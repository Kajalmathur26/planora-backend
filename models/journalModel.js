const supabase = require('../config/supabase');

const journalModel = {
  async getAll(userId, { start_date, end_date, search }) {
    let query = supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false });

    if (start_date) query = query.gte('entry_date', start_date);
    if (end_date) query = query.lte('entry_date', end_date);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(userId, id) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async create(userId, entryData) {
    const { title, content, entry_date, mood, tags, is_private, font_style, bg_color, image_url } = entryData;
    
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([{
        user_id: userId,
        title: title || 'Untitled Entry',
        content: content || '',
        entry_date: entry_date || new Date().toISOString().split('T')[0],
        mood: mood || null,
        tags: tags || [],
        is_private: is_private !== undefined ? is_private : true,
        font_style: font_style || null,
        bg_color: bg_color || null,
        image_url: image_url || null
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(userId, id, updates) {
    const updateData = { ...updates, updated_at: new Date().toISOString() };
    
    const { data, error } = await supabase
      .from('journal_entries')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(userId, id) {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },
  async uploadImage(userId, { imageData, fileName, mimeType }) {
    if (!imageData) throw new Error('Image data is required');

    const base64Data = imageData.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const ext = (mimeType || 'image/jpeg').split('/')[1] || 'jpg';
    const uniqueName = `${userId}/${Date.now()}_${fileName || 'upload'}.${ext}`;

    const { data, error } = await supabase.storage
      .from('journal-images')
      .upload(uniqueName, buffer, {
        contentType: mimeType || 'image/jpeg',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('journal-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }
};

module.exports = journalModel;
