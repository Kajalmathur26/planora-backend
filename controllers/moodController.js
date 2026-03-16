const moodModel = require('../models/moodModel');

const getMoods = async (req, res) => {
  try {
    const moods = await moodModel.getAll(req.user.id, req.query);
    res.json({ moods });
  } catch (error) {
    console.error('getMoods error:', error);
    res.status(500).json({ error: 'Failed to fetch moods' });
  }
};

const logMood = async (req, res) => {
  try {
    const mood = await moodModel.log(req.user.id, req.body);
    res.status(201).json({ mood });
  } catch (error) {
    console.error('logMood error:', error);
    res.status(500).json({ error: 'Failed to log mood' });
  }
};

const getMoodStats = async (req, res) => {
  try {
    const stats = await moodModel.getStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('getMoodStats error:', error);
    res.status(500).json({ error: 'Failed to get mood stats' });
  }
};

const updateMood = async (req, res) => {
  try {
    const mood = await moodModel.update(req.user.id, req.params.id, req.body);
    if (!mood) return res.status(404).json({ error: 'Mood entry not found' });
    res.json({ mood });
  } catch (error) {
    console.error('updateMood error:', error);
    res.status(500).json({ error: 'Failed to update mood' });
  }
};

module.exports = { getMoods, logMood, getMoodStats, updateMood };
