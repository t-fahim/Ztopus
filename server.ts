import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = process.env.HOST || '0.0.0.0';
const GEMINI_CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const GEMINI_PARSER_MODEL = process.env.GEMINI_PARSER_MODEL || 'gemini-3.8-flash';

app.use(express.json());

// Initialize Google GenAI on the server side with environment API key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Server-side AI Chatbot endpoint for students
app.post('/api/gemini/chat', async (req, res) => {
  const { message, history = [], contextOpportunity, stream = false } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  let systemInstruction = `You are Ztopus AI, a ultra-fast, helpful, and concise AI student advisor for Ztopus.
Ztopus is a distraction-free student opportunity radar that helps university and college students discover hackdays, scholarships, research grants, workshops, and campus events without needing social media.

Your directives:
1. Be ultra-fast, punchy, and direct. Avoid unnecessary conversational fluff, filler, or lengthy intros.
2. Structure answers with clean bullet points, numbered steps, or checklist items.
3. Help students navigate hackathons (MLH, campus hackdays, dev sprints), find teammates, and polish ideas.
4. Answer scholarship and research fellowship questions with clear eligibility notes and application strategy.
5. Help draft team pitches, cold emails to professors/organizers, or project motivation outlines.
6. If an active opportunity context is provided, ground your answer directly in its requirements.`;

  if (contextOpportunity) {
    systemInstruction += `\n\nActive Opportunity Context:\nTitle: ${contextOpportunity.title}\nCategory: ${contextOpportunity.category}\nHost: ${contextOpportunity.host}\nDeadline: ${contextOpportunity.deadline}\nEligibility: ${contextOpportunity.eligibility || 'All students'}\nDescription: ${contextOpportunity.description}`;
  }

  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  if (Array.isArray(history)) {
    for (const item of history.slice(-6)) {
      if (item.sender === 'user') {
        contents.push({ role: 'user', parts: [{ text: item.text }] });
      } else if (item.sender === 'bot') {
        contents.push({ role: 'model', parts: [{ text: item.text }] });
      }
    }
  }

  contents.push({ role: 'user', parts: [{ text: message }] });

  // If streaming is requested, stream via Server-Sent Events (SSE)
  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    try {
      const responseStream = await ai.models.generateContentStream({
        model: GEMINI_CHAT_MODEL,
        contents,
        config: {
          systemInstruction,
          temperature: 0.6,
        },
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
      res.write(`data: [DONE]\n\n`);
      return res.end();
    } catch (err: any) {
      console.error('Error during streaming chat:', err);
      // Send fallback chunk
      const fallback = `Here is key advice from Ztopus AI:\n\n• **Direct Strategy**: Focus on tailoring your application directly to the stated criteria.\n• **Pitch Framework**: State the problem, your tech solution, team roles, and expected impact.\n• **Next Step**: Double-check deadlines and reach out to team members early.`;
      res.write(`data: ${JSON.stringify({ text: fallback })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      return res.end();
    }
  }

  // Standard fast JSON response using GEMINI_CHAT_MODEL
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_CHAT_MODEL,
      contents,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    const reply = response.text || "I'm here to help with any student events or scholarship questions!";
    return res.json({ reply });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    // Instant helpful fallback to prevent stalling
    const lower = message.toLowerCase();
    let smartReply = "I'm Ztopus AI! I'm here to help you conquer hackdays, scholarships, and campus research opportunities. Ask me to draft a pitch, check eligibility, or outline your application strategy!";
    if (lower.includes('team') || lower.includes('pitch')) {
      smartReply = "Here is a quick team-up pitch template for Ztopus:\n\n1. **Hook**: 'Looking for 1-2 teammates for the upcoming hackday! Building a web/mobile solution.'\n2. **Your Stack**: Mention your primary strengths (e.g. Frontend React, Backend Python, UI/UX).\n3. **Looking For**: State complementary roles needed (e.g. ML engineer, data researcher).\n4. **Call to Action**: 'DM me or drop your handle if you want to team up!'";
    } else if (lower.includes('scholarship') || lower.includes('grant')) {
      smartReply = "Quick Scholarship Checklist from Ztopus AI:\n\n• **Direct Alignment**: Tie your personal essay to the sponsor's mission statement.\n• **Demonstrated Impact**: Quantify accomplishments (projects built, students tutored, code committed).\n• **Recommendation Letters**: Request them at least 2 weeks before the deadline.\n• **Proofread**: Keep formatting clean and concise.";
    }

    return res.json({ reply: smartReply });
  }
});

// AI Scraper / Smart Clipper Endpoint: Parses raw text from Facebook/Instagram/LinkedIn/News into a structured opportunity
app.post('/api/scraper/parse-post', async (req, res) => {
  const { rawText = '', sourceUrl = '', sourcePlatform = '' } = req.body || {};

  if (!rawText || typeof rawText !== 'string') {
    return res.status(400).json({ error: 'Raw post text is required' });
  }

  try {

    const prompt = `Analyze this student announcement, social media post, or university news snippet:
"""
${rawText}
"""

Source platform: ${sourcePlatform || 'web'}
Source URL: ${sourceUrl || 'None provided'}

Extract and return a valid JSON object matching this schema:
{
  "title": "Clear, concise title",
  "host": "Organizing club, department, or company",
  "category": "hackday" | "scholarship" | "university-event" | "internship" | "workshop",
  "format": "In-Person" | "Virtual" | "Hybrid",
  "location": "Specific location or online platform",
  "deadline": "YYYY-MM-DD (estimate if only month/week given)",
  "eventDate": "Human readable event date (e.g. Nov 12, 2026)",
  "awardOrPrize": "Prize or stipend if mentioned, or null",
  "eligibility": "Who can attend/apply",
  "description": "2-3 sentence clean summary of the event",
  "tags": ["array", "of", "3-5", "relevant", "lowercase", "tags"]
}`;

    const response = await ai.models.generateContent({
      model: GEMINI_PARSER_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            host: { type: Type.STRING },
            category: { type: Type.STRING },
            format: { type: Type.STRING },
            location: { type: Type.STRING },
            deadline: { type: Type.STRING },
            eventDate: { type: Type.STRING },
            awardOrPrize: { type: Type.STRING },
            eligibility: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'title',
            'host',
            'category',
            'format',
            'location',
            'deadline',
            'eventDate',
            'eligibility',
            'description',
            'tags',
          ],
        },
      },
    });

    const parsedJson = JSON.parse(response.text?.trim() || '{}');
    return res.json({ parsedOpportunity: parsedJson });
  } catch (error: any) {
    console.error('Error parsing post with Gemini:', error);
    // Resilient fallback so app continues to work without an API key
    const lines = rawText.split('\n').map((l: string) => l.trim()).filter(Boolean);
    const title = lines[0]?.slice(0, 70) || 'Campus Opportunity Announcement';
    const lower = rawText.toLowerCase();
    let category = 'university-event';
    if (lower.includes('hack')) category = 'hackday';
    else if (lower.includes('scholarship') || lower.includes('grant') || lower.includes('fellowship')) category = 'scholarship';
    else if (lower.includes('intern') || lower.includes('hire') || lower.includes('job')) category = 'internship';
    else if (lower.includes('workshop') || lower.includes('bootcamp')) category = 'workshop';

    return res.json({
      parsedOpportunity: {
        title,
        host: sourcePlatform ? `${sourcePlatform.charAt(0).toUpperCase() + sourcePlatform.slice(1)} Channel` : 'Campus Community',
        category,
        format: lower.includes('online') || lower.includes('zoom') || lower.includes('virtual') ? 'Virtual' : 'In-Person',
        location: lower.includes('online') || lower.includes('zoom') ? 'Online' : 'Main Campus',
        deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        eventDate: 'Upcoming this term',
        awardOrPrize: lower.includes('$') || lower.includes('prize') ? 'Cash prizes / awards' : null,
        eligibility: 'Open to enrolled students',
        description: rawText.slice(0, 200) + '...',
        tags: [category, 'students', 'campus'],
      },
    });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Ztopus server running on http://${HOST}:${PORT}`);
  });
}

startServer();
