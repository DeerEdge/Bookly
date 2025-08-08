from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime
import uuid
from routes.businesses import business_bp
from routes.appointments import appointment_bp

app = Flask(__name__)
CORS(app)

# Configure Flask to handle trailing slashes
app.url_map.strict_slashes = False

# Ensure data directory exists
data_dir = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(data_dir, exist_ok=True)

# Register blueprints
app.register_blueprint(business_bp, url_prefix='/api/businesses')
app.register_blueprint(appointment_bp, url_prefix='/api/appointments')

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'message': 'BookMyAppointment API is running',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3001) 