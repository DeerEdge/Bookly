from flask import Blueprint, request, jsonify
import os
import json
from datetime import datetime
import uuid

appointment_bp = Blueprint('appointments', __name__)

# Get data directory path
data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')

def get_appointment_file_path(business_id):
    """Get the file path for appointments JSON file"""
    return os.path.join(data_dir, f'appointments-{business_id}.json')

def get_business_appointments(business_id):
    """Get appointments for a specific business"""
    try:
        file_path = get_appointment_file_path(business_id)
        if not os.path.exists(file_path):
            return []
        
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading appointments: {e}")
        return []

def save_business_appointments(business_id, appointments):
    """Save appointments for a business"""
    try:
        file_path = get_appointment_file_path(business_id)
        with open(file_path, 'w') as f:
            json.dump(appointments, f, indent=2)
    except Exception as e:
        print(f"Error saving appointments: {e}")
        raise e

@appointment_bp.route('/business/<business_id>', methods=['GET'])
def get_appointments_by_business(business_id):
    """Get all appointments for a business"""
    try:
        appointments = get_business_appointments(business_id)
        return jsonify(appointments)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch appointments'}), 500

@appointment_bp.route('/<appointment_id>', methods=['GET'])
def get_appointment(appointment_id):
    """Get specific appointment"""
    try:
        business_id = request.args.get('business_id')
        if not business_id:
            return jsonify({'error': 'Business ID is required'}), 400
        
        appointments = get_business_appointments(business_id)
        appointment = next((apt for apt in appointments if apt.get('id') == appointment_id), None)
        
        if not appointment:
            return jsonify({'error': 'Appointment not found'}), 404
        
        return jsonify(appointment)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch appointment'}), 500

@appointment_bp.route('/', methods=['POST'])
def create_appointment():
    """Create new appointment"""
    try:
        print("=== Appointment Creation Request ===")
        print(f"Request method: {request.method}")
        print(f"Request URL: {request.url}")
        print(f"Request headers: {dict(request.headers)}")
        
        appointment_data = request.get_json()
        print(f"Request data: {appointment_data}")
        
        # Validate required fields
        required_fields = ['business_id', 'customer_name', 'customer_email', 'service_name', 'date', 'time']
        for field in required_fields:
            if not appointment_data.get(field):
                print(f"Missing required field: {field}")
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        print(f"Business ID: {appointment_data['business_id']}")
        
        # Create new appointment
        new_appointment = {
            'id': str(uuid.uuid4()),
            **appointment_data,
            'status': 'confirmed',
            'created_at': datetime.now().isoformat()
        }
        
        print(f"Created appointment: {new_appointment}")
        
        # Get existing appointments and add new one
        appointments = get_business_appointments(appointment_data['business_id'])
        print(f"Existing appointments count: {len(appointments)}")
        
        appointments.append(new_appointment)
        
        # Save updated appointments
        save_business_appointments(appointment_data['business_id'], appointments)
        print(f"Saved {len(appointments)} appointments")
        
        return jsonify(new_appointment), 201
    except Exception as e:
        print(f"Error creating appointment: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Failed to create appointment'}), 500

@appointment_bp.route('/<appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    """Update appointment"""
    try:
        business_id = request.args.get('business_id')
        if not business_id:
            return jsonify({'error': 'Business ID is required'}), 400
        
        updates = request.get_json()
        appointments = get_business_appointments(business_id)
        
        appointment_index = next((i for i, apt in enumerate(appointments) if apt.get('id') == appointment_id), None)
        
        if appointment_index is None:
            return jsonify({'error': 'Appointment not found'}), 404
        
        appointments[appointment_index].update(updates)
        appointments[appointment_index]['updated_at'] = datetime.now().isoformat()
        
        save_business_appointments(business_id, appointments)
        
        return jsonify(appointments[appointment_index])
    except Exception as e:
        print(f"Error updating appointment: {e}")
        return jsonify({'error': 'Failed to update appointment'}), 500

@appointment_bp.route('/<appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    """Delete appointment"""
    try:
        business_id = request.args.get('business_id')
        if not business_id:
            return jsonify({'error': 'Business ID is required'}), 400
        
        appointments = get_business_appointments(business_id)
        
        appointment = next((apt for apt in appointments if apt.get('id') == appointment_id), None)
        
        if not appointment:
            return jsonify({'error': 'Appointment not found'}), 404
        
        appointments = [apt for apt in appointments if apt.get('id') != appointment_id]
        save_business_appointments(business_id, appointments)
        
        return jsonify({'message': 'Appointment deleted successfully'})
    except Exception as e:
        print(f"Error deleting appointment: {e}")
        return jsonify({'error': 'Failed to delete appointment'}), 500

@appointment_bp.route('/business/<business_id>/range', methods=['GET'])
def get_appointments_by_range(business_id):
    """Get appointments by date range"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if not start_date or not end_date:
            return jsonify({'error': 'Start date and end date are required'}), 400
        
        appointments = get_business_appointments(business_id)
        
        filtered_appointments = [
            apt for apt in appointments
            if start_date <= apt.get('date', '') <= end_date
        ]
        
        return jsonify(filtered_appointments)
    except Exception as e:
        print(f"Error getting appointments by range: {e}")
        return jsonify({'error': 'Failed to fetch appointments'}), 500 