import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Trash2, Menu, X, Download } from 'lucide-react';
import './ModernSidebar.css';

const ModernSidebar = ({ 
  conversations, 
  currentConversation, 
  onNewChat, 
  onSelectConversation, 
  onDeleteConversation,
  isOpen,
  onToggle
}) => {
  const [hoveredId, setHoveredId] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check if it was already captured globally
    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
    }

    const handlePromptReady = () => {
      setDeferredPrompt(window.deferredPrompt);
    };

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setDeferredPrompt(e);
    };

    window.addEventListener('prompt-ready', handlePromptReady);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('prompt-ready', handlePromptReady);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
      window.deferredPrompt = null;
    }
  };

  return (
    <>
      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            className="modern-sidebar"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="sidebar-header">
              <div className="sidebar-header-top">
                <div className="sidebar-logo">
                  <span className="sidebar-logo-sigma">Σ</span>
                  <a className="sidebar-logo-text" href="/">SigmaGPT</a>
                </div>
                
                {/* Close Button */}
                <motion.button
                  className="sidebar-close-button"
                  onClick={onToggle}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              <motion.button
                className="new-chat-button"
                onClick={onNewChat}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={18} />
                <span>New Chat</span>
              </motion.button>
            </div>

            <div className="conversations-list">
              <AnimatePresence>
                {conversations.length === 0 ? (
                  <motion.div
                    className="empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <MessageSquare size={40} className="empty-icon" />
                    <p>No conversations yet</p>
                    <span>Start a new chat to begin</span>
                  </motion.div>
                ) : (
                  conversations.map((conversation, index) => (
                    <motion.div
                      key={conversation.id}
                      className={`conversation-item ${currentConversation?.id === conversation.id ? 'active' : ''}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onSelectConversation(conversation)}
                      onMouseEnter={() => setHoveredId(conversation.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      whileHover={{ x: 5 }}
                    >
                      <MessageSquare size={18} className="conversation-icon" />
                      <span className="conversation-title">
                        {conversation.title || 'New Chat'}
                      </span>
                      
                      {(hoveredId === conversation.id || currentConversation?.id === conversation.id) && (
                        <motion.button
                          className="delete-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conversation.id);
                          }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      )}
                      
                      <div className="conversation-glow"></div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <div className="sidebar-footer">
              {deferredPrompt && (
                <motion.button 
                  className="install-app-button"
                  onClick={handleInstallClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download size={16} />
                  <span>Download App</span>
                </motion.button>
              )}
              <div className="footer-badge">
                <div className="badge-dot"></div>
                <span>Powered by Gemini 2.5</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Open Button - Shows when sidebar is closed */}
      {!isOpen && (
        <motion.button
          className="sidebar-toggle"
          onClick={onToggle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Menu size={20} />
        </motion.button>
      )}

      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div
          className="sidebar-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default ModernSidebar;
