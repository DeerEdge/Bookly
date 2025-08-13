from flask import Blueprint, request, jsonify
from datetime import datetime, date
import uuid
import logging
from services.database import DatabaseService

closed_dates_bp = Blueprint('closed_dates', __name__)
logger = logging.getLogger(__name__)

# Initialize database service
try:
    db_service = DatabaseService()
    supabase = db_service.get_supabase_client()
except Exception as e:
    logger.error(f"Failed to initialize database service: {e}")
    db_service = None
    supabase = None

@closed_dates_bp.route('/business/<business_id>', methods=['GET'])
def get_closed_dates(business_id):
    """Get all closed dates for a specific business"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        result = supabase.table('closed_dates').select('*').eq('business_id', business_id).execute()
        closed_dates = result.data
        
        # Convert to a simple list of date strings
        closed_date_list = [item['closed_date'] for item in closed_dates]
        
        return jsonify({'closed_dates': closed_date_list})
    except Exception as e:
        logger.error(f"Error fetching closed dates: {e}")
        return jsonify({'error': 'Failed to fetch closed dates'}), 500

@closed_dates_bp.route('/business/<business_id>', methods=['POST'])
def add_closed_date(business_id):
    """Add a closed date for a business"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        data = request.get_json()
        if not data or 'date' not in data:
            return jsonify({'error': 'Date is required'}), 400
        
        closed_date = data['date']
        reason = data.get('reason', '')
        
        # Validate date format
        try:
            datetime.strptime(closed_date, '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Insert the closed date
        closed_data = {
            'business_id': business_id,
            'closed_date': closed_date,
            'reason': reason
        }
        
        result = supabase.table('closed_dates').insert(closed_data).execute()
        
        if result.data:
            return jsonify({'message': 'Closed date added successfully', 'data': result.data[0]})
        else:
            return jsonify({'error': 'Failed to add closed date'}), 500
            
    except Exception as e:
        logger.error(f"Error adding closed date: {e}")
        # Handle duplicate key error
        if 'duplicate key' in str(e).lower():
            return jsonify({'error': 'This date is already marked as closed'}), 409
        return jsonify({'error': 'Failed to add closed date'}), 500

@closed_dates_bp.route('/business/<business_id>/date/<date_str>', methods=['DELETE'])
def remove_closed_date(business_id, date_str):
    """Remove a closed date for a business"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        # Validate date format
        try:
            datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Delete the closed date
        result = supabase.table('closed_dates').delete().eq('business_id', business_id).eq('closed_date', date_str).execute()
        
        return jsonify({'message': 'Closed date removed successfully'})
        
    except Exception as e:
        logger.error(f"Error removing closed date: {e}")
        return jsonify({'error': 'Failed to remove closed date'}), 500

@closed_dates_bp.route('/business/<business_id>/bulk', methods=['PUT'])
def update_closed_dates_bulk(business_id):
    """Update multiple closed dates at once"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        data = request.get_json()
        if not data or 'closed_dates' not in data:
            return jsonify({'error': 'closed_dates array is required'}), 400
        
        closed_dates = data['closed_dates']
        
        # Validate all dates first
        for date_str in closed_dates:
            try:
                datetime.strptime(date_str, '%Y-%m-%d')
            except ValueError:
                return jsonify({'error': f'Invalid date format: {date_str}. Use YYYY-MM-DD'}), 400
        
        # First, get all existing closed dates for this business
        existing_result = supabase.table('closed_dates').select('closed_date').eq('business_id', business_id).execute()
        existing_dates = set(item['closed_date'] for item in existing_result.data)
        
        new_dates = set(closed_dates)
        
        # Dates to add (in new_dates but not in existing_dates)
        dates_to_add = new_dates - existing_dates
        
        # Dates to remove (in existing_dates but not in new_dates)
        dates_to_remove = existing_dates - new_dates
        
        # Add new dates
        if dates_to_add:
            insert_data = [
                {
                    'business_id': business_id,
                    'closed_date': date_str,
                    'reason': 'Manually closed'
                }
                for date_str in dates_to_add
            ]
            supabase.table('closed_dates').insert(insert_data).execute()
        
        # Remove dates that are no longer closed
        if dates_to_remove:
            for date_str in dates_to_remove:
                supabase.table('closed_dates').delete().eq('business_id', business_id).eq('closed_date', date_str).execute()
        
        return jsonify({
            'message': 'Closed dates updated successfully',
            'added': len(dates_to_add),
            'removed': len(dates_to_remove)
        })
        
    except Exception as e:
        logger.error(f"Error updating closed dates in bulk: {e}")
        return jsonify({'error': 'Failed to update closed dates'}), 500

@closed_dates_bp.route('/business/<business_id>/check/<date_str>', methods=['GET'])
def check_if_closed(business_id, date_str):
    """Check if a specific date is closed for a business"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        # Validate date format
        try:
            datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        result = supabase.table('closed_dates').select('*').eq('business_id', business_id).eq('closed_date', date_str).execute()
        
        is_closed = len(result.data) > 0
        reason = result.data[0]['reason'] if is_closed else None
        
        return jsonify({
            'is_closed': is_closed,
            'reason': reason
        })
        
    except Exception as e:
        logger.error(f"Error checking if date is closed: {e}")
        return jsonify({'error': 'Failed to check date status'}), 500
