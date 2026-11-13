const Task = require('../models/Task');
const {
    findOwnedProject,
    findListInProject,
} = require('../utils/projectAccess');
const createError = require('../utils/createError');
const {
    getPagination,
    escapeRegex,
    parseDate,
} = require('../utils/queryHelpers');

const SORT_OPTIONS = {
    position: { position: 1 },
    dueDate: { dueDate: 1 },
    '-dueDate': { dueDate: -1 },
    createdAt: { createdAt: 1 },
    '-createdAt': { createdAt: -1 },
};

const findTaskInProject = async (taskId, projectId) => {
    const task = await Task.findOne({ _id: taskId, project: projectId });

    if (!task) {
        throw createError('Task not found', 404);
    }

    return task;
};

const moveTask = async (task, targetListId, requestedPosition) => {
    const oldPosition = task.position;

    if (task.list.equals(targetListId)) {
        if (requestedPosition === undefined) return;

        const total = await Task.countDocuments({ list: task.list });
        const newPosition = Math.min(requestedPosition, total - 1);

        if (newPosition > oldPosition) {
            await Task.updateMany(
                {
                    list: task.list,
                    position: { $gt: oldPosition, $lte: newPosition },
                },
                { $inc: { position: -1 } }
            );
        } else if (newPosition < oldPosition) {
            await Task.updateMany(
                {
                    list: task.list,
                    position: { $gte: newPosition, $lt: oldPosition },
                },
                { $inc: { position: 1 } }
            );
        }

        task.position = newPosition;
        return;
    }

    await Task.updateMany(
        { list: task.list, position: { $gt: oldPosition } },
        { $inc: { position: -1 } }
    );

    const total = await Task.countDocuments({ list: targetListId });
    const newPosition =
        requestedPosition === undefined ? total : Math.min(requestedPosition, total);

    await Task.updateMany(
        { list: targetListId, position: { $gte: newPosition } },
        { $inc: { position: 1 } }
    );

    task.list = targetListId;
    task.position = newPosition;
};

const createTask = async (req, res) => {
    const project = await findOwnedProject(req.params.projectId, req.user._id);
    const { title, description, priority, dueDate, list } = req.body || {};

    if (typeof list !== 'string') {
        throw createError('List id is required', 400);
    }

    const targetList = await findListInProject(list, project._id);
    const position = await Task.countDocuments({ list: targetList._id });

    const task = await Task.create({
        title,
        description,
        priority,
        dueDate,
        list: targetList._id,
        project: project._id,
        position,
    });

    res.status(201).json({ success: true, data: task });
};

const getTasks = async (req, res) => {
    const project = await findOwnedProject(req.params.projectId, req.user._id);
    const { search, list, priority, completed, dueBefore, dueAfter, sort } =
        req.query;

    const filter = { project: project._id };

    if (typeof search === 'string' && search.trim()) {
        const pattern = new RegExp(escapeRegex(search.trim()), 'i');
        filter.$or = [{ title: pattern }, { description: pattern }];
    }

    if (list !== undefined) {
        if (typeof list !== 'string') {
            throw createError('List must be a list id', 400);
        }
        filter.list = list;
    }

    if (priority !== undefined) {
        if (!['low', 'medium', 'high'].includes(priority)) {
            throw createError('Priority must be low, medium or high', 400);
        }
        filter.priority = priority;
    }

    if (completed !== undefined) {
        if (completed !== 'true' && completed !== 'false') {
            throw createError('Completed must be true or false', 400);
        }
        filter.completed = completed === 'true';
    }

    const dueFilter = {};
    if (dueAfter !== undefined) dueFilter.$gte = parseDate(dueAfter, 'dueAfter');
    if (dueBefore !== undefined) {
        dueFilter.$lte = parseDate(dueBefore, 'dueBefore');
    }
    if (Object.keys(dueFilter).length > 0) filter.dueDate = dueFilter;

    let sortBy = SORT_OPTIONS.position;
    if (sort !== undefined) {
        if (typeof sort !== 'string' || !Object.hasOwn(SORT_OPTIONS, sort)) {
            throw createError('Invalid sort value', 400);
        }
        sortBy = SORT_OPTIONS[sort];
    }

    const { page, limit, skip } = getPagination(req.query);

    const [tasks, total] = await Promise.all([
        Task.find(filter)
            .sort({ ...sortBy, _id: 1 })
            .skip(skip)
            .limit(limit),
        Task.countDocuments(filter),
    ]);

    res.json({
        success: true,
        count: tasks.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: tasks,
    });
};

const getTask = async (req, res) => {
    const project = await findOwnedProject(req.params.projectId, req.user._id);
    const task = await findTaskInProject(req.params.id, project._id);

    res.json({ success: true, data: task });
};

const updateTask = async (req, res) => {
    const project = await findOwnedProject(req.params.projectId, req.user._id);
    const task = await findTaskInProject(req.params.id, project._id);
    const { title, description, priority, dueDate, completed, list, position } =
        req.body || {};

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (completed !== undefined) task.completed = completed;

    await task.validate();

    if (position !== undefined) {
        if (!Number.isInteger(position) || position < 0) {
            throw createError('Position must be a non-negative integer', 400);
        }
    }

    let targetListId = task.list;

    if (list !== undefined) {
        if (typeof list !== 'string') {
            throw createError('List must be a list id', 400);
        }

        const targetList = await findListInProject(list, project._id);
        targetListId = targetList._id;
    }

    await moveTask(task, targetListId, position);
    await task.save();

    res.json({ success: true, data: task });
};

const deleteTask = async (req, res) => {
    const project = await findOwnedProject(req.params.projectId, req.user._id);
    const task = await findTaskInProject(req.params.id, project._id);

    await task.deleteOne();

    await Task.updateMany(
        { list: task.list, position: { $gt: task.position } },
        { $inc: { position: -1 } }
    );

    res.json({ success: true, message: 'Task deleted' });
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };