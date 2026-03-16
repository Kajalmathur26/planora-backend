const supabase = require('../config/supabase');

const financeModel = {
  async getAll(userId, { type, category, days = 30, limit = 100 }) {
    const cutoff = new Date(Date.now() - parseInt(days) * 86400000).toISOString().split('T')[0];

    let query = supabase
      .from('finance_transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', cutoff)
      .order('date', { ascending: false })
      .limit(parseInt(limit));

    if (type) query = query.eq('type', type);
    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) throw error;

    const totalIncome = data.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0);
    const totalExpense = data.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);

    const today = new Date().toISOString().split('T')[0];
    const todayData = data.filter(t => t.date === today);
    const todayIncome = todayData.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0);
    const todayExpense = todayData.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);

    return {
      transactions: data,
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        todayIncome,
        todayExpense,
      }
    };
  },

  async create(userId, transactionData) {
    const { type, amount, category, description, date } = transactionData;
    const { data, error } = await supabase
      .from('finance_transactions')
      .insert([{
        user_id: userId,
        type,
        amount: parseFloat(amount),
        category: category || 'Other',
        description: description || '',
        date: date || new Date().toISOString().split('T')[0],
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(userId, id, updates) {
    const safeUpdates = { ...updates, updated_at: new Date().toISOString() };
    if (safeUpdates.amount) safeUpdates.amount = parseFloat(safeUpdates.amount);
    if (safeUpdates.date === '') safeUpdates.date = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('finance_transactions')
      .update(safeUpdates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(userId, id) {
    const { error } = await supabase
      .from('finance_transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  async getAnalytics(userId, days = 30) {
    const cutoff = new Date(Date.now() - parseInt(days) * 86400000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('finance_transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', cutoff)
      .order('date', { ascending: true });

    if (error) throw error;

    const categoryMap = {};
    data.filter(t => t.type === 'expense').forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + parseFloat(t.amount);
    });
    const categoryBreakdown = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    const trendMap = {};
    data.forEach(t => {
      if (!trendMap[t.date]) trendMap[t.date] = { date: t.date, income: 0, expense: 0 };
      trendMap[t.date][t.type] += parseFloat(t.amount);
    });
    const dailyTrend = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));

    const weeklyMap = {};
    data.forEach(t => {
      const d = new Date(t.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      if (!weeklyMap[key]) weeklyMap[key] = { week: key, income: 0, expense: 0 };
      weeklyMap[key][t.type] += parseFloat(t.amount);
    });
    const weeklySummary = Object.values(weeklyMap).sort((a, b) => a.week.localeCompare(b.week));

    return { categoryBreakdown, dailyTrend, weeklySummary };
  }
};

module.exports = financeModel;
