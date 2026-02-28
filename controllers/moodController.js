const supabase = require('../config/supabase');

const getMoods = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let query = supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', req.user.id)
      .order('log_date', { ascending: false });

    if (start_date) query = query.gte('log_date', start_date);
    if (end_date) query = query.lte('log_date', end_date);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ moods: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch moods' });
  }
};

const logMood = async (req, res) => {
  try {
    const { mood_score, mood_label, notes, emotions, log_date } = req.body;
    if (!mood_score) return res.status(400).json({ error: 'Mood score required' });

    const date = log_date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('mood_logs')
      .upsert([{
        user_id: req.user.id,
        mood_score,
        mood_label,
        notes,
        emotions: emotions || [],
        log_date: date
      }], { onConflict: 'user_id,log_date' })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ mood: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log mood' });
  }
};

const getMoodStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('mood_logs')
      .select('mood_score, mood_label, log_date')
      .eq('user_id', req.user.id)
      .gte('log_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('log_date');

    if (error) throw error;

    const avg = data.length ? data.reduce((s, m) => s + m.mood_score, 0) / data.length : 0;
    const distribution = data.reduce((acc, m) => {
      acc[m.mood_label] = (acc[m.mood_label] || 0) + 1;
      return acc;
    }, {});

    res.json({ moods: data, average: Math.round(avg * 10) / 10, distribution, total: data.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get mood stats' });
  }
};

module.exports = { getMoods, logMood, getMoodStats };
