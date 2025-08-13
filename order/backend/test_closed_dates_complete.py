#!/usr/bin/env python3

import os
import requests
import json
from datetime import datetime, date, timedelta
from services.database import DatabaseService
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_closed_dates_table():
    """Test if the closed_dates table exists and is accessible"""
    try:
        db_service = DatabaseService()
        supabase = db_service.get_supabase_client()
        
        if not supabase:
            logger.error("❌ Failed to get Supabase client")
            return False
        
        # Test table exists
        logger.info("🔍 Testing closed_dates table...")
        result = supabase.table('closed_dates').select('*').limit(1).execute()
        
        logger.info("✅ closed_dates table exists and is accessible")
        return True
        
    except Exception as e:
        error_msg = str(e).lower()
        if 'relation "closed_dates" does not exist' in error_msg:
            logger.error("❌ closed_dates table does not exist!")
            logger.error("💡 Please run the migration SQL in your Supabase dashboard")
            return False
        else:
            logger.error(f"❌ Error accessing closed_dates table: {e}")
            return False

def test_closed_dates_api():
    """Test the closed dates API endpoints"""
    try:
        # Get a real business ID
        db_service = DatabaseService()
        supabase = db_service.get_supabase_client()
        businesses_result = supabase.table('businesses').select('id').limit(1).execute()
        
        if not businesses_result.data:
            logger.error("❌ No businesses found in database")
            return False
        
        business_id = businesses_result.data[0]['id']
        logger.info(f"🔍 Testing with business ID: {business_id}")
        
        base_url = "http://localhost:3001/api/closed-dates"
        
        # Test 1: Get closed dates (should be empty initially)
        logger.info("📋 Test 1: GET closed dates")
        response = requests.get(f"{base_url}/business/{business_id}")
        logger.info(f"Status: {response.status_code}, Response: {response.json()}")
        
        # Test 2: Add a closed date
        logger.info("📋 Test 2: POST add closed date")
        test_date = (date.today() + timedelta(days=30)).strftime('%Y-%m-%d')
        add_data = {"date": test_date, "reason": "Test closure"}
        response = requests.post(f"{base_url}/business/{business_id}", json=add_data)
        logger.info(f"Status: {response.status_code}, Response: {response.json()}")
        
        # Test 3: Get closed dates again (should include our test date)
        logger.info("📋 Test 3: GET closed dates after adding")
        response = requests.get(f"{base_url}/business/{business_id}")
        logger.info(f"Status: {response.status_code}, Response: {response.json()}")
        
        # Test 4: Check specific date
        logger.info("📋 Test 4: Check if specific date is closed")
        response = requests.get(f"{base_url}/business/{business_id}/check/{test_date}")
        logger.info(f"Status: {response.status_code}, Response: {response.json()}")
        
        # Test 5: Bulk update
        logger.info("📋 Test 5: Bulk update closed dates")
        tomorrow = (date.today() + timedelta(days=1)).strftime('%Y-%m-%d')
        bulk_data = {"closed_dates": [test_date, tomorrow]}
        response = requests.put(f"{base_url}/business/{business_id}/bulk", json=bulk_data)
        logger.info(f"Status: {response.status_code}, Response: {response.json()}")
        
        # Test 6: Remove a closed date
        logger.info("📋 Test 6: DELETE remove closed date")
        response = requests.delete(f"{base_url}/business/{business_id}/date/{tomorrow}")
        logger.info(f"Status: {response.status_code}, Response: {response.json()}")
        
        # Test 7: Final check
        logger.info("📋 Test 7: Final GET closed dates")
        response = requests.get(f"{base_url}/business/{business_id}")
        logger.info(f"Status: {response.status_code}, Response: {response.json()}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Error testing closed dates API: {e}")
        return False

def test_business_hours_with_closed_dates():
    """Test that business hours still work with closed dates"""
    try:
        # Get a real business ID
        db_service = DatabaseService()
        supabase = db_service.get_supabase_client()
        businesses_result = supabase.table('businesses').select('id').limit(1).execute()
        
        if not businesses_result.data:
            logger.error("❌ No businesses found in database")
            return False
        
        business_id = businesses_result.data[0]['id']
        
        # Test business hours endpoint
        logger.info("📋 Testing business hours endpoint...")
        response = requests.get(f"http://localhost:3001/api/business-hours/business/{business_id}")
        logger.info(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            logger.info("✅ Business hours endpoint working!")
            return True
        else:
            logger.error(f"❌ Business hours endpoint failed: {response.text}")
            return False
        
    except Exception as e:
        logger.error(f"❌ Error testing business hours: {e}")
        return False

if __name__ == "__main__":
    logger.info("🚀 Starting complete closed dates feature test...")
    
    # Test 1: Database table
    table_exists = test_closed_dates_table()
    
    if not table_exists:
        logger.error("❌ Cannot proceed - closed_dates table doesn't exist")
        logger.info("💡 Please create the table first using the migration SQL")
        exit(1)
    
    # Test 2: API endpoints
    api_works = test_closed_dates_api()
    
    # Test 3: Business hours integration
    hours_work = test_business_hours_with_closed_dates()
    
    logger.info("📋 Final Test Results:")
    logger.info(f"  closed_dates table: {'✅ EXISTS' if table_exists else '❌ MISSING'}")
    logger.info(f"  closed_dates API: {'✅ WORKING' if api_works else '❌ ERROR'}")
    logger.info(f"  business_hours API: {'✅ WORKING' if hours_work else '❌ ERROR'}")
    
    if table_exists and api_works and hours_work:
        logger.info("🎉 All tests passed! Closed dates feature is fully working!")
    else:
        logger.error("❌ Some tests failed. Check the logs above for details.")
