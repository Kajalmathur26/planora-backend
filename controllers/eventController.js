const eventModel = require('../models/eventModel');

const getEvents = async (req, res) => {
  try {
    const events = await eventModel.getAll(req.user.id, req.query);
    res.json({ events });
  } catch (error) {
    console.error('getEvents error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

const createEvent = async (req, res) => {
  try {
    const event = await eventModel.create(req.user.id, req.body);
    res.status(201).json({ event });
  } catch (error) {
    console.error('createEvent error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await eventModel.update(req.user.id, req.params.id, req.body);
    res.json({ event });
  } catch (error) {
    console.error('updateEvent error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    await eventModel.delete(req.user.id, req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('deleteEvent error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

module.exports = { getEvents, createEvent, updateEvent, deleteEvent };
