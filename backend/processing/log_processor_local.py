from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, StringType, IntegerType, TimestampType
from pyspark.sql.functions import col, to_timestamp
import re
import argparse
import os
import json
import sys

# Try to import findspark, install if not available
try:
    import findspark
    findspark.init()
except ImportError:
    print("findspark not found, trying to continue without it...")
    pass

def parse_log_line(log_line):
    """
    Parse a common log format line into structured data
    Example: 127.0.0.1 - - [21/Jul/2021:10:55:36 +0000] "GET /home HTTP/1.1" 200 2326 "http://example.com/about" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    """
    try:
        # Regular expression to parse common log format
        pattern = r'(\S+) \S+ \S+ \[(.*?)\] "(\S+) (\S+) ([^"]*)" (\d+) (\d+) "([^"]*)" "([^"]*)"'
        
        match = re.match(pattern, log_line)
        if match:
            ip, date_str, method, url, protocol, status, size, referer, user_agent = match.groups()
            
            # Parse date
            date_pattern = r'(\d+)/(\w+)/(\d+):(\d+):(\d+):(\d+)'
            date_match = re.match(date_pattern, date_str)
            if date_match:
                day, month, year, hour, minute, second = date_match.groups()
                timestamp = f"{year}-{month}-{day} {hour}:{minute}:{second}"
                
                # Extract browser and device type from user agent
                browser = "Unknown"
                if "Chrome" in user_agent:
                    browser = "Chrome"
                elif "Firefox" in user_agent:
                    browser = "Firefox"
                elif "Safari" in user_agent:
                    browser = "Safari"
                elif "MSIE" in user_agent or "Trident" in user_agent:
                    browser = "Internet Explorer"
                elif "Edge" in user_agent:
                    browser = "Edge"
                
                device_type = "Desktop"
                if "Mobile" in user_agent or "Android" in user_agent or "iPhone" in user_agent:
                    device_type = "Mobile"
                elif "Tablet" in user_agent or "iPad" in user_agent:
                    device_type = "Tablet"
                
                # Mock country data (would be replaced with GeoIP lookup in production)
                countries = ["US", "UK", "IN", "CA", "AU", "DE", "FR", "JP", "BR", "CN"]
                import hashlib
                country_idx = int(hashlib.md5(ip.encode()).hexdigest(), 16) % len(countries)
                country = countries[country_idx]
                
                return {
                    "ip": ip,
                    "timestamp": timestamp,
                    "method": method,
                    "url": url,
                    "protocol": protocol,
                    "status_code": int(status),
                    "response_size": int(size),
                    "referer": referer,
                    "user_agent": user_agent,
                    "browser": browser,
                    "device_type": device_type,
                    "country": country,
                    "date": timestamp.split(" ")[0]
                }
    except Exception as e:
        print(f"Error parsing log line: {e}")
    
    return None

def process_logs(input_path, output_path):
    """
    Process log files and convert to structured format using Spark in local mode
    """
    try:
        print("Initializing Spark session...")
        
        # Check if input file exists
        if not os.path.exists(input_path):
            print(f"Error: Input file {input_path} does not exist")
            return False
            
        # Create Spark session with more memory
        spark = SparkSession.builder \
            .appName("WebLogProcessor") \
            .master("local[*]") \
            .config("spark.driver.memory", "2g") \
            .config("spark.executor.memory", "2g") \
            .config("spark.driver.extraJavaOptions", "-XX:+UseG1GC") \
            .getOrCreate()
        
        print(f"Spark version: {spark.version}")
        print(f"Reading log file from: {input_path}")
        
        # Read log file
        raw_logs = spark.sparkContext.textFile(input_path)
        
        # Check if file is empty
        if raw_logs.count() == 0:
            print(f"Error: Input file {input_path} is empty")
            return False
            
        print(f"Log file loaded. Sample line: {raw_logs.first()}")
        
        # Parse log lines
        print("Parsing log lines...")
        parsed_logs = raw_logs.map(parse_log_line).filter(lambda x: x is not None)
        
        # Check if parsing produced any results
        parsed_count = parsed_logs.count()
        if parsed_count == 0:
            print("Error: No log lines could be parsed. Check the format of your log file.")
            return False
            
        print(f"Successfully parsed {parsed_count} log lines")
        
        # Define schema
        schema = StructType([
            StructField("ip", StringType(), True),
            StructField("timestamp", StringType(), True),
            StructField("method", StringType(), True),
            StructField("url", StringType(), True),
            StructField("protocol", StringType(), True),
            StructField("status_code", IntegerType(), True),
            StructField("response_size", IntegerType(), True),
            StructField("referer", StringType(), True),
            StructField("user_agent", StringType(), True),
            StructField("browser", StringType(), True),
            StructField("device_type", StringType(), True),
            StructField("country", StringType(), True),
            StructField("date", StringType(), True)
        ])
        
        # Convert RDD to DataFrame
        print("Converting to DataFrame...")
        logs_df = spark.createDataFrame(parsed_logs, schema)
        
        # Convert timestamp string to actual timestamp
        logs_df = logs_df.withColumn("timestamp", to_timestamp(col("timestamp")))
        
        # Create output directory if it doesn't exist
        os.makedirs(output_path, exist_ok=True)
        
        # Write processed logs as Parquet files (by date partition)
        print("Writing parquet files...")
        logs_df.write \
            .partitionBy("date") \
            .mode("overwrite") \
            .parquet(os.path.join(output_path, "parquet"))
            
        # Generate aggregated data for the API
        print("Generating aggregated data for API...")
        
        # Traffic overview
        print("Generating traffic overview...")
        traffic_overview = logs_df.groupBy("date").count().orderBy("date")
        traffic_overview_data = [{"date": row["date"], "request_count": row["count"]} 
                                for row in traffic_overview.collect()]
        
        with open(os.path.join(output_path, "traffic_overview.json"), "w") as f:
            json.dump(traffic_overview_data, f)
        
        # Top pages
        print("Generating top pages data...")
        top_pages = logs_df.groupBy("url").count().orderBy("count", ascending=False).limit(10)
        top_pages_data = [{"url": row["url"], "visit_count": row["count"]} 
                        for row in top_pages.collect()]
        
        with open(os.path.join(output_path, "top_pages.json"), "w") as f:
            json.dump(top_pages_data, f)
        
        # Geographic distribution
        print("Generating geographic distribution data...")
        geo_distribution = logs_df.groupBy("country").count().orderBy("count", ascending=False)
        geo_data = [{"country": row["country"], "request_count": row["count"]} 
                    for row in geo_distribution.collect()]
        
        with open(os.path.join(output_path, "geo_distribution.json"), "w") as f:
            json.dump(geo_data, f)
        
        # Browser stats
        print("Generating browser stats...")
        browser_stats = logs_df.groupBy("browser").count().orderBy("count", ascending=False)
        browser_data = [{"browser": row["browser"], "count": row["count"]} 
                        for row in browser_stats.collect()]
        
        with open(os.path.join(output_path, "browser_stats.json"), "w") as f:
            json.dump(browser_data, f)
        
        # Device stats
        print("Generating device stats...")
        device_stats = logs_df.groupBy("device_type").count().orderBy("count", ascending=False)
        device_data = [{"device_type": row["device_type"], "count": row["count"]} 
                    for row in device_stats.collect()]
        
        with open(os.path.join(output_path, "device_stats.json"), "w") as f:
            json.dump(device_data, f)
        
        # Status code stats
        print("Generating status code stats...")
        status_code_stats = logs_df.groupBy("status_code").count().orderBy("count", ascending=False)
        status_code_data = [{"status_code": row["status_code"], "count": row["count"]} 
                            for row in status_code_stats.collect()]
        
        with open(os.path.join(output_path, "status_codes.json"), "w") as f:
            json.dump(status_code_data, f)
        
        print(f"Successfully processed {logs_df.count()} log entries")
        print(f"Output files written to {output_path}")
        
        # Stop Spark session
        spark.stop()
        return True
    except Exception as e:
        print(f"Error processing logs: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process web server logs")
    parser.add_argument("--input", required=True, help="Input path for raw logs")
    parser.add_argument("--output", required=True, help="Output path for processed logs")
    
    args = parser.parse_args()
    
    success = process_logs(args.input, args.output)
    if not success:
        sys.exit(1)
