#!/usr/bin/env python3
"""
Keep-alive script for Render backend
This script pings the backend to prevent hibernation
"""

import requests
import sys
import time
from datetime import datetime

def ping_backend():
    """Ping the backend health endpoint"""
    backend_url = "https://bookly-hwx0.onrender.com"
    endpoints = ["/api/health", "/"]
    
    print(f"[{datetime.now()}] Starting keep-alive ping...")
    
    for endpoint in endpoints:
        try:
            url = f"{backend_url}{endpoint}"
            print(f"Pinging: {url}")
            
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200:
                print(f"✅ {endpoint} responded successfully (200)")
                return True
            else:
                print(f"⚠️ {endpoint} responded with status: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Error pinging {endpoint}: {e}")
            continue
    
    print("❌ All endpoints failed to respond")
    return False

if __name__ == "__main__":
    success = ping_backend()
    sys.exit(0 if success else 1)
