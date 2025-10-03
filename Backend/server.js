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
  // Initialize Puter.js - works without authentication in anonymous mode
  console.log('🚀 Using Puter.js for AI capabilities (anonymous mode)');
  // Puter.js can work in anonymous mode for basic AI chat
  // No authentication needed for basic usage
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
    // Use Puter.js AI - build conversation context from all messages
    const lastMessage = messages[messages.length - 1];
    
    // Create a rich context prompt that includes conversation history
    let contextPrompt = lastMessage.content;
    if (messages.length > 1) {
      // Include previous messages for context
      const conversationHistory = messages.slice(-5).map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n');
      contextPrompt = `Previous conversation:\n${conversationHistory}\n\nRespond naturally to the last message.`;
    }
    
    try {
      console.log('🤖 Calling Puter.js AI...');
      // Call Puter.js AI chat
      const response = await puter.ai.chat(contextPrompt);
      
      console.log('✅ Puter.js response received:', typeof response);
      
      // Handle different response formats
      if (typeof response === 'string') {
        // Check if it's an auth error message
        if (response.includes('authentication') || response.includes('token')) {
          console.log('⚠️ Puter.js authentication required, using smart fallback');
          return generateFallbackResponse(lastMessage.content);
        }
        return response;
      } else if (response && typeof response === 'object') {
        // Check for auth error in object response
        const errorMsg = response.message || response.error || response.text || response.content;
        if (errorMsg && String(errorMsg).toLowerCase().includes('authentication')) {
          console.log('⚠️ Puter.js authentication required, using smart fallback');
          return generateFallbackResponse(lastMessage.content);
        }
        
        // Try different possible response properties
        const content = response.text || response.content || response.message || response.response;
        if (content && !String(content).toLowerCase().includes('authentication')) {
          return String(content);
        }
        
        // If we got here, use smart fallback
        console.log('⚠️ Puter.js response not usable, using smart fallback');
        return generateFallbackResponse(lastMessage.content);
      }
      
      // Fallback if response is unexpected
      console.log('⚠️ Unexpected Puter.js response format, using smart fallback');
      return generateFallbackResponse(lastMessage.content);
      
    } catch (error) {
      console.error('❌ Puter.js error:', error.message, error.code);
      // Use smart fallback that still provides value
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

// Smart AI response generator - provides helpful responses when external AI is unavailable
function generateFallbackResponse(userMessage) {
  const lowerMsg = userMessage.toLowerCase();
  
  // Greeting responses
  if (lowerMsg.match(/^(hi|hello|hey|greetings|good morning|good evening|good afternoon)/)) {
    return `Hello! 👋 I'm SigmaGPT, your AI assistant. I'm currently running in standalone mode (without external AI APIs). I can help you with general questions, have conversations, and demonstrate this ChatGPT-like interface. What would you like to talk about?`;
  }
  
  // How are you
  if (lowerMsg.match(/how are you|how're you|how r u/)) {
    return `I'm doing great, thank you for asking! 😊 I'm SigmaGPT, running in standalone mode. While I don't have access to large language models right now, I'm here to chat and help where I can. What's on your mind?`;
  }
  
  // Questions about capabilities
  if (lowerMsg.match(/what can you do|your capabilities|what do you do/)) {
    return `I'm SigmaGPT, a ChatGPT-like interface. Currently running in standalone mode, I can:\n\n✅ Have conversations and respond to your messages\n✅ Demonstrate a modern chat interface with streaming responses\n✅ Maintain conversation history\n✅ Show that this app can work with or without external AI APIs\n\nFor full AI capabilities with advanced language understanding, the app can be configured with OpenAI or other AI providers. What would you like to know more about?`;
  }
  
  // Questions about space (common example)
  if (lowerMsg.match(/space|planet|star|galaxy|universe|astronomy/)) {
    return `Space is fascinating! 🌌 Here are some interesting facts:\n\n1. The observable universe is about 93 billion light-years in diameter\n2. There are more stars in the universe than grains of sand on all of Earth's beaches\n3. A day on Venus is longer than its year!\n\nNote: I'm currently running in standalone mode. For more detailed and accurate space information, you could configure this app with an AI provider like OpenAI. Would you like to know anything else?`;
  }
  
  // Programming questions
  if (lowerMsg.match(/code|programming|javascript|python|react|node|development/)) {
    return `I can see you're interested in programming! 💻 This SigmaGPT app itself is built with:\n\n• **Frontend**: React with modern animations\n• **Backend**: Node.js + Express\n• **Features**: Real-time streaming, conversation management\n\nI'm currently in standalone mode. For detailed coding help and advanced programming assistance, you'd want to configure this app with OpenAI or another AI provider. Is there something specific about this project you'd like to know?`;
  }
  
  // Math/numbers questions
  if (lowerMsg.match(/calculate|math|number|equation|\d+\s*[\+\-\*\/]\s*\d+/)) {
    return `I can see you're asking about ${userMessage}. While I'm running in standalone mode right now, here's what I can tell you:\n\nFor complex calculations and math problems, you'd want to configure this app with a full AI provider like OpenAI. That would give you access to advanced problem-solving capabilities.\n\nIs there anything else I can help you with? 🤔`;
  }
  
  // General helpful response
  const generalResponses = [
    `That's an interesting question about "${userMessage}"! 🤔\n\nI'm SigmaGPT running in standalone mode (without external AI APIs). While I can have basic conversations, for detailed and accurate answers, this app can be configured with OpenAI or other AI providers.\n\nWhat else would you like to talk about?`,
    
    `Thanks for your message: "${userMessage}".\n\nI'm currently demonstrating SigmaGPT's standalone capabilities. This shows that the app works even without external AI services! For more sophisticated responses and understanding, you can configure it with an API key from OpenAI or similar providers.\n\nHow can I help you further? 😊`,
    
    `I understand you're asking about "${userMessage}". \n\nRight now I'm running in demo mode to show that SigmaGPT is functional without requiring paid AI services. This is great for development and testing!\n\nFor production use with full AI capabilities, you'd configure this with OpenAI, Anthropic, or another AI provider. Anything else I can help with?`
  ];
  
  return generalResponses[Math.floor(Math.random() * generalResponses.length)];
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
    // Log full error server-side for debugging, but do NOT expose error.message
    // to clients because it may contain sensitive information (API keys, tokens).
    console.error('AI API error:', error);
    res.status(502).json({ 
      error: 'AI provider error. Check server logs for details.'
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
    // Log the streaming error server-side but send a generic error message to the client
    // to avoid leaking any sensitive details that may be included in the error object.
    console.error('AI Streaming API error:', error);
    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      data: { message: 'AI provider error. Check server logs for details.' } 
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