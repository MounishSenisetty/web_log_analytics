#!/bin/bash

# Run script for Web Log Analytics project (non-Docker version)
# This script starts all necessary components locally

echo "Starting Web Log Analytics project (non-Docker version)..."

# Activate virtual environment
source venv/bin/activate

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
  echo "Error: Virtual environment not activated. Run ./setup_local.sh first."
  exit 1
fi

# Generate sample log data (using the simple generator instead of PySpark)
echo "Generating sample data..."
mkdir -p processed_logs
cd backend/processing
python3 generate_sample_data.py
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate sample data. Exiting."
    exit 1
fi
cd ../..

# Check if processed data exists
if [ ! -f "processed_logs/traffic_overview.json" ]; then
    echo "❌ Processed data not found. Sample data generation may have failed."
    exit 1
fi

# Start the API server in the background
echo "Starting API server on http://localhost:8000"
cd backend/api
python3 app_local.py &
API_PID=$!
cd ../..

# Wait for API to start
echo "Waiting for API to start..."
sleep 3

# Start the frontend in the background
echo "Starting frontend on http://localhost:3000"
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "All services started!"
echo "API running at: http://localhost:8000"
echo "Frontend running at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to kill processes on exit
function cleanup {
  echo "Stopping services..."
  kill $API_PID
  kill $FRONTEND_PID
  echo "Services stopped."
}

# Register the cleanup function for when script receives SIGINT
trap cleanup SIGINT

# Keep the script running
wait
