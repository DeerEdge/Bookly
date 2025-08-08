from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
import logging
from services.database import DatabaseService

appointment_bp = Blueprint('appointments', __name__)
logger = logging.getLogger(__name__)

# Initialize database service
try:
    db_service = DatabaseService()
    supabase = db_service.get_supabase_client()
except Exception as e:
    logger.error(f"Failed to initialize database service: {e}")
    db_service = None
    supabase = None

@appointment_bp.route('/business/<business_id>', methods=['GET'])
def get_appointments_by_business(business_id):
    """Get all appointments for a business"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        result = supabase.table('appointments').select('*, customers(name, email, phone), services(name, price)').eq('business_id', business_id).execute()
        appointments = result.data
        
        return jsonify(appointments)
    except Exception as e:
        logger.error(f"Error fetching appointments: {e}")
        return jsonify({'error': 'Failed to fetch appointments'}), 500

@appointment_bp.route('/<appointment_id>', methods=['GET'])
def get_appointment(appointment_id):
    """Get specific appointment"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        result = supabase.table('appointments').select('*, customers(name, email, phone), services(name, price)').eq('id', appointment_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Appointment not found'}), 404
        
        return jsonify(result.data[0])
    except Exception as e:
        logger.error(f"Error fetching appointment: {e}")
        return jsonify({'error': 'Failed to fetch appointment'}), 500

@appointment_bp.route('/', methods=['POST'])
def create_appointment():
    """Create new appointment"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        appointment_data = request.get_json()
        logger.info(f"Creating appointment: {appointment_data}")
        
        # Validate required fields
        required_fields = ['business_id', 'customer_name', 'customer_email', 'service_name', 'date', 'time']
        for field in required_fields:
            if not appointment_data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # First, create or get customer
        customer_data = {
            'name': appointment_data['customer_name'],
            'email': appointment_data['customer_email'],
            'phone': appointment_data.get('customer_phone', '')
        }
        
        # Check if customer exists
        existing_customer = supabase.table('customers').select('id').eq('email', customer_data['email']).execute()
        
        if existing_customer.data:
            customer_id = existing_customer.data[0]['id']
        else:
            # Create new customer
            customer_result = supabase.table('customers').insert(customer_data).execute()
            customer_id = customer_result.data[0]['id']
        
        # Get service by name for the business
        service_result = supabase.table('services').select('id, price, duration').eq('business_id', appointment_data['business_id']).eq('name', appointment_data['service_name']).execute()
        
        if not service_result.data:
            return jsonify({'error': 'Service not found'}), 404
        
        service = service_result.data[0]
        
        # Create appointment
        new_appointment = {
            'id': str(uuid.uuid4()),
            'business_id': appointment_data['business_id'],
            'customer_id': customer_id,
            'service_id': service['id'],
            'appointment_date': appointment_data['date'],
            'appointment_time': appointment_data['time'],
            'status': 'confirmed',
            'notes': appointment_data.get('notes', '')
        }
        
        result = supabase.table('appointments').insert(new_appointment).execute()
        
        if not result.data:
            return jsonify({'error': 'Failed to create appointment'}), 500
        
        created_appointment = result.data[0]
        
        # Add customer and service info to response
        created_appointment['customer_name'] = customer_data['name']
        created_appointment['customer_email'] = customer_data['email']
        created_appointment['customer_phone'] = customer_data['phone']
        created_appointment['service_name'] = appointment_data['service_name']
        created_appointment['service_price'] = service['price']
        
        return jsonify(created_appointment), 201
    except Exception as e:
        logger.error(f"Error creating appointment: {e}")
        return jsonify({'error': 'Failed to create appointment'}), 500

@appointment_bp.route('/<appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    """Update appointment"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        updates = request.get_json()
        updates['updated_at'] = datetime.now().isoformat()
        
        result = supabase.table('appointments').update(updates).eq('id', appointment_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Appointment not found'}), 404
        
        return jsonify(result.data[0])
    except Exception as e:
        logger.error(f"Error updating appointment: {e}")
        return jsonify({'error': 'Failed to update appointment'}), 500

@appointment_bp.route('/<appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    """Delete appointment"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        result = supabase.table('appointments').delete().eq('id', appointment_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Appointment not found'}), 404
        
        return jsonify({'message': 'Appointment deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting appointment: {e}")
        return jsonify({'error': 'Failed to delete appointment'}), 500

@appointment_bp.route('/business/<business_id>/range', methods=['GET'])
def get_appointments_by_range(business_id):
    """Get appointments by date range"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if not start_date or not end_date:
            return jsonify({'error': 'Start date and end date are required'}), 400
        
        result = supabase.table('appointments').select('*, customers(name, email, phone), services(name, price)').eq('business_id', business_id).gte('appointment_date', start_date).lte('appointment_date', end_date).execute()
        
        return jsonify(result.data)
    except Exception as e:
        logger.error(f"Error getting appointments by range: {e}")
        return jsonify({'error': 'Failed to fetch appointments'}), 500

@appointment_bp.route('/customer/<customer_id>', methods=['GET'])
def get_customer_appointments(customer_id):
    """Get all appointments for a customer"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        result = supabase.table('appointments').select('*, businesses(name, slug), services(name, price)').eq('customer_id', customer_id).execute()
        
        return jsonify(result.data)
    except Exception as e:
        logger.error(f"Error fetching customer appointments: {e}")
        return jsonify({'error': 'Failed to fetch appointments'}), 500 