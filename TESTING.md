# Testing Guide

## Testing the Application

### Manual Testing

#### 1. Test Backend API

Start the backend:
```bash
cd backend
npm run dev
```

Test health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "modelLoaded": false,
  "timestamp": "2026-03-23T03:27:46.061Z"
}
```

Test model loading:
```bash
curl -X POST http://localhost:5000/api/load-model
```

Test chat endpoint:
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

#### 2. Test Frontend

Start both servers:
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

**Test Checklist:**
- [ ] Page loads without errors
- [ ] "BitNet Chat" title is visible
- [ ] Model loader screen appears
- [ ] Click "Load Model" button
- [ ] Model loads successfully (or shows appropriate error)
- [ ] Chat interface appears after loading
- [ ] Can type in message input
- [ ] Send button is clickable
- [ ] Messages appear in chat window
- [ ] Responses stream in real-time
- [ ] Status indicator shows "Connected"
- [ ] Generation indicator appears during responses
- [ ] Can send multiple messages
- [ ] Chat history is preserved

#### 3. Test Error Handling

**Without bitnet.cpp:**
1. Remove or rename `backend/bitnet.cpp/main`
2. Try loading the model
3. Should see error message about bitnet.cpp not found

**Without model:**
1. Remove or rename `backend/models/model.bin`
2. Try loading the model
3. Should see error message about model not found

**Backend disconnected:**
1. Stop the backend server
2. Try sending a message
3. Should see connection error

### Mock Testing

Use the dev setup for testing without a real model:

```bash
./dev-setup.sh
npm run dev
```

This provides a mock bitnet.cpp that returns demo responses.

### Integration Testing

#### Test Complete Flow

1. Setup:
```bash
./dev-setup.sh
```

2. Start servers:
```bash
npm run dev
```

3. Open http://localhost:3000

4. Load model and verify success

5. Send test messages:
   - "Hello"
   - "What is BitNet?"
   - "How does it work?"

6. Verify responses appear

7. Check for console errors

### Performance Testing

#### Response Time

Monitor how long it takes for:
- Model loading (should be < 2s with mock)
- First token (should be < 1s with mock)
- Complete response (depends on length)

#### Memory Usage

Check memory consumption:
```bash
# Backend
ps aux | grep node

# Check server logs for memory usage
node --trace-gc backend/server.js
```

### Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Responsive Design

Test at different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

Use browser DevTools to simulate mobile devices.

### Network Testing

Test with network throttling in DevTools:
- [ ] Fast 3G
- [ ] Slow 3G
- [ ] Offline

Verify appropriate error messages appear.

## Automated Testing (Future)

### Unit Tests

For future implementation:

```javascript
// Example test structure
describe('ChatWindow', () => {
  it('should render messages', () => {
    // Test implementation
  });

  it('should auto-scroll to latest message', () => {
    // Test implementation
  });
});
```

### API Tests

```javascript
// Example API test
describe('Backend API', () => {
  it('should return health status', async () => {
    const response = await fetch('/api/health');
    expect(response.status).toBe(200);
  });
});
```

## Debugging Tips

### Frontend Issues

1. Check browser console for errors
2. Verify API calls in Network tab
3. Check React component state with DevTools
4. Add console.log() in event handlers

### Backend Issues

1. Check terminal output
2. Verify environment variables
3. Test endpoints with curl
4. Check file permissions

### Integration Issues

1. Verify backend is running on port 5000
2. Check Vite proxy configuration
3. Verify CORS is enabled
4. Test API endpoints independently

## Common Test Scenarios

### Scenario 1: First Time User
1. User opens the app
2. Sees model loader
3. Clicks load model
4. Model loads successfully
5. Starts chatting

### Scenario 2: Model Load Failure
1. bitnet.cpp not installed
2. User tries to load model
3. Sees clear error message
4. Instructions on how to fix

### Scenario 3: Long Conversation
1. User sends 10+ messages
2. Responses appear correctly
3. Chat history preserved
4. Scrolling works smoothly
5. No memory leaks

### Scenario 4: Rapid Inputs
1. User types and sends quickly
2. Messages queue properly
3. No race conditions
4. All responses received

## Success Criteria

The application passes testing if:

- ✅ All API endpoints work correctly
- ✅ Frontend renders without errors
- ✅ Model loading works (with mock)
- ✅ Messages send and receive
- ✅ Streaming works in real-time
- ✅ Error handling is appropriate
- ✅ UI is responsive on mobile
- ✅ Status indicators update correctly
- ✅ No console errors in normal flow
- ✅ Documentation is clear and complete
