from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import StructType, StructField, StringType, IntegerType, TimestampType
import re
import argparse

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
    Process log files and convert to structured format
    """
    # Create Spark session
    spark = SparkSession.builder \
        .appName("WebLogProcessor") \
        .enableHiveSupport() \
        .getOrCreate()
    
    # Read log file
    raw_logs = spark.sparkContext.textFile(input_path)
    
    # Parse log lines
    parsed_logs = raw_logs.map(parse_log_line).filter(lambda x: x is not None)
    
    # Define schema
    schema = StructType([
        StructField("ip", StringType(), True),
        StructField("timestamp", TimestampType(), True),
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
    logs_df = spark.createDataFrame(parsed_logs, schema)
    
    # Create Hive table if it doesn't exist
    spark.sql("""
    CREATE TABLE IF NOT EXISTS web_logs (
        ip STRING,
        timestamp TIMESTAMP,
        method STRING,
        url STRING,
        protocol STRING,
        status_code INT,
        response_size INT,
        referer STRING,
        user_agent STRING,
        browser STRING,
        device_type STRING,
        country STRING,
        date STRING
    )
    PARTITIONED BY (date)
    STORED AS PARQUET
    """)
    
    # Write to Hive table
    logs_df.write \
        .partitionBy("date") \
        .mode("append") \
        .parquet(output_path)
    
    # Load new data to Hive table
    spark.sql(f"MSCK REPAIR TABLE web_logs")
    
    print(f"Successfully processed {logs_df.count()} log entries")
    
    # Stop Spark session
    spark.stop()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process web server logs")
    parser.add_argument("--input", required=True, help="Input path for raw logs")
    parser.add_argument("--output", required=True, help="Output path for processed logs")
    
    args = parser.parse_args()
    
    process_logs(args.input, args.output)
