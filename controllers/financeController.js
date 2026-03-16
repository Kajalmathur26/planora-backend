const financeModel = require('../models/financeModel');

const getTransactions = async (req, res) => {
    try {
        const result = await financeModel.getAll(req.user.id, req.query);
        res.json(result);
    } catch (error) {
        console.error('getTransactions error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};

const createTransaction = async (req, res) => {
    try {
        const transaction = await financeModel.create(req.user.id, req.body);
        res.status(201).json({ transaction });
    } catch (error) {
        console.error('createTransaction error:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
};

const updateTransaction = async (req, res) => {
    try {
        const transaction = await financeModel.update(req.user.id, req.params.id, req.body);
        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
        res.json({ transaction });
    } catch (error) {
        console.error('updateTransaction error:', error);
        res.status(500).json({ error: 'Failed to update transaction' });
    }
};

const deleteTransaction = async (req, res) => {
    try {
        await financeModel.delete(req.user.id, req.params.id);
        res.json({ message: 'Transaction deleted' });
    } catch (error) {
        console.error('deleteTransaction error:', error);
        res.status(500).json({ error: 'Failed to delete transaction' });
    }
};

const getAnalytics = async (req, res) => {
    try {
        const analytics = await financeModel.getAnalytics(req.user.id, req.query.days);
        res.json(analytics);
    } catch (error) {
        console.error('getAnalytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};

module.exports = { getTransactions, createTransaction, updateTransaction, deleteTransaction, getAnalytics };
