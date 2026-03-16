const searchModel = require('../models/searchModel');

const globalSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return res.json({ results: { tasks: [], goals: [], journal: [] } });
        }

        const search = q.trim();
        const results = await searchModel.globalSearch(req.user.id, search);

        res.json({ results, query: search });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
};

module.exports = { globalSearch };
