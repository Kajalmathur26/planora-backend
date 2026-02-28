const supabase = require('../config/supabase');

const getEvents = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let query = supabase
      .from('events')
      .select('*')
      .eq('user_id', req.user.id)
      .order('start_time');

    if (start_date) query = query.gte('start_time', start_date);
    if (end_date) query = query.lte('start_time', end_date);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ events: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, start_time, end_time, color, reminder_minutes, is_all_day, location } = req.body;
    if (!title || !start_time) return res.status(400).json({ error: 'Title and start time required' });

    const { data, error } = await supabase
      .from('events')
      .insert([{
        user_id: req.user.id,
        title,
        description,
        start_time,
        end_time,
        color: color || '#8B5CF6',
        reminder_minutes: reminder_minutes || 30,
        is_all_day: is_all_day || false,
        location
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ event: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('events')
      .update(req.body)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ event: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

module.exports = { getEvents, createEvent, updateEvent, deleteEvent };
