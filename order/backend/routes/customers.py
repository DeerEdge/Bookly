from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
import logging
from services.database import DatabaseService

customers_bp = Blueprint('customers', __name__)
logger = logging.getLogger(__name__)

# Initialize database service
try:
    db_service = DatabaseService()
    supabase = db_service.get_supabase_client()
except Exception as e:
    logger.error(f"Failed to initialize database service: {e}")
    db_service = None
    supabase = None

@customers_bp.route('/', methods=['GET'])
def get_customers():
    """Get all customers"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        result = supabase.table('customers').select('*').execute()
        return jsonify(result.data)
    except Exception as e:
        logger.error(f"Error fetching customers: {e}")
        return jsonify({'error': 'Failed to fetch customers'}), 500

@customers_bp.route('/<customer_id>', methods=['GET'])
def get_customer(customer_id):
    """Get specific customer"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        result = supabase.table('customers').select('*').eq('id', customer_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Customer not found'}), 404
        
        return jsonify(result.data[0])
    except Exception as e:
        logger.error(f"Error fetching customer: {e}")
        return jsonify({'error': 'Failed to fetch customer'}), 500

@customers_bp.route('/register', methods=['POST'])
def register_customer():
    """Register a new customer"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        customer_data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email']
        for field in required_fields:
            if not customer_data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if customer already exists
        existing_result = supabase.table('customers').select('id').eq('email', customer_data['email']).execute()
        
        if existing_result.data:
            return jsonify({'error': 'Customer with this email already exists'}), 400
        
        # Create new customer
        new_customer = {
            'id': str(uuid.uuid4()),
            'name': customer_data['name'],
            'email': customer_data['email'],
            'phone': customer_data.get('phone', ''),
            'password_hash': customer_data.get('password_hash', None)
        }
        
        result = supabase.table('customers').insert(new_customer).execute()
        
        if not result.data:
            return jsonify({'error': 'Failed to create customer'}), 500
        
        return jsonify(result.data[0]), 201
    except Exception as e:
        logger.error(f"Error registering customer: {e}")
        return jsonify({'error': 'Failed to register customer'}), 500

@customers_bp.route('/<customer_id>', methods=['PUT'])
def update_customer(customer_id):
    """Update customer"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        updates = request.get_json()
        updates['updated_at'] = datetime.now().isoformat()
        
        result = supabase.table('customers').update(updates).eq('id', customer_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Customer not found'}), 404
        
        return jsonify(result.data[0])
    except Exception as e:
        logger.error(f"Error updating customer: {e}")
        return jsonify({'error': 'Failed to update customer'}), 500

@customers_bp.route('/<customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    """Delete customer"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        result = supabase.table('customers').delete().eq('id', customer_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Customer not found'}), 404
        
        return jsonify({'message': 'Customer deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting customer: {e}")
        return jsonify({'error': 'Failed to delete customer'}), 500

@customers_bp.route('/email/<email>', methods=['GET'])
def get_customer_by_email(email):
    """Get customer by email"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        result = supabase.table('customers').select('*').eq('email', email).execute()
        
        if not result.data:
            return jsonify({'error': 'Customer not found'}), 404
        
        return jsonify(result.data[0])
    except Exception as e:
        logger.error(f"Error fetching customer by email: {e}")
        return jsonify({'error': 'Failed to fetch customer'}), 500
