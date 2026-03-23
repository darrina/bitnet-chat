const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// State management
let modelLoaded = false;
let isGenerating = false;

// Configuration
const BITNET_PATH = process.env.BITNET_PATH || path.join(__dirname, 'bitnet.cpp');
const MODEL_PATH = process.env.MODEL_PATH || path.join(__dirname, 'models', 'model.bin');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    modelLoaded,
    timestamp: new Date().toISOString()
  });
});

// Load model endpoint
app.post('/api/load-model', async (req, res) => {
  try {
    // Check if bitnet.cpp exists
    const bitnetExists = fs.existsSync(BITNET_PATH) ||
                         fs.existsSync(path.join(BITNET_PATH, 'build', 'bin', 'main')) ||
                         fs.existsSync(path.join(BITNET_PATH, 'main'));

    if (!bitnetExists) {
      return res.status(500).json({
        error: 'bitnet.cpp not found. Please compile bitnet.cpp and place it in the backend directory or set BITNET_PATH environment variable.',
        bitnetPath: BITNET_PATH
      });
    }

    // Check if model file exists
    const modelExists = fs.existsSync(MODEL_PATH);

    if (!modelExists) {
      return res.status(500).json({
        error: 'Model file not found. Please download a BitNet model and place it in backend/models/ or set MODEL_PATH environment variable.',
        modelPath: MODEL_PATH,
        hint: 'You can use models in GGUF format compatible with llama.cpp'
      });
    }

    modelLoaded = true;

    res.json({
      success: true,
      message: 'Model loaded successfully',
      modelPath: MODEL_PATH
    });
  } catch (error) {
    console.error('Error loading model:', error);
    res.status(500).json({ error: error.message });
  }
});

// Chat completion endpoint with streaming
app.post('/api/chat', async (req, res) => {
  if (!modelLoaded) {
    return res.status(400).json({ error: 'Model not loaded' });
  }

  if (isGenerating) {
    return res.status(429).json({ error: 'Model is currently generating a response' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }

  // Set headers for SSE (Server-Sent Events)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  isGenerating = true;

  try {
    // Format the prompt
    let prompt = '';
    for (const msg of messages) {
      if (msg.role === 'user') {
        prompt += `User: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Assistant: ${msg.content}\n`;
      }
    }
    prompt += 'Assistant:';

    // Determine the correct bitnet executable path
    let bitnetExecutable = path.join(BITNET_PATH, 'build', 'bin', 'main');
    if (!fs.existsSync(bitnetExecutable)) {
      bitnetExecutable = path.join(BITNET_PATH, 'main');
    }
    if (!fs.existsSync(bitnetExecutable)) {
      bitnetExecutable = BITNET_PATH;
    }

    // Spawn bitnet.cpp process
    const args = [
      '-m', MODEL_PATH,
      '-p', prompt,
      '-n', '512',
      '--temp', '0.7',
      '--top-k', '40',
      '--top-p', '0.9',
    ];

    const bitnetProcess = spawn(bitnetExecutable, args);
    let outputBuffer = '';

    // Handle stdout
    bitnetProcess.stdout.on('data', (data) => {
      const text = data.toString();
      outputBuffer += text;

      // Send tokens as they arrive
      const lines = outputBuffer.split('\n');
      outputBuffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.trim()) {
          res.write(`data: ${JSON.stringify({ content: line + '\n' })}\n\n`);
        }
      }
    });

    // Handle stderr
    bitnetProcess.stderr.on('data', (data) => {
      console.error('bitnet.cpp stderr:', data.toString());
    });

    // Handle process completion
    bitnetProcess.on('close', (code) => {
      if (outputBuffer.trim()) {
        res.write(`data: ${JSON.stringify({ content: outputBuffer })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
      isGenerating = false;
    });

    // Handle process error
    bitnetProcess.on('error', (error) => {
      console.error('Error spawning bitnet.cpp:', error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      isGenerating = false;
    });

    // Handle client disconnect
    req.on('close', () => {
      bitnetProcess.kill();
      isGenerating = false;
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
    isGenerating = false;
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`BitNet path: ${BITNET_PATH}`);
  console.log(`Model path: ${MODEL_PATH}`);
  console.log('\nEndpoints:');
  console.log(`  GET  /api/health      - Health check`);
  console.log(`  POST /api/load-model  - Load the model`);
  console.log(`  POST /api/chat        - Chat with the model`);
});
