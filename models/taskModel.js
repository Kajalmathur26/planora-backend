const supabase = require('../config/supabase');

const taskModel = {
  async getAll(userId, { category, status, priority }) {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(userId, { title, description, category, priority, due_date, tags }) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        user_id: userId,
        title,
        description,
        category: category || 'personal',
        priority: priority || 'medium',
        due_date: due_date || null,
        tags: tags || [],
        status: 'pending',
        position: 0
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(userId, id, updates) {
    const safeUpdates = { ...updates, updated_at: new Date().toISOString() };
    if (safeUpdates.due_date === '') safeUpdates.due_date = null;

    const { data, error } = await supabase
      .from('tasks')
      .update(safeUpdates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(userId, id) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  async reorder(userId, tasks) {
    const updates = tasks.map(({ id, position }) =>
      supabase.from('tasks').update({ position }).eq('id', id).eq('user_id', userId)
    );
    await Promise.all(updates);
    return true;
  }
};

module.exports = taskModel;
