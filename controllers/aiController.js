const { GoogleGenerativeAI } = require('@google/generative-ai');
const supabase = require('../config/supabase');

const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API key not configured');
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const analyzeProductivity = async (req, res) => {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Get recent data
    const [tasks, moods, habits] = await Promise.all([
      supabase.from('tasks').select('status, priority, created_at, due_date').eq('user_id', req.user.id).gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
      supabase.from('mood_logs').select('mood_score, mood_label, log_date').eq('user_id', req.user.id).gte('log_date', new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]),
      supabase.from('habits').select('name, current_streak').eq('user_id', req.user.id)
    ]);

    const prompt = `You are a productivity coach. Based on this weekly data for ${req.user.name}:

Tasks: ${JSON.stringify(tasks.data?.slice(0, 20))}
Mood logs: ${JSON.stringify(moods.data)}
Active habits: ${JSON.stringify(habits.data?.slice(0, 10))}

Provide a brief, personalized productivity analysis with:
1. Key observations (2-3 points)
2. Patterns noticed
3. 3 actionable recommendations
4. Motivational closing message

Keep it warm, concise, and practical. Format with clear sections.`;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    res.json({ analysis, generated_at: new Date().toISOString() });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ error: 'Failed to generate analysis', details: error.message });
  }
};

const generateJournalPrompt = async (req, res) => {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const { mood, theme } = req.body;

    const prompt = `Generate 3 thoughtful, introspective journal prompts for someone feeling ${mood || 'reflective'} today${theme ? ` with the theme of "${theme}"` : ''}. 
    
Make them open-ended, emotionally intelligent, and conducive to self-discovery. 
Format as a JSON array with objects containing "prompt" and "category" (e.g., gratitude, growth, reflection, creativity).
Return ONLY the JSON array, no markdown.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith('```')) text = text.replace(/```json?\n?/, '').replace(/```$/, '');
    const prompts = JSON.parse(text);

    res.json({ prompts });
  } catch (error) {
    console.error('Journal prompt error:', error);
    res.status(500).json({ error: 'Failed to generate prompts' });
  }
};

const chatWithAI = async (req, res) => {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const systemContext = `You are Plora, a friendly AI assistant for Planora - a digital planner and journal app. 
You help users with: task management, goal setting, habit building, mood tracking, and journaling.
User name: ${req.user.name}
${context ? `Context: ${context}` : ''}
Be concise, warm, and actionable. Keep responses under 200 words unless asked for more detail.`;

    const result = await model.generateContent(`${systemContext}\n\nUser: ${message}`);
    const reply = result.response.text();

    res.json({ reply, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'AI chat unavailable' });
  }
};

const suggestGoals = async (req, res) => {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const { interests, timeframe } = req.body;

    const prompt = `Suggest 5 SMART goals for someone with these interests: ${interests || 'productivity, health, learning'} for a ${timeframe || '3-month'} timeframe.

Return as JSON array with objects: { title, description, category, target_value, unit, suggested_milestones: [] }
Categories: personal, career, health, learning, financial
Return ONLY the JSON array.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith('```')) text = text.replace(/```json?\n?/, '').replace(/```$/, '');
    const goals = JSON.parse(text);

    res.json({ goals });
  } catch (error) {
    res.status(500).json({ error: 'Failed to suggest goals' });
  }
};

module.exports = { analyzeProductivity, generateJournalPrompt, chatWithAI, suggestGoals };
