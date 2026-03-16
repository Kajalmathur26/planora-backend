const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getTransactions, createTransaction, updateTransaction, deleteTransaction, getAnalytics } = require('../controllers/financeController');

router.use(authenticate);
router.get('/analytics', getAnalytics);
router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
