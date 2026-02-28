const express = require('express');
const router = express.Router();
const { getGoals, createGoal, updateGoal, deleteGoal, addMilestone } = require('../controllers/goalController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.post('/:id/milestones', addMilestone);

module.exports = router;
