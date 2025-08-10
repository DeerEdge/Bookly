from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
import logging
from services.database import DatabaseService
from services.qr_service import QRCodeService
import requests
from config import Config

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

# Initialize QR code service
try:
    qr_service = QRCodeService()
except Exception as e:
    logger.error(f"Failed to initialize QR code service: {e}")
    qr_service = None

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
        
        # Get QR code URL if available
        if qr_service:
            qr_url = qr_service.get_business_qr_code_download_url(business['id'])
            business['qr_code_url'] = qr_url
        
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
        
        # Get QR code URL if available
        if qr_service:
            qr_url = qr_service.get_business_qr_code_download_url(business_id)
            business['qr_code_url'] = qr_url
        
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
        
        # Generate and upload QR code
        if qr_service:
            try:
                qr_url = qr_service.generate_business_qr_code(
                    created_business['id'],
                    created_business['slug'],
                    created_business['name']
                )
                if qr_url:
                    created_business['qr_code_url'] = qr_url
                    logger.info(f"QR code generated for business: {created_business['id']}")
                else:
                    logger.warning(f"Failed to generate QR code for business: {created_business['id']}")
            except Exception as qr_error:
                logger.error(f"Error generating QR code: {qr_error}")
                # Don't fail business creation if QR code generation fails
        
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
        
        # Get QR code URL if available
        if qr_service:
            qr_url = qr_service.get_business_qr_code_download_url(business['id'])
            business['qr_code_url'] = qr_url
        
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
        
        # Regenerate QR code if slug changed
        if 'slug' in updates and qr_service:
            try:
                # Delete old QR code
                qr_service.delete_business_qr_code(business_id)
                
                # Generate new QR code
                qr_url = qr_service.generate_business_qr_code(
                    business_id,
                    updated_business['slug'],
                    updated_business['name']
                )
                if qr_url:
                    updated_business['qr_code_url'] = qr_url
                    logger.info(f"QR code regenerated for business: {business_id}")
            except Exception as qr_error:
                logger.error(f"Error regenerating QR code: {qr_error}")
        
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
        
        # Delete QR code first
        if qr_service:
            try:
                qr_service.delete_business_qr_code(business_id)
            except Exception as qr_error:
                logger.error(f"Error deleting QR code: {qr_error}")
        
        # Delete business
        result = supabase.table('businesses').delete().eq('id', business_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Business not found'}), 404
        
        return jsonify({'message': 'Business deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting business: {e}")
        return jsonify({'error': 'Failed to delete business'}), 500 

@business_bp.route('/<business_id>/qr-code', methods=['GET'])
def get_business_qr_code(business_id):
    """Get business QR code URL"""
    try:
        if not qr_service:
            return jsonify({'error': 'QR code service not available'}), 500
        
        qr_url = qr_service.get_business_qr_code_download_url(business_id)
        
        if not qr_url:
            return jsonify({'error': 'QR code not found'}), 404
        
        return jsonify({'qr_code_url': qr_url})
    except Exception as e:
        logger.error(f"Error getting QR code: {e}")
        return jsonify({'error': 'Failed to get QR code'}), 500

@business_bp.route('/<business_id>/qr-code/image', methods=['GET'])
def get_business_qr_code_image(business_id):
    """Serve the actual QR code image file"""
    try:
        if not qr_service:
            return jsonify({'error': 'QR code service not available'}), 500
        
        # Get the SVG content from Supabase storage
        filename = f"{business_id}.svg"
        download_url = f"{Config.SUPABASE_URL}/storage/v1/object/{qr_service.bucket_name}/{filename}"
        
        headers = {
            'Authorization': f'Bearer {Config.SUPABASE_SERVICE_KEY}',
            'apikey': Config.SUPABASE_SERVICE_KEY
        }
        
        # Download the SVG content
        response = requests.get(download_url, headers=headers)
        
        if response.status_code == 200:
            # Return the SVG content with proper headers
            from flask import Response
            return Response(
                response.content,
                mimetype='image/svg+xml',
                headers={
                    'Cache-Control': 'public, max-age=3600',  # Cache for 1 hour
                    'Access-Control-Allow-Origin': '*'
                }
            )
        else:
            return jsonify({'error': 'QR code not found'}), 404
            
    except Exception as e:
        logger.error(f"Error serving QR code image: {e}")
        return jsonify({'error': 'Failed to serve QR code'}), 500

@business_bp.route('/<business_id>/qr-code', methods=['POST'])
def regenerate_business_qr_code(business_id):
    """Regenerate business QR code"""
    try:
        if not qr_service:
            return jsonify({'error': 'QR code service not available'}), 500
        
        # Get business data
        business_result = supabase.table('businesses').select('*').eq('id', business_id).execute()
        if not business_result.data:
            return jsonify({'error': 'Business not found'}), 404
        
        business = business_result.data[0]
        
        # Delete old QR code
        qr_service.delete_business_qr_code(business_id)
        
        # Generate new QR code
        qr_url = qr_service.generate_business_qr_code(
            business_id,
            business['slug'],
            business['name']
        )
        
        if not qr_url:
            return jsonify({'error': 'Failed to generate QR code'}), 500
        
        return jsonify({'qr_code_url': qr_url, 'message': 'QR code regenerated successfully'})
    except Exception as e:
        logger.error(f"Error regenerating QR code: {e}")
        return jsonify({'error': 'Failed to regenerate QR code'}), 500 