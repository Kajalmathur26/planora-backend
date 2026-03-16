const journalModel = require('../models/journalModel');
const supabase = require('../config/supabase'); // Still needed for storage

const getEntries = async (req, res) => {
  try {
    const entries = await journalModel.getAll(req.user.id, req.query);
    res.json({ entries });
  } catch (error) {
    console.error('getEntries error:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
};

const getEntry = async (req, res) => {
  try {
    const entry = await journalModel.getById(req.user.id, req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.json({ entry });
  } catch (error) {
    console.error('getEntry error:', error);
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
};

const createEntry = async (req, res) => {
  try {
    const entry = await journalModel.create(req.user.id, req.body);
    res.status(201).json({ entry });
  } catch (error) {
    console.error('createEntry error:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
};

const updateEntry = async (req, res) => {
  try {
    const entry = await journalModel.update(req.user.id, req.params.id, req.body);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.json({ entry });
  } catch (error) {
    console.error('updateEntry error:', error);
    res.status(500).json({ error: 'Failed to update entry' });
  }
};

const deleteEntry = async (req, res) => {
  try {
    await journalModel.delete(req.user.id, req.params.id);
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    console.error('deleteEntry error:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
};

const uploadJournalImage = async (req, res) => {
  try {
    const url = await journalModel.uploadImage(req.user.id, req.body);
    res.json({ url });
  } catch (error) {
    console.error('Journal image upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
};

module.exports = { getEntries, getEntry, createEntry, updateEntry, deleteEntry, uploadJournalImage };
