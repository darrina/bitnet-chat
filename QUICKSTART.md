# Quick Start Guide

This guide will help you get BitNet Chat up and running quickly.

## Fast Setup (5 minutes)

### 1. Install Dependencies

```bash
npm run install-all
```

### 2. Set Up bitnet.cpp

If you already have bitnet.cpp compiled:

```bash
# Create backend directory structure
mkdir -p backend/bitnet.cpp
mkdir -p backend/models

# Copy your bitnet.cpp executable
cp /path/to/bitnet-cpp/build/bin/main backend/bitnet.cpp/

# Or if you have a single executable:
cp /path/to/bitnet-main backend/bitnet.cpp/main
```

### 3. Add Your Model

```bash
# Copy your BitNet/GGUF model
cp /path/to/your/model.gguf backend/models/model.bin
```

### 4. Configure

```bash
cd backend
cp .env.example .env
# Edit .env if needed (usually not required for default setup)
cd ..
```

### 5. Run

```bash
npm run dev
```

Open http://localhost:3000 in your browser!

## Alternative: Using Environment Variables

Instead of copying files, you can use environment variables:

```bash
# Set paths to your existing files
export BITNET_PATH=/path/to/bitnet-cpp/build/bin/main
export MODEL_PATH=/path/to/your/model.gguf

# Run the application
npm run dev
```

## Building bitnet.cpp from Source

If you don't have bitnet.cpp yet:

```bash
# Clone the BitNet repository
git clone https://github.com/microsoft/BitNet.git
cd BitNet

# Follow their build instructions
mkdir build && cd build
cmake ..
make -j$(nproc)

# The executable will be at build/bin/main
```

## Getting a Model

### Option 1: Hugging Face
Download a compatible model from Hugging Face. Look for:
- BitNet models in GGUF format
- Llama.cpp compatible models
- Models quantized for BitNet

### Option 2: Convert Your Own
If you have a BitNet model, convert it to GGUF format using the tools provided in the BitNet repository.

## Verify Installation

Once everything is set up, you should see:

1. Backend starts on port 5000
2. Frontend opens on port 3000
3. Browser shows "BitNet Chat" interface
4. Click "Load Model" - should succeed
5. Type a message and get a response

## Common Issues

### "bitnet.cpp not found"
- Check `BITNET_PATH` in backend/.env
- Verify the file exists and is executable

### "Model file not found"
- Check `MODEL_PATH` in backend/.env
- Verify the model file exists

### "Port already in use"
- Change `PORT` in backend/.env
- Or stop other services using ports 3000/5000

## Next Steps

- Read the full README.md for detailed information
- Customize the UI in frontend/src/App.css
- Adjust model parameters in backend/server.js
- Add authentication or additional features

Enjoy chatting with your local BitNet model! 🚀
