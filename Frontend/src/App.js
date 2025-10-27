import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './App.css';
import ModernSidebar from './components/ModernSidebar';
import ModernChatArea from './components/ModernChatArea';
import LandingPage from './components/LandingPage';
import { conversationService } from './services/api';

// Chat Page Component
function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [currentConversation, setCurrentConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load specific conversation when chatId changes
  useEffect(() => {
    if (chatId && conversations.length > 0) {
      loadConversation(chatId);
    }
  }, [chatId, conversations.length]);

  const loadConversations = async () => {
    try {
      const conversationList = await conversationService.getConversations();
      const sortedConversations = conversationList.sort((a, b) => b.id - a.id);
      setConversations(sortedConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadConversation = async (id) => {
    try {
      const conversation = await conversationService.getConversation(id);
      setCurrentConversation(conversation);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleNewChat = () => {
    setCurrentConversation(null);
    navigate('/chat');
  };

  const handleSelectConversation = async (conversation) => {
    navigate(`/chat/${conversation.id}`);
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await conversationService.deleteConversation(conversationId);
      const updatedConversations = conversations.filter(c => c.id !== conversationId);
      setConversations(updatedConversations);
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        navigate('/chat');
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleSendMessage = async (message) => {
    try {
      let conversation = currentConversation;
      
      if (!conversation) {
        conversation = await conversationService.createConversation();
        const updatedConversations = [conversation, ...conversations];
        setConversations(updatedConversations);
        setCurrentConversation(conversation);
        navigate(`/chat/${conversation.id}`);
      }

      const userMessage = { role: 'user', content: message };
      const updatedConversation = {
        ...conversation,
        messages: [...(conversation.messages || []), userMessage]
      };
      setCurrentConversation(updatedConversation);

      setIsStreaming(true);
      let fullContent = '';
      let wordQueue = [];
      let isProcessing = false;
      let displayIntervalId = null;
      let hasStartedDisplaying = false;
      
      // Function to display words one by one with delay
      const displayWords = () => {
        if (displayIntervalId) return; // Already running
        
        displayIntervalId = setInterval(() => {
          if (wordQueue.length > 0) {
            const word = wordQueue.shift();
            fullContent += word;
            
            // Hide loading indicator once content starts
            if (!hasStartedDisplaying) {
              hasStartedDisplaying = true;
              setIsStreaming(false);
            }
            
            setCurrentConversation(prev => {
              // Get all messages except any streaming assistant message (without ID)
              const existingMessages = prev.messages.filter(
                m => m.role !== 'assistant' || m.id !== undefined
              );
              
              return {
                ...prev,
                messages: [
                  ...existingMessages,
                  { role: 'assistant', content: fullContent }
                ]
              };
            });
          } else if (!isProcessing) {
            // No more words and not receiving new data
            clearInterval(displayIntervalId);
            displayIntervalId = null;
          }
        }, 50); // 50ms between words
      };
      
      await conversationService.streamMessage(
        conversation.id,
        message,
        (data) => {
          if (data.content) {
            isProcessing = true;
            // Split incoming chunk into words
            const text = data.content;
            const words = text.split(/(\s+)/); // Split but keep whitespace
            
            // Add words to queue
            wordQueue.push(...words);
            
            // Start displaying if not already running
            if (!displayIntervalId) {
              displayWords();
            }
            
            isProcessing = false;
          }
        },
        (error) => {
          console.error('Streaming error:', error);
          if (displayIntervalId) {
            clearInterval(displayIntervalId);
          }
          setIsStreaming(false);
        },
        () => {
          isProcessing = false;
          
          // Wait for all queued words to be displayed
          const checkComplete = setInterval(() => {
            if (wordQueue.length === 0 && !displayIntervalId) {
              clearInterval(checkComplete);
              
              conversationService.getConversation(conversation.id).then(updated => {
                setCurrentConversation(updated);
                setConversations(prevConversations => 
                  prevConversations.map(c => c.id === updated.id ? updated : c)
                );
              });
            }
          }, 100);
        }
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsStreaming(false);
    }
  };

  return (
    <div className="app-container">
      <div className="gradient-bg">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        <div className="gradient-orb gradient-orb-3"></div>
      </div>

      <div className="grid-overlay"></div>

      <div className="app-content">
        <ModernSidebar
          conversations={conversations}
          currentConversation={currentConversation}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <ModernChatArea
            conversation={currentConversation}
            onSendMessage={handleSendMessage}
            isStreaming={isStreaming}
          />
        </main>
      </div>
    </div>
  );
}

// Home Page Component
function HomePage() {
  const navigate = useNavigate();

  const handleStartChat = () => {
    navigate('/chat');
  };

  return (
    <div className="app-container">
      <div className="gradient-bg">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        <div className="gradient-orb gradient-orb-3"></div>
      </div>

      <div className="grid-overlay"></div>

      <div className="app-content">
        <main className="main-content">
          <LandingPage onStartChat={handleStartChat} />
        </main>
      </div>
    </div>
  );
}

// Main App Component with Router
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:chatId" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
