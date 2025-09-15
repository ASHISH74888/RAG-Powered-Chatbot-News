import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

class ApiService {
  private sessionId: string | null = null;

  async createSession(): Promise<string> {
    try {
      const response = await axios.post(`${API_URL}/session`);
      this.sessionId = response.data.sessionId;
      if (!this.sessionId) {
        throw new Error('No session ID received from server');
      }
      return this.sessionId;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  async sendMessage(message: string): Promise<string> {
    try {
      if (!this.sessionId) {
        await this.createSession();
      }

      if (!this.sessionId) {
        throw new Error('Failed to create session');
      }

      console.log('Sending message to:', `${API_URL}/chat/${this.sessionId}`);
      const response = await axios.post(`${API_URL}/chat/${this.sessionId}`, { message });
      
      if (!response.data || !response.data.response) {
        throw new Error('Invalid response from server');
      }
      
      return response.data.response;
    } catch (error) {
      console.error('Error sending message:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw error;
    }
  }

  async getChatHistory(): Promise<ChatMessage[]> {
    if (!this.sessionId) {
      return [];
    }

    try {
      const response = await axios.get(`${API_URL}/history/${this.sessionId}`);
      return response.data.messages || [];
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  async clearHistory(): Promise<void> {
    if (!this.sessionId) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/history/${this.sessionId}`);
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  setSessionId(sessionId: string) {
    this.sessionId = sessionId;
  }
}

export const apiService = new ApiService();