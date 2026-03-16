const { GoogleGenerativeAI } = require('@google/generative-ai');
const taskModel = require('../models/taskModel');
const moodModel = require('../models/moodModel');
const habitModel = require('../models/habitModel');
const goalModel = require('../models/goalModel');
const dashboardModel = require('../models/dashboardModel');
const journalModel = require('../models/journalModel');

// ---------- Helpers ---------- //

const getGenAI = () => {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const getModel = () => {
  const genAI = getGenAI();
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });
};

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('JSON Parse Error:', text);
    return null;
  }
};

// ---------- 1. Productivity Analysis ---------- //

const analyzeProductivity = async (req, res) => {
  try {
    const model = getModel();

    const [tasks, moods, habits] = await Promise.all([
      taskModel.getAll(req.user.id, {}),
      moodModel.getAll(req.user.id, {
        start_date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
      }),
      habitModel.getAll(req.user.id),
    ]);

    const prompt = `
You are a productivity coach. Based on this weekly data for ${req.user.name}:

Tasks: ${JSON.stringify(tasks.slice(0, 20))}
Mood logs: ${JSON.stringify(moods)}
Active habits: ${JSON.stringify(habits.slice(0, 10))}

Provide:
1. Key observations (2-3)
2. Patterns noticed
3. 3 actionable recommendations
4. Motivational closing

Keep it warm, concise and practical.
`;

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: prompt }] }
      ],
    });

    const analysis = result.response.text();

    res.json({
      analysis,
      generated_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      error: 'Failed to generate analysis',
      details: error.message,
    });
  }
};

// ---------- 2. Journal Prompts ---------- //

const generateJournalPrompt = async (req, res) => {
  try {
    const model = getModel();
    const { mood, theme } = req.body;

    const prompt = `
Generate 3 thoughtful, introspective journal prompts for someone feeling ${mood || 'reflective'} today
${theme ? `with the theme of "${theme}"` : ''}.

Return ONLY a JSON array:
[
  { "prompt": "...", "category": "gratitude|growth|reflection|creativity" }
]
No markdown.
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    let text = result.response.text().trim();
    text = text.replace(/```json|```/g, '');

    const prompts = safeJsonParse(text);

    if (!prompts) {
      return res.status(500).json({ error: 'Invalid AI response format' });
    }

    res.json({ prompts });

  } catch (error) {
    console.error('Journal prompt error:', error);
    res.status(500).json({ error: 'Failed to generate prompts' });
  }
};

// ---------- 3. AI Chat ---------- //

const chatWithAI = async (req, res) => {
  try {
    const model = getModel();
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    const systemContext = `
You are Plora, a friendly AI assistant for Planora (a digital planner and journal app).
You help with tasks, goals, habits, mood tracking, and journaling.

User name: ${req.user.name}
${context ? `Context: ${context}` : ''}

Be warm, concise, actionable.
Keep under 200 words unless asked otherwise.
`;

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemContext}\n\nUser: ${message}` }],
        },
      ],
    });

    const reply = result.response.text();

    res.json({
      reply,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'AI chat unavailable' });
  }
};

// ---------- 4. Goal Suggestions ---------- //

const suggestGoals = async (req, res) => {
  try {
    const model = getModel();
    const { interests, timeframe } = req.body;

    const prompt = `
Suggest 5 SMART goals for someone interested in:
${interests || 'productivity, health, learning'}
for a ${timeframe || '3-month'} timeframe.

Return ONLY JSON:
[
  {
    "title": "",
    "description": "",
    "category": "personal|career|health|learning|financial",
    "target_value": "",
    "unit": "",
    "suggested_milestones": []
  }
]
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    let text = result.response.text().trim();
    text = text.replace(/```json|```/g, '');

    const goals = safeJsonParse(text);

    if (!goals) {
      return res.status(500).json({ error: 'Invalid AI response format' });
    }

    res.json({ goals });

  } catch (error) {
    console.error('Goal suggestion error:', error);
    res.status(500).json({ error: 'Failed to suggest goals' });
  }
};

// ---------- 5. Daily Plan ---------- //

const dailyPlan = async (req, res) => {
  try {
    const model = getModel();
    const today = new Date().toISOString().split('T')[0];

    const [tasks, habits, goals] = await Promise.all([
      taskModel.getAll(req.user.id, { status: 'pending' }),
      habitModel.getAll(req.user.id),
      goalModel.getAll(req.user.id),
    ]);

    const activeGoals = goals.filter(g => g.status === 'active');

    const prompt = `
You are a productivity coach. Create a time-blocked daily schedule for ${req.user.name} for today (${today}).

Pending/In-Progress Tasks: ${JSON.stringify(tasks.slice(0, 10))}
Active Habits: ${JSON.stringify(habits)}
Active Goals: ${JSON.stringify(activeGoals)}

Create a realistic schedule from 7:00 AM to 10:00 PM.
Include breaks, meals, and habit time.
Format each block as: HH:MM – Activity (reason/goal it serves)

Return ONLY a JSON array:
[
  { "time": "09:00", "activity": "...", "duration": 60, "category": "work|habit|break|goal|personal", "emoji": "💼" }
]
No markdown, no explanation.
`;

    const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    let text = result.response.text().trim().replace(/```json|```/g, '');
    const schedule = safeJsonParse(text);

    if (!schedule) return res.status(500).json({ error: 'Invalid AI response' });
    res.json({ schedule, date: today, generated_at: new Date().toISOString() });
  } catch (error) {
    console.error('Daily plan error:', error);
    res.status(500).json({ error: 'Failed to generate daily plan' });
  }
};

// ---------- 6. Smart Task Suggestions ---------- //

const suggestTasks = async (req, res) => {
  try {
    const model = getModel();

    const [tasks, goals, habits] = await Promise.all([
      taskModel.getAll(req.user.id, { status: 'pending' }),
      goalModel.getAll(req.user.id),
      habitModel.getAll(req.user.id),
    ]);

    const activeGoals = goals.filter(g => g.status === 'active');

    const prompt = `
Based on the user's current tasks, goals, and habits, suggest 5 specific, actionable tasks they should do today or this week.

Current tasks: ${JSON.stringify(tasks.slice(0, 10))}
Active goals: ${JSON.stringify(activeGoals)}
Habits: ${JSON.stringify(habits.slice(0, 5))}

Return ONLY JSON:
[
  {
    "title": "...",
    "description": "...",
    "priority": "low|medium|high|urgent",
    "category": "work|personal|health|learning",
    "reason": "Brief explanation why this task helps"
  }
]
No markdown.
`;

    const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    let text = result.response.text().trim().replace(/```json|```/g, '');
    const suggestions = safeJsonParse(text);

    if (!suggestions) return res.status(500).json({ error: 'Invalid AI response' });
    res.json({ suggestions, generated_at: new Date().toISOString() });
  } catch (error) {
    console.error('Task suggestion error:', error);
    res.status(500).json({ error: 'Failed to suggest tasks' });
  }
};

module.exports = {
  analyzeProductivity,
  generateJournalPrompt,
  chatWithAI,
  suggestGoals,
  dailyPlan,
  suggestTasks,
};