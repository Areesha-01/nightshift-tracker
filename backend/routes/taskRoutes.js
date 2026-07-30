const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask, addComment } = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createTask);
router.get('/', authMiddleware, getTasks);
router.put('/:id', authMiddleware, updateTask);
router.delete('/:id', authMiddleware, deleteTask);
router.post('/:id/comments', authMiddleware, addComment);

module.exports = router;