import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, UserIcon, BotIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ChatArea.css';

const ChatArea = ({ conversation, onSendMessage, loading, sidebarCollapsed }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !loading) {
      onSendMessage(message);
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const renderMessage = (msg, index) => {
    const isUser = msg.role === 'user';
    const isAssistant = msg.role === 'assistant';

    return (
      <div key={msg.id || index} className={`message ${msg.role}`}>
        <div className="message-avatar">
          {isUser ? (
            <UserIcon size={20} />
          ) : (
            <div className="bot-avatar">
              <BotIcon size={20} />
            </div>
          )}
        </div>
        
        <div className="message-content">
          {isUser ? (
            <div className="user-message">{msg.content}</div>
          ) : (
            <div className="assistant-message">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={tomorrow}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  };

  const welcomeExamples = [
    "Explain quantum computing like I'm 5",
    "Write a Python function to reverse a string",
    "What are the benefits of meditation?",
    "Help me plan a weekend trip to San Francisco"
  ];

  return (
    <div className={`chat-area ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="chat-messages">
        {!conversation || conversation.messages.length === 0 ? (
          <div className="welcome-screen">
            <div className="welcome-content">
              <div className="sigma-logo">
                <div className="logo-circle">
                  <span className="sigma-symbol">Σ</span>
                </div>
              </div>
              <h1>SigmaGPT</h1>
              <p>How can I help you today?</p>
              
              <div className="example-prompts">
                {welcomeExamples.map((example, index) => (
                  <button
                    key={index}
                    className="example-prompt"
                    onClick={() => setMessage(example)}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="messages-container">
            {conversation.messages.map((msg, index) => renderMessage(msg, index))}
            
            {loading && (
              <div className="message assistant">
                <div className="message-avatar">
                  <div className="bot-avatar">
                    <BotIcon size={20} />
                  </div>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form onSubmit={handleSubmit} className="chat-input-form">
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setIsTyping(e.target.value.length > 0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Message SigmaGPT..."
              disabled={loading}
              rows={1}
            />
            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="send-button"
            >
              <SendIcon size={20} />
            </button>
          </div>
        </form>
        
        <div className="chat-disclaimer">
          SigmaGPT can make mistakes. Consider checking important information.
        </div>
      </div>
    </div>
  );
};

export default ChatArea;