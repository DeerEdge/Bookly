from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
import logging
from services.database import DatabaseService

services_bp = Blueprint('services', __name__)
logger = logging.getLogger(__name__)

# Initialize database service
try:
    db_service = DatabaseService()
    supabase = db_service.get_supabase_client()
except Exception as e:
    logger.error(f"Failed to initialize database service: {e}")
    db_service = None
    supabase = None

@services_bp.route('/business/<business_id>', methods=['GET'])
def get_business_services(business_id):
    """Get all services for a business"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        result = supabase.table('services').select('*').eq('business_id', business_id).eq('is_active', True).execute()
        
        return jsonify(result.data)
    except Exception as e:
        logger.error(f"Error fetching services: {e}")
        return jsonify({'error': 'Failed to fetch services'}), 500

@services_bp.route('/<service_id>', methods=['GET'])
def get_service(service_id):
    """Get specific service"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        result = supabase.table('services').select('*').eq('id', service_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Service not found'}), 404
        
        return jsonify(result.data[0])
    except Exception as e:
        logger.error(f"Error fetching service: {e}")
        return jsonify({'error': 'Failed to fetch service'}), 500

@services_bp.route('/', methods=['POST'])
def create_service():
    """Create new service"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        service_data = request.get_json()
        
        # Validate required fields
        required_fields = ['business_id', 'name', 'duration', 'price']
        for field in required_fields:
            if not service_data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create new service
        new_service = {
            'id': str(uuid.uuid4()),
            'business_id': service_data['business_id'],
            'name': service_data['name'],
            'description': service_data.get('description', ''),
            'duration': service_data['duration'],
            'price': service_data['price'],
            'is_active': True
        }
        
        result = supabase.table('services').insert(new_service).execute()
        
        if not result.data:
            return jsonify({'error': 'Failed to create service'}), 500
        
        return jsonify(result.data[0]), 201
    except Exception as e:
        logger.error(f"Error creating service: {e}")
        return jsonify({'error': 'Failed to create service'}), 500

@services_bp.route('/<service_id>', methods=['PUT'])
def update_service(service_id):
    """Update service"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        updates = request.get_json()
        updates['updated_at'] = datetime.now().isoformat()
        
        result = supabase.table('services').update(updates).eq('id', service_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Service not found'}), 404
        
        return jsonify(result.data[0])
    except Exception as e:
        logger.error(f"Error updating service: {e}")
        return jsonify({'error': 'Failed to update service'}), 500

@services_bp.route('/<service_id>', methods=['DELETE'])
def delete_service(service_id):
    """Delete service (soft delete by setting is_active to false)"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        result = supabase.table('services').update({'is_active': False, 'updated_at': datetime.now().isoformat()}).eq('id', service_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Service not found'}), 404
        
        return jsonify({'message': 'Service deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting service: {e}")
        return jsonify({'error': 'Failed to delete service'}), 500
