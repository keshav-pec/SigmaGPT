import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ModernChatArea.css';

const ModernChatArea = ({ conversation, onSendMessage, isStreaming }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => scrollToBottom(), [conversation?.messages]);
  useEffect(() => setIsTyping(isStreaming), [isStreaming]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    onSendMessage(input);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="modern-chat-area">
      <div className="chat-messages">
        <AnimatePresence>
          {conversation?.messages && conversation.messages.length > 0 ? (
            conversation.messages.map((message, index) => (
              <motion.div
                key={index}
                className={`message-wrapper ${message.role}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="message-avatar">
                  {message.role === 'user' ? (
                    <User size={20} />
                  ) : (
                    <Bot size={20} />
                  )}
                </div>
                <div className="message-content">
                  <div className="message-role">
                    {message.role === 'user' ? 'You' : 'SigmaGPT'}
                  </div>
                  <div className="message-text">
                    {message.role === 'assistant' ? (
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={vscDarkPlus}
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
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                  <div className="message-glow"></div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              className="empty-chat"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="empty-chat-icon">
                <Bot size={60} />
              </div>
              <h2>Welcome to SigmaGPT</h2>
              <p>Powered by Google Gemini 2.5 Flash</p>
              <div className="suggestion-chips">
                <button 
                  className="chip"
                  onClick={() => {
                    setInput('Explain quantum computing in simple terms');
                    inputRef.current?.focus();
                  }}
                >
                  Explain quantum computing
                </button>
                <button 
                  className="chip"
                  onClick={() => {
                    setInput('Write a Python function to sort a list');
                    inputRef.current?.focus();
                  }}
                >
                  Write a Python function
                </button>
                <button 
                  className="chip"
                  onClick={() => {
                    setInput('What are the latest AI trends?');
                    inputRef.current?.focus();
                  }}
                >
                  Latest AI trends
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            className="message-wrapper assistant typing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="message-avatar">
              <Bot size={20} />
            </div>
            <div className="message-content">
              <div className="message-role">SigmaGPT</div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form onSubmit={handleSubmit} className="chat-input-form">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message SigmaGPT..."
              rows={1}
              disabled={isStreaming}
            />
            <motion.button
              type="submit"
              className="send-button"
              disabled={!input.trim() || isStreaming}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isStreaming ? (
                <Loader className="loader-icon" size={20} />
              ) : (
                <Send size={20} />
              )}
            </motion.button>
          </div>
        </form>
        <div className="input-footer">
          <span>SigmaGPT can make mistakes. Consider checking important information.</span>
        </div>
      </div>
    </div>
  );
};

export default ModernChatArea;
