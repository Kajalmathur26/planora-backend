const express = require('express');
const router = express.Router();
const { getHabits, createHabit, logHabit, unlogHabit, updateHabit, deleteHabit } = require('../controllers/habitController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getHabits);
router.post('/', createHabit);
router.post('/:id/log', logHabit);
router.delete('/:id/log', unlogHabit);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);

module.exports = router;
