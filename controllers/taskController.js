const taskModel = require('../models/taskModel');

const getTasks = async (req, res) => {
  try {
    const tasks = await taskModel.getAll(req.user.id, req.query);
    res.json({ tasks });
  } catch (error) {
    console.error('getTasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

const createTask = async (req, res) => {
  try {
    const task = await taskModel.create(req.user.id, req.body);
    res.status(201).json({ task });
  } catch (error) {
    console.error('createTask error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await taskModel.update(req.user.id, req.params.id, req.body);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ task });
  } catch (error) {
    console.error('updateTask error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    await taskModel.delete(req.user.id, req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('deleteTask error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

const reorderTasks = async (req, res) => {
  try {
    await taskModel.reorder(req.user.id, req.body.tasks);
    res.json({ message: 'Tasks reordered' });
  } catch (error) {
    console.error('reorderTasks error:', error);
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, reorderTasks };
