#!/bin/bash

# Big Data Analytics Web Log Analytics Project Startup Script

echo "Starting Web Log Analytics Project with Apache Big Data Tools..."

# Function to check if Docker is running
check_docker() {
  if ! sudo docker info > /dev/null 2>&1; then
    echo "Starting Docker service..."
    sudo service docker start
    sleep 5
    if ! sudo docker info > /dev/null 2>&1; then
      echo "Docker is not running. Please start Docker and try again."
      exit 1
    fi
  fi
  echo "Docker is running."
}

# Function to generate sample data
generate_sample_data() {
  echo "Generating sample log data..."
  mkdir -p data
  cd data
  python generate_logs.py --output sample_logs.txt --lines 10000 --start_date 2023-01-01 --days 30
  cd ..
}

# Function to start backend services with Docker
start_backend() {
  echo "Starting backend services with Docker..."
  sudo docker-compose up -d
  
  # Wait for services to be ready
  echo "Waiting for services to be ready..."
  sleep 30
  
  # Check if services are up
  if sudo docker ps | grep -q "spark-master"; then
    echo "Spark Master is running."
  else
    echo "Spark Master failed to start."
    exit 1
  fi
  
  if sudo docker ps | grep -q "hive-server"; then
    echo "Hive Server is running."
  else
    echo "Hive Server failed to start."
    exit 1
  fi
}

# Function to process log data with Spark
process_logs() {
  echo "Processing log data with Spark..."
  sudo docker cp data/sample_logs.txt spark-master:/tmp/sample_logs.txt
  sudo docker cp backend/processing/log_processor.py spark-master:/tmp/log_processor.py
  
  sudo docker exec -it spark-master spark-submit \
    --master spark://spark-master:7077 \
    /tmp/log_processor.py \
    --input /tmp/sample_logs.txt \
    --output /user/hive/warehouse/web_logs
    
  echo "Log processing complete."
}

# Function to start the API server
start_api() {
  echo "Starting API server..."
  cd backend/api
  python app.py &
  API_PID=$!
  cd ../..
  
  # Wait for API to start
  echo "Waiting for API to start..."
  sleep 5
  
  # Check if API is running
  if curl -s http://localhost:5000 > /dev/null; then
    echo "API server started successfully."
  else
    echo "API server failed to start."
    exit 1
  fi
}

# Function to start frontend development server
start_frontend() {
  echo "Starting frontend development server..."
  cd frontend
  
  # Update apiService.js to point to the correct API endpoint
  sed -i 's/localhost:8000/localhost:5000/g' src/api/apiService.js
  
  npm start &
  FRONTEND_PID=$!
  cd ..
}

# Main execution
check_docker
generate_sample_data
start_backend
process_logs
start_api
start_frontend

echo "All services started!"
echo "API running at: http://localhost:5000"
echo "Frontend running at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to kill processes on exit
function cleanup {
  echo "Stopping services..."
  kill $API_PID
  kill $FRONTEND_PID
  sudo docker-compose down
  echo "Services stopped."
}

# Register the cleanup function for when script receives SIGINT
trap cleanup SIGINT

# Keep the script running
wait
