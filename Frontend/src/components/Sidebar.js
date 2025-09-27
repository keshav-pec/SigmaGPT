import React, { useState } from 'react';
import { PlusIcon, MessageSquareIcon, TrashIcon, MenuIcon, XIcon, HomeIcon } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ 
  conversations, 
  currentConversationId, 
  onConversationSelect, 
  onNewConversation, 
  onDeleteConversation, 
  onBackToHome,
  collapsed, 
  onToggleCollapse 
}) => {
  const [hoveredConversation, setHoveredConversation] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const groupConversationsByDate = (conversations) => {
    const groups = {};
    
    conversations.forEach(conv => {
      const date = formatDate(conv.updatedAt);
      if (!groups[date]) groups[date] = [];
      groups[date].push(conv);
    });
    
    return groups;
  };

  const conversationGroups = groupConversationsByDate(conversations);

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button 
          className="toggle-sidebar-btn"
          onClick={onToggleCollapse}
          title={collapsed ? 'Open sidebar' : 'Close sidebar'}
        >
          {collapsed ? <MenuIcon size={20} /> : <XIcon size={20} />}
        </button>
        
        {!collapsed && (
          <div className="sidebar-header-buttons">
            <button 
              className="home-btn"
              onClick={onBackToHome}
              title="Back to home"
            >
              <HomeIcon size={20} />
            </button>
            <button 
              className="new-chat-btn"
              onClick={onNewConversation}
              title="New chat"
            >
              <PlusIcon size={20} />
              <span>New chat</span>
            </button>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="conversations-list">
          {Object.keys(conversationGroups).length === 0 ? (
            <div className="empty-state">
              <MessageSquareIcon size={48} />
              <p>No conversations yet</p>
              <p>Start a new chat to begin</p>
            </div>
          ) : (
            Object.entries(conversationGroups).map(([date, convs]) => (
              <div key={date} className="conversation-group">
                <div className="group-header">{date}</div>
                {convs.map(conversation => (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${
                      currentConversationId === conversation.id ? 'active' : ''
                    }`}
                    onClick={() => onConversationSelect(conversation.id)}
                    onMouseEnter={() => setHoveredConversation(conversation.id)}
                    onMouseLeave={() => setHoveredConversation(null)}
                  >
                    <MessageSquareIcon size={16} />
                    <span className="conversation-title">{conversation.title}</span>
                    
                    {hoveredConversation === conversation.id && (
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conversation.id);
                        }}
                        title="Delete conversation"
                      >
                        <TrashIcon size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {!collapsed && (
        <div className="sidebar-footer">
          <div className="brand">
            <h2>SigmaGPT</h2>
            <p>AI Assistant</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;