const supabase = require('../config/supabase');

const getHabits = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: habits, error } = await supabase
      .from('habits')
      .select('*, habit_logs(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json({ habits });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
};

const createHabit = async (req, res) => {
  try {
    const { name, description, frequency, target_count, color, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    const { data, error } = await supabase
      .from('habits')
      .insert([{
        user_id: req.user.id,
        name,
        description,
        frequency: frequency || 'daily',
        target_count: target_count || 1,
        current_streak: 0,
        longest_streak: 0,
        color: color || '#8B5CF6',
        icon: icon || '⭐'
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ habit: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create habit' });
  }
};

const logHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, count, notes } = req.body;
    const logDate = date || new Date().toISOString().split('T')[0];

    // Upsert log
    const { data, error } = await supabase
      .from('habit_logs')
      .upsert([{
        habit_id: id,
        log_date: logDate,
        count: count || 1,
        notes,
        completed: true
      }], { onConflict: 'habit_id,log_date' })
      .select()
      .single();

    if (error) throw error;

    // Update streak
    await updateStreak(id);
    res.json({ log: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log habit' });
  }
};

const updateStreak = async (habitId) => {
  try {
    const { data: logs } = await supabase
      .from('habit_logs')
      .select('log_date')
      .eq('habit_id', habitId)
      .eq('completed', true)
      .order('log_date', { ascending: false });

    if (!logs || logs.length === 0) return;

    let streak = 0;
    const today = new Date();
    let checkDate = new Date(today);

    for (const log of logs) {
      const logDate = new Date(log.log_date);
      const diff = Math.floor((checkDate - logDate) / (1000 * 60 * 60 * 24));
      if (diff <= 1) {
        streak++;
        checkDate = logDate;
      } else break;
    }

    const { data: habit } = await supabase.from('habits').select('longest_streak').eq('id', habitId).single();
    await supabase.from('habits').update({
      current_streak: streak,
      longest_streak: Math.max(streak, habit?.longest_streak || 0)
    }).eq('id', habitId);
  } catch (e) { console.error(e); }
};

const updateHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('habits')
      .update(req.body)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ habit: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update habit' });
  }
};

const deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    await supabase.from('habit_logs').delete().eq('habit_id', id);
    const { error } = await supabase.from('habits').delete().eq('id', id).eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Habit deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete habit' });
  }
};

module.exports = { getHabits, createHabit, logHabit, updateHabit, deleteHabit };
