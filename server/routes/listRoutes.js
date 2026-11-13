const express = require('express');
const {
    createList,
    getLists,
    updateList,
    deleteList,
} = require('../controllers/listController');

const router = express.Router({ mergeParams: true });

router.route('/').get(getLists).post(createList);
router.route('/:id').patch(updateList).delete(deleteList);

module.exports = router;