#!/bin/bash

PORT=2006
PID=$(lsof -t -i:$PORT)

if [ -n "$PID" ]; then
  echo "Port $PORT is in use. Killing process with PID $PID."
  sudo kill -9 $PID
else
  echo "Port $PORT is free."
fi

echo "Starting server on port $PORT..."
nodemon server.js
