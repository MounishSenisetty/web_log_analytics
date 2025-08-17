#!/bin/bash

# Test script for the backend functionality
# This script tests the various components of the backend in isolation

echo "Testing backend components..."

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "Activated virtual environment"
else
    echo "No virtual environment found. Running setup_local.sh..."
    ./setup_local.sh
fi

# Check if PySpark is installed
if ! python -c "import pyspark" &> /dev/null; then
    echo "PySpark not found. Installing..."
    pip install pyspark findspark
fi

# Generate sample log data for testing
echo "Generating sample log data..."
mkdir -p data
cd data
python generate_logs.py --output sample_logs.txt --lines 1000 --start_date 2023-01-01 --days 10
cd ..

# Create data directory for processed logs
mkdir -p processed_logs

# Process log data with Spark in local mode
echo "Processing log data with Spark in local mode..."
cd backend/processing
python log_processor_local.py --input ../../data/sample_logs.txt --output ../../processed_logs
PROCESSING_RESULT=$?
cd ../..

if [ $PROCESSING_RESULT -ne 0 ]; then
    echo "❌ Log processing failed. Exiting."
    exit 1
fi

# Check if processed data exists
if [ ! -f "processed_logs/traffic_overview.json" ]; then
    echo "❌ Processed data not found. Log processing may have failed."
    exit 1
fi

# Test the API server
echo "Testing API server..."
cd backend/api
python -c "
import requests
import time
import subprocess
import signal
import os
import sys
import socket

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

# Check if port 5000 is already in use
if is_port_in_use(5000):
    print('Warning: Port 5000 is already in use. The API server may not start properly.')

# Start the API server
print('Starting API server...')
proc = subprocess.Popen(['python', 'app_local.py'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

# Wait for server to start
max_retries = 10
retry_count = 0
while retry_count < max_retries:
    try:
        time.sleep(3)  # Give more time to start
        response = requests.get('http://localhost:5000/')
        if response.status_code == 200:
            print('API server started successfully')
            break
    except requests.exceptions.ConnectionError:
        retry_count += 1
        print(f'Waiting for API server to start (attempt {retry_count}/{max_retries})...')

if retry_count >= max_retries:
    print('Failed to start API server after multiple attempts')
    os.kill(proc.pid, signal.SIGTERM)
    sys.exit(1)

# Test endpoints
endpoints = [
    'http://localhost:5000/',
    'http://localhost:5000/api/traffic/overview',
    'http://localhost:5000/api/top-pages',
    'http://localhost:5000/api/geo-distribution', 
    'http://localhost:5000/api/browser-stats',
    'http://localhost:5000/api/device-stats',
    'http://localhost:5000/api/status-codes',
    'http://localhost:5000/api/user-sessions',
    'http://localhost:5000/api/anomalies'
]

all_good = True
for endpoint in endpoints:
    try:
        print(f'Testing {endpoint}...')
        response = requests.get(endpoint)
        if response.status_code == 200:
            print(f'✅ {endpoint} - OK')
        else:
            print(f'❌ {endpoint} - Failed with status {response.status_code}')
            all_good = False
    except Exception as e:
        print(f'❌ {endpoint} - Error: {e}')
        all_good = False

# Shutdown the server
print('Shutting down API server...')
os.kill(proc.pid, signal.SIGTERM)

if all_good:
    print('All API tests passed!')
    sys.exit(0)
else:
    print('Some API tests failed!')
    sys.exit(1)
"

result=$?
cd ../..

if [ $result -eq 0 ]; then
    echo "✅ Backend tests completed successfully!"
    echo "You can now run the full application with './run_local.sh'"
else
    echo "❌ Backend tests failed. Please check the logs above for details."
fi

exit $result
