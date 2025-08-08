from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
import logging
from services.database import DatabaseService
from services.email_service import EmailService

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

# Initialize email service
try:
    email_service = EmailService()
except Exception as e:
    logger.error(f"Failed to initialize email service: {e}")
    email_service = None

@appointment_bp.route('/', methods=['GET'])
def get_appointments():
    """Get all appointments"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        result = supabase.table('appointments').select('*, customers(*), services(*)').execute()
        return jsonify(result.data)
    except Exception as e:
        logger.error(f"Error fetching appointments: {e}")
        return jsonify({'error': 'Failed to fetch appointments'}), 500

@appointment_bp.route('/business/<business_id>', methods=['GET'])
def get_business_appointments(business_id):
    """Get appointments for a specific business"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        result = supabase.table('appointments').select('*, customers(*), services(*)').eq('business_id', business_id).execute()
        return jsonify(result.data)
    except Exception as e:
        logger.error(f"Error fetching business appointments: {e}")
        return jsonify({'error': 'Failed to fetch appointments'}), 500

@appointment_bp.route('/', methods=['POST'])
def create_appointment():
    """Create a new appointment"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        appointment_data = request.get_json()
        
        # Validate required fields
        required_fields = ['business_id', 'service_name', 'date', 'time', 'customer_name', 'customer_email']
        for field in required_fields:
            if not appointment_data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if customer exists, create if not
        customer_result = supabase.table('customers').select('*').eq('email', appointment_data['customer_email']).execute()
        
        if customer_result.data:
            customer_id = customer_result.data[0]['id']
        else:
            # Create new customer
            new_customer = {
                'id': str(uuid.uuid4()),
                'name': appointment_data['customer_name'],
                'email': appointment_data['customer_email'],
                'phone': appointment_data.get('customer_phone', '')
            }
            customer_result = supabase.table('customers').insert(new_customer).execute()
            customer_id = customer_result.data[0]['id']
        
        # Get service by name
        service_result = supabase.table('services').select('*').eq('name', appointment_data['service_name']).eq('business_id', appointment_data['business_id']).execute()
        
        if not service_result.data:
            return jsonify({'error': 'Service not found'}), 404
        
        service_id = service_result.data[0]['id']
        
        # Create appointment
        new_appointment = {
            'id': str(uuid.uuid4()),
            'business_id': appointment_data['business_id'],
            'customer_id': customer_id,
            'service_id': service_id,
            'appointment_date': appointment_data['date'],
            'appointment_time': appointment_data['time'],
            'status': appointment_data.get('status', 'confirmed'),
            'notes': appointment_data.get('notes', '')
        }
        
        result = supabase.table('appointments').insert(new_appointment).execute()
        
        if not result.data:
            return jsonify({'error': 'Failed to create appointment'}), 500
        
        created_appointment = result.data[0]
        
        # Send confirmation emails only if requested and email service is available
        send_email_confirmation = appointment_data.get('send_email_confirmation', True)
        
        if email_service and send_email_confirmation:
            try:
                # Get business data
                business_result = supabase.table('businesses').select('*').eq('id', appointment_data['business_id']).execute()
                business_data = business_result.data[0] if business_result.data else {}
                
                # Get customer data
                customer_data = {
                    'name': appointment_data['customer_name'],
                    'email': appointment_data['customer_email'],
                    'phone': appointment_data.get('customer_phone', '')
                }
                
                # Prepare appointment data for email
                email_appointment_data = {
                    'service_name': appointment_data['service_name'],
                    'service_price': service_result.data[0]['price'],
                    'date': appointment_data['date'],
                    'time': appointment_data['time']
                }
                
                # Send confirmation email to customer
                email_service.send_appointment_confirmation(email_appointment_data, business_data, customer_data)
                
                # Only send business notification if business email is valid (not example.com)
                if business_data.get('email') and '@example.com' not in business_data['email']:
                    email_service.send_appointment_notification_to_business(email_appointment_data, business_data, customer_data)
                else:
                    logger.info(f"Skipping business notification email - invalid business email: {business_data.get('email')}")
                
            except Exception as email_error:
                logger.error(f"Failed to send confirmation emails: {email_error}")
                # Don't fail the appointment creation if email fails
        
        return jsonify(created_appointment), 201
    except Exception as e:
        logger.error(f"Error creating appointment: {e}")
        return jsonify({'error': 'Failed to create appointment'}), 500

@appointment_bp.route('/<appointment_id>', methods=['GET'])
def get_appointment(appointment_id):
    """Get specific appointment"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        business_id = request.args.get('business_id')
        if not business_id:
            return jsonify({'error': 'Business ID is required'}), 400
        
        result = supabase.table('appointments').select('*, customers(*), services(*)').eq('id', appointment_id).eq('business_id', business_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Appointment not found'}), 404
        
        return jsonify(result.data[0])
    except Exception as e:
        logger.error(f"Error fetching appointment: {e}")
        return jsonify({'error': 'Failed to fetch appointment'}), 500

@appointment_bp.route('/<appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    """Update appointment"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        business_id = request.args.get('business_id')
        if not business_id:
            return jsonify({'error': 'Business ID is required'}), 400
        
        updates = request.get_json()
        updates['updated_at'] = datetime.now().isoformat()
        
        result = supabase.table('appointments').update(updates).eq('id', appointment_id).eq('business_id', business_id).execute()
        
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
        
        business_id = request.args.get('business_id')
        if not business_id:
            return jsonify({'error': 'Business ID is required'}), 400
        
        result = supabase.table('appointments').delete().eq('id', appointment_id).eq('business_id', business_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Appointment not found'}), 404
        
        return jsonify({'message': 'Appointment deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting appointment: {e}")
        return jsonify({'error': 'Failed to delete appointment'}), 500

@appointment_bp.route('/business/<business_id>/range', methods=['GET'])
def get_appointments_by_range(business_id):
    """Get appointments for a business within a date range"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if not start_date or not end_date:
            return jsonify({'error': 'Start date and end date are required'}), 400
        
        result = supabase.table('appointments').select('*, customers(*), services(*)').eq('business_id', business_id).gte('appointment_date', start_date).lte('appointment_date', end_date).execute()
        
        return jsonify(result.data)
    except Exception as e:
        logger.error(f"Error fetching appointments by range: {e}")
        return jsonify({'error': 'Failed to fetch appointments'}), 500

@appointment_bp.route('/customer/<customer_email>', methods=['GET'])
def get_customer_appointments(customer_email):
    """Get appointments for a specific customer"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        # First get customer by email
        customer_result = supabase.table('customers').select('id').eq('email', customer_email).execute()
        
        if not customer_result.data:
            return jsonify([])
        
        customer_id = customer_result.data[0]['id']
        
        # Get appointments for this customer
        result = supabase.table('appointments').select('*, customers(*), services(*), businesses(*)').eq('customer_id', customer_id).execute()
        
        return jsonify(result.data)
    except Exception as e:
        logger.error(f"Error fetching customer appointments: {e}")
        return jsonify({'error': 'Failed to fetch appointments'}), 500 