import React, { useState, useRef, useEffect } from 'react';
import ModelLoader from './ModelLoader';
import ChatWindow from './ChatWindow';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const abortControllerRef = useRef(null);

  // Check backend connection on mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  const handleLoadModel = async () => {
    setIsLoading(true);
    setModelError('');

    try {
      const response = await fetch('/api/load-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setModelLoaded(true);
        setConnectionStatus('connected');
      } else {
        setModelError(data.error || 'Failed to load model');
      }
    } catch (error) {
      setModelError('Failed to connect to backend server. Make sure the server is running.');
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to get response from model');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantMessage.content += parsed.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { ...assistantMessage };
                  return newMessages;
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        const errorMessage = {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request.',
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="app-container">
      <div className="chat-app">
        <div className="header">
          <h1>BitNet Chat</h1>
          <p>Powered by BitNet model inference</p>
        </div>

        {!modelLoaded ? (
          <ModelLoader
            onLoadModel={handleLoadModel}
            isLoading={isLoading}
            error={modelError}
          />
        ) : (
          <>
            <ChatWindow messages={messages} isGenerating={isGenerating} />

            <div className="input-box">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows="2"
                disabled={isGenerating}
              />
              <button onClick={handleSendMessage} disabled={isGenerating || !input.trim()}>
                Send
              </button>
            </div>

            <div className="status-bar">
              <div className="status-indicator">
                <div className={`dot ${connectionStatus}`}></div>
                <span>
                  {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {isGenerating && <span>Generating response...</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
