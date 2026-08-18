const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask, addComment } = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin, requireVerified } = require('../middleware/roleMiddleware');

router.post('/', authMiddleware, requireVerified, requireAdmin, createTask);
router.get('/', authMiddleware, requireVerified, getTasks);
router.put('/:id', authMiddleware, requireVerified, updateTask);
router.delete('/:id', authMiddleware, requireVerified, requireAdmin, deleteTask);
router.post('/:id/comments', authMiddleware, requireVerified, addComment);

module.exports = router;