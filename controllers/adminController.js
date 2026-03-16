const adminModel = require('../models/adminModel');

const getAllUsers = async (req, res) => {
  try {
    const users = await adminModel.getAllUsers();
    res.json({ users });
  } catch (error) {
    console.error('Admin getAllUsers error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const user = await adminModel.updateUserRole(req.params.userId, req.body.role);
    res.json({ message: 'User role updated', user });
  } catch (error) {
    console.error('Admin updateUserRole error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

const getSystemStats = async (req, res) => {
  try {
    const stats = await adminModel.getSystemStats();
    res.json({ stats });
  } catch (error) {
    console.error('Admin getSystemStats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

module.exports = { getAllUsers, updateUserRole, getSystemStats };
