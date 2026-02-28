const supabase = require('../config/supabase');

const getTasks = async (req, res) => {
  try {
    const { category, status, priority } = req.query;
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ tasks: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, category, priority, due_date, tags } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        user_id: req.user.id,
        title,
        description,
        category: category || 'personal',
        priority: priority || 'medium',
        due_date,
        tags: tags || [],
        status: 'pending',
        position: 0
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ task: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Task not found' });
    res.json({ task: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

const reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body; // [{id, position}]
    const updates = tasks.map(({ id, position }) =>
      supabase.from('tasks').update({ position }).eq('id', id).eq('user_id', req.user.id)
    );
    await Promise.all(updates);
    res.json({ message: 'Tasks reordered' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, reorderTasks };
