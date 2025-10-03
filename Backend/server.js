import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import puter from '@heyputer/puter.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize AI client based on configuration
let aiClient;
// Prefer OpenAI when an API key is present. Use Puter only when explicitly
// requested AND no OpenAI API key is configured.
const openaiKeyPresent = !!process.env.OPENAI_API_KEY || !!process.env.OPEN_AI_KEY;
const usePuter = (process.env.USE_PUTER === 'true') && !openaiKeyPresent;

if (usePuter) {
  // Initialize Puter.js
  console.log('🚀 Using Puter.js for AI capabilities');
  // Initialize Puter (it may need authentication in the future)
  aiClient = puter;
} else {
  // Initialize OpenAI client
  aiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY,
  });
}

// Middleware - Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? true  // Allow all origins for now - we'll restrict this later
    : ['http://localhost:3000', 'http://localhost:3003'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// In-memory storage for conversations (in production, use a database)
let conversations = {};

// AI Helper Functions
async function getAIResponse(messages) {
  if (usePuter) {
    // Use Puter.js AI
    const lastMessage = messages[messages.length - 1];
    
    try {
      // Try to use Puter.js AI chat
      let response;
      
      if (puter.ai && puter.ai.chat) {
        try {
          response = await puter.ai.chat(lastMessage.content);
          
          // Handle different response formats
          if (typeof response === 'string') {
            return response;
          } else if (response && response.message && response.code === 'token_missing') {
            // Authentication required - provide fallback
            console.log('Puter.js authentication required. Using fallback response.');
            return generateFallbackResponse(lastMessage.content);
          } else if (response && (response.text || response.content || response.message)) {
            return response.text || response.content || response.message;
          } else {
            return JSON.stringify(response);
          }
        } catch (authError) {
          console.log('Puter.js authentication error, using fallback:', authError.message);
          return generateFallbackResponse(lastMessage.content);
        }
      } else {
        return generateFallbackResponse(lastMessage.content);
      }
    } catch (error) {
      console.log('Puter AI error, using fallback:', error.message);
      return generateFallbackResponse(lastMessage.content);
    }
  } else {
    // Use OpenAI
    const completion = await aiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    });
    return completion.choices[0].message.content;
  }
}

// Fallback AI response generator
function generateFallbackResponse(userMessage) {
  const responses = [
    `I understand you're asking about "${userMessage}". While I'm currently running on Puter.js (which requires authentication for full AI features), I can still help! This is a demonstration of SigmaGPT working without OpenAI API limits.`,
    
    `Thanks for your message: "${userMessage}". I'm currently operating in demo mode using Puter.js as the AI backend. The full AI capabilities would be available with proper authentication setup.`,
    
    `I see you asked: "${userMessage}". Right now I'm running on Puter.js in fallback mode since your OpenAI API quota was exhausted. This shows that SigmaGPT can work with alternative AI providers!`,
    
    `Your question "${userMessage}" is interesting! I'm currently using Puter.js as an alternative to OpenAI. While this is a simplified response, it demonstrates that SigmaGPT can be configured to use different AI backends.`,
    
    `I received your message: "${userMessage}". Currently running with Puter.js integration (demo mode). This proves that your ChatGPT clone can work even when OpenAI API limits are reached!`
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  return randomResponse;
}

async function* getAIStreamResponse(messages) {
  if (usePuter) {
    // Use Puter.js AI with streaming simulation
    const response = await getAIResponse(messages);
    const words = response.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
      yield chunk;
      // Add realistic delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 40));
    }
  } else {
    // Use OpenAI streaming
    const stream = await aiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: true,
    });
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }
  }
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SigmaGPT Backend is running' });
});

// Get all conversations
app.get('/api/conversations', (req, res) => {
  const conversationList = Object.keys(conversations).map(id => ({
    id,
    title: conversations[id].title,
    createdAt: conversations[id].createdAt,
    updatedAt: conversations[id].updatedAt
  }));
  res.json(conversationList);
});

// Get specific conversation
app.get('/api/conversations/:id', (req, res) => {
  const { id } = req.params;
  const conversation = conversations[id];
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  res.json(conversation);
});

// Create new conversation
app.post('/api/conversations', (req, res) => {
  const id = Date.now().toString();
  const conversation = {
    id,
    title: 'New Chat',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  conversations[id] = conversation;
  res.json(conversation);
});

// Delete conversation
app.delete('/api/conversations/:id', (req, res) => {
  const { id } = req.params;
  
  if (!conversations[id]) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  delete conversations[id];
  res.json({ message: 'Conversation deleted successfully' });
});

// Send message to conversation
app.post('/api/conversations/:id/messages', async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  // Get or create conversation
  if (!conversations[id]) {
    conversations[id] = {
      id,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  const conversation = conversations[id];
  
  // Add user message
  const userMessage = {
    id: Date.now().toString(),
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  };
  
  conversation.messages.push(userMessage);
  
  try {
    // Prepare messages for AI
    const messages = conversation.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Get response from AI (OpenAI or Puter.js)
    const aiResponse = await getAIResponse(messages);
    
    // Add assistant message
    const assistantMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    };
    
    conversation.messages.push(assistantMessage);
    
    // Update conversation title if it's the first message
    if (conversation.messages.length === 2 && conversation.title === 'New Chat') {
      conversation.title = message.length > 50 ? message.substring(0, 50) + '...' : message;
    }
    
    conversation.updatedAt = new Date().toISOString();
    
    res.json({
      userMessage,
      assistantMessage,
      conversation: {
        id: conversation.id,
        title: conversation.title,
        updatedAt: conversation.updatedAt
      }
    });
    
  } catch (error) {
    console.error('AI API error:', error);
    res.status(500).json({ 
      error: 'Failed to get response from AI',
      details: error.message 
    });
  }
});

// Streaming endpoint for chat messages
app.post('/api/conversations/:id/stream', async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  // Set headers for Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });
  
  // Get or create conversation
  if (!conversations[id]) {
    conversations[id] = {
      id,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  const conversation = conversations[id];
  
  // Add user message
  const userMessage = {
    id: Date.now().toString(),
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  };
  
  conversation.messages.push(userMessage);
  
  try {
    // Prepare messages for AI
    const messages = conversation.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Send user message first
    res.write(`data: ${JSON.stringify({ type: 'user_message', data: userMessage })}\n\n`);
    
    // Get streaming response from AI (OpenAI or Puter.js)
    let assistantContent = '';
    const assistantMessageId = (Date.now() + 1).toString();
    
    // Send start of assistant message
    res.write(`data: ${JSON.stringify({ type: 'assistant_start', data: { id: assistantMessageId } })}\n\n`);
    
    // Stream the response
    for await (const chunk of getAIStreamResponse(messages)) {
      if (chunk) {
        assistantContent += chunk;
        res.write(`data: ${JSON.stringify({ type: 'assistant_chunk', data: { content: chunk } })}\n\n`);
      }
    }
    
    // Add complete assistant message to conversation
    const assistantMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: assistantContent,
      timestamp: new Date().toISOString()
    };
    
    conversation.messages.push(assistantMessage);
    
    // Update conversation title if it's the first message
    if (conversation.messages.length === 2 && conversation.title === 'New Chat') {
      conversation.title = message.length > 50 ? message.substring(0, 50) + '...' : message;
    }
    
    conversation.updatedAt = new Date().toISOString();
    
    // Send completion signal
    res.write(`data: ${JSON.stringify({ 
      type: 'assistant_complete', 
      data: { 
        message: assistantMessage,
        conversation: {
          id: conversation.id,
          title: conversation.title,
          updatedAt: conversation.updatedAt
        }
      } 
    })}\n\n`);
    
  } catch (error) {
    console.error('AI Streaming API error:', error);
    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      data: { message: 'Failed to get response from AI', details: error.message } 
    })}\n\n`);
  }
  
  res.write('data: [DONE]\n\n');
  res.end();
});

app.listen(PORT, () => {
  console.log(`🚀 SigmaGPT Backend running on port ${PORT}`);
  console.log(`📡 API Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI Service: ${usePuter ? 'Puter.js' : 'OpenAI'}`);
});

// Safe debug endpoint (does NOT expose keys)
app.get('/api/debug', (req, res) => {
  res.json({
    usePuter: process.env.USE_PUTER === 'true',
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});