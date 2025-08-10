#!/usr/bin/env python3
"""
Sample Data Initialization Script for BookMyAppointment

This script creates sample data for testing the application.
It can be run independently or called via the API endpoint.
"""

import json
import os
import uuid
from datetime import datetime, timedelta
from pathlib import Path

def create_sample_data():
    """Create sample data for testing"""
    
    # Ensure data directory exists
    data_dir = Path(__file__).parent / 'data'
    data_dir.mkdir(exist_ok=True)
    
    # Sample businesses
    businesses = [
        {
            "id": "399d2578-9295-44c0-a1e9-e27adb962594",
            "name": "Elegant Hair Salon",
            "slug": "elegant-hair-salon",
            "category": "Hair Salon",
            "description": "Professional hair styling and beauty services",
            "address": "123 Main Street, Sandy, UT",
            "phone": "(555) 123-4567",
            "hours": "Mon-Fri: 9AM-7PM, Sat: 10AM-5PM",
            "email": "elegant@example.com",
            "password": "password123",
            "services": [
                {
                    "id": str(uuid.uuid4()),
                    "duration": 30,
                    "name": "Haircut",
                    "price": 45.00,
                    "description": "Professional haircut and styling"
                },
                {
                    "id": str(uuid.uuid4()),
                    "duration": 120,
                    "name": "Hair Color",
                    "price": 120.00,
                    "description": "Full hair coloring service"
                },
                {
                    "id": str(uuid.uuid4()),
                    "duration": 45,
                    "name": "Styling",
                    "price": 60.00,
                    "description": "Special occasion hair styling"
                },
                {
                    "id": str(uuid.uuid4()),
                    "duration": 30,
                    "name": "Manicure",
                    "price": 35.00,
                    "description": "Classic manicure service"
                }
            ],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "419caa8f-9c5e-4474-bc92-1412a46786c1",
            "name": "Tech Solutions Pro",
            "slug": "tech-solutions-pro",
            "category": "Technology Services",
            "description": "Professional IT consulting and computer repair",
            "address": "456 Tech Drive, Salt Lake City, UT",
            "phone": "(555) 987-6543",
            "hours": "Mon-Fri: 8AM-6PM, Sat: 9AM-3PM",
            "email": "tech@example.com",
            "password": "password123",
            "services": [
                {
                    "id": str(uuid.uuid4()),
                    "duration": 60,
                    "name": "Computer Repair",
                    "price": 75.00,
                    "description": "Diagnosis and repair of computer issues"
                },
                {
                    "id": str(uuid.uuid4()),
                    "duration": 120,
                    "name": "Virus Removal",
                    "price": 95.00,
                    "description": "Complete virus and malware removal"
                },
                {
                    "id": str(uuid.uuid4()),
                    "duration": 180,
                    "name": "Data Recovery",
                    "price": 150.00,
                    "description": "Recovery of lost or deleted data"
                }
            ],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "22775255-8bee-4016-8c0b-c5e8712d0f64",
            "name": "Green Thumb Landscaping",
            "slug": "green-thumb-landscaping",
            "category": "Landscaping",
            "description": "Professional landscaping and garden maintenance",
            "address": "789 Garden Way, Provo, UT",
            "phone": "(555) 456-7890",
            "hours": "Mon-Fri: 7AM-5PM, Sat: 8AM-4PM",
            "email": "landscape@example.com",
            "password": "password123",
            "services": [
                {
                    "id": str(uuid.uuid4()),
                    "duration": 240,
                    "name": "Lawn Maintenance",
                    "price": 120.00,
                    "description": "Complete lawn care and maintenance"
                },
                {
                    "id": str(uuid.uuid4()),
                    "duration": 360,
                    "name": "Garden Design",
                    "price": 200.00,
                    "description": "Custom garden design and installation"
                },
                {
                    "id": str(uuid.uuid4()),
                    "duration": 180,
                    "name": "Tree Trimming",
                    "price": 150.00,
                    "description": "Professional tree trimming and care"
                }
            ],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "9afeb1f3-6744-4fb9-ad31-7d1958c6d463",
            "name": "FitLife Personal Training",
            "slug": "fitlife-personal-training",
            "category": "Fitness",
            "description": "Personal training and fitness coaching",
            "address": "321 Fitness Ave, Orem, UT",
            "phone": "(555) 321-0987",
            "hours": "Mon-Fri: 6AM-8PM, Sat-Sun: 7AM-6PM",
            "email": "fitness@example.com",
            "password": "password123",
            "services": [
                {
                    "id": str(uuid.uuid4()),
                    "duration": 60,
                    "name": "Personal Training",
                    "price": 80.00,
                    "description": "One-on-one personal training session"
                },
                {
                    "id": str(uuid.uuid4()),
                    "duration": 30,
                    "name": "Nutrition Consultation",
                    "price": 50.00,
                    "description": "Personalized nutrition planning"
                },
                {
                    "id": str(uuid.uuid4()),
                    "duration": 90,
                    "name": "Group Fitness",
                    "price": 25.00,
                    "description": "Group fitness class"
                }
            ],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
    ]
    
    # Create sample appointments for each business
    appointments = []
    
    for business in businesses:
        business_id = business["id"]
        
        # Create appointments for the next 30 days
        for i in range(10):
            appointment_date = datetime.now() + timedelta(days=i+1)
            
            # Skip weekends for some businesses
            if business["category"] in ["Hair Salon", "Technology Services"] and appointment_date.weekday() >= 5:
                continue
                
            # Create 2-3 appointments per day
            for j in range(2):
                service = business["services"][j % len(business["services"])]
                appointment_time = datetime.strptime(f"09:00", "%H:%M") + timedelta(hours=j*2)
                
                appointment = {
                    "id": str(uuid.uuid4()),
                    "business_id": business_id,
                    "customer_name": f"Customer {i+1}-{j+1}",
                    "customer_email": f"customer{i+1}{j+1}@example.com",
                    "customer_phone": f"(555) {100+i:03d}-{1000+j:04d}",
                    "service_name": service["name"],
                    "service_id": service["id"],
                    "appointment_date": appointment_date.strftime("%Y-%m-%d"),
                    "appointment_time": appointment_time.strftime("%H:%M"),
                    "duration": service["duration"],
                    "price": service["price"],
                    "status": "confirmed",
                    "notes": f"Sample appointment for testing",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                }
                appointments.append(appointment)
    
    # Save businesses
    for business in businesses:
        business_file = data_dir / f"business-{business['id']}.json"
        with open(business_file, 'w') as f:
            json.dump(business, f, indent=2)
        print(f"Created business: {business['name']}")
    
    # Save appointments
    for appointment in appointments:
        appointment_file = data_dir / f"appointment-{appointment['id']}.json"
        with open(appointment_file, 'w') as f:
            json.dump(appointment, f, indent=2)
    
    print(f"\nCreated {len(businesses)} businesses and {len(appointments)} appointments")
    print("Sample data initialization completed successfully!")
    
    return {
        "businesses": len(businesses),
        "appointments": len(appointments)
    }

if __name__ == "__main__":
    try:
        result = create_sample_data()
        print(f"\nSummary: {result['businesses']} businesses, {result['appointments']} appointments")
    except Exception as e:
        print(f"Error creating sample data: {e}")
        exit(1)
