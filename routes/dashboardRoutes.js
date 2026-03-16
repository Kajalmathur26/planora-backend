const express = require('express');
const router = express.Router();
const { getDashboardData, getWeeklyReport } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getDashboardData);
router.get('/weekly-report', authenticate, getWeeklyReport);

module.exports = router;
