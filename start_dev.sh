#!/bin/bash
# Start Bronswap Web Application in development mode

echo "🚀 Starting Bronswap Web Application (Development Mode)..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load environment variables from project root
if [ -f "$PROJECT_ROOT/.env" ]; then
    echo "📝 Loading environment variables..."
    export $(cat "$PROJECT_ROOT/.env" | grep -v '^#' | xargs)
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

cd "$SCRIPT_DIR"

# Load nvm and use Node v20 LTS
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start Next.js development server
echo "🎨 Starting Next.js app on port 6969..."
npm run dev &
WEBAPP_PID=$!

echo ""
echo "✅ Web Application is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Application: http://daycanton02.elkcapitalmarkets.com:6969"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 To access remotely, use SSH port forwarding:"
echo "   ssh -L 6969:localhost:6969 user@daycanton02"
echo ""
echo "Press Ctrl+C to stop..."

# Wait for process
wait

