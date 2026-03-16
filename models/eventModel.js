const supabase = require('../config/supabase');

const eventModel = {
  async getAll(userId, { start_date, end_date }) {
    let query = supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('start_time');

    if (start_date) query = query.gte('start_time', start_date);
    if (end_date) query = query.lte('start_time', end_date);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(userId, eventData) {
    const { title, description, start_time, end_time, color, reminder_minutes, is_all_day, location } = eventData;
    const { data, error } = await supabase
      .from('events')
      .insert([{
        user_id: userId,
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
    return data;
  },

  async update(userId, id, updates) {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(userId, id) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }
};

module.exports = eventModel;
