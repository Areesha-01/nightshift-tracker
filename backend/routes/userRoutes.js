const express = require('express');
const router = express.Router();
const { getUsers, getPendingUsers, verifyUser, rejectUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
router.get('/', authMiddleware, getUsers);
router.get('/pending', authMiddleware, requireAdmin, getPendingUsers);
router.put('/:id/verify', authMiddleware, requireAdmin, verifyUser);
router.delete('/:id/reject', authMiddleware, requireAdmin, rejectUser);

module.exports = router;