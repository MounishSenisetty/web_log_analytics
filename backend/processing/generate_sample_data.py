#!/usr/bin/env python3
"""
Script to generate sample data files for the API without using PySpark
"""

import os
import json
import random
from datetime import datetime, timedelta

def generate_sample_data():
    """Generate sample JSON data files for the API to serve"""
    
    # Create output directory - using absolute path to project root
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    output_dir = os.path.join(project_root, "processed_logs")
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Generating sample data in {output_dir}")
    
    # Generate traffic overview data (daily request counts)
    traffic_data = []
    start_date = datetime.strptime("2023-01-01", "%Y-%m-%d")
    for i in range(30):  # 30 days
        date = start_date + timedelta(days=i)
        date_str = date.strftime("%Y-%m-%d")
        count = random.randint(1000, 5000)  # Random traffic between 1000-5000 requests
        traffic_data.append({"date": date_str, "request_count": count})
    
    with open(os.path.join(output_dir, "traffic_overview.json"), "w") as f:
        json.dump(traffic_data, f)
    
    # Generate top pages data
    pages = [
        "/", "/home", "/about", "/contact", "/products", "/services", 
        "/blog", "/login", "/register", "/profile", "/cart", "/checkout"
    ]
    top_pages_data = []
    for page in pages:
        visit_count = random.randint(500, 3000)
        top_pages_data.append({"url": page, "visit_count": visit_count})
    
    # Sort by visit count (descending)
    top_pages_data.sort(key=lambda x: x["visit_count"], reverse=True)
    
    with open(os.path.join(output_dir, "top_pages.json"), "w") as f:
        json.dump(top_pages_data, f)
    
    # Generate geographic distribution data
    countries = ["US", "UK", "IN", "CA", "AU", "DE", "FR", "JP", "BR", "CN"]
    geo_data = []
    for country in countries:
        request_count = random.randint(500, 2000)
        geo_data.append({"country": country, "request_count": request_count})
    
    with open(os.path.join(output_dir, "geo_distribution.json"), "w") as f:
        json.dump(geo_data, f)
    
    # Generate browser stats
    browsers = ["Chrome", "Firefox", "Safari", "Edge", "Internet Explorer", "Opera", "Unknown"]
    browser_data = []
    for browser in browsers:
        count = random.randint(100, 2000)
        browser_data.append({"browser": browser, "count": count})
    
    with open(os.path.join(output_dir, "browser_stats.json"), "w") as f:
        json.dump(browser_data, f)
    
    # Generate device stats
    devices = ["Desktop", "Mobile", "Tablet"]
    device_data = []
    for device in devices:
        count = random.randint(500, 3000)
        device_data.append({"device_type": device, "count": count})
    
    with open(os.path.join(output_dir, "device_stats.json"), "w") as f:
        json.dump(device_data, f)
    
    # Generate status code stats
    status_codes = [200, 301, 302, 304, 400, 401, 403, 404, 500, 502, 503]
    status_code_data = []
    for code in status_codes:
        count = random.randint(50, 2000) if code == 200 else random.randint(10, 200)
        status_code_data.append({"status_code": code, "count": count})
    
    with open(os.path.join(output_dir, "status_codes.json"), "w") as f:
        json.dump(status_code_data, f)
    
    print("Sample data generated successfully!")
    return True

if __name__ == "__main__":
    generate_sample_data()
