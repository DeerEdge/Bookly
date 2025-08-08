#!/usr/bin/env python3
"""
Test script to verify Supabase connection and basic operations
"""

import os
import sys
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_supabase_connection():
    """Test Supabase connection"""
    try:
        from services.database import DatabaseService
        
        print("🔌 Testing Supabase connection...")
        db_service = DatabaseService()
        
        # Test connection
        if db_service.test_connection():
            print("✅ Database connection successful!")
            return True
        else:
            print("❌ Database connection failed!")
            return False
            
    except Exception as e:
        print(f"❌ Error testing connection: {e}")
        return False

def test_basic_operations():
    """Test basic CRUD operations"""
    try:
        from services.database import DatabaseService
        
        print("\n🧪 Testing basic operations...")
        db_service = DatabaseService()
        supabase = db_service.get_supabase_client()
        
        # Test creating a sample business
        print("📝 Creating sample business...")
        business_data = {
            'id': str(uuid.uuid4()),
            'name': 'Test Business',
            'slug': 'test-business',
            'category': 'Test Category',
            'description': 'A test business',
            'email': 'test@example.com',
            'password_hash': 'test123',
            'is_active': True
        }
        
        # Insert business
        result = supabase.table('businesses').insert(business_data).execute()
        if result.data:
            print("✅ Sample business created successfully!")
            
            # Test reading the business
            print("📖 Reading sample business...")
            read_result = supabase.table('businesses').select('*').eq('id', business_data['id']).execute()
            if read_result.data:
                print("✅ Sample business read successfully!")
                
                # Test updating the business
                print("✏️ Updating sample business...")
                update_result = supabase.table('businesses').update({'description': 'Updated test business'}).eq('id', business_data['id']).execute()
                if update_result.data:
                    print("✅ Sample business updated successfully!")
                    
                    # Test deleting the business
                    print("🗑️ Deleting sample business...")
                    delete_result = supabase.table('businesses').delete().eq('id', business_data['id']).execute()
                    if delete_result.data:
                        print("✅ Sample business deleted successfully!")
                        return True
                    else:
                        print("❌ Failed to delete sample business!")
                        return False
                else:
                    print("❌ Failed to update sample business!")
                    return False
            else:
                print("❌ Failed to read sample business!")
                return False
        else:
            print("❌ Failed to create sample business!")
            return False
            
    except Exception as e:
        print(f"❌ Error testing operations: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Starting Supabase connection tests...\n")
    
    # Check environment variables
    required_vars = ['SUPABASE_URL', 'SUPABASE_KEY', 'SUPABASE_SERVICE_KEY']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please create a .env file with your Supabase credentials.")
        return False
    
    print("✅ Environment variables found!")
    
    # Test connection
    if not test_supabase_connection():
        return False
    
    # Test basic operations
    if not test_basic_operations():
        return False
    
    print("\n🎉 All tests passed! Supabase integration is working correctly.")
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
