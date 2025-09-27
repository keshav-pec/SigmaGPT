import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import StreamingChatArea from './components/StreamingChatArea';
import AnimatedHomepage from './components/AnimatedHomepage';
import PageTransition from './components/PageTransition';
import { conversationService } from './services/api';

function App() {
  const [showHomepage, setShowHomepage] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load conversations on app start
  useEffect(() => {
    loadConversations();
  }, []);

  // Load current conversation when ID changes
  useEffect(() => {
    if (currentConversationId) {
      loadConversation(currentConversationId);
    } else {
      setCurrentConversation(null);
    }
  }, [currentConversationId]);

  const loadConversations = async () => {
    try {
      const conversationList = await conversationService.getConversations();
      setConversations(conversationList);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadConversation = async (id) => {
    try {
      setLoading(true);
      const conversation = await conversationService.getConversation(id);
      setCurrentConversation(conversation);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const newConversation = await conversationService.createConversation();
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const deleteConversation = async (id) => {
    try {
      await conversationService.deleteConversation(id);
      setConversations(prev => prev.filter(conv => conv.id !== id));
      if (currentConversationId === id) {
        setCurrentConversationId(null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleConversationUpdate = (update) => {
    switch (update.type) {
      case 'new_conversation':
        setConversations(prev => [update.data, ...prev]);
        setCurrentConversationId(update.data.id);
        setCurrentConversation(update.data);
        break;
      
      case 'add_message':
        const { conversationId, message } = update.data;
        setCurrentConversation(prev => {
          if (prev && prev.id === conversationId) {
            return {
              ...prev,
              messages: [...prev.messages, message]
            };
          }
          return prev;
        });
        break;
      
      case 'update_conversation':
        const updatedConv = update.data;
        setConversations(prev => prev.map(conv => 
          conv.id === updatedConv.id 
            ? { ...conv, ...updatedConv }
            : conv
        ));
        break;
      
      default:
        break;
    }
  };

  const handleStartChat = () => {
    setShowHomepage(false);
  };

  const handleBackToHome = () => {
    setShowHomepage(true);
    setCurrentConversationId(null);
    setCurrentConversation(null);
  };

  return (
    <PageTransition key={showHomepage ? 'homepage' : 'chat'}>
      {showHomepage ? (
        <AnimatedHomepage onStartChat={handleStartChat} />
      ) : (
        <div className="App">
          <Sidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onConversationSelect={setCurrentConversationId}
            onNewConversation={createNewConversation}
            onDeleteConversation={deleteConversation}
            onBackToHome={handleBackToHome}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <StreamingChatArea
            conversation={currentConversation}
            onConversationUpdate={handleConversationUpdate}
            loading={loading}
            setLoading={setLoading}
            sidebarCollapsed={sidebarCollapsed}
          />
        </div>
      )}
    </PageTransition>
  );
}

export default App;
