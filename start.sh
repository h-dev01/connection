#!/bin/bash
set -e

echo "Starting CollegeConnect..."

# Start API server in background
PORT=8080 pnpm --filter @workspace/api-server run dev &
API_PID=$!

# Start frontend (port 5000 for Replit webview)
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/college-connect run dev &
FRONTEND_PID=$!

# Wait for either process to exit
wait -n $API_PID $FRONTEND_PID

# If one exits, kill the other
kill $API_PID $FRONTEND_PID 2>/dev/null
