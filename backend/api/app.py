from flask import Flask, jsonify
from flask_cors import CORS
import json
import pandas as pd
import os
from hive_connector import HiveConnector
from spark_connector import SparkConnector

app = Flask(__name__)
CORS(app)

# Initialize connections
hive = HiveConnector()
spark = SparkConnector()

@app.route('/api/traffic/overview', methods=['GET'])
def get_traffic_overview():
    """
    Get traffic overview data (daily request counts)
    """
    try:
        query = """
        SELECT date, count(*) as request_count 
        FROM web_logs 
        GROUP BY date 
        ORDER BY date
        """
        data = hive.execute_query(query)
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
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
        query = """
        SELECT url, count(*) as visit_count 
        FROM web_logs 
        GROUP BY url 
        ORDER BY visit_count DESC 
        LIMIT 10
        """
        data = hive.execute_query(query)
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
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
        query = """
        SELECT country, count(*) as request_count 
        FROM web_logs 
        WHERE country IS NOT NULL 
        GROUP BY country 
        ORDER BY request_count DESC
        """
        data = hive.execute_query(query)
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
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
        query = """
        SELECT browser, count(*) as count 
        FROM web_logs 
        GROUP BY browser 
        ORDER BY count DESC
        """
        data = hive.execute_query(query)
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
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
        query = """
        SELECT device_type, count(*) as count 
        FROM web_logs 
        GROUP BY device_type 
        ORDER BY count DESC
        """
        data = hive.execute_query(query)
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
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
        query = """
        SELECT status_code, count(*) as count 
        FROM web_logs 
        GROUP BY status_code 
        ORDER BY count DESC
        """
        data = hive.execute_query(query)
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/user-sessions', methods=['GET'])
def get_user_sessions():
    """
    Get user session data (more complex query using window functions)
    """
    try:
        # This would be better implemented with Spark
        data = spark.get_user_sessions()
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/anomalies', methods=['GET'])
def get_anomalies():
    """
    Get detected anomalies in traffic
    """
    try:
        data = spark.detect_anomalies()
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
