const express = require('express');
const router = express.Router();
const { register, login, googleLogin, getProfile, updateProfile, forgotPassword, deleteProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/forgot-password', forgotPassword);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.delete('/profile', authenticate, deleteProfile);

module.exports = router;
