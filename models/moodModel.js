const supabase = require('../config/supabase');

const moodModel = {
  async getAll(userId, { start_date, end_date }) {
    let query = supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false });

    if (start_date) query = query.gte('log_date', start_date);
    if (end_date) query = query.lte('log_date', end_date);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async log(userId, moodData) {
    const { mood_score, mood_label, notes, emotions, log_date } = moodData;
    const date = log_date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('mood_logs')
      .upsert([{
        user_id: userId,
        mood_score,
        mood_label,
        notes,
        emotions: emotions || [],
        log_date: date
      }], { onConflict: 'user_id,log_date' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getStats(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('mood_logs')
      .select('mood_score, mood_label, log_date')
      .eq('user_id', userId)
      .gte('log_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('log_date');

    if (error) throw error;

    const avg = data.length ? data.reduce((s, m) => s + m.mood_score, 0) / data.length : 0;
    const distribution = data.reduce((acc, m) => {
      acc[m.mood_label] = (acc[m.mood_label] || 0) + 1;
      return acc;
    }, {});

    return { moods: data, average: Math.round(avg * 10) / 10, distribution, total: data.length };
  },

  async update(userId, id, updates) {
    const safeUpdates = { ...updates, updated_at: new Date().toISOString() };
    const { data, error } = await supabase
      .from('mood_logs')
      .update(safeUpdates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

module.exports = moodModel;
