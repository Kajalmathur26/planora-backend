const supabase = require('../config/supabase');

const goalModel = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('goals')
      .select('*, goal_milestones(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(g => {
      const milestones = g.goal_milestones || [];
      const total = milestones.length;
      const completed = milestones.filter(m => m.completed).length;
      return {
        ...g,
        milestone_progress: total > 0 ? Math.round((completed / total) * 100) : null,
        milestone_count: total,
        milestone_completed: completed,
      };
    });
  },

  async create(userId, goalData) {
    const { title, description, category, target_date, target_value, unit } = goalData;
    const { data, error } = await supabase
      .from('goals')
      .insert([{
        user_id: userId,
        title,
        description,
        category: category || 'personal',
        target_date: target_date || null,
        target_value: target_value || 100,
        current_value: 0,
        unit: unit || '%',
        status: 'active'
      }])
      .select()
      .single();

    if (error) throw error;
    return { ...data, goal_milestones: [], milestone_progress: null, milestone_count: 0, milestone_completed: 0 };
  },

  async update(userId, id, updates) {
    const safeUpdates = { ...updates, updated_at: new Date().toISOString() };
    if (safeUpdates.target_date === '') safeUpdates.target_date = null;

    const { data, error } = await supabase
      .from('goals')
      .update(safeUpdates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(userId, id) {
    await supabase.from('goal_milestones').delete().eq('goal_id', id);
    const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    return true;
  },

  async updateProgress(goalId) {
    const { data: milestones, error } = await supabase
      .from('goal_milestones')
      .select('completed')
      .eq('goal_id', goalId);

    if (error || !milestones) return;

    const total = milestones.length;
    const completed = milestones.filter(m => m.completed).length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const newStatus = progressPercent >= 100 ? 'completed' : 'active';

    await supabase
      .from('goals')
      .update({ 
        current_value: progressPercent, 
        status: newStatus,
        updated_at: new Date().toISOString() 
      })
      .eq('id', goalId);
  },

  async addMilestone(goalId, milestoneData) {
    const { title, target_value } = milestoneData;
    const { data, error } = await supabase
      .from('goal_milestones')
      .insert([{ goal_id: goalId, title, target_value, completed: false }])
      .select()
      .single();

    if (error) throw error;
    await this.updateProgress(goalId);
    return data;
  },

  async toggleMilestone(milestoneId, completed) {
    const { data: milestone, error: fetchError } = await supabase
      .from('goal_milestones')
      .select('goal_id')
      .eq('id', milestoneId)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('goal_milestones')
      .update({ completed, updated_at: new Date().toISOString() })
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) throw error;
    await this.updateProgress(milestone.goal_id);
    return data;
  },

  async deleteMilestone(milestoneId) {
    const { data: milestone, error: fetchError } = await supabase
      .from('goal_milestones')
      .select('goal_id')
      .eq('id', milestoneId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('goal_milestones')
      .delete()
      .eq('id', milestoneId);

    if (error) throw error;
    await this.updateProgress(milestone.goal_id);
    return true;
  }
};

module.exports = goalModel;
