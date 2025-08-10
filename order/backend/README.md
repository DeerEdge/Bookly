# Bookly Backend (Flask)

A Python Flask backend for the Bookly platform with JSON file storage.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip3 install -r requirements.txt
```

### 2. Start the Server
```bash
python3 app.py
```

The server will start on `http://localhost:3001`

## 📁 File Structure

```
backend/
├── data/                    # JSON data files
│   ├── business-*.json     # Individual business files
│   └── appointments-*.json # Appointment files per business
├── routes/
│   ├── businesses.py       # Business management routes
│   └── appointments.py     # Appointment management routes
├── app.py                  # Main Flask application
├── requirements.txt        # Python dependencies
└── README.md
```

## 🔗 API Endpoints

### Health Check
- `GET /api/health` - Server health check

### Businesses
- `GET /api/businesses` - Get all businesses
- `GET /api/businesses/slug/<slug>` - Get business by slug
- `POST /api/businesses/register` - Register new business
- `POST /api/businesses/login` - Business login
- `PUT /api/businesses/<id>` - Update business
- `DELETE /api/businesses/<id>` - Delete business

### Appointments
- `GET /api/appointments/business/<business_id>` - Get appointments for business
- `GET /api/appointments/<id>?business_id=<business_id>` - Get specific appointment
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/<id>?business_id=<business_id>` - Update appointment
- `DELETE /api/appointments/<id>?business_id=<business_id>` - Delete appointment
- `GET /api/appointments/business/<business_id>/range?start_date=<date>&end_date=<date>` - Get appointments by date range

## 📊 Data Storage

### Business Files
Each business is stored in a separate JSON file:
```
business-{uuid}.json
```

### Appointment Files
Appointments are grouped by business:
```
appointments-{business_id}.json
```

## 🔧 Development

### Start Development Server
```bash
python3 app.py
```

### Environment Variables
Create a `.env` file for environment variables:
```
FLASK_ENV=development
FLASK_DEBUG=1
```

## 🔄 Future Migration to Supabase

This JSON file storage system is designed to be easily migrated to Supabase:

1. **Businesses Table**: Replace JSON files with Supabase table
2. **Appointments Table**: Replace JSON files with Supabase table
3. **Authentication**: Replace simple login with Supabase Auth
4. **Real-time**: Add Supabase real-time subscriptions

The API endpoints will remain the same, only the data layer will change.

## 🐍 Python Requirements

- Flask 2.3.3
- Flask-CORS 4.0.0
- python-dotenv 1.0.0
- uuid 1.30

## 🚀 Production Deployment

For production deployment:

1. Set environment variables
2. Use a production WSGI server (Gunicorn)
3. Configure proper logging
4. Set up database migration scripts

```bash
# Production example
pip3 install gunicorn
gunicorn -w 4 -b 0.0.0.0:3001 app:app
``` 