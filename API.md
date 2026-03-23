# API Documentation

## Overview

The BitNet Chat backend provides a RESTful API for loading models and performing chat inference using bitnet.cpp.

## Base URL

```
http://localhost:5000/api
```

## Endpoints

### Health Check

Check the server status and model state.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "modelLoaded": false,
  "timestamp": "2026-03-23T03:27:46.061Z"
}
```

**Status Codes:**
- `200 OK` - Server is running

---

### Load Model

Load the BitNet model into memory.

**Endpoint:** `POST /api/load-model`

**Request Body:** None

**Response (Success):**
```json
{
  "success": true,
  "message": "Model loaded successfully",
  "modelPath": "/path/to/model.bin"
}
```

**Response (Error - bitnet.cpp not found):**
```json
{
  "error": "bitnet.cpp not found. Please compile bitnet.cpp and place it in the backend directory or set BITNET_PATH environment variable.",
  "bitnetPath": "/path/to/bitnet.cpp"
}
```

**Response (Error - Model not found):**
```json
{
  "error": "Model file not found. Please download a BitNet model and place it in backend/models/ or set MODEL_PATH environment variable.",
  "modelPath": "/path/to/model.bin",
  "hint": "You can use models in GGUF format compatible with llama.cpp"
}
```

**Status Codes:**
- `200 OK` - Model loaded successfully
- `500 Internal Server Error` - Model loading failed

---

### Chat Completion (Streaming)

Send a chat request and receive a streamed response.

**Endpoint:** `POST /api/chat`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    },
    {
      "role": "assistant",
      "content": "I'm doing well, thank you!"
    },
    {
      "role": "user",
      "content": "What is BitNet?"
    }
  ]
}
```

**Response (Streaming):**

The response is sent as Server-Sent Events (SSE) with `Content-Type: text/event-stream`.

Each chunk is sent in the following format:
```
data: {"content":"This "}\n\n
data: {"content":"is "}\n\n
data: {"content":"BitNet"}\n\n
data: [DONE]\n\n
```

**Response (Error):**
```json
{
  "error": "Model not loaded"
}
```

**Status Codes:**
- `200 OK` - Streaming response started
- `400 Bad Request` - Invalid request format or model not loaded
- `429 Too Many Requests` - Model is currently generating another response

---

## Message Format

### User Message
```json
{
  "role": "user",
  "content": "Your message here"
}
```

### Assistant Message
```json
{
  "role": "assistant",
  "content": "AI response here"
}
```

## Error Handling

All errors follow this format:
```json
{
  "error": "Error message description"
}
```

## Rate Limiting

The server can only process one inference request at a time. If a request is made while another is in progress, a `429 Too Many Requests` status will be returned.

## Streaming Protocol

The `/api/chat` endpoint uses Server-Sent Events (SSE) for streaming responses.

### Consuming the Stream

**JavaScript Example:**
```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages })
});

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
      if (data === '[DONE]') break;

      const parsed = JSON.parse(data);
      console.log(parsed.content); // Process the content
    }
  }
}
```

## Configuration

The backend server can be configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `BITNET_PATH` | Path to bitnet.cpp executable | `./bitnet.cpp` |
| `MODEL_PATH` | Path to model file | `./models/model.bin` |
| `PORT` | Server port | `5000` |

Set these in `backend/.env`:
```env
BITNET_PATH=./bitnet.cpp
MODEL_PATH=./models/model.bin
PORT=5000
```

## Model Parameters

The following parameters are used for inference (defined in `server.js`):

- `-m` - Model path
- `-p` - Prompt
- `-n 512` - Maximum tokens to generate
- `--temp 0.7` - Temperature (randomness)
- `--top-k 40` - Top-K sampling
- `--top-p 0.9` - Top-P (nucleus) sampling

These can be modified in `backend/server.js` to adjust model behavior.
