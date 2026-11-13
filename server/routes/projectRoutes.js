const express = require('express');
const {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const listRoutes = require('./listRoutes');

const router = express.Router();

router.use(protect);

router.use('/:projectId/lists', listRoutes);

router.route('/').get(getProjects).post(createProject);
router
    .route('/:id')
    .get(getProject)
    .patch(updateProject)
    .delete(deleteProject);

module.exports = router;