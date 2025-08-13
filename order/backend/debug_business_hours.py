#!/usr/bin/env python3
"""
Debug script to check business hours integration
Run this to diagnose issues with business hours not saving
"""

import requests
import json
from services.database import DatabaseService

def check_backend_health():
    """Check if backend is running"""
    try:
        response = requests.get('http://localhost:3001/api/health', timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend is not running or not accessible at http://localhost:3001")
        return False
    except Exception as e:
        print(f"❌ Backend health check error: {e}")
        return False

def check_database_connection():
    """Check if database connection works"""
    try:
        db_service = DatabaseService()
        if db_service.test_connection():
            print("✅ Database connection successful")
            return True
        else:
            print("❌ Database connection failed")
            return False
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return False

def check_business_hours_table():
    """Check if business_hours table exists and has the right structure"""
    try:
        db_service = DatabaseService()
        supabase = db_service.get_supabase_client()
        
        # Try to query the business_hours table
        result = supabase.table('business_hours').select('*').limit(1).execute()
        print("✅ business_hours table exists and is accessible")
        
        # Check if selected_slots column exists
        if result.data:
            first_row = result.data[0]
            if 'selected_slots' in first_row:
                print("✅ selected_slots column exists")
            else:
                print("❌ selected_slots column missing - migration needed")
                print("Available columns:", list(first_row.keys()))
        else:
            print("ℹ️  business_hours table is empty")
        
        return True
    except Exception as e:
        print(f"❌ business_hours table check failed: {e}")
        return False

def check_businesses_exist():
    """Check if there are any businesses in the database"""
    try:
        db_service = DatabaseService()
        supabase = db_service.get_supabase_client()
        
        result = supabase.table('businesses').select('id, name, email').execute()
        if result.data:
            print(f"✅ Found {len(result.data)} businesses:")
            for business in result.data[:3]:  # Show first 3
                print(f"  - {business['name']} (ID: {business['id'][:8]}...)")
            return result.data
        else:
            print("❌ No businesses found in database")
            return []
    except Exception as e:
        print(f"❌ Error checking businesses: {e}")
        return []

def test_business_hours_api(business_id):
    """Test the business hours API endpoints"""
    base_url = 'http://localhost:3001/api/business-hours'
    
    print(f"\n🧪 Testing business hours API for business: {business_id[:8]}...")
    
    # Test GET
    try:
        response = requests.get(f'{base_url}/business/{business_id}')
        if response.status_code == 200:
            print("✅ GET business hours successful")
            data = response.json()
            print(f"  Current hours: {list(data.keys())}")
        else:
            print(f"❌ GET business hours failed: {response.status_code}")
            print(f"  Response: {response.text}")
    except Exception as e:
        print(f"❌ GET business hours error: {e}")
    
    # Test PUT
    test_data = {
        'monday': {
            'selectedSlots': [8, 9, 10, 11, 12, 13, 14, 15, 16],
            'isOpen': True
        },
        'tuesday': {
            'selectedSlots': [8, 9, 10, 11, 12, 13, 14, 15, 16],
            'isOpen': True
        },
        'sunday': {
            'selectedSlots': [],
            'isOpen': False
        }
    }
    
    try:
        response = requests.put(
            f'{base_url}/business/{business_id}',
            headers={'Content-Type': 'application/json'},
            data=json.dumps(test_data)
        )
        if response.status_code == 200:
            print("✅ PUT business hours successful")
        else:
            print(f"❌ PUT business hours failed: {response.status_code}")
            print(f"  Response: {response.text}")
    except Exception as e:
        print(f"❌ PUT business hours error: {e}")

def main():
    print("🔍 Diagnosing Business Hours Integration")
    print("=" * 50)
    
    # Step 1: Check backend
    if not check_backend_health():
        print("\n💡 To fix: Start your backend server with: python3 app.py")
        return
    
    # Step 2: Check database
    if not check_database_connection():
        print("\n💡 To fix: Check your Supabase credentials in .env file")
        return
    
    # Step 3: Check table structure
    if not check_business_hours_table():
        print("\n💡 To fix: Run the migration SQL in your Supabase SQL editor")
        print("  File: migrations/update_business_hours.sql")
        return
    
    # Step 4: Check businesses exist
    businesses = check_businesses_exist()
    if not businesses:
        print("\n💡 To fix: Register a business first or check your database")
        return
    
    # Step 5: Test API with first business
    test_business_hours_api(businesses[0]['id'])
    
    print("\n" + "=" * 50)
    print("🏁 Diagnosis complete!")
    print("\nNext steps:")
    print("1. Open browser dev tools (F12)")
    print("2. Go to Services tab and try selecting time slots")
    print("3. Click 'Save Hours' and check console for debug messages")
    print("4. Look for the 💾, 📊, and ✅ emoji messages")

if __name__ == '__main__':
    main()
