#!/bin/bash

# setup.sh - Quick setup script for BitNet Chat

set -e

echo "🚀 BitNet Chat Setup Script"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "📦 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js v18 or higher.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher. Current: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm $(npm -v) detected${NC}"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
echo "This may take a few minutes..."
echo ""

npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

echo ""
echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
echo ""

# Create necessary directories
echo "📁 Creating directory structure..."
mkdir -p backend/bitnet.cpp
mkdir -p backend/models

echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Set up environment file
if [ ! -f backend/.env ]; then
    echo "⚙️  Creating environment configuration..."
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ Environment file created at backend/.env${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env already exists, skipping...${NC}"
fi

echo ""
echo "=============================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "=============================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Set up bitnet.cpp:"
echo "   - Place your bitnet.cpp executable in: backend/bitnet.cpp/main"
echo "   - Or update BITNET_PATH in backend/.env"
echo ""
echo "2. Add your model:"
echo "   - Place your model file in: backend/models/model.bin"
echo "   - Or update MODEL_PATH in backend/.env"
echo ""
echo "3. Run the application:"
echo "   npm run dev"
echo ""
echo "For detailed instructions, see README.md or QUICKSTART.md"
echo ""
