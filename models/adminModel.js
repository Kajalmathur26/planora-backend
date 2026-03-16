const supabase = require('../config/supabase');

const adminModel = {
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, avatar_url, phone, preferences, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateUserRole(userId, role) {
    const { data, error } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('id, name, email, role')
      .single();

    if (error) throw error;
    return data;
  },

  async getSystemStats() {
    const [users, tasks, journal, goals] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('tasks').select('id', { count: 'exact', head: true }),
      supabase.from('journal_entries').select('id', { count: 'exact', head: true }), // Fixed table name from journal to journal_entries
      supabase.from('goals').select('id', { count: 'exact', head: true }),
    ]);

    return {
      totalUsers: users.count || 0,
      totalTasks: tasks.count || 0,
      totalJournalEntries: journal.count || 0,
      totalGoals: goals.count || 0,
    };
  }
};

module.exports = adminModel;
