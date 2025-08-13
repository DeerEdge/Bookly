from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime
import uuid
import logging
from routes.businesses import business_bp
from routes.appointments import appointment_bp
from routes.services import services_bp
from routes.time_slots import time_slots_bp
from routes.customers import customers_bp
from services.database import DatabaseService
from config import Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configure CORS to allow requests from Netlify, Render, and localhost
CORS(app, 
     origins=["https://bookwithbookly.netlify.app", "http://localhost:5173", "http://localhost:3000"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "Accept"],
     supports_credentials=True)

# Configure Flask to handle trailing slashes
app.url_map.strict_slashes = False

# Initialize database service
try:
    db_service = DatabaseService()
    logger.info("Database service initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize database service: {e}")
    db_service = None

# Ensure data directory exists
data_dir = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(data_dir, exist_ok=True)

# Register blueprints
app.register_blueprint(business_bp, url_prefix='/api/businesses')
app.register_blueprint(appointment_bp, url_prefix='/api/appointments')
app.register_blueprint(services_bp, url_prefix='/api/services')
app.register_blueprint(time_slots_bp, url_prefix='/api/time-slots')
app.register_blueprint(customers_bp, url_prefix='/api/customers')

# Add root route for testing
@app.route('/')
def root():
    return jsonify({
        'message': 'OrderAgain API is running!',
        'status': 'healthy',
        'endpoints': {
            'health': '/api/health',
            'businesses': '/api/businesses',
            'login': '/api/businesses/login'
        }
    })

# Handle preflight OPTIONS requests
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({'message': 'OK'})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization,Accept")
        response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS")
        return response

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    db_status = "Connected" if db_service and db_service.test_connection() else "Disconnected"
    
    return jsonify({
        'status': 'OK',
        'message': 'BookMyAppointment API is running',
        'database': db_status,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/migrate', methods=['POST'])
def migrate_data():
    """Migrate data from JSON files to Supabase"""
    if not db_service:
        return jsonify({'error': 'Database service not available'}), 500
    
    try:
        db_service.migrate_data_from_json()
        return jsonify({'message': 'Data migration completed successfully'})
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        return jsonify({'error': f'Migration failed: {str(e)}'}), 500

@app.route('/api/sample-data', methods=['POST'])
def create_sample_data():
    """Create sample data for testing"""
    if not db_service:
        return jsonify({'error': 'Database service not available'}), 500
    
    try:
        db_service.create_sample_data()
        return jsonify({'message': 'Sample data created successfully'})
    except Exception as e:
        logger.error(f"Sample data creation failed: {e}")
        return jsonify({'error': f'Sample data creation failed: {str(e)}'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3001))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(debug=debug, host='0.0.0.0', port=port) 