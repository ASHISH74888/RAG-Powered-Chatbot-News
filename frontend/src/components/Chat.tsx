import React, { useEffect, useState, useRef } from 'react';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { apiService, ChatMessage } from '../services/api';

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        await apiService.createSession();
        const history = await apiService.getChatHistory();
        setMessages(history);
      } catch (error) {
        setError('Failed to initialize chat. Please try again.');
        console.error('Error initializing chat:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add user message
      const userMessage: ChatMessage = {
        role: 'user',
        content,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, userMessage]);

      // Get bot response
      const response = await apiService.sendMessage(content);
      
      // Add bot message
      const botMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      await apiService.clearHistory();
      setMessages([]);
    } catch (error) {
      setError('Failed to clear history. Please try again.');
      console.error('Error clearing history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="header">
        <h1>News Assistant</h1>
        <div className="actions">
          <button 
            onClick={handleClearHistory}
            disabled={loading || messages.length === 0}
          >
            Clear History
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="message-list">
        {messages.length === 0 ? (
          <div className="empty-state">
            Ask me anything about the news! I'm here to help.
          </div>
        ) : (
          messages.map((message, index) => (
            <Message key={`${message.timestamp}-${index}`} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput 
        onSendMessage={handleSendMessage} 
        disabled={loading}
        placeholder="Ask me about the latest news..."
      />
    </div>
  );
};