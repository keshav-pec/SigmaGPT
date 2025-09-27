# SigmaGPT - ChatGPT Clone

A fully-featured ChatGPT-like web application built with React and Node.js, featuring real-time streaming responses, conversation management, and a sleek dark theme interface.

## Features

- 🎯 **ChatGPT-like Interface**: Exact replica of ChatGPT's user experience
- 💬 **Real-time Streaming**: Messages stream in real-time like the original ChatGPT
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🌙 **Dark Theme**: Modern dark theme with ChatGPT-style colors
- 💾 **Conversation Management**: Create, switch, and delete conversations
- 🤖 **OpenAI Integration**: Powered by OpenAI's GPT models
- ⚡ **Fast & Smooth**: Optimized for performance and user experience
- 🎨 **Syntax Highlighting**: Code blocks with proper syntax highlighting
- 📝 **Markdown Support**: Full markdown rendering for rich text responses

## Tech Stack

### Backend
- **Node.js** with Express.js
- **OpenAI API** for AI responses
- **Server-Sent Events** for streaming
- **CORS** enabled for cross-origin requests

### Frontend
- **React** with functional components and hooks
- **Axios** for API communication
- **React Markdown** for message rendering
- **React Syntax Highlighter** for code blocks
- **Lucide React** for icons
- **Custom CSS** with ChatGPT-style theming

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

### Backend Setup

1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Make sure your .env file contains:
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   
   The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   
   The frontend will run on `http://localhost:3000`

## Usage

1. **Starting a Conversation**: Click "New chat" or simply start typing in the input field
2. **Sending Messages**: Type your message and press Enter or click the send button
3. **Managing Conversations**: 
   - View all conversations in the left sidebar
   - Click on any conversation to switch to it
   - Hover over conversations to see the delete button
4. **Streaming Responses**: Responses stream in real-time just like ChatGPT
5. **Code Support**: Send code-related questions to get properly formatted code responses

## API Endpoints

### Conversations
- `GET /api/conversations` - Get all conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id` - Get specific conversation
- `DELETE /api/conversations/:id` - Delete conversation

### Messages
- `POST /api/conversations/:id/messages` - Send message (regular response)
- `POST /api/conversations/:id/stream` - Send message (streaming response)

### Health Check
- `GET /api/health` - Check if backend is running

## Project Structure

```
SigmaGPT/
├── Backend/
│   ├── server.js          # Express server with OpenAI integration
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
└── Frontend/
    ├── src/
    │   ├── components/    # React components
    │   │   ├── Sidebar.js # Conversation sidebar
    │   │   ├── ChatArea.js # Main chat interface
    │   │   └── StreamingChatArea.js # Streaming version
    │   ├── services/
    │   │   └── api.js     # API service functions
    │   ├── App.js         # Main app component
    │   └── App.css        # Global styles
    └── package.json       # Frontend dependencies
```

## Features in Detail

### Real-time Streaming
- Messages appear character by character as they're generated
- Typing indicators and loading states
- Smooth animations and transitions

### Conversation Management
- Automatic conversation titling based on first message
- Persistent conversation history
- Easy conversation switching and deletion

### UI/UX
- Exact ChatGPT visual design
- Responsive layout for all screen sizes
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Auto-expanding text input
- Scroll to bottom on new messages

### Code Handling
- Syntax highlighting for multiple programming languages
- Proper code block formatting
- Copy-friendly code display

## Customization

### Changing the AI Model
Edit `server.js` and modify the model parameter:
```javascript
model: 'gpt-4', // Change to gpt-4, gpt-3.5-turbo, etc.
```

### Styling
All styles are in CSS files using CSS custom properties (variables) for easy theming. Main colors are defined in `App.css`:
```css
:root {
  --bg-primary: #212121;
  --accent-color: #10a37f;
  /* ... other variables */
}
```

### Adding Features
The codebase is modular and easy to extend:
- Add new API endpoints in `server.js`
- Create new React components in the `components/` folder
- Extend the API service in `services/api.js`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. Make sure to comply with OpenAI's usage policies when using their API.

## Support

If you encounter any issues:
1. Check that both backend and frontend servers are running
2. Verify your OpenAI API key is valid and has credits
3. Check the browser console and server logs for error messages
4. Ensure all dependencies are properly installed

---

**Enjoy your SigmaGPT experience! 🚀**