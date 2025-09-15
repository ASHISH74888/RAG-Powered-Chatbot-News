import React from 'react';
import { ChatMessage } from '../services/api';

interface MessageProps {
  message: ChatMessage;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Format the content by replacing ** with bold text and handling lists
  const formatContent = (content: string) => {
    // Split into paragraphs
    const paragraphs = content.split(/\n\n/);
    
    return paragraphs.map((paragraph, index) => {
      // Format bold text
      const formattedText = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Check if it's a numbered list item
      const isListItem = /^\d+\.\s/.test(paragraph);
      
      if (isListItem) {
        return (
          <div key={index} className="list-item">
            <span dangerouslySetInnerHTML={{ __html: formattedText }} />
          </div>
        );
      }
      
      return (
        <p key={index} dangerouslySetInnerHTML={{ __html: formattedText }} />
      );
    });
  };

  return (
    <div className={`message ${message.role}`}>
      <div className="message-content">
        {formatContent(message.content)}
      </div>
      <div className="message-time">
        {formattedTime}
      </div>
    </div>
  );
};