const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const isSupabaseConnectionError = (error) => {
  if (!error) return false;
  const text = `${error.message || ''} ${error.details || ''}`.toLowerCase();
  return text.includes('fetch failed') || text.includes('connect timeout');
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check existing user
    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      if (isSupabaseConnectionError(existingError)) {
        return res.status(503).json({ error: 'Database unavailable. Please try again shortly.' });
      }
      throw existingError;
    }

    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword, preferences: { theme: 'dark', accent: 'violet' } }])
      .select('id, name, email, preferences, created_at')
      .single();

    if (error) {
      if (isSupabaseConnectionError(error)) {
        return res.status(503).json({ error: 'Database unavailable. Please try again shortly.' });
      }
      throw error;
    }

    const token = generateToken(user.id);
    res.status(201).json({ message: 'Account created successfully', token, user });
  } catch (error) {
    console.error('Register error:', error);
    if (isSupabaseConnectionError(error)) {
      return res.status(503).json({ error: 'Database unavailable. Please try again shortly.' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, password, preferences')
      .eq('email', email)
      .single();

    if (error) {
      if (isSupabaseConnectionError(error)) {
        return res.status(503).json({ error: 'Database unavailable. Please try again shortly.' });
      }
      return res.status(500).json({ error: 'Login failed' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    res.json({ message: 'Login successful', token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    if (isSupabaseConnectionError(error)) {
      return res.status(503).json({ error: 'Database unavailable. Please try again shortly.' });
    }
    res.status(500).json({ error: 'Login failed' });
  }
};

const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

const updateProfile = async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (preferences) updates.preferences = preferences;

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, name, email, preferences')
      .single();

    if (error) throw error;
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
};

module.exports = { register, login, getProfile, updateProfile };
