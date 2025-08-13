#!/usr/bin/env python3
"""
Check the actual structure of the business_hours table
"""

from services.database import DatabaseService

def check_table_structure():
    try:
        db_service = DatabaseService()
        supabase = db_service.get_supabase_client()
        
        # Get table structure by trying to insert a test record and seeing what fails
        print("🔍 Checking business_hours table structure...")
        
        # Try to query and see what columns exist
        result = supabase.table('business_hours').select('*').limit(1).execute()
        
        if result.data:
            print("✅ Table exists with columns:")
            for key in result.data[0].keys():
                print(f"  - {key}")
        else:
            print("ℹ️  Table exists but is empty")
            
            # Try to insert a test record to see what columns are expected
            test_data = {
                'business_id': '00000000-0000-0000-0000-000000000000',  # Dummy ID
                'day_of_week': 1,
                'selected_slots': [8, 9, 10],
                'is_closed': False,
                'open_time': None,
                'close_time': None
            }
            
            try:
                insert_result = supabase.table('business_hours').insert(test_data).execute()
                print("✅ Test insert successful - all columns exist")
                
                # Clean up test data
                supabase.table('business_hours').delete().eq('business_id', '00000000-0000-0000-0000-000000000000').execute()
                
            except Exception as e:
                print(f"❌ Test insert failed: {e}")
                if "column" in str(e).lower() and "does not exist" in str(e).lower():
                    print("💡 The selected_slots column is missing - run the migration!")
                
    except Exception as e:
        print(f"❌ Error checking table structure: {e}")

if __name__ == '__main__':
    check_table_structure()
