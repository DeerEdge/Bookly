from flask import Blueprint, request, jsonify
import os
import json
from datetime import datetime
import uuid

business_bp = Blueprint('businesses', __name__)

# Get data directory path
data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')

def get_business_file_path(business_id):
    """Get the file path for a business JSON file"""
    return os.path.join(data_dir, f'business-{business_id}.json')

def get_credentials_file_path():
    """Get the file path for credentials JSON file"""
    return os.path.join(os.path.dirname(os.path.dirname(__file__)), 'credentials.json')

def get_all_businesses():
    """Get all businesses from JSON files"""
    businesses = []
    try:
        for filename in os.listdir(data_dir):
            if filename.startswith('business-') and filename.endswith('.json'):
                file_path = os.path.join(data_dir, filename)
                with open(file_path, 'r') as f:
                    business_data = json.load(f)
                    businesses.append(business_data)
    except Exception as e:
        print(f"Error reading businesses: {e}")
    return businesses

def validate_credentials(email, password):
    """Validate credentials against credentials.json file"""
    try:
        credentials_file = get_credentials_file_path()
        if not os.path.exists(credentials_file):
            return None
        
        with open(credentials_file, 'r') as f:
            credentials_data = json.load(f)
        
        for user in credentials_data.get('users', []):
            if user.get('email') == email and user.get('password') == password:
                return user
        
        return None
    except Exception as e:
        print(f"Error validating credentials: {e}")
        return None

@business_bp.route('/', methods=['GET'])
def get_businesses():
    """Get all businesses"""
    try:
        businesses = get_all_businesses()
        # Remove passwords from response
        for business in businesses:
            business.pop('password', None)
        return jsonify(businesses)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch businesses'}), 500

@business_bp.route('/slug/<slug>', methods=['GET'])
def get_business_by_slug(slug):
    """Get business by slug"""
    try:
        businesses = get_all_businesses()
        business = next((b for b in businesses if b.get('slug') == slug), None)
        
        if not business:
            return jsonify({'error': 'Business not found'}), 404
        
        # Remove password from response
        business.pop('password', None)
        return jsonify(business)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch business'}), 500

@business_bp.route('/register', methods=['POST'])
def register_business():
    """Register a new business"""
    try:
        business_data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'password']
        for field in required_fields:
            if not business_data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if business already exists
        businesses = get_all_businesses()
        existing_business = next((b for b in businesses if b.get('email') == business_data['email']), None)
        
        if existing_business:
            return jsonify({'error': 'Business with this email already exists'}), 400
        
        # Create new business
        new_business = {
            'id': str(uuid.uuid4()),
            **business_data,
            'slug': business_data['name'].lower().replace(' ', '-').replace('_', '-'),
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        # Save to file
        file_path = get_business_file_path(new_business['id'])
        with open(file_path, 'w') as f:
            json.dump(new_business, f, indent=2)
        
        # Remove password from response
        response_business = new_business.copy()
        response_business.pop('password', None)
        
        return jsonify(response_business), 201
    except Exception as e:
        print(f"Error registering business: {e}")
        return jsonify({'error': 'Failed to register business'}), 500

@business_bp.route('/login', methods=['POST'])
def login_business():
    """Business login with credentials validation"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # First check credentials.json file
        valid_user = validate_credentials(email, password)
        if valid_user:
            # Find the corresponding business data
            businesses = get_all_businesses()
            business = next((b for b in businesses if b.get('email') == email), None)
            
            if business:
                # Remove password from response
                response_business = business.copy()
                response_business.pop('password', None)
                return jsonify(response_business)
        
        # Fallback to checking business files directly
        businesses = get_all_businesses()
        business = next((b for b in businesses if b.get('email') == email and b.get('password') == password), None)
        
        if not business:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Remove password from response
        response_business = business.copy()
        response_business.pop('password', None)
        
        return jsonify(response_business)
    except Exception as e:
        print(f"Error logging in: {e}")
        return jsonify({'error': 'Failed to login'}), 500

@business_bp.route('/<business_id>', methods=['PUT'])
def update_business(business_id):
    """Update business"""
    try:
        updates = request.get_json()
        file_path = get_business_file_path(business_id)
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'Business not found'}), 404
        
        # Read existing business
        with open(file_path, 'r') as f:
            business = json.load(f)
        
        # Update business
        business.update(updates)
        business['updated_at'] = datetime.now().isoformat()
        
        # Save updated business
        with open(file_path, 'w') as f:
            json.dump(business, f, indent=2)
        
        # Remove password from response
        response_business = business.copy()
        response_business.pop('password', None)
        
        return jsonify(response_business)
    except Exception as e:
        print(f"Error updating business: {e}")
        return jsonify({'error': 'Failed to update business'}), 500

@business_bp.route('/<business_id>', methods=['DELETE'])
def delete_business(business_id):
    """Delete business"""
    try:
        file_path = get_business_file_path(business_id)
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'Business not found'}), 404
        
        os.remove(file_path)
        return jsonify({'message': 'Business deleted successfully'})
    except Exception as e:
        print(f"Error deleting business: {e}")
        return jsonify({'error': 'Failed to delete business'}), 500 