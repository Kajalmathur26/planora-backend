const express = require('express');
const router = express.Router();
const { getMoods, logMood, getMoodStats } = require('../controllers/moodController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getMoods);
router.get('/stats', getMoodStats);
router.post('/', logMood);

module.exports = router;
