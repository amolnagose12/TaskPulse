#!/usr/bin/env bash
# ===================================================================
# TaskPulse Launch Helper
# Starts Spring Boot Backend (Port 8080) and React Frontend (Port 5173)
# ===================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "⚡ Starting TaskPulse Platform..."
echo "📁 Project Directory: $PROJECT_DIR"

# 1. Start Spring Boot in the background
echo "🚀 [1/2] Starting Spring Boot Backend on http://localhost:8080..."
cd "$PROJECT_DIR/backend"
mvn spring-boot:run &
BACKEND_PID=$!

# Trap interrupt to kill background backend process on exit
trap "echo 'Stopping TaskPulse backend (PID $BACKEND_PID)...'; kill $BACKEND_PID 2>/dev/null; exit" SIGINT SIGTERM

echo "⏳ Waiting 5 seconds for backend initialization..."
sleep 5

# 2. Start React Frontend with Vite
echo "💻 [2/2] Starting React Vite Frontend on http://localhost:5173..."
cd "$PROJECT_DIR/frontend"
npm run dev

# Wait for background processes
wait $BACKEND_PID

