const supabase = require('../config/supabase');

const userModel = {
  async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, password, preferences, phone, avatar_url, role')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, preferences, phone, avatar_url, role, created_at')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select('id, name, email, preferences, phone, avatar_url, role, created_at')
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, name, email, preferences, phone, avatar_url, role')
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async setResetToken(id, token, expires) {
    const { error } = await supabase
      .from('users')
      .update({
        reset_token: token,
        reset_token_expires: expires
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

module.exports = userModel;
