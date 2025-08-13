#!/usr/bin/env python3
"""
Test script for business hours API endpoints
Run this after starting the Flask server to test the integration
"""

import requests
import json

BASE_URL = 'http://localhost:3001/api'

def test_business_hours_api():
    """Test the business hours API endpoints"""
    
    # Test data
    business_id = 'test-business-id'  # Replace with actual business ID
    test_hours = {
        'monday': {
            'selectedSlots': [8, 9, 10, 11, 12, 13, 14, 15, 16],  # 9 AM - 5 PM
            'isOpen': True
        },
        'tuesday': {
            'selectedSlots': [8, 9, 10, 11, 12, 13, 14, 15, 16],
            'isOpen': True
        },
        'wednesday': {
            'selectedSlots': [8, 9, 10, 11, 12, 13, 14, 15, 16],
            'isOpen': True
        },
        'thursday': {
            'selectedSlots': [8, 9, 10, 11, 12, 13, 14, 15, 16],
            'isOpen': True
        },
        'friday': {
            'selectedSlots': [8, 9, 10, 11, 12, 13, 14, 15, 16],
            'isOpen': True
        },
        'saturday': {
            'selectedSlots': [10, 11, 12, 13, 14],  # 10 AM - 2 PM
            'isOpen': True
        },
        'sunday': {
            'selectedSlots': [],
            'isOpen': False
        }
    }
    
    print("🧪 Testing Business Hours API Integration")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Testing health check...")
    try:
        response = requests.get(f'{BASE_URL}/health')
        if response.status_code == 200:
            print("✅ Health check passed")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
    
    # Test 2: Update business hours
    print(f"\n2. Testing update business hours for business: {business_id}")
    try:
        response = requests.put(
            f'{BASE_URL}/business-hours/business/{business_id}',
            headers={'Content-Type': 'application/json'},
            data=json.dumps(test_hours)
        )
        if response.status_code == 200:
            print("✅ Business hours updated successfully")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Update failed: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Update error: {e}")
    
    # Test 3: Get business hours
    print(f"\n3. Testing get business hours for business: {business_id}")
    try:
        response = requests.get(f'{BASE_URL}/business-hours/business/{business_id}')
        if response.status_code == 200:
            print("✅ Business hours retrieved successfully")
            data = response.json()
            print(f"Monday slots: {data.get('monday', {}).get('selectedSlots', [])}")
            print(f"Sunday open: {data.get('sunday', {}).get('isOpen', False)}")
        else:
            print(f"❌ Get failed: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Get error: {e}")
    
    # Test 4: Get available time slots
    print(f"\n4. Testing get available time slots for business: {business_id}")
    try:
        response = requests.get(f'{BASE_URL}/business-hours/business/{business_id}/available-slots')
        if response.status_code == 200:
            print("✅ Available time slots retrieved successfully")
            data = response.json()
            for day, slots in data.items():
                if slots:
                    print(f"{day.capitalize()}: {len(slots)} available slots")
        else:
            print(f"❌ Get available slots failed: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Get available slots error: {e}")
    
    # Test 5: Update single day
    print(f"\n5. Testing update single day (Monday) for business: {business_id}")
    try:
        monday_data = {
            'selectedSlots': [10, 11, 12, 13, 14, 15, 16, 17, 18],  # 10 AM - 6 PM
            'isOpen': True
        }
        response = requests.put(
            f'{BASE_URL}/business-hours/business/{business_id}/day/monday',
            headers={'Content-Type': 'application/json'},
            data=json.dumps(monday_data)
        )
        if response.status_code == 200:
            print("✅ Monday hours updated successfully")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Monday update failed: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Monday update error: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 Test completed!")
    print("\nTo run this test:")
    print("1. Make sure your Flask server is running (python3 app.py)")
    print("2. Update the business_id variable with a real business ID")
    print("3. Run: python3 test_business_hours.py")

if __name__ == '__main__':
    test_business_hours_api()
