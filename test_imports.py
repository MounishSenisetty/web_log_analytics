#!/usr/bin/env python3
print("Python is working!")
try:
    from flask import Flask
    print("Flask import successful!")
except ImportError as e:
    print(f"Error importing Flask: {e}")
    
print("Script completed!")
