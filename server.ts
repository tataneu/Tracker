import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Gemini client initialization
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Tomorrow recommendation endpoint
app.post('/api/ai/recommendation', async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API Key is not configured.' });
    }

    const { config, entries } = req.body;
    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({ error: 'Invalid entries data' });
    }

    if (entries.length === 0) {
      return res.json({
        isDataSufficient: false,
        title: 'Not enough study data yet',
        summary: 'Not enough study entries recorded to generate a personalized recommendation. Add a few daily entries to get started.',
        actionableSteps: [
          'Record today\'s study hours and subjects studied',
          'Mention specific topics or chapters completed',
          'Include test scores or notes if available',
        ],
        reasoning: 'AI requires at least 1-2 study logs to analyze study pace, target gaps, and test accuracy.',
        generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    // Prepare clear structured context for Gemini
    const recentLogs = entries.slice(0, 10).map((e: any) => ({
      date: e.date,
      hours: e.studyHours,
      subjects: Array.isArray(e.subjects) ? e.subjects.join(', ') : '',
      topics: e.topics || '',
      completed: e.completed || '',
      wentWrong: e.wentWrong || '',
      distractions: e.distractions || '',
      tomorrowPlan: e.tomorrowPlan || '',
      testResult: e.testResult
        ? `${e.testResult.testName} (${e.testResult.subject}): ${e.testResult.score}/${e.testResult.maxMarks} (${e.testResult.percentage}%)`
        : 'None',
    }));

    const prompt = `You are a personal study advisor for a student in a 90-Day Study Progress Challenge.
Challenge settings:
Daily Target: ${config?.dailyTargetHours || 6} hours.
Weekly Target: ${config?.weeklyTargetHours || 42} hours.

Recent recorded daily study entries (newest first):
${JSON.stringify(recentLogs, null, 2)}

Your task:
Analyze the student's study momentum, target gaps, test accuracy, mistakes, and reported reflections.
Provide a clear, actionable, practical study plan for TOMORROW.

CRITICAL RULES:
1. NEVER invent weaknesses or topics that the student has not mentioned.
2. Ground every step strictly in the student's actual recorded entries.
3. Keep steps realistic (3-4 concise bullet points).
4. Include a brief reasoning statement explaining WHY this plan was generated based on the data.

Format response as JSON with this exact schema:
{
  "title": "Actionable title for tomorrow's plan",
  "summary": "1-2 sentence overview of recent study momentum and focus",
  "actionableSteps": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "reasoning": "Brief explanation grounded explicitly in recorded data (e.g., 'Recommended because your study hours fell by 1.5h over the last 2 days and test score in Physics was 68%')",
  "isDataSufficient": true
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            actionableSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            reasoning: { type: Type.STRING },
            isDataSufficient: { type: Type.BOOLEAN },
          },
          required: ['title', 'summary', 'actionableSteps', 'reasoning', 'isDataSufficient'],
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      data.generatedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return res.json(data);
    } else {
      throw new Error('No text generated from Gemini model.');
    }
  } catch (err: any) {
    console.error('Error in /api/ai/recommendation:', err);
    res.status(500).json({ error: err.message || 'Failed to generate AI recommendation' });
  }
});

// Reflections pattern analyzer endpoint
app.post('/api/ai/reflections', async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API Key is not configured.' });
    }

    const { entries } = req.body;
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.json({ insights: [] });
    }

    const reflectionLogs = entries
      .filter((e: any) => e.wentWrong || e.distractions || e.wentWell || e.notes)
      .slice(0, 15)
      .map((e: any) => `[${e.date}] Went Well: "${e.wentWell || ''}", Went Wrong: "${e.wentWrong || ''}", Distraction: "${e.distractions || ''}"`)
      .join('\n');

    if (!reflectionLogs.trim()) {
      return res.json({ insights: [] });
    }

    const prompt = `Analyze these student daily study reflections and synthesize recurring patterns (e.g., phone distractions, fatigue/sleep, difficult topics, procrastination).

Reflections:
${reflectionLogs}

Return JSON:
{
  "insights": [
    {
      "category": "distraction",
      "title": "Mobile Phone Distractions",
      "occurrenceCount": 3,
      "userReportedExamples": ["Scrolled social media after lunch", "Phone alerts during physics study"],
      "insightSummary": "User frequently reports losing study momentum to phone notifications during afternoon sessions."
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      return res.json(data);
    }
    return res.json({ insights: [] });
  } catch (err: any) {
    console.error('Error in /api/ai/reflections:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze reflections' });
  }
});

// Start Express and integrate Vite dev middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`90-Day Study Tracker server running on http://localhost:${PORT}`);
  });
}

startServer();
