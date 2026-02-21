#!/bin/bash
# Start server and agent together (for Railway deployment)
npx tsx server/src/index.ts &
SERVER_PID=$!

# Wait for server to be ready
sleep 5

npx tsx agent/src/index.ts &
AGENT_PID=$!

# If either process dies, kill the other and exit
trap "kill $SERVER_PID $AGENT_PID 2>/dev/null; exit" SIGINT SIGTERM

wait -n
kill $SERVER_PID $AGENT_PID 2>/dev/null
