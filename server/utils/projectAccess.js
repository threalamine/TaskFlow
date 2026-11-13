const Project = require('../models/Project');

const findOwnedProject = async (projectId, userId) => {
    const project = await Project.findOne({ _id: projectId, owner: userId });

    if (!project) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        throw error;
    }

    return project;
};

module.exports = { findOwnedProject };