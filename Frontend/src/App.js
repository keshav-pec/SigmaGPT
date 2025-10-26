import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import './App.css';
import ModernSidebar from './components/ModernSidebar';
import ModernChatArea from './components/ModernChatArea';
import LandingPage from './components/LandingPage';
import { conversationService } from './services/api';

function App() {
  const [currentConversation, setCurrentConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);

  // Load conversations on app start
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const conversationList = await conversationService.getConversations();
      // Sort conversations by ID (timestamp) in descending order - newest first
      const sortedConversations = conversationList.sort((a, b) => b.id - a.id);
      setConversations(sortedConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const handleNewChat = () => {
    setCurrentConversation(null);
    setShowLanding(false);
  };

  const handleSelectConversation = async (conversation) => {
    try {
      // Load the full conversation with messages
      const fullConversation = await conversationService.getConversation(conversation.id);
      setCurrentConversation(fullConversation);
      setShowLanding(false);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setCurrentConversation(conversation);
      setShowLanding(false);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await conversationService.deleteConversation(conversationId);
      setConversations(conversations.filter(c => c.id !== conversationId));
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setShowLanding(true);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleStartChat = () => {
    setShowLanding(false);
    setCurrentConversation(null);
  };

  const handleSendMessage = async (message) => {
    try {
      let conversation = currentConversation;
      
      if (!conversation) {
        conversation = await conversationService.createConversation();
        const updatedConversations = [conversation, ...conversations];
        setConversations(updatedConversations);
        setCurrentConversation(conversation);
      }

      const userMessage = { role: 'user', content: message };
      const updatedConversation = {
        ...conversation,
        messages: [...(conversation.messages || []), userMessage]
      };
      setCurrentConversation(updatedConversation);

      setIsStreaming(true);
      let assistantMessage = { role: 'assistant', content: '' };
      
      await conversationService.streamMessage(
        conversation.id,
        message,
        (data) => {
          if (data.content) {
            assistantMessage.content += data.content;
            setCurrentConversation(prev => ({
              ...prev,
              messages: [
                ...(prev.messages || []).filter(m => m.role !== 'assistant' || m.content),
                { ...assistantMessage }
              ]
            }));
          }
        },
        (error) => {
          console.error('Streaming error:', error);
          setIsStreaming(false);
        },
        () => {
          setIsStreaming(false);
          conversationService.getConversation(conversation.id).then(updated => {
            setCurrentConversation(updated);
            setConversations(prevConversations => 
              prevConversations.map(c => c.id === updated.id ? updated : c)
            );
          });
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
          <AnimatePresence mode="wait">
            {showLanding ? (
              <LandingPage key="landing" onStartChat={handleStartChat} />
            ) : (
              <ModernChatArea
                key="chat"
                conversation={currentConversation}
                onSendMessage={handleSendMessage}
                isStreaming={isStreaming}
              />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
