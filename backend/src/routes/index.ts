import * as express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { redisService } from '../services/redisService';
import { geminiService } from '../services/geminiService';

const Router = express.Router;
const router = Router();

// Create new session
router.post('/session', (req, res) => {
  const sessionId = uuidv4();
  res.json({ sessionId });
});

// Get chat history for a session
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await redisService.getMessages(sessionId);
    res.json({ messages });
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

// Clear chat history for a session
router.delete('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await redisService.clearSession(sessionId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

// Chat endpoint
router.post('/chat/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Store user message
    await redisService.addMessage(sessionId, {
      role: 'user',
      content: message
    });

    // Generate response using Gemini
    const response = await geminiService.generateResponse(message);

    // Store assistant response
    await redisService.addMessage(sessionId, {
      role: 'assistant',
      content: response
    });

    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

export { router };