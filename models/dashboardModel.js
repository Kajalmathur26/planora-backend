const supabase = require('../config/supabase');

const dashboardModel = {
  async getSummary(userId) {
    const today = new Date().toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

    const [
      tasksResult,
      todayEventsResult,
      moodsResult,
      habitsResult,
      goalsResult,
      journalResult
    ] = await Promise.all([
      supabase.from('tasks').select('status, priority, due_date').eq('user_id', userId),
      supabase.from('events').select('*').eq('user_id', userId).gte('start_time', today).lte('start_time', today + 'T23:59:59'),
      supabase.from('mood_logs').select('mood_score, mood_label, log_date').eq('user_id', userId).gte('log_date', monthAgo).order('log_date'),
      supabase.from('habits').select('name, current_streak, habit_logs(log_date, completed)').eq('user_id', userId),
      supabase.from('goals').select('title, current_value, target_value, status, category').eq('user_id', userId),
      supabase.from('journal_entries').select('id, title, entry_date, mood').eq('user_id', userId).order('entry_date', { ascending: false }).limit(5)
    ]);

    const tasks = tasksResult.data || [];
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      overdue: tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'completed').length
    };

    const habits = habitsResult.data || [];
    const todayHabits = habits.map(h => ({
      ...h,
      completed_today: h.habit_logs?.some(l => l.log_date === today && l.completed)
    }));

    return {
      taskStats,
      todayEvents: todayEventsResult.data || [],
      moodTrend: moodsResult.data || [],
      habits: todayHabits,
      goals: goalsResult.data || [],
      recentJournals: journalResult.data || [],
      generatedAt: new Date().toISOString()
    };
  },

  async getWeeklyReport(userId) {
    const weekAgo = new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0];

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('status, created_at, updated_at')
      .eq('user_id', userId)
      .gte('created_at', weekAgo);

    if (error) throw error;

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      days.push({
        date: d,
        completed: tasks.filter(t => t.status === 'completed' && t.updated_at && t.updated_at.startsWith(d)).length,
        added: tasks.filter(t => t.created_at && t.created_at.startsWith(d)).length
      });
    }

    return days;
  }
};

module.exports = dashboardModel;
