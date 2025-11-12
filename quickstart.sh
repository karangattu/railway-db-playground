#!/bin/bash
# Quick start script for Event Counter application

echo "🚀 Event Counter - Quick Start Setup"
echo "===================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found!"
    echo ""
    echo "📋 Steps to set up your environment:"
    echo "1. Create a Turso database:"
    echo "   turso db create event-counter"
    echo ""
    echo "2. Get your credentials:"
    echo "   turso db show event-counter"
    echo "   turso db tokens create event-counter"
    echo ""
    echo "3. Copy the example file:"
    echo "   cp .env.local.example .env.local"
    echo ""
    echo "4. Edit .env.local with your Turso credentials"
    echo ""
    exit 1
fi

# Check if we can connect to database
echo "🗄️  Pushing database schema..."
npm run db:push

if [ $? -eq 0 ]; then
    echo "✅ Database schema ready"
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "Starting development server..."
    echo "Open http://localhost:3000 in your browser"
    echo ""
    npm run dev
else
    echo "❌ Failed to connect to database"
    echo "Please check your .env.local credentials"
    exit 1
fi
