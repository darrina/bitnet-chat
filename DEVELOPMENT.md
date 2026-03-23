# Development Guide

## Project Structure

```
bitnet-chat/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── App.jsx        # Main application component
│   │   ├── App.css        # Global styles
│   │   ├── ChatWindow.jsx # Message history display
│   │   ├── ModelLoader.jsx # Model loading UI
│   │   └── main.jsx       # Application entry point
│   ├── index.html         # HTML template
│   ├── vite.config.js     # Vite configuration
│   └── package.json       # Frontend dependencies
├── backend/               # Express backend server
│   ├── server.js          # Main server with API endpoints
│   ├── .env.example       # Environment variables template
│   └── package.json       # Backend dependencies
└── package.json           # Root package with scripts
```

## Development Workflow

### 1. Initial Setup

```bash
# Clone and install
git clone <repository>
cd bitnet-chat
npm run install-all
```

### 2. Development Mode

Run both frontend and backend with hot reloading:

```bash
npm run dev
```

This starts:
- Frontend at http://localhost:3000 (Vite dev server)
- Backend at http://localhost:5000 (Nodemon with auto-reload)

### 3. Working on Frontend

```bash
cd frontend
npm run dev
```

The frontend proxy is configured to forward `/api/*` requests to the backend at `http://localhost:5000`.

### 4. Working on Backend

```bash
cd backend
npm run dev
```

Nodemon will automatically restart the server when you make changes to `server.js`.

## Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **CSS3** - Styling with CSS variables

### Backend
- **Express.js** - Web framework
- **Node.js** - Runtime environment
- **child_process** - For spawning bitnet.cpp

### Inference
- **bitnet.cpp** - BitNet model inference engine

## Code Style

### JavaScript/JSX
- Use ES6+ features
- Functional components with hooks
- Async/await for asynchronous operations
- Descriptive variable names

### CSS
- CSS variables for theming
- BEM-like naming for components
- Mobile-first responsive design

## Key Components

### Frontend

#### App.jsx
Main application component managing:
- Message state
- Model loading state
- Connection status
- API communication

#### ChatWindow.jsx
Displays the message history with:
- Auto-scrolling to latest message
- Empty state handling
- Typing indicators

#### ModelLoader.jsx
Model loading interface with:
- Load button
- Loading animation
- Error display

### Backend

#### server.js
Express server providing:
- Health check endpoint
- Model loading endpoint
- Streaming chat endpoint with SSE

## API Integration

The frontend communicates with the backend via REST API:

1. **Health Check**: `GET /api/health`
2. **Load Model**: `POST /api/load-model`
3. **Chat**: `POST /api/chat` (streaming)

See [API.md](API.md) for detailed API documentation.

## Environment Variables

### Backend (.env)

```env
BITNET_PATH=./bitnet.cpp    # Path to bitnet.cpp executable
MODEL_PATH=./models/model.bin  # Path to model file
PORT=5000                    # Server port
```

## Common Development Tasks

### Adding a New Feature

1. Plan the feature
2. Update frontend components if needed
3. Add backend endpoints if needed
4. Test the integration
5. Update documentation

### Debugging

#### Frontend Debugging
- Use React DevTools browser extension
- Check browser console for errors
- Use Network tab to inspect API calls

#### Backend Debugging
- Check terminal output for server logs
- Add `console.log()` statements
- Use Node.js debugger: `node --inspect server.js`

### Testing Model Integration

For testing without a real model, use the mock setup:

```bash
./dev-setup.sh
npm run dev
```

This creates a mock bitnet.cpp that returns demo responses.

## Building for Production

### Build Frontend

```bash
cd frontend
npm run build
```

Builds the frontend to `frontend/dist/`.

### Serve Production Build

Configure Express to serve the built files:

```javascript
// In backend/server.js
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/dist')));
```

Then:
```bash
cd backend
npm start
```

## Performance Optimization

### Frontend
- React.memo for expensive components
- Debounce input handlers
- Lazy load components if needed

### Backend
- Stream responses instead of buffering
- Implement request queuing for multiple users
- Add caching if appropriate

## Troubleshooting

### Port Already in Use

Change the port in `backend/.env`:
```env
PORT=5001
```

And update Vite proxy in `frontend/vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5001',
    changeOrigin: true
  }
}
```

### CORS Issues

CORS is enabled in `server.js`:
```javascript
app.use(cors());
```

For specific origins:
```javascript
app.use(cors({
  origin: 'http://localhost:3000'
}));
```

### Model Loading Errors

1. Verify `BITNET_PATH` points to valid executable
2. Check file permissions
3. Ensure model file exists at `MODEL_PATH`
4. Check bitnet.cpp compatibility

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Resources

- [React Documentation](https://react.dev/)
- [Express Documentation](https://expressjs.com/)
- [Vite Documentation](https://vitejs.dev/)
- [BitNet Paper](https://arxiv.org/pdf/2410.16144)

## License

MIT
