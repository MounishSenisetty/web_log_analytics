# Web Server Log Batch Analytics Project

This project is a full-stack big data analytics solution for processing and visualizing web server logs. It demonstrates how to process log data in batch and visualize the results on a dashboard.

## Architecture

### Frontend
- React-based dashboard for visualization
- Charts and graphs using Chart.js
- Multiple views for different analytics aspects

### Backend
1. **Data Processing**: PySpark for transforming and analyzing logs
2. **Data Serving**: API built with Flask to serve processed data to the frontend

## Prerequisites

- Node.js and npm
- Python 3.x with pip
- PySpark (installed via setup script)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd web-log-analytics
```

### 2. Run the Setup Script

This will create a Python virtual environment and install all necessary dependencies:

```bash
./setup_local.sh
```

### 3. Start the Application

Run the local startup script to generate sample data, process it, and start both the backend API and frontend:

```bash
./run_local.sh
```

The dashboard will be accessible at http://localhost:3000

### 4. Manual Setup (Alternative)

If you prefer to set up manually:

#### Generate Sample Data
```bash
source venv/bin/activate
cd data
python generate_logs.py --output sample_logs.txt --lines 10000 --start_date 2023-01-01 --days 30
cd ..
```

#### Process Log Data
```bash
mkdir -p processed_logs
cd backend/processing
python log_processor_local.py --input ../../data/sample_logs.txt --output ../../processed_logs
cd ../..
```

#### Start the API Server
```bash
cd backend/api
python app_local.py
```

#### Start the Frontend (in a new terminal)
```bash
cd frontend
npm install
npm start
```

## Project Structure
```
web-log-analytics/
├── frontend/                # React dashboard
│   ├── src/
│   │   ├── components/      # React components for different visualizations
│   │   ├── api/             # API service to connect to backend
│   │   └── App.js           # Main application component
│   └── package.json         # Frontend dependencies
├── backend/
│   ├── processing/          # Spark jobs for data processing
│   │   ├── log_processor.py         # Original Spark job (for Docker version)
│   │   └── log_processor_local.py   # Local Spark job that saves to JSON files
│   └── api/                 # Flask API for serving data
│       ├── app.py           # Original API application (for Docker version)
│       └── app_local.py     # Local API that reads from JSON files
├── data/                    # Sample log data and generation scripts
│   └── generate_logs.py     # Script to generate sample log data
├── processed_logs/          # Directory where processed data is stored
├── setup_local.sh           # Script to set up local environment
├── run_local.sh             # Script to run the application locally
├── docker-compose.yml       # Docker configuration (for future use)
└── hadoop.env               # Hadoop environment variables (for future use)
```

## Features

### Dashboard

The main dashboard provides an overview of all key metrics:

- **Traffic Overview**: Time-series analysis of website traffic
  - View daily/weekly/monthly traffic patterns
  - Identify peak usage times and trends

- **Top Pages**: Analysis of most visited pages
  - Ranking of pages by visit count
  - Insight into popular content

- **Geographic Distribution**: Visualization of visitor locations
  - Traffic breakdown by country
  - Regional popularity analysis

- **Browser & Device Analysis**:
  - Browser usage statistics (Chrome, Firefox, Safari, etc.)
  - Device type breakdown (Desktop, Mobile, Tablet)

- **HTTP Status Codes**: Analysis of server responses
  - Success (200) vs Error (4xx, 5xx) rates
  - Identification of problematic endpoints

- **User Sessions**: Analysis of user behavior
  - Session duration and page view counts
  - User journey mapping

- **Anomaly Detection**: Identification of unusual patterns
  - Detection of traffic spikes or drops
  - Potential security threat identification

## Advanced Features (Future Work)

### Docker Containerization
- Containerize the application with Docker
- Use Docker Compose for orchestration
- Set up Hadoop, Spark, and Hive in containers

### Real-time Analytics
- Implement Kafka for log streaming
- Use Spark Streaming for real-time processing
- Add WebSocket support for live dashboard updates

### Security Monitoring
- Detect suspicious access patterns
- Identify potential DDoS attacks
- Track failed login attempts

### Performance Optimization
- Response time analysis
- Server-side bottleneck identification
- Cache hit ratio analysis

### Cloud Deployment
- AWS deployment with EMR, S3, and EC2
- Google Cloud setup with Dataproc
- Azure implementation with HDInsight

## Troubleshooting

### PySpark Issues
If log processing fails:
- Ensure PySpark is installed correctly: `pip list | grep pyspark`
- Check Python version compatibility: `python --version`
- Verify Java is installed for Spark: `java -version`
- Make sure findspark is installed: `pip install findspark`
- Set JAVA_HOME environment variable: `export JAVA_HOME=/path/to/java`

### API Connection
If the frontend can't connect to the API:
- Ensure the API server is running: `ps aux | grep app_local.py`
- Check for port conflicts: `lsof -i :5000`
- Verify the API endpoint in the frontend configuration
- Check that the processed_logs directory contains the generated JSON files

### Testing the Backend Separately
You can run only the backend components to verify they're working:
```bash
./test_backend.sh
```
This script will:
- Generate sample data
- Process logs with PySpark
- Test all API endpoints
# web_log_analytics
