#!/bin/bash

# Kill any existing zombie processes on our ports just to be safe
lsof -i :8008 -t | xargs kill -9 2>/dev/null
lsof -i :5173 -t | xargs kill -9 2>/dev/null

echo "======================================"
echo "🚀 Starting RepoGuide Backend (Port 8008)..."
echo "======================================"
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8008 &
BACKEND_PID=$!

echo ""
echo "======================================"
echo "✨ Starting RepoGuide Frontend (Port 5173)..."
echo "======================================"
cd ../frontend
npm run dev

# Ensure backend stops if frontend is stopped
trap "kill $BACKEND_PID" EXIT
