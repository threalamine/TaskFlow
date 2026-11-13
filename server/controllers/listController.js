const List = require('../models/List');
const Task = require('../models/Task');
const {
    findOwnedProject,
    findListInProject,
} = require('../utils/projectAccess');
const createError = require('../utils/createError');

const createList = async (req, res) => {
    const project = await findOwnedProject(req.params.projectId, req.user._id);
    const { title } = req.body || {};

    const position = await List.countDocuments({ project: project._id });

    const list = await List.create({ title, project: project._id, position });

    res.status(201).json({ success: true, data: list });
};

const getLists = async (req, res) => {
    const project = await findOwnedProject(req.params.projectId, req.user._id);

    const lists = await List.find({ project: project._id }).sort({ position: 1 });

    res.json({ success: true, count: lists.length, data: lists });
};

const updateList = async (req, res) => {
    const project = await findOwnedProject(req.params.projectId, req.user._id);
    const list = await findListInProject(req.params.id, project._id);
    const { title, position } = req.body || {};

    if (title !== undefined) list.title = title;

    await list.validate();

    if (position !== undefined) {
        if (!Number.isInteger(position) || position < 0) {
            throw createError('Position must be a non-negative integer', 400);
        }

        const total = await List.countDocuments({ project: project._id });
        const newPosition = Math.min(position, total - 1);
        const oldPosition = list.position;

        if (newPosition > oldPosition) {
            await List.updateMany(
                {
                    project: project._id,
                    position: { $gt: oldPosition, $lte: newPosition },
                },
                { $inc: { position: -1 } }
            );
        } else if (newPosition < oldPosition) {
            await List.updateMany(
                {
                    project: project._id,
                    position: { $gte: newPosition, $lt: oldPosition },
                },
                { $inc: { position: 1 } }
            );
        }

        list.position = newPosition;
    }

    await list.save();

    res.json({ success: true, data: list });
};

const deleteList = async (req, res) => {
    const project = await findOwnedProject(req.params.projectId, req.user._id);
    const list = await findListInProject(req.params.id, project._id);

    await Task.deleteMany({ list: list._id });
    await list.deleteOne();

    await List.updateMany(
        { project: project._id, position: { $gt: list.position } },
        { $inc: { position: -1 } }
    );

    res.json({ success: true, message: 'List deleted' });
};

module.exports = { createList, getLists, updateList, deleteList };