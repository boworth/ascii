#!/bin/bash
# Start Bronswap Web Application in production mode

echo "🚀 Starting Bronswap Web Application (Production Mode)..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    echo "📝 Loading environment variables..."
    export $(cat "$PROJECT_ROOT/.env" | grep -v '^#' | xargs)
fi

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

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the application
echo "🏗️  Building Next.js application..."
npm run build

# Start production server
echo "🌐 Starting production server on port 8080..."
npm run start &
WEBAPP_PID=$!

echo ""
echo "✅ Web Application is running in production mode!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Application: http://daycanton02.elkcapitalmarkets.com:8080"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 To access remotely, use SSH port forwarding:"
echo "   ssh -L 8080:localhost:8080 user@daycanton02"
echo ""
echo "Press Ctrl+C to stop..."

# Wait for process
wait

