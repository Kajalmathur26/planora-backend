const supabase = require('../config/supabase');

const getEntries = async (req, res) => {
  try {
    const { start_date, end_date, search } = req.query;
    let query = supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', req.user.id)
      .order('entry_date', { ascending: false });

    if (start_date) query = query.gte('entry_date', start_date);
    if (end_date) query = query.lte('entry_date', end_date);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ entries: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
};

const getEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Entry not found' });
    res.json({ entry: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
};

const createEntry = async (req, res) => {
  try {
    const { title, content, entry_date, mood, tags, is_private } = req.body;

    const { data, error } = await supabase
      .from('journal_entries')
      .insert([{
        user_id: req.user.id,
        title: title || 'Untitled Entry',
        content: content || '',
        entry_date: entry_date || new Date().toISOString().split('T')[0],
        mood,
        tags: tags || [],
        is_private: is_private !== undefined ? is_private : true
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ entry: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create entry' });
  }
};

const updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('journal_entries')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ entry: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update entry' });
  }
};

const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
};

module.exports = { getEntries, getEntry, createEntry, updateEntry, deleteEntry };
