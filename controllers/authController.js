const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const userModel = require('../models/userModel');
const { sendWelcomeEmail, sendLoginNotification } = require('../utils/emailService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await userModel.create({ 
      name, 
      email, 
      password: hashedPassword, 
      role: 'user', 
      preferences: { theme: 'dark', accent: 'violet' } 
    });

    const token = generateToken(user.id);
    sendWelcomeEmail(user);
    res.status(201).json({ message: 'Account created successfully', token, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;
    sendLoginNotification(user);
    res.json({ message: 'Login successful', token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { token: googleToken } = req.body;
    if (!googleToken) return res.status(400).json({ error: 'Google token is required' });

    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture: avatar_url } = payload;

    let user = await userModel.findByEmail(email);

    if (!user) {
      user = await userModel.create({
        name,
        email,
        password: 'GOOGLE_OAUTH_USER',
        role: 'user',
        avatar_url,
        preferences: { theme: 'dark', accent: 'violet' }
      });
      sendWelcomeEmail(user);
    } else {
      sendLoginNotification(user);
    }

    const token = generateToken(user.id);
    res.json({ message: 'Google login successful', token, user });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Google login failed' });
  }
};

const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

const updateProfile = async (req, res) => {
  try {
    const { name, preferences, phone, avatar_url } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (preferences !== undefined) updates.preferences = preferences;
    if (phone !== undefined) updates.phone = phone;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    const user = await userModel.update(req.user.id, updates);
    res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Update failed' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
    }

    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await userModel.setResetToken(user.id, resetToken, new Date(Date.now() + 3600000).toISOString());
    console.log(`Password reset token for ${email}: ${resetToken}`);
    res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

const deleteProfile = async (req, res) => {
  try {
    await userModel.delete(req.user.id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Deletion failed' });
  }
};

module.exports = { register, login, googleLogin, getProfile, updateProfile, forgotPassword, deleteProfile };
