from supabase import create_client, Client
from config import Config
import logging

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        Config.validate_supabase_config()
        self.supabase: Client = create_client(
            Config.SUPABASE_URL,
            Config.SUPABASE_KEY
        )
    
    def get_supabase_client(self) -> Client:
        """Get the Supabase client instance"""
        return self.supabase
    
    def test_connection(self):
        """Test the database connection"""
        try:
            # Try to fetch a single row from businesses table
            result = self.supabase.table('businesses').select('id').limit(1).execute()
            logger.info("Database connection successful")
            return True
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            return False
    
    def migrate_data_from_json(self):
        """Migrate data from JSON files to Supabase"""
        import json
        import os
        from datetime import datetime
        
        data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
        
        # Migrate businesses
        business_files = [f for f in os.listdir(data_dir) if f.startswith('business-')]
        for file in business_files:
            with open(os.path.join(data_dir, file), 'r') as f:
                business_data = json.load(f)
                
                # Remove password field and hash it properly
                password = business_data.pop('password', 'password123')
                business_data['password_hash'] = password  # In production, hash this properly
                
                # Insert into Supabase
                try:
                    result = self.supabase.table('businesses').insert(business_data).execute()
                    logger.info(f"Migrated business: {business_data['name']}")
                except Exception as e:
                    logger.error(f"Failed to migrate business {business_data['name']}: {e}")
        
        # Migrate appointments
        appointment_files = [f for f in os.listdir(data_dir) if f.startswith('appointments-')]
        for file in appointment_files:
            with open(os.path.join(data_dir, file), 'r') as f:
                appointments_data = json.load(f)
                
                for appointment in appointments_data:
                    # Create customer if doesn't exist
                    customer_data = {
                        'name': appointment['customer_name'],
                        'email': appointment['customer_email'],
                        'phone': appointment['customer_phone']
                    }
                    
                    try:
                        # Check if customer exists
                        existing_customer = self.supabase.table('customers').select('id').eq('email', customer_data['email']).execute()
                        
                        if not existing_customer.data:
                            customer_result = self.supabase.table('customers').insert(customer_data).execute()
                            customer_id = customer_result.data[0]['id']
                        else:
                            customer_id = existing_customer.data[0]['id']
                        
                        # Create appointment
                        appointment_data = {
                            'business_id': appointment['business_id'],
                            'customer_id': customer_id,
                            'appointment_date': appointment['date'],
                            'appointment_time': appointment['time'],
                            'status': appointment['status'],
                            'notes': f"Migrated from JSON - Service: {appointment['service_name']}, Price: ${appointment['service_price']}"
                        }
                        
                        result = self.supabase.table('appointments').insert(appointment_data).execute()
                        logger.info(f"Migrated appointment for {appointment['customer_name']}")
                        
                    except Exception as e:
                        logger.error(f"Failed to migrate appointment: {e}")
    
    def create_sample_data(self):
        """Create sample data for testing"""
        # Sample business
        business_data = {
            'name': 'Sample Hair Salon',
            'slug': 'sample-hair-salon',
            'category': 'Hair Salon',
            'description': 'Professional hair styling services',
            'address': '123 Sample St, City',
            'phone': '(555) 123-4567',
            'email': 'sample@example.com',
            'password_hash': 'password123'
        }
        
        try:
            business_result = self.supabase.table('businesses').insert(business_data).execute()
            business_id = business_result.data[0]['id']
            
            # Sample services
            services_data = [
                {
                    'business_id': business_id,
                    'name': 'Haircut',
                    'description': 'Basic haircut service',
                    'duration': 30,
                    'price': 45.00
                },
                {
                    'business_id': business_id,
                    'name': 'Hair Color',
                    'description': 'Professional hair coloring',
                    'duration': 120,
                    'price': 120.00
                }
            ]
            
            services_result = self.supabase.table('services').insert(services_data).execute()
            logger.info("Sample data created successfully")
            
        except Exception as e:
            logger.error(f"Failed to create sample data: {e}")
