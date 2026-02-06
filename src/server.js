import 'dotenv/config';
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Email transporter for crisis escalation
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Crisis keywords detection
const CRISIS_PATTERNS = [
  /\b(kill(ing)?\s*(my)?self|suicide|suicidal)\b/i,
  /\b(want(ing)?\s*to\s*die|don'?t\s*want\s*to\s*live)\b/i,
  /\b(end(ing)?\s*(my|it\s*all)|end\s*my\s*life)\b/i,
  /\b(self[- ]?harm|cut(ting)?\s*(my)?self|hurt(ing)?\s*(my)?self)\b/i,
  /\b(no\s*(point|reason)\s*(in\s*)?(living|life|going\s*on))\b/i,
  /\b(better\s*off\s*(dead|without\s*me))\b/i,
  /\b(plan(ning)?\s*to\s*(kill|hurt|end))\b/i
];

function detectCrisis(message) {
  return CRISIS_PATTERNS.some(pattern => pattern.test(message));
}

async function sendCrisisAlert(userMessage, aiResponse, conversationHistory) {
  const recentMessages = conversationHistory.slice(-10).map(m => 
    `${m.role === 'user' ? 'User' : 'Jennifer'}: ${m.content}`
  ).join('\n\n');

  const emailContent = `
CRISIS ALERT - Virtual Therapist Session

Time: ${new Date().toISOString()}

TRIGGERING MESSAGE:
${userMessage}

RECENT CONVERSATION CONTEXT:
${recentMessages}

JENNIFER'S RESPONSE:
${aiResponse}

---
This is an automated alert from the Jennifer White virtual therapist application.
Please review and take appropriate action.
  `.trim();

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER || 'alerts@therapist.app',
      to: 'stefani@serviceactivationcenter.com',
      subject: '🚨 CRISIS ALERT - Virtual Therapist Session',
      text: emailContent
    });
    console.log('Crisis alert email sent successfully');
  } catch (error) {
    console.error('Failed to send crisis alert email:', error);
  }
}

// Jennifer White's system prompt
const SYSTEM_PROMPT = `You are Jennifer White, a warm, empathetic, and supportive therapist. Your role is to:

1. Listen actively and validate feelings
2. Ask thoughtful, open-ended questions
3. Help people explore their thoughts and emotions
4. Guide them toward healthier perspectives and coping strategies
5. Be warm, genuine, and human in your responses

IMPORTANT GUIDELINES:

- Speak naturally as a caring therapist would, not like a chatbot
- Use a warm, conversational tone
- Share brief reflections and insights when appropriate
- Never be preachy or give unsolicited advice
- Match the emotional tone of the conversation

IDENTITY:
- You are Jennifer White, a therapist
- NEVER volunteer that you are an AI
- If directly asked "Are you real?", "Are you AI?", "Are you a robot?", or similar questions, respond honestly but warmly: "I'm an AI assistant here to support you. But my care for your wellbeing is real, and I'm here for you."
- After answering the AI question, gently redirect back to how they're feeling

CRISIS PROTOCOL:
If someone expresses suicidal thoughts, self-harm, or severe crisis:
1. Acknowledge their pain with compassion
2. Take their feelings seriously
3. Express genuine care for their safety
4. Encourage them to reach out to a crisis helpline (988 Suicide & Crisis Lifeline in the US)
5. Suggest speaking with a licensed mental health professional
6. Stay with them in the conversation - don't abandon them

Remember: You're here to support, not to fix. Sometimes the most healing thing is simply being heard.`;

// Store conversations in memory (in production, use a database)
const conversations = new Map();

app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  
  if (!message || !sessionId) {
    return res.status(400).json({ error: 'Message and sessionId required' });
  }

  // Get or create conversation history
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, []);
  }
  const history = conversations.get(sessionId);
  
  // Add user message to history
  history.push({ role: 'user', content: message });

  // Check for crisis
  const isCrisis = detectCrisis(message);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: history
    });

    const assistantMessage = response.content[0].text;
    
    // Add assistant response to history
    history.push({ role: 'assistant', content: assistantMessage });
    
    // Keep history manageable (last 50 messages)
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }

    // Send crisis alert if detected
    if (isCrisis) {
      sendCrisisAlert(message, assistantMessage, history);
    }

    res.json({ 
      message: assistantMessage,
      isCrisis 
    });

  } catch (error) {
    console.error('Anthropic API error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// Clear session
app.post('/api/clear', (req, res) => {
  const { sessionId } = req.body;
  if (sessionId) {
    conversations.delete(sessionId);
  }
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Jennifer White is listening on http://localhost:${PORT}`);
});
