import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? true : ['http://localhost:3003', 'http://localhost:3033'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

let conversations = {};

async function getAIResponse(messages) {
  const chat = model.startChat({
    history: messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })),
    generationConfig: { maxOutputTokens: 2048, temperature: 0.7 }
  });
  const result = await chat.sendMessage(messages[messages.length - 1].content);
  return (await result.response).text();
}

async function* getAIStreamResponse(messages) {
  try {
    const chat = model.startChat({
      history: messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      generationConfig: { 
        maxOutputTokens: 4096,
        temperature: 0.7,
        topK: 40,
        topP: 0.95
      }
    });
    
    console.log('🤖 Sending to Gemini...');
    const result = await chat.sendMessageStream(messages[messages.length - 1].content);
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        yield chunkText;
      }
    }
  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
    throw new Error(`AI generation failed: ${error.message}`);
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

app.post('/api/conversations', (req, res) => {
  const id = Date.now().toString();
  const conversation = { id, title: 'New Chat', messages: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  conversations[id] = conversation;
  res.json(conversation);
});

app.delete('/api/conversations/:id', (req, res) => {
  const { id } = req.params;
  if (!conversations[id]) return res.status(404).json({ error: 'Conversation not found' });
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
    
    // Get response from Gemini AI
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
  
  // Set 45 second timeout
  const timeout = setTimeout(() => {
    console.error('⏱️ Streaming timeout after 45 seconds');
    try {
      res.write(`data: ${JSON.stringify({ type: 'error', data: { message: 'Request timeout' } })}\n\n`);
      res.end();
    } catch (e) {}
  }, 45000);
  
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
    console.log(`📨 Processing: "${message.substring(0, 50)}..."`);
    
    // Prepare messages for AI
    const messages = conversation.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Send user message first
    res.write(`data: ${JSON.stringify({ type: 'user_message', data: userMessage })}\n\n`);
    
    // Get streaming response from Gemini AI
    let assistantContent = '';
    const assistantMessageId = (Date.now() + 1).toString();
    
    // Send start of assistant message
    res.write(`data: ${JSON.stringify({ type: 'assistant_start', data: { id: assistantMessageId } })}\n\n`);
    
    console.log('🔄 Starting stream...');
    let chunkCount = 0;
    
    // Stream the response
    for await (const chunk of getAIStreamResponse(messages)) {
      clearTimeout(timeout);
      if (chunk) {
        chunkCount++;
        assistantContent += chunk;
        res.write(`data: ${JSON.stringify({ type: 'assistant_chunk', data: { content: chunk } })}\n\n`);
      }
    }
    
    console.log(`✅ Stream complete: ${chunkCount} chunks, ${assistantContent.length} chars`);
    console.log(`✅ Stream complete: ${chunkCount} chunks, ${assistantContent.length} chars`);
    
    clearTimeout(timeout);
    
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
    clearTimeout(timeout);
    console.error('❌ AI Streaming error:', error.message);
    console.error('Full error:', error);
    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      data: { message: 'AI provider error. Check server logs for details.' } 
    })}\n\n`);
  }
  
  res.write('data: [DONE]\n\n');
  res.end();
});

// Safe debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    aiProvider: 'Google Gemini',
    model: 'gemini-2.5-flash',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SigmaGPT Backend running on port ${PORT}`);
  console.log(`📡 API Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI Service: Google Gemini 2.5 Flash`);
});
