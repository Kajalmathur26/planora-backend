const express = require('express');
const router = express.Router();
const { getGoals, createGoal, updateGoal, deleteGoal, addMilestone, toggleMilestone, deleteMilestone } = require('../controllers/goalController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.post('/:id/milestones', addMilestone);
router.put('/milestones/:milestoneId', toggleMilestone);
router.delete('/milestones/:milestoneId', deleteMilestone);

module.exports = router;
