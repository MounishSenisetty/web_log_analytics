import random
import time
from datetime import datetime, timedelta
import argparse
import os

# List of sample URLs
URLS = [
    "/", "/home", "/about", "/contact", "/products", "/services", "/blog", "/login", 
    "/register", "/profile", "/cart", "/checkout", "/api/users", "/api/products", 
    "/faq", "/support", "/terms", "/privacy", "/404"
]

# List of HTTP methods
METHODS = ["GET", "POST", "PUT", "DELETE"]

# List of status codes
STATUS_CODES = [200, 200, 200, 200, 200, 301, 302, 304, 400, 401, 403, 404, 500]

# List of user agents
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.59 Safari/537.36"
]

# List of referrers
REFERRERS = [
    "-",
    "https://www.google.com/",
    "https://www.bing.com/",
    "https://www.facebook.com/",
    "https://www.twitter.com/",
    "https://www.linkedin.com/",
    "https://www.instagram.com/",
    "https://www.reddit.com/"
]

def generate_ip():
    """Generate a random IP address"""
    return f"{random.randint(1, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}"

def generate_log_line(timestamp):
    """Generate a single log line in common log format"""
    ip = generate_ip()
    timestamp_str = timestamp.strftime("%d/%b/%Y:%H:%M:%S +0000")
    method = random.choice(METHODS)
    url = random.choice(URLS)
    protocol = "HTTP/1.1"
    status = random.choice(STATUS_CODES)
    size = random.randint(100, 10000)
    referrer = random.choice(REFERRERS)
    user_agent = random.choice(USER_AGENTS)
    
    return f'{ip} - - [{timestamp_str}] "{method} {url} {protocol}" {status} {size} "{referrer}" "{user_agent}"'

def generate_logs(output_file, num_lines, start_date, days):
    """Generate log files with the specified number of lines"""
    # Fix for handling file paths
    dirname = os.path.dirname(output_file)
    if dirname:  # Only make directories if there's a directory path
        os.makedirs(dirname, exist_ok=True)
    
    with open(output_file, 'w') as f:
        # Generate logs over the specified date range
        current_date = datetime.strptime(start_date, "%Y-%m-%d")
        end_date = current_date + timedelta(days=days)
        
        lines_per_day = num_lines // days
        
        while current_date < end_date:
            # Generate logs for this day
            for _ in range(lines_per_day):
                # Random time within the day
                hour = random.randint(0, 23)
                minute = random.randint(0, 59)
                second = random.randint(0, 59)
                
                timestamp = current_date.replace(hour=hour, minute=minute, second=second)
                log_line = generate_log_line(timestamp)
                f.write(log_line + '\n')
            
            # Move to next day
            current_date += timedelta(days=1)
    
    print(f"Generated {num_lines} log entries in {output_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate sample web server logs")
    parser.add_argument("--output", default="../data/sample_logs.txt", help="Output file path")
    parser.add_argument("--lines", type=int, default=10000, help="Number of log lines to generate")
    parser.add_argument("--start_date", default="2023-01-01", help="Start date (YYYY-MM-DD)")
    parser.add_argument("--days", type=int, default=30, help="Number of days to generate logs for")
    
    args = parser.parse_args()
    
    generate_logs(args.output, args.lines, args.start_date, args.days)
