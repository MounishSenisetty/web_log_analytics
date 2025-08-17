#!/bin/bash

# Web Log Analytics Project Startup Script

echo "Starting Web Log Analytics Project..."

# Function to check if Docker is running
check_docker() {
  if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    exit 1
  fi
}

# Function to generate sample data
generate_sample_data() {
  echo "Generating sample log data..."
  cd data
  python generate_logs.py --output sample_logs.txt --lines 10000 --start_date 2023-01-01 --days 30
  cd ..
}

# Function to start backend services with Docker
start_backend() {
  echo "Starting backend services with Docker..."
  docker-compose up -d
  
  # Wait for services to be ready
  echo "Waiting for services to be ready..."
  sleep 10
}

# Function to start frontend development server
start_frontend() {
  echo "Starting frontend development server..."
  cd frontend
  npm install
  npm start
}

# Function to process log data with Spark
process_logs() {
  echo "Processing log data with Spark..."
  docker exec -it spark-master spark-submit \
    --master spark://spark-master:7077 \
    /app/backend/processing/log_processor.py \
    --input /app/data/sample_logs.txt \
    --output /user/hive/warehouse/web_logs
}

# Main execution
check_docker
generate_sample_data
start_backend
process_logs
start_frontend
