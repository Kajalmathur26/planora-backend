const supabase = require('../config/supabase');

const searchModel = {
  async globalSearch(userId, query) {
    const [tasksRes, goalsRes, journalRes] = await Promise.all([
      supabase.from('tasks')
        .select('id, title, description, status, priority, category')
        .eq('user_id', userId)
        .ilike('title', `%${query}%`)
        .limit(5),

      supabase.from('goals')
        .select('id, title, description, category, status')
        .eq('user_id', userId)
        .ilike('title', `%${query}%`)
        .limit(5),

      supabase.from('journal_entries')
        .select('id, title, entry_date, mood')
        .eq('user_id', userId)
        .ilike('title', `%${query}%`)
        .limit(5),
    ]);

    return {
      tasks: tasksRes.data || [],
      goals: goalsRes.data || [],
      journal: journalRes.data || [],
    };
  }
};

module.exports = searchModel;
