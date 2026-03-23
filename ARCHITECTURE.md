# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│                    http://localhost:3000                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    App.jsx   │  │ ChatWindow   │  │ ModelLoader  │      │
│  │              │  │   .jsx       │  │   .jsx       │      │
│  │ • State Mgmt │  │ • Messages   │  │ • Load UI    │      │
│  │ • API Calls  │  │ • Auto-scroll│  │ • Errors     │      │
│  │ • Streaming  │  │ • Typing     │  │ • Animation  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/SSE
                           │ Proxy: /api/* → :5000
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               Backend (Express + Node.js)                    │
│                   http://localhost:5000                      │
├─────────────────────────────────────────────────────────────┤
│  API Endpoints:                                              │
│  • GET  /api/health      → Status check                     │
│  • POST /api/load-model  → Initialize model                 │
│  • POST /api/chat        → Stream responses (SSE)           │
│                                                              │
│  Components:                                                 │
│  • Express.js server                                         │
│  • CORS enabled                                              │
│  • Body parser                                               │
│  • Child process spawner                                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ spawn()
                           │ stdin/stdout pipes
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   bitnet.cpp Process                         │
├─────────────────────────────────────────────────────────────┤
│  • Inference engine                                          │
│  • Model loading                                             │
│  • Token generation                                          │
│  • Streaming output                                          │
│                                                              │
│  Arguments:                                                  │
│  -m <model_path>    Model file                              │
│  -p <prompt>        Input prompt                            │
│  -n 512            Max tokens                               │
│  --temp 0.7        Temperature                              │
│  --top-k 40        Top-K sampling                           │
│  --top-p 0.9       Top-P sampling                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     BitNet Model File                        │
│                   (GGUF format, .bin)                        │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Model Loading Flow

```
User clicks "Load Model"
    ↓
Frontend: POST /api/load-model
    ↓
Backend: Check bitnet.cpp exists
    ↓
Backend: Check model file exists
    ↓
Backend: Set modelLoaded = true
    ↓
Frontend: Show chat interface
```

### 2. Chat Message Flow

```
User types message & clicks Send
    ↓
Frontend: Add to messages array
    ↓
Frontend: POST /api/chat with messages
    ↓
Backend: Format prompt from messages
    ↓
Backend: spawn(bitnet.cpp, args)
    ↓
bitnet.cpp: Load model & generate tokens
    ↓
Backend: Read stdout, format as SSE
    ↓
Backend: Stream → data: {"content":"..."}\n\n
    ↓
Frontend: Read stream chunks
    ↓
Frontend: Update message content in real-time
    ↓
Frontend: Show complete response
```

## Component Responsibilities

### Frontend Components

**App.jsx**
- Central state management
- API communication
- Connection status tracking
- Request orchestration

**ChatWindow.jsx**
- Message rendering
- Auto-scroll behavior
- Typing indicators
- Empty state handling

**ModelLoader.jsx**
- Model loading UI
- Loading states
- Error display
- User prompts

### Backend Components

**server.js**
- HTTP server setup
- Route handlers
- Process spawning
- Stream management
- Error handling

**bitnet.cpp integration**
- Process lifecycle
- Argument passing
- Output streaming
- Cleanup on disconnect

## Technology Stack Details

### Frontend Stack
- **React 18**: UI framework
- **Vite**: Build tool & dev server
  - Fast HMR (Hot Module Replacement)
  - ES modules support
  - Proxy for API calls
- **CSS3**: Styling with variables
  - Gradient themes
  - Animations
  - Responsive design

### Backend Stack
- **Node.js**: Runtime environment
- **Express.js**: Web framework
  - Middleware support
  - Route handling
  - Static file serving
- **CORS**: Cross-origin requests
- **Body Parser**: JSON parsing

### Infrastructure
- **Server-Sent Events (SSE)**: Real-time streaming
- **Child Process**: Subprocess management
- **Environment Variables**: Configuration

## Security Considerations

1. **Input Validation**
   - Message format validation
   - Request body checking
   - File path verification

2. **Process Isolation**
   - bitnet.cpp runs as subprocess
   - No direct shell execution
   - Controlled argument passing

3. **CORS Configuration**
   - Enabled for development
   - Should be restricted in production

4. **Resource Management**
   - Single inference at a time
   - Process cleanup on disconnect
   - Memory considerations

## Performance Characteristics

### Latency Points
1. **Network**: Frontend ↔ Backend (localhost, minimal)
2. **Process Spawn**: ~100-500ms (one-time per request)
3. **Model Loading**: Depends on model size
4. **Token Generation**: Varies by hardware
5. **Streaming**: Real-time, minimal buffering

### Optimizations
- Streaming reduces perceived latency
- Auto-scroll improves UX during generation
- Process reuse possible (future enhancement)
- Model stays loaded between requests

## Extension Points

### Easy to Add
- Authentication middleware
- Request queuing
- Multiple model support
- Conversation persistence
- Rate limiting
- Usage analytics

### Future Enhancements
- WebSocket support
- Multi-user handling
- Model hot-swapping
- GPU acceleration
- Distributed inference
- Cloud deployment

## Configuration Points

### Environment Variables
```bash
# Backend
BITNET_PATH=./bitnet.cpp
MODEL_PATH=./models/model.bin
PORT=5000

# Frontend (vite.config.js)
server.port=3000
proxy.target=http://localhost:5000
```

### Model Parameters
```javascript
// In server.js
const args = [
  '-n', '512',      // Max tokens
  '--temp', '0.7',  // Temperature
  '--top-k', '40',  // Top-K
  '--top-p', '0.9', // Top-P
];
```

## Deployment Considerations

### Development
- Vite dev server (port 3000)
- Nodemon auto-reload (port 5000)
- Mock bitnet.cpp for testing

### Production
- Build frontend to `dist/`
- Serve static files from Express
- Real bitnet.cpp executable
- Environment-based config
- Process monitoring
- Error logging
