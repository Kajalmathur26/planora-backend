const goalModel = require('../models/goalModel');

const getGoals = async (req, res) => {
  try {
    const goals = await goalModel.getAll(req.user.id);
    res.json({ goals });
  } catch (error) {
    console.error('getGoals error:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
};

const createGoal = async (req, res) => {
  try {
    const goal = await goalModel.create(req.user.id, req.body);
    res.status(201).json({ goal });
  } catch (error) {
    console.error('createGoal error:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
};

const updateGoal = async (req, res) => {
  try {
    const goal = await goalModel.update(req.user.id, req.params.id, req.body);
    res.json({ goal });
  } catch (error) {
    console.error('updateGoal error:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

const deleteGoal = async (req, res) => {
  try {
    await goalModel.delete(req.user.id, req.params.id);
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    console.error('deleteGoal error:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
};

const addMilestone = async (req, res) => {
  try {
    const milestone = await goalModel.addMilestone(req.params.id, req.body);
    res.status(201).json({ milestone });
  } catch (error) {
    console.error('addMilestone error:', error);
    res.status(500).json({ error: 'Failed to add milestone' });
  }
};

const toggleMilestone = async (req, res) => {
  try {
    const milestone = await goalModel.toggleMilestone(req.params.milestoneId, req.body.completed);
    res.json({ milestone });
  } catch (error) {
    console.error('toggleMilestone error:', error);
    res.status(500).json({ error: 'Failed to toggle milestone' });
  }
};

const deleteMilestone = async (req, res) => {
  try {
    await goalModel.deleteMilestone(req.params.milestoneId);
    res.json({ message: 'Milestone deleted' });
  } catch (error) {
    console.error('deleteMilestone error:', error);
    res.status(500).json({ error: 'Failed to delete milestone' });
  }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal, addMilestone, toggleMilestone, deleteMilestone };
