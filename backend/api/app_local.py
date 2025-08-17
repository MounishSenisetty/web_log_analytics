from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Set the path to processed data - using absolute path to avoid issues
# Default to relative path, but allow override via environment variable
DEFAULT_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../processed_logs"))
DATA_DIR = os.environ.get("DATA_DIR", DEFAULT_DATA_DIR)

logger.info(f"Using data directory: {DATA_DIR}")

@app.route('/', methods=['GET'])
def index():
    """
    API root endpoint
    """
    return jsonify({
        'status': 'online',
        'api_version': '1.0',
        'endpoints': [
            '/api/traffic/overview',
            '/api/top-pages',
            '/api/geo-distribution',
            '/api/browser-stats',
            '/api/device-stats',
            '/api/status-codes',
            '/api/user-sessions',
            '/api/anomalies'
        ]
    })

@app.route('/api/traffic/overview', methods=['GET'])
def get_traffic_overview():
    """
    Get traffic overview data (daily request counts)
    """
    try:
        # Read from the pre-generated JSON file
        filepath = os.path.join(DATA_DIR, "traffic_overview.json")
        logger.info(f"Reading traffic overview from: {filepath}")
        
        if not os.path.exists(filepath):
            logger.error(f"File not found: {filepath}")
            return jsonify({
                'success': False,
                'error': f"Data file not found. Has log processing been run?"
            }), 404
            
        with open(filepath, "r") as f:
            data = json.load(f)
            
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        logger.exception("Error getting traffic overview")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/top-pages', methods=['GET'])
def get_top_pages():
    """
    Get top visited pages
    """
    try:
        # Read from the pre-generated JSON file
        filepath = os.path.join(DATA_DIR, "top_pages.json")
        logger.info(f"Reading top pages from: {filepath}")
        
        if not os.path.exists(filepath):
            logger.error(f"File not found: {filepath}")
            return jsonify({
                'success': False,
                'error': f"Data file not found. Has log processing been run?"
            }), 404
            
        with open(filepath, "r") as f:
            data = json.load(f)
            
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        logger.exception("Error getting top pages")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/geo-distribution', methods=['GET'])
def get_geo_distribution():
    """
    Get geographic distribution of traffic
    """
    try:
        # Read from the pre-generated JSON file
        filepath = os.path.join(DATA_DIR, "geo_distribution.json")
        logger.info(f"Reading geo distribution from: {filepath}")
        
        if not os.path.exists(filepath):
            logger.error(f"File not found: {filepath}")
            return jsonify({
                'success': False,
                'error': f"Data file not found. Has log processing been run?"
            }), 404
            
        with open(filepath, "r") as f:
            data = json.load(f)
            
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        logger.exception("Error getting geo distribution")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/browser-stats', methods=['GET'])
def get_browser_stats():
    """
    Get browser usage statistics
    """
    try:
        # Read from the pre-generated JSON file
        filepath = os.path.join(DATA_DIR, "browser_stats.json")
        logger.info(f"Reading browser stats from: {filepath}")
        
        if not os.path.exists(filepath):
            logger.error(f"File not found: {filepath}")
            return jsonify({
                'success': False,
                'error': f"Data file not found. Has log processing been run?"
            }), 404
            
        with open(filepath, "r") as f:
            data = json.load(f)
            
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        logger.exception("Error getting browser stats")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/device-stats', methods=['GET'])
def get_device_stats():
    """
    Get device type statistics (mobile vs desktop)
    """
    try:
        # Read from the pre-generated JSON file
        filepath = os.path.join(DATA_DIR, "device_stats.json")
        logger.info(f"Reading device stats from: {filepath}")
        
        if not os.path.exists(filepath):
            logger.error(f"File not found: {filepath}")
            return jsonify({
                'success': False,
                'error': f"Data file not found. Has log processing been run?"
            }), 404
            
        with open(filepath, "r") as f:
            data = json.load(f)
            
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        logger.exception("Error getting device stats")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/status-codes', methods=['GET'])
def get_status_codes():
    """
    Get HTTP status code distribution
    """
    try:
        # Read from the pre-generated JSON file
        filepath = os.path.join(DATA_DIR, "status_codes.json")
        logger.info(f"Reading status codes from: {filepath}")
        
        if not os.path.exists(filepath):
            logger.error(f"File not found: {filepath}")
            return jsonify({
                'success': False,
                'error': f"Data file not found. Has log processing been run?"
            }), 404
            
        with open(filepath, "r") as f:
            data = json.load(f)
            
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        logger.exception("Error getting status codes")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/user-sessions', methods=['GET'])
def get_user_sessions():
    """
    Get user session data
    
    Note: This is mocked in the local version
    """
    try:
        logger.info("Getting mocked user session data")
        # Mock session data
        data = [
            {
                "session_id": "mock_session_1",
                "start_time": "2023-01-01 10:00:00",
                "end_time": "2023-01-01 10:15:30",
                "page_views": 5,
                "duration_minutes": 15.5
            },
            {
                "session_id": "mock_session_2",
                "start_time": "2023-01-01 11:30:00",
                "end_time": "2023-01-01 11:42:15",
                "page_views": 3,
                "duration_minutes": 12.25
            },
            {
                "session_id": "mock_session_3",
                "start_time": "2023-01-01 14:10:00",
                "end_time": "2023-01-01 14:35:45",
                "page_views": 8,
                "duration_minutes": 25.75
            }
        ]
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        logger.exception("Error getting user sessions")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/anomalies', methods=['GET'])
def get_anomalies():
    """
    Get detected anomalies in traffic
    
    Note: This is mocked in the local version
    """
    try:
        logger.info("Getting mocked anomaly data")
        # Mock anomaly data
        data = [
            {
                "hour": "2023-01-05 03:00:00",
                "count": 5,
                "expected_count": 120,
                "deviation_percent": -95.8
            },
            {
                "hour": "2023-01-12 04:00:00",
                "count": 8,
                "expected_count": 95,
                "deviation_percent": -91.6
            },
            {
                "hour": "2023-01-18 14:00:00",
                "count": 542,
                "expected_count": 210,
                "deviation_percent": 158.1
            }
        ]
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        logger.exception("Error getting anomalies")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Not found'
    }), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
