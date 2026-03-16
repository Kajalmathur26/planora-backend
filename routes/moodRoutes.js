const express = require('express');
const router = express.Router();
const { getMoods, logMood, getMoodStats, updateMood } = require('../controllers/moodController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/stats', getMoodStats);
router.get('/', getMoods);
router.post('/', logMood);
router.put('/:id', updateMood);

module.exports = router;
