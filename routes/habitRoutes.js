const express = require('express');
const router = express.Router();
const { getHabits, createHabit, logHabit, updateHabit, deleteHabit } = require('../controllers/habitController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getHabits);
router.post('/', createHabit);
router.post('/:id/log', logHabit);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);

module.exports = router;
