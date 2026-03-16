const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, getSystemStats } = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');

// Admin Authorization Middleware
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
};

// Protect all admin routes
router.use(authenticate);
router.use(authorizeAdmin);

router.get('/users', getAllUsers);
router.put('/users/:userId/role', updateUserRole);
router.get('/stats', getSystemStats);

module.exports = router;
