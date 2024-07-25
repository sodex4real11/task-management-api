const express = require('express');
const { createTask, getTasks, updateTask, deleteTask } = require('../Controllers/taskController');
const authMiddleware = require('../Middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, createTask);
router.get('/', authMiddleware, getTasks);
router.put('/:id', authMiddleware, updateTask);
router.delete('/:id', authMiddleware, deleteTask);

module.exports = router;
