import { createClient } from 'redis';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

class RedisService {
  private client;
  private readonly MESSAGE_EXPIRY = 24 * 60 * 60; // 24 hours in seconds

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', err => console.error('Redis Client Error:', err));
    this.client.connect();
  }

  private getSessionKey(sessionId: string): string {
    return `chat:${sessionId}`;
  }

  async addMessage(sessionId: string, message: Omit<ChatMessage, 'timestamp'>): Promise<void> {
    const key = this.getSessionKey(sessionId);
    const chatMessage: ChatMessage = {
      ...message,
      timestamp: Date.now()
    };

    try {
      await this.client.rPush(key, JSON.stringify(chatMessage));
      await this.client.expire(key, this.MESSAGE_EXPIRY);
    } catch (error) {
      console.error('Error adding message to Redis:', error);
      throw error;
    }
  }

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    const key = this.getSessionKey(sessionId);

    try {
      const messages = await this.client.lRange(key, 0, -1);
      return messages.map(msg => JSON.parse(msg));
    } catch (error) {
      console.error('Error getting messages from Redis:', error);
      throw error;
    }
  }

  async clearSession(sessionId: string): Promise<void> {
    const key = this.getSessionKey(sessionId);

    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Error clearing session from Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }
}

export const redisService = new RedisService();
export type { ChatMessage };
