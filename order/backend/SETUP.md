# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and API keys

## 2. Configure Environment Variables

Create a `.env` file in the backend directory with your Supabase credentials:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
```

## 3. Create Database Tables

Run the following SQL in your Supabase SQL editor:

```sql
-- 1. Businesses Table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Services Table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Customers Table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Business Hours Table
CREATE TABLE business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Time Slots Table
CREATE TABLE time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  duration INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'available',
  appointment_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, service_id, slot_date, slot_time)
);

-- 6. Appointments Table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  time_slot_id UUID,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Availability Rules Table
CREATE TABLE availability_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  rule_type VARCHAR(50) NOT NULL,
  rule_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE time_slots 
ADD CONSTRAINT fk_time_slots_appointment 
FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;

ALTER TABLE appointments 
ADD CONSTRAINT fk_appointments_time_slot 
FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_services_business ON services(business_id);
CREATE INDEX idx_business_hours_business ON business_hours(business_id);
CREATE INDEX idx_time_slots_business_date ON time_slots(business_id, slot_date);
CREATE INDEX idx_time_slots_status ON time_slots(status);
CREATE INDEX idx_time_slots_service ON time_slots(service_id);
CREATE INDEX idx_appointments_business_date ON appointments(business_id, appointment_date);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_availability_rules_business ON availability_rules(business_id);
```

## 4. Test the Connection

1. Start the Flask server:
```bash
python3 app.py
```

2. Check the health endpoint:
```bash
curl http://localhost:3001/api/health
```

3. Test the connection:
```bash
python3 test_connection.py
```

4. Migrate existing data (optional):
```bash
curl -X POST http://localhost:3001/api/migrate
```

5. Create sample data (optional):
```bash
curl -X POST http://localhost:3001/api/sample-data
```

## 5. Complete API Endpoints

### Health & Setup
- `GET /api/health` - Health check with database status
- `POST /api/migrate` - Migrate data from JSON files
- `POST /api/sample-data` - Create sample data

### Businesses
- `GET /api/businesses` - Get all businesses
- `GET /api/businesses/{id}` - Get business by ID
- `GET /api/businesses/slug/{slug}` - Get business by slug
- `POST /api/businesses/register` - Register a new business
- `POST /api/businesses/login` - Business login
- `PUT /api/businesses/{id}` - Update business
- `DELETE /api/businesses/{id}` - Delete business

### Services
- `GET /api/services/business/{business_id}` - Get services for a business
- `GET /api/services/{service_id}` - Get specific service
- `POST /api/services` - Create new service
- `PUT /api/services/{service_id}` - Update service
- `DELETE /api/services/{service_id}` - Delete service

### Appointments
- `GET /api/appointments/business/{business_id}` - Get appointments for a business
- `GET /api/appointments/{appointment_id}` - Get specific appointment
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/{appointment_id}` - Update appointment
- `DELETE /api/appointments/{appointment_id}` - Delete appointment
- `GET /api/appointments/business/{business_id}/range` - Get appointments by date range
- `GET /api/appointments/customer/{customer_id}` - Get appointments for a customer

### Time Slots
- `GET /api/time-slots/business/{business_id}/available` - Get available time slots
- `POST /api/time-slots/business/{business_id}/generate` - Generate time slots
- `PUT /api/time-slots/{slot_id}/book` - Book a time slot
- `PUT /api/time-slots/{slot_id}/release` - Release a time slot
- `POST /api/time-slots/business/{business_id}/block` - Block time slots

## 6. Example API Usage

### Register a Business
```bash
curl -X POST http://localhost:3001/api/businesses/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Hair Salon",
    "email": "salon@example.com",
    "password": "password123",
    "category": "Hair Salon",
    "description": "Professional hair services",
    "address": "123 Main St",
    "phone": "(555) 123-4567"
  }'
```

### Create a Service
```bash
curl -X POST http://localhost:3001/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "your-business-id",
    "name": "Haircut",
    "description": "Basic haircut service",
    "duration": 30,
    "price": 45.00
  }'
```

### Create an Appointment
```bash
curl -X POST http://localhost:3001/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "your-business-id",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "(555) 111-2222",
    "service_name": "Haircut",
    "date": "2024-01-15",
    "time": "14:00"
  }'
```

### Generate Time Slots
```bash
curl -X POST http://localhost:3001/api/time-slots/business/your-business-id/generate \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2024-01-15",
    "end_date": "2024-01-20",
    "service_id": "your-service-id"
  }'
```

## Troubleshooting

1. **Database connection failed**: Check your Supabase URL and API keys
2. **Import errors**: Make sure all dependencies are installed
3. **Table not found**: Run the SQL commands in Supabase SQL editor
4. **Permission denied**: Check your Supabase RLS policies
5. **Environment variables missing**: Create a `.env` file with your credentials

## Next Steps

1. Set up Row Level Security (RLS) policies in Supabase
2. Configure authentication with Supabase Auth
3. Set up real-time subscriptions for live updates
4. Add business hours management
5. Implement time slot generation logic
6. Add customer authentication
7. Set up email notifications
