from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
import logging
from services.database import DatabaseService

business_bp = Blueprint('businesses', __name__)
logger = logging.getLogger(__name__)

# Initialize database service
try:
    db_service = DatabaseService()
    supabase = db_service.get_supabase_client()
except Exception as e:
    logger.error(f"Failed to initialize database service: {e}")
    db_service = None
    supabase = None

@business_bp.route('/', methods=['GET'])
def get_businesses():
    """Get all businesses"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        result = supabase.table('businesses').select('*').execute()
        businesses = result.data
        
        # Remove password_hash from response
        for business in businesses:
            business.pop('password_hash', None)
        
        return jsonify(businesses)
    except Exception as e:
        logger.error(f"Error fetching businesses: {e}")
        return jsonify({'error': 'Failed to fetch businesses'}), 500

@business_bp.route('/slug/<slug>', methods=['GET'])
def get_business_by_slug(slug):
    """Get business by slug"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        result = supabase.table('businesses').select('*').eq('slug', slug).execute()
        
        if not result.data:
            return jsonify({'error': 'Business not found'}), 404
        
        business = result.data[0]
        business.pop('password_hash', None)
        
        return jsonify(business)
    except Exception as e:
        logger.error(f"Error fetching business by slug: {e}")
        return jsonify({'error': 'Failed to fetch business'}), 500

@business_bp.route('/<business_id>', methods=['GET'])
def get_business_by_id(business_id):
    """Get business by ID"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        result = supabase.table('businesses').select('*').eq('id', business_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Business not found'}), 404
        
        business = result.data[0]
        business.pop('password_hash', None)
        
        return jsonify(business)
    except Exception as e:
        logger.error(f"Error fetching business by ID: {e}")
        return jsonify({'error': 'Failed to fetch business'}), 500

@business_bp.route('/register', methods=['POST'])
def register_business():
    """Register a new business"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        business_data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'password']
        for field in required_fields:
            if not business_data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if business already exists
        existing_result = supabase.table('businesses').select('id').eq('email', business_data['email']).execute()
        
        if existing_result.data:
            return jsonify({'error': 'Business with this email already exists'}), 400
        
        # Create new business
        new_business = {
            'id': str(uuid.uuid4()),
            'name': business_data['name'],
            'slug': business_data['name'].lower().replace(' ', '-').replace('_', '-'),
            'category': business_data.get('category', 'General'),
            'description': business_data.get('description', ''),
            'address': business_data.get('address', ''),
            'phone': business_data.get('phone', ''),
            'email': business_data['email'],
            'password_hash': business_data['password'],  # In production, hash this properly
            'is_active': True
        }
        
        # Insert into Supabase
        result = supabase.table('businesses').insert(new_business).execute()
        
        if not result.data:
            return jsonify({'error': 'Failed to create business'}), 500
        
        created_business = result.data[0]
        created_business.pop('password_hash', None)
        
        return jsonify(created_business), 201
    except Exception as e:
        logger.error(f"Error registering business: {e}")
        return jsonify({'error': 'Failed to register business'}), 500

@business_bp.route('/login', methods=['POST'])
def login_business():
    """Business login"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find business by email
        result = supabase.table('businesses').select('*').eq('email', email).execute()
        
        if not result.data:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        business = result.data[0]
        
        # Check password (in production, use proper password hashing)
        if business.get('password_hash') != password:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Remove password from response
        business.pop('password_hash', None)
        
        return jsonify(business)
    except Exception as e:
        logger.error(f"Error logging in: {e}")
        return jsonify({'error': 'Failed to login'}), 500

@business_bp.route('/<business_id>', methods=['PUT'])
def update_business(business_id):
    """Update business"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        updates = request.get_json()
        updates['updated_at'] = datetime.now().isoformat()
        
        # Remove password_hash from updates if present
        updates.pop('password_hash', None)
        
        result = supabase.table('businesses').update(updates).eq('id', business_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Business not found'}), 404
        
        updated_business = result.data[0]
        updated_business.pop('password_hash', None)
        
        return jsonify(updated_business)
    except Exception as e:
        logger.error(f"Error updating business: {e}")
        return jsonify({'error': 'Failed to update business'}), 500

@business_bp.route('/<business_id>', methods=['DELETE'])
def delete_business(business_id):
    """Delete business"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        result = supabase.table('businesses').delete().eq('id', business_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Business not found'}), 404
        
        return jsonify({'message': 'Business deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting business: {e}")
        return jsonify({'error': 'Failed to delete business'}), 500 