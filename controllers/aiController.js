const { GoogleGenerativeAI } = require('@google/generative-ai');
const supabase = require('../config/supabase');

// ---------- Helpers ---------- //

const getGenAI = () => {
  // if (!process.env.GEMINI_API_KEY) {
  //   throw new Error('Gemini API key not configured');
  // }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const getModel = () => {
  const genAI = getGenAI();
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash', // ✅ stable working model
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
      supabase
        .from('tasks')
        .select('status, priority, created_at, due_date')
        .eq('user_id', req.user.id)
        .gte(
          'created_at',
          new Date(Date.now() - 7 * 86400000).toISOString()
        ),

      supabase
        .from('mood_logs')
        .select('mood_score, mood_label, log_date')
        .eq('user_id', req.user.id)
        .gte(
          'log_date',
          new Date(Date.now() - 7 * 86400000)
            .toISOString()
            .split('T')[0]
        ),

      supabase
        .from('habits')
        .select('name, current_streak')
        .eq('user_id', req.user.id),
    ]);

    const prompt = `
You are a productivity coach. Based on this weekly data for ${req.user.name}:

Tasks: ${JSON.stringify(tasks.data?.slice(0, 20))}
Mood logs: ${JSON.stringify(moods.data)}
Active habits: ${JSON.stringify(habits.data?.slice(0, 10))}

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

module.exports = {
  analyzeProductivity,
  generateJournalPrompt,
  chatWithAI,
  suggestGoals,
};