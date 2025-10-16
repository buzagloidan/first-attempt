#!/bin/bash

# Development startup script for Buzaglo Engine

echo "🚀 Starting Buzaglo Engine Development Environment..."

# Check if PostgreSQL is running
if ! pg_isready > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL is not running!"
    echo "Starting PostgreSQL..."
    
    if command -v brew > /dev/null 2>&1; then
        # macOS with Homebrew
        brew services start postgresql@14
    elif command -v systemctl > /dev/null 2>&1; then
        # Linux with systemd
        sudo systemctl start postgresql
    else
        echo "❌ Could not start PostgreSQL automatically"
        echo "Please start PostgreSQL manually and run this script again"
        exit 1
    fi
    
    sleep 2
fi

# Check if database exists
if ! psql -lqt | cut -d \| -f 1 | grep -qw buzaglo; then
    echo "📦 Creating database 'buzaglo'..."
    createdb buzaglo
fi

# Check if migrations have been run
if [ ! -f ".migration-done" ]; then
    echo "🔧 Running database migrations..."
    cd backend
    npm run migrate
    cd ..
    touch .migration-done
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "Copying .env.example to .env..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your GEMINI_API_KEY"
    exit 1
fi

# Check if GEMINI_API_KEY is set
if ! grep -q "GEMINI_API_KEY=.*[^=]" .env; then
    echo "⚠️  GEMINI_API_KEY not set in .env"
    echo "Please add your Gemini API key to .env file"
    exit 1
fi

echo "✅ All checks passed!"
echo "🚀 Starting development servers..."
echo ""
echo "Backend:  http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo ""

npm run dev

