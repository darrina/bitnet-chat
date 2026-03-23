#!/bin/bash

# dev-setup.sh - Setup script for development/demo with mock model

set -e

echo "🛠️  BitNet Chat Development Setup"
echo "===================================="
echo ""
echo "This script sets up a demo environment for testing without a real model."
echo ""

# Create mock bitnet.cpp script
mkdir -p backend/bitnet.cpp
cat > backend/bitnet.cpp/main << 'EOF'
#!/bin/bash

# Mock bitnet.cpp for testing/demo purposes
# This simulates the bitnet.cpp inference engine

# Parse arguments
MODEL=""
PROMPT=""
MAX_TOKENS=512

while [[ $# -gt 0 ]]; do
  case $1 in
    -m)
      MODEL="$2"
      shift 2
      ;;
    -p)
      PROMPT="$2"
      shift 2
      ;;
    -n)
      MAX_TOKENS="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# Simulate generation with a demo response
echo "This is a demo response from the mock BitNet model."
echo ""
echo "The real bitnet.cpp would generate text based on the BitNet model."
echo ""
echo "To use a real model:"
echo "1. Compile bitnet.cpp from the BitNet repository"
echo "2. Download a compatible BitNet/GGUF model"
echo "3. Update the BITNET_PATH and MODEL_PATH in backend/.env"
echo ""
echo "Your prompt was:"
echo "$PROMPT"
EOF

chmod +x backend/bitnet.cpp/main

# Create mock model file
mkdir -p backend/models
touch backend/models/model.bin

# Create .env file
cat > backend/.env << 'EOF'
BITNET_PATH=./bitnet.cpp
MODEL_PATH=./models/model.bin
PORT=5000
EOF

echo "✅ Development environment setup complete!"
echo ""
echo "📝 Created:"
echo "  - backend/bitnet.cpp/main (mock executable)"
echo "  - backend/models/model.bin (placeholder)"
echo "  - backend/.env (configuration)"
echo ""
echo "⚠️  Note: This is using a MOCK model for testing."
echo "   Real inference requires actual bitnet.cpp and a BitNet model."
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
