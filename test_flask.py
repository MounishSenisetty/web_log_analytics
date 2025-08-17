#!/usr/bin/env python3
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello, World!"

if __name__ == '__main__':
    print("Starting Flask test server...")
    app.run(debug=True, port=8000)
