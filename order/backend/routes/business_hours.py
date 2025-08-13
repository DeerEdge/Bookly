from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
import logging
from services.database import DatabaseService

business_hours_bp = Blueprint('business_hours', __name__)
logger = logging.getLogger(__name__)

# Initialize database service
try:
    db_service = DatabaseService()
    supabase = db_service.get_supabase_client()
except Exception as e:
    logger.error(f"Failed to initialize database service: {e}")
    db_service = None
    supabase = None

@business_hours_bp.route('/business/<business_id>', methods=['GET'])
def get_business_hours(business_id):
    """Get business hours for a specific business"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        result = supabase.table('business_hours').select('*').eq('business_id', business_id).execute()
        business_hours = result.data
        
        # Convert to the format expected by the frontend
        hours_by_day = {}
        for hour in business_hours:
            day_map = {
                0: 'sunday',
                1: 'monday', 
                2: 'tuesday',
                3: 'wednesday',
                4: 'thursday',
                5: 'friday',
                6: 'saturday'
            }
            day_name = day_map.get(hour['day_of_week'])
            if day_name:
                hours_by_day[day_name] = {
                    'selectedSlots': hour.get('selected_slots', []),
                    'isOpen': not hour.get('is_closed', False)
                }
        
        # Fill in missing days with default values
        for day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']:
            if day not in hours_by_day:
                hours_by_day[day] = {
                    'selectedSlots': [],
                    'isOpen': day != 'sunday'  # Default: open Monday-Saturday, closed Sunday
                }
        
        return jsonify(hours_by_day)
    except Exception as e:
        logger.error(f"Error fetching business hours: {e}")
        return jsonify({'error': 'Failed to fetch business hours'}), 500

@business_hours_bp.route('/business/<business_id>', methods=['PUT'])
def update_business_hours(business_id):
    """Update business hours for a specific business"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Map day names to numbers
        day_map = {
            'sunday': 0,
            'monday': 1,
            'tuesday': 2,
            'wednesday': 3,
            'thursday': 4,
            'friday': 5,
            'saturday': 6
        }
        
        # Process each day
        for day_name, day_data in data.items():
            if day_name not in day_map:
                continue
                
            day_of_week = day_map[day_name]
            selected_slots = day_data.get('selectedSlots', [])
            is_open = day_data.get('isOpen', False)
            
            # Check if record exists
            existing_result = supabase.table('business_hours').select('*').eq('business_id', business_id).eq('day_of_week', day_of_week).execute()
            
            hour_data = {
                'business_id': business_id,
                'day_of_week': day_of_week,
                'selected_slots': selected_slots,
                'is_closed': not is_open,
                'open_time': None,  # Keep for backward compatibility
                'close_time': None  # Keep for backward compatibility
            }
            
            if existing_result.data:
                # Update existing record
                result = supabase.table('business_hours').update(hour_data).eq('business_id', business_id).eq('day_of_week', day_of_week).execute()
            else:
                # Insert new record
                result = supabase.table('business_hours').insert(hour_data).execute()
            
            if not result.data:
                logger.error(f"Failed to save hours for day {day_name}")
        
        return jsonify({'message': 'Business hours updated successfully'})
    except Exception as e:
        logger.error(f"Error updating business hours: {e}")
        return jsonify({'error': 'Failed to update business hours'}), 500

@business_hours_bp.route('/business/<business_id>/day/<day_name>', methods=['PUT'])
def update_single_day_hours(business_id, day_name):
    """Update business hours for a single day"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Map day names to numbers
        day_map = {
            'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
            'thursday': 4, 'friday': 5, 'saturday': 6
        }
        
        if day_name not in day_map:
            return jsonify({'error': 'Invalid day name'}), 400
        
        day_of_week = day_map[day_name]
        selected_slots = data.get('selectedSlots', [])
        is_open = data.get('isOpen', False)
        
        # Check if record exists
        existing_result = supabase.table('business_hours').select('*').eq('business_id', business_id).eq('day_of_week', day_of_week).execute()
        
        hour_data = {
            'business_id': business_id,
            'day_of_week': day_of_week,
            'selected_slots': selected_slots,
            'is_closed': not is_open,
            'open_time': None,
            'close_time': None
        }
        
        if existing_result.data:
            # Update existing record
            result = supabase.table('business_hours').update(hour_data).eq('business_id', business_id).eq('day_of_week', day_of_week).execute()
        else:
            # Insert new record
            result = supabase.table('business_hours').insert(hour_data).execute()
        
        return jsonify({'message': f'Business hours updated for {day_name}'})
    except Exception as e:
        logger.error(f"Error updating business hours for {day_name}: {e}")
        return jsonify({'error': f'Failed to update business hours for {day_name}'}), 500

@business_hours_bp.route('/business/<business_id>/available-slots', methods=['GET'])
def get_available_time_slots(business_id):
    """Get all available time slots for a business based on their hours"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        # Get business hours
        result = supabase.table('business_hours').select('*').eq('business_id', business_id).execute()
        business_hours = result.data
        
        # Convert to a more usable format
        available_slots = {}
        day_map = {0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday'}
        
        for hour in business_hours:
            day_name = day_map.get(hour['day_of_week'])
            if day_name and not hour.get('is_closed', False):
                available_slots[day_name] = hour.get('selected_slots', [])
        
        return jsonify(available_slots)
    except Exception as e:
        logger.error(f"Error fetching available time slots: {e}")
        return jsonify({'error': 'Failed to fetch available time slots'}), 500

@business_hours_bp.route('/business/<business_id>', methods=['DELETE'])
def delete_business_hours(business_id):
    """Delete all business hours for a business"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        result = supabase.table('business_hours').delete().eq('business_id', business_id).execute()
        
        return jsonify({'message': 'Business hours deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting business hours: {e}")
        return jsonify({'error': 'Failed to delete business hours'}), 500
