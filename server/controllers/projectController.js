const Project = require('../models/Project');
const List = require('../models/List');
const Task = require('../models/Task');
const { findOwnedProject } = require('../utils/projectAccess');

const createProject = async (req, res) => {
    const { title, description } = req.body || {};

    const project = await Project.create({
        title,
        description,
        owner: req.user._id,
    });

    res.status(201).json({ success: true, data: project });
};

const getProjects = async (req, res) => {
    const projects = await Project.find({ owner: req.user._id }).sort({
        createdAt: -1,
    });

    res.json({ success: true, count: projects.length, data: projects });
};

const getProject = async (req, res) => {
    const project = await findOwnedProject(req.params.id, req.user._id);

    res.json({ success: true, data: project });
};

const updateProject = async (req, res) => {
    const { title, description } = req.body || {};

    const project = await findOwnedProject(req.params.id, req.user._id);

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;

    await project.save();

    res.json({ success: true, data: project });
};

const deleteProject = async (req, res) => {
    const project = await findOwnedProject(req.params.id, req.user._id);

    await Task.deleteMany({ project: project._id });
    await List.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ success: true, message: 'Project deleted' });
};

module.exports = {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
};