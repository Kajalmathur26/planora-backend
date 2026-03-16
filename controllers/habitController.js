const habitModel = require('../models/habitModel');

const getHabits = async (req, res) => {
  try {
    const habits = await habitModel.getAll(req.user.id);
    res.json({ habits });
  } catch (error) {
    console.error('getHabits error:', error);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
};

const createHabit = async (req, res) => {
  try {
    const habit = await habitModel.create(req.user.id, req.body);
    res.status(201).json({ habit });
  } catch (error) {
    console.error('createHabit error:', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
};

const logHabit = async (req, res) => {
  try {
    const log = await habitModel.log(req.params.id, req.body);
    res.json({ log });
  } catch (error) {
    console.error('logHabit error:', error);
    res.status(500).json({ error: 'Failed to log habit' });
  }
};

const updateHabit = async (req, res) => {
  try {
    const habit = await habitModel.update(req.user.id, req.params.id, req.body);
    res.json({ habit });
  } catch (error) {
    console.error('updateHabit error:', error);
    res.status(500).json({ error: 'Failed to update habit' });
  }
};

const unlogHabit = async (req, res) => {
  try {
    await habitModel.unlog(req.params.id);
    res.json({ message: 'Habit unlogged' });
  } catch (error) {
    console.error('unlogHabit error:', error);
    res.status(500).json({ error: 'Failed to unlog habit' });
  }
};

const deleteHabit = async (req, res) => {
  try {
    await habitModel.delete(req.user.id, req.params.id);
    res.json({ message: 'Habit deleted' });
  } catch (error) {
    console.error('deleteHabit error:', error);
    res.status(500).json({ error: 'Failed to delete habit' });
  }
};

module.exports = { getHabits, createHabit, logHabit, unlogHabit, updateHabit, deleteHabit };
