#!/bin/bash
set -e

echo "Starting CollegeConnect..."

# Start API server in background
PORT=8080 pnpm --filter @workspace/api-server run dev &
API_PID=$!

# Start frontend (port 5000 for Replit webview)
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/college-connect run dev

# If frontend exits, kill API server
kill $API_PID 2>/dev/null
