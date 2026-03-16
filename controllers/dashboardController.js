const dashboardModel = require('../models/dashboardModel');

const getDashboardData = async (req, res) => {
  try {
    const data = await dashboardModel.getSummary(req.user.id);
    res.json(data);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

const getWeeklyReport = async (req, res) => {
  try {
    const data = await dashboardModel.getWeeklyReport(req.user.id);
    res.json({ data });
  } catch (error) {
    console.error('Weekly report error:', error);
    res.status(500).json({ error: 'Failed to load weekly report' });
  }
};

module.exports = { getDashboardData, getWeeklyReport };
