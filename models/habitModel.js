const supabase = require('../config/supabase');

const habitModel = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('habits')
      .select('*, habit_logs(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(userId, habitData) {
    const { name, description, frequency, target_count, color, icon } = habitData;
    const { data, error } = await supabase
      .from('habits')
      .insert([{
        user_id: userId,
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
    return data;
  },

  async log(id, { date, count, notes }) {
    const logDate = date || new Date().toISOString().split('T')[0];
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
    await this.updateStreak(id);
    return data;
  },

  async unlog(id) {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
      .from('habit_logs')
      .update({ completed: false })
      .eq('habit_id', id)
      .eq('log_date', today);

    if (error) throw error;
    await this.updateStreak(id);
    return true;
  },

  async update(userId, id, updates) {
    const { data, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(userId, id) {
    await supabase.from('habit_logs').delete().eq('habit_id', id);
    const { error } = await supabase.from('habits').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    return true;
  },

  async updateStreak(habitId) {
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
  }
};

module.exports = habitModel;
