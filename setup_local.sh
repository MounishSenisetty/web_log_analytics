#!/bin/bash

# Setup script for Web Log Analytics project (non-Docker version)
# This script sets up the necessary Python environments and dependencies

echo "Setting up Web Log Analytics project (non-Docker version)..."

# Create Python virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Java (required for PySpark)
echo "Checking if Java is installed..."
if ! command -v java &> /dev/null; then
    echo "Java not found. Installing OpenJDK..."
    sudo apt-get update
    sudo apt-get install -y openjdk-11-jdk
else
    echo "Java is already installed."
fi

# Set JAVA_HOME environment variable if not set
if [ -z "$JAVA_HOME" ]; then
    echo "Setting JAVA_HOME environment variable..."
    JAVA_PATH=$(dirname $(dirname $(readlink -f $(which java))))
    echo "export JAVA_HOME=$JAVA_PATH" >> venv/bin/activate
    export JAVA_HOME=$JAVA_PATH
    echo "JAVA_HOME set to $JAVA_HOME"
fi

# Install PySpark directly to ensure it's available
echo "Installing PySpark and findspark..."
pip install --upgrade pip
pip install pyspark==3.0.0 findspark==1.4.0

# Install other backend requirements
echo "Installing backend dependencies..."
pip install -r backend/requirements.txt

# Install notebook dependencies for analysis
echo "Installing Jupyter for analysis..."
pip install jupyter matplotlib seaborn

# Create data and processed_logs directories if they don't exist
echo "Creating necessary directories..."
mkdir -p data processed_logs

# Install frontend dependencies
echo "Setting up frontend..."
cd frontend
npm install

echo "Setup complete! Use './run_local.sh' to start the application."
