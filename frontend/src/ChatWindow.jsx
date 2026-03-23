import React, { useEffect, useRef } from 'react';

function ChatWindow({ messages, isGenerating }) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0 && !isGenerating) {
    return (
      <div className="chat-window">
        <div className="empty-state">
          Start a conversation by typing a message below
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {messages.map((message, index) => (
        <div key={index} className={`message ${message.role}`}>
          <div className="message-bubble">
            {message.content}
          </div>
        </div>
      ))}
      {isGenerating && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
        <div className="message assistant">
          <div className="message-bubble loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
}

export default ChatWindow;
