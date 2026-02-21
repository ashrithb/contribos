#!/bin/bash
# Start both server and agent in a single Railway container
npx tsx server/src/index.ts &
SERVER_PID=$!

sleep 5

npx tsx agent/src/index.ts &
AGENT_PID=$!

trap "kill $SERVER_PID $AGENT_PID 2>/dev/null" EXIT

wait $SERVER_PID $AGENT_PID
