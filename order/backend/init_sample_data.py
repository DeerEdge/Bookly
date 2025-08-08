import os
import json
import uuid
from datetime import datetime, timedelta

# Data directory
data_dir = os.path.join(os.path.dirname(__file__), 'data')

# Sample businesses
sample_businesses = [
    {
        'id': '399d2578-9295-44c0-a1e9-e27adb962594',
        'name': 'Elegant Hair Salon',
        'slug': 'elegant-hair-salon',
        'category': 'Hair Salon',
        'description': 'Professional hair styling and beauty services',
        'address': '123 Main St, Downtown',
        'phone': '(555) 123-4567',
        'hours': 'Mon-Fri: 9AM-7PM, Sat: 10AM-5PM',
        'email': 'elegant@example.com',
        'password': 'password123',
        'services': [
            {'name': 'Haircut', 'duration': 30, 'price': 45},
            {'name': 'Hair Color', 'duration': 120, 'price': 120},
            {'name': 'Styling', 'duration': 45, 'price': 60},
            {'name': 'Manicure', 'duration': 30, 'price': 35}
        ],
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    },
    {
        'id': '419caa8f-9c5e-4474-bc92-1412a46786c1',
        'name': 'Zen Massage Therapy',
        'slug': 'zen-massage-therapy',
        'category': 'Massage',
        'description': 'Relaxing therapeutic massage services',
        'address': '456 Wellness Ave, Uptown',
        'phone': '(555) 987-6543',
        'hours': 'Mon-Sat: 10AM-8PM',
        'email': 'zen@example.com',
        'password': 'password123',
        'services': [
            {'name': 'Swedish Massage', 'duration': 60, 'price': 80},
            {'name': 'Deep Tissue', 'duration': 60, 'price': 90},
            {'name': 'Hot Stone', 'duration': 90, 'price': 120}
        ],
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
]

# Get current date and create recent dates
today = datetime.now()
tomorrow = today + timedelta(days=1)
next_week = today + timedelta(days=7)
next_month = today + timedelta(days=30)

# Sample appointments with recent dates
sample_appointments = [
    {
        'id': str(uuid.uuid4()),
        'business_id': sample_businesses[0]['id'],
        'business_name': 'Elegant Hair Salon',
        'service_name': 'Haircut',
        'service_price': 45,
        'date': today.strftime('%Y-%m-%d'),
        'time': '14:00',
        'customer_name': 'John Doe',
        'customer_email': 'john@example.com',
        'customer_phone': '(555) 111-2222',
        'status': 'confirmed',
        'created_at': datetime.now().isoformat()
    },
    {
        'id': str(uuid.uuid4()),
        'business_id': sample_businesses[0]['id'],
        'business_name': 'Elegant Hair Salon',
        'service_name': 'Hair Color',
        'service_price': 120,
        'date': tomorrow.strftime('%Y-%m-%d'),
        'time': '10:00',
        'customer_name': 'Jane Smith',
        'customer_email': 'jane@example.com',
        'customer_phone': '(555) 333-4444',
        'status': 'confirmed',
        'created_at': datetime.now().isoformat()
    },
    {
        'id': str(uuid.uuid4()),
        'business_id': sample_businesses[0]['id'],
        'business_name': 'Elegant Hair Salon',
        'service_name': 'Styling',
        'service_price': 60,
        'date': next_week.strftime('%Y-%m-%d'),
        'time': '15:30',
        'customer_name': 'Sarah Wilson',
        'customer_email': 'sarah@example.com',
        'customer_phone': '(555) 777-8888',
        'status': 'confirmed',
        'created_at': datetime.now().isoformat()
    },
    {
        'id': str(uuid.uuid4()),
        'business_id': sample_businesses[1]['id'],
        'business_name': 'Zen Massage Therapy',
        'service_name': 'Swedish Massage',
        'service_price': 80,
        'date': today.strftime('%Y-%m-%d'),
        'time': '16:00',
        'customer_name': 'Mike Johnson',
        'customer_email': 'mike@example.com',
        'customer_phone': '(555) 555-6666',
        'status': 'confirmed',
        'created_at': datetime.now().isoformat()
    },
    {
        'id': str(uuid.uuid4()),
        'business_id': sample_businesses[1]['id'],
        'business_name': 'Zen Massage Therapy',
        'service_name': 'Deep Tissue',
        'service_price': 90,
        'date': next_week.strftime('%Y-%m-%d'),
        'time': '11:00',
        'customer_name': 'Lisa Brown',
        'customer_email': 'lisa@example.com',
        'customer_phone': '(555) 999-0000',
        'status': 'confirmed',
        'created_at': datetime.now().isoformat()
    },
    {
        'id': str(uuid.uuid4()),
        'business_id': sample_businesses[1]['id'],
        'business_name': 'Zen Massage Therapy',
        'service_name': 'Hot Stone',
        'service_price': 120,
        'date': next_month.strftime('%Y-%m-%d'),
        'time': '13:00',
        'customer_name': 'David Lee',
        'customer_email': 'david@example.com',
        'customer_phone': '(555) 111-3333',
        'status': 'confirmed',
        'created_at': datetime.now().isoformat()
    }
]

def initialize_sample_data():
    """Initialize sample business and appointment data"""
    try:
        # Ensure data directory exists
        os.makedirs(data_dir, exist_ok=True)
        
        # Create business files
        for business in sample_businesses:
            business_file_path = os.path.join(data_dir, f"business-{business['id']}.json")
            with open(business_file_path, 'w') as f:
                json.dump(business, f, indent=2)
            print(f"Created business: {business['name']}")
        
        # Create appointment files grouped by business
        appointments_by_business = {}
        for appointment in sample_appointments:
            business_id = appointment['business_id']
            if business_id not in appointments_by_business:
                appointments_by_business[business_id] = []
            appointments_by_business[business_id].append(appointment)
        
        for business_id, appointments in appointments_by_business.items():
            appointments_file_path = os.path.join(data_dir, f"appointments-{business_id}.json")
            with open(appointments_file_path, 'w') as f:
                json.dump(appointments, f, indent=2)
            print(f"Created appointments for business: {business_id}")
        
        print('\n✅ Sample data initialized successfully!')
        print(f'\n📁 Data files created in: {data_dir}')
        print('\n🔗 API Endpoints:')
        print('  - GET /api/health')
        print('  - GET /api/businesses')
        print('  - GET /api/businesses/slug/elegant-hair-salon')
        print('  - POST /api/businesses/login')
        print('  - POST /api/businesses/register')
        print('  - GET /api/appointments/business/:business_id')
        print('  - POST /api/appointments')
        
    except Exception as e:
        print(f'❌ Error initializing sample data: {e}')

if __name__ == '__main__':
    initialize_sample_data() 