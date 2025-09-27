import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendIcon, UserIcon, BotIcon, SparklesIcon, CopyIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { conversationService } from '../services/api';
import './ChatArea.css';

const StreamingChatArea = ({ conversation, onConversationUpdate, loading, setLoading, sidebarCollapsed }) => {
  const [message, setMessage] = useState('');
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, streamingMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() && !loading && !isStreaming) {
      const messageText = message;
      setMessage('');
      setLoading(true);
      setIsStreaming(true);
      setStreamingMessage('');

      try {
        // Create new conversation if none exists
        let conversationId = conversation?.id;
        if (!conversationId) {
          const newConversation = await conversationService.createConversation();
          conversationId = newConversation.id;
          onConversationUpdate({
            type: 'new_conversation',
            data: newConversation
          });
        }

        let streamingContent = '';

        await conversationService.streamMessage(
          conversationId,
          messageText,
          (data) => {
            switch (data.type) {
              case 'user_message':
                onConversationUpdate({
                  type: 'add_message',
                  data: { conversationId, message: data.data }
                });
                break;
              
              case 'assistant_start':
                setStreamingMessage('');
                break;
              
              case 'assistant_chunk':
                streamingContent += data.data.content;
                setStreamingMessage(streamingContent);
                break;
              
              case 'assistant_complete':
                const assistantMessage = data.data.message;
                onConversationUpdate({
                  type: 'add_message',
                  data: { conversationId, message: assistantMessage }
                });
                
                if (data.data.conversation) {
                  onConversationUpdate({
                    type: 'update_conversation',
                    data: data.data.conversation
                  });
                }
                break;
              
              case 'error':
                console.error('Streaming error:', data.data.message);
                break;
              
              default:
                console.warn('Unknown message type:', data.type);
                break;
            }
          },
          (error) => {
            console.error('Stream error:', error);
          },
          () => {
            setIsStreaming(false);
            setStreamingMessage('');
            setLoading(false);
          }
        );

      } catch (error) {
        console.error('Failed to send message:', error);
        setIsStreaming(false);
        setStreamingMessage('');
        setLoading(false);
      }
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === 'user';

    return (
      <motion.div
        key={msg.id || index}
        className={`message ${msg.role}`}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: index * 0.1
        }}
        layout
      >
        <motion.div 
          className="message-avatar"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {isUser ? (
            <div className="user-avatar">
              <UserIcon size={18} />
            </div>
          ) : (
            <div className="bot-avatar">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <BotIcon size={18} />
              </motion.div>
              <div className="avatar-glow"></div>
            </div>
          )}
        </motion.div>
        
        <div className="message-content">
          {isUser ? (
            <motion.div 
              className="user-message"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {msg.content}
            </motion.div>
          ) : (
            <div className="assistant-message">
              <motion.button
                className="copy-button"
                onClick={() => copyToClipboard(msg.content)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <CopyIcon size={14} />
              </motion.button>
              
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="code-block-wrapper">
                        <div className="code-header">
                          <span className="code-language">{match[1]}</span>
                          <motion.button
                            className="code-copy-btn"
                            onClick={() => copyToClipboard(String(children))}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <CopyIcon size={12} />
                          </motion.button>
                        </div>
                        <SyntaxHighlighter
                          style={tomorrow}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
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
      </motion.div>
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
          <motion.div 
            className="welcome-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="welcome-content">
              <motion.div 
                className="sigma-logo"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20,
                  delay: 0.2 
                }}
              >
                <div className="logo-circle">
                  <motion.span 
                    className="sigma-symbol"
                    animate={{ 
                      textShadow: [
                        "0 0 20px rgba(16, 163, 127, 0.5)",
                        "0 0 30px rgba(16, 163, 127, 0.8)",
                        "0 0 20px rgba(16, 163, 127, 0.5)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Σ
                  </motion.span>
                  <div className="logo-pulse-ring"></div>
                </div>
              </motion.div>
              
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <span className="welcome-title">Sigma</span>
                <span className="welcome-title-accent">GPT</span>
              </motion.h1>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                How can I help you today?
              </motion.p>
              
              <motion.div 
                className="example-prompts"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                {welcomeExamples.map((example, index) => (
                  <motion.button
                    key={index}
                    className="example-prompt"
                    onClick={() => setMessage(example)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: "0 8px 25px rgba(16, 163, 127, 0.2)" 
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SparklesIcon size={16} />
                    {example}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <div className="messages-container">
            {conversation.messages.map((msg, index) => renderMessage(msg, index))}
            
            {/* Streaming message */}
            <AnimatePresence>
              {isStreaming && streamingMessage && (
                <motion.div 
                  className="message assistant streaming"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="message-avatar"
                    animate={{ 
                      boxShadow: [
                        "0 0 0 0 rgba(16, 163, 127, 0.7)",
                        "0 0 0 10px rgba(16, 163, 127, 0)",
                        "0 0 0 0 rgba(16, 163, 127, 0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="bot-avatar">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <BotIcon size={18} />
                      </motion.div>
                      <div className="avatar-glow streaming"></div>
                    </div>
                  </motion.div>
                  <div className="message-content">
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
                        {streamingMessage}
                      </ReactMarkdown>
                      <motion.span 
                        className="cursor"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        |
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Loading indicator for non-streaming requests */}
            <AnimatePresence>
              {loading && !isStreaming && (
                <motion.div 
                  className="message assistant"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="message-avatar"
                    animate={{ 
                      boxShadow: [
                        "0 0 0 0 rgba(16, 163, 127, 0.7)",
                        "0 0 0 10px rgba(16, 163, 127, 0)",
                        "0 0 0 0 rgba(16, 163, 127, 0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="bot-avatar">
                      <BotIcon size={18} />
                      <div className="avatar-glow pulsing"></div>
                    </div>
                  </motion.div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <motion.div 
                        className="typing-dots"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {[0, 1, 2].map((index) => (
                          <motion.span
                            key={index}
                            animate={{ 
                              y: [0, -8, 0],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 1.4,
                              repeat: Infinity,
                              delay: index * 0.2,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <motion.div 
        className="chat-input-container"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <form onSubmit={handleSubmit} className="chat-input-form">
          <motion.div 
            className="input-wrapper"
            whileFocus={{ 
              borderColor: "rgba(16, 163, 127, 0.5)",
              boxShadow: "0 0 20px rgba(16, 163, 127, 0.1)"
            }}
            transition={{ duration: 0.2 }}
          >
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message SigmaGPT..."
              disabled={loading || isStreaming}
              rows={1}
            />
            <motion.button
              type="submit"
              disabled={!message.trim() || loading || isStreaming}
              className="send-button"
              whileHover={{ 
                scale: message.trim() && !loading && !isStreaming ? 1.05 : 1
              }}
              whileTap={{ scale: 0.95 }}
              animate={{
                opacity: message.trim() ? 1 : 0.5
              }}
              transition={{ 
                opacity: { duration: 0.15 },
                scale: { duration: 0.1 }
              }}
            >
              {loading || isStreaming ? (
                <motion.div
                  className="loading-spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid white",
                    borderRadius: "50%"
                  }}
                />
              ) : (
                <SendIcon size={16} />
              )}
            </motion.button>
          </motion.div>
        </form>
        
        <motion.div 
          className="chat-disclaimer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          SigmaGPT can make mistakes. Consider checking important information.
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StreamingChatArea;