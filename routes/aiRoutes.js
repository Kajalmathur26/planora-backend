const express = require('express');
const router = express.Router();
const { analyzeProductivity, generateJournalPrompt, chatWithAI, suggestGoals } = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/analyze', analyzeProductivity);
router.post('/journal-prompts', generateJournalPrompt);
router.post('/chat', chatWithAI);
router.post('/suggest-goals', suggestGoals);

module.exports = router;
