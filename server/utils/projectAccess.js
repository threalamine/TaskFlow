const Project = require('../models/Project');
const List = require('../models/List');
const createError = require('./createError');

const findOwnedProject = async (projectId, userId) => {
    const project = await Project.findOne({ _id: projectId, owner: userId });

    if (!project) {
        throw createError('Project not found', 404);
    }

    return project;
};

const findListInProject = async (listId, projectId) => {
    const list = await List.findOne({ _id: listId, project: projectId });

    if (!list) {
        throw createError('List not found', 404);
    }

    return list;
};

module.exports = { findOwnedProject, findListInProject };