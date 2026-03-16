const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { exportFinanceCSV, exportJournalText, exportProductivityJSON } = require('../controllers/exportController');

router.use(authenticate);

router.get('/finance', exportFinanceCSV);
router.get('/journal', exportJournalText);
router.get('/productivity', exportProductivityJSON);

module.exports = router;
