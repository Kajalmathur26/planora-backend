const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask, reorderTasks } = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getTasks);
router.post('/', createTask);
router.put('/reorder', reorderTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
