const supabase = require('../config/supabase');

const exportModel = {
  async getFinanceData(userId) {
    const { data, error } = await supabase
      .from('finance_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getJournalData(userId) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getProductivityData(userId) {
    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select('title, status, due_date')
      .eq('user_id', userId);

    const { data: habits, error: habitError } = await supabase
      .from('habits')
      .select('name, current_streak')
      .eq('user_id', userId);

    if (taskError || habitError) throw new Error('Failed to fetch productivity data');

    return {
      exportDate: new Date().toISOString(),
      tasksStats: {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
      },
      habits: habits.map(h => ({
        name: h.name,
        currentStreak: h.current_streak,
      }))
    };
  }
};

module.exports = exportModel;
