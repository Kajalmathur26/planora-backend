const express = require('express');
const router = express.Router();
const { analyzeProductivity, generateJournalPrompt, chatWithAI, suggestGoals, dailyPlan, suggestTasks } = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/analyze', analyzeProductivity);
router.post('/journal-prompts', generateJournalPrompt);
router.post('/chat', chatWithAI);
router.post('/suggest-goals', suggestGoals);
router.post('/daily-plan', dailyPlan);
router.post('/suggest-tasks', suggestTasks);

module.exports = router;
