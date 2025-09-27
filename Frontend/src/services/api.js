import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const conversationService = {
  // Get all conversations
  getConversations: async () => {
    const response = await api.get('/conversations');
    return response.data;
  },

  // Get specific conversation
  getConversation: async (id) => {
    const response = await api.get(`/conversations/${id}`);
    return response.data;
  },

  // Create new conversation
  createConversation: async () => {
    const response = await api.post('/conversations');
    return response.data;
  },

  // Delete conversation
  deleteConversation: async (id) => {
    const response = await api.delete(`/conversations/${id}`);
    return response.data;
  },

  // Send message to conversation
  sendMessage: async (conversationId, message) => {
    const response = await api.post(`/conversations/${conversationId}/messages`, {
      message
    });
    return response.data;
  },

  // Stream message to conversation (for real-time responses)
  streamMessage: async (conversationId, message, onData, onError, onComplete) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              onComplete?.();
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              onData?.(parsed);
            } catch (e) {
              console.warn('Failed to parse SSE data:', data);
            }
          }
        }
      }
    } catch (error) {
      onError?.(error);
    }
  }
};

export default api;