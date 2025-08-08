from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import uuid
import logging
from services.database import DatabaseService

time_slots_bp = Blueprint('time_slots', __name__)
logger = logging.getLogger(__name__)

# Initialize database service
try:
    db_service = DatabaseService()
    supabase = db_service.get_supabase_client()
except Exception as e:
    logger.error(f"Failed to initialize database service: {e}")
    db_service = None
    supabase = None

@time_slots_bp.route('/business/<business_id>/available', methods=['GET'])
def get_available_slots(business_id):
    """Get available time slots for a business"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        date = request.args.get('date')
        service_id = request.args.get('service_id')
        
        if not date:
            return jsonify({'error': 'Date parameter is required'}), 400
        
        # Get available slots for the business and date
        query = supabase.table('time_slots').select('*').eq('business_id', business_id).eq('slot_date', date).eq('status', 'available')
        
        if service_id:
            query = query.eq('service_id', service_id)
        
        result = query.execute()
        
        return jsonify(result.data)
    except Exception as e:
        logger.error(f"Error fetching available slots: {e}")
        return jsonify({'error': 'Failed to fetch available slots'}), 500

@time_slots_bp.route('/business/<business_id>/generate', methods=['POST'])
def generate_time_slots(business_id):
    """Generate time slots for a business for a date range"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        data = request.get_json()
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        service_id = data.get('service_id')
        
        if not start_date or not end_date:
            return jsonify({'error': 'Start date and end date are required'}), 400
        
        # Get business hours
        hours_result = supabase.table('business_hours').select('*').eq('business_id', business_id).execute()
        business_hours = {hour['day_of_week']: hour for hour in hours_result.data}
        
        # Get service details
        service_result = supabase.table('services').select('*').eq('id', service_id).execute()
        if not service_result.data:
            return jsonify({'error': 'Service not found'}), 404
        
        service = service_result.data[0]
        
        # Generate slots for each day in the range
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        
        generated_slots = []
        
        current_date = start
        while current_date <= end:
            day_of_week = current_date.weekday()
            
            if day_of_week in business_hours and not business_hours[day_of_week]['is_closed']:
                open_time = business_hours[day_of_week]['open_time']
                close_time = business_hours[day_of_week]['close_time']
                
                if open_time and close_time:
                    # Generate slots for this day
                    slots = generate_slots_for_day(
                        business_id, 
                        service_id, 
                        current_date.strftime('%Y-%m-%d'),
                        open_time,
                        close_time,
                        service['duration']
                    )
                    generated_slots.extend(slots)
            
            current_date += timedelta(days=1)
        
        # Insert slots into database
        if generated_slots:
            result = supabase.table('time_slots').insert(generated_slots).execute()
            return jsonify({
                'message': f'Generated {len(generated_slots)} time slots',
                'slots': result.data
            })
        else:
            return jsonify({'message': 'No slots generated (business closed on specified dates)'})
            
    except Exception as e:
        logger.error(f"Error generating time slots: {e}")
        return jsonify({'error': 'Failed to generate time slots'}), 500

def generate_slots_for_day(business_id, service_id, date, open_time, close_time, duration):
    """Generate time slots for a specific day"""
    slots = []
    
    # Parse times
    open_dt = datetime.strptime(open_time, '%H:%M')
    close_dt = datetime.strptime(close_time, '%H:%M')
    
    # Generate slots
    current_time = open_dt
    while current_time + timedelta(minutes=duration) <= close_dt:
        slot = {
            'id': str(uuid.uuid4()),
            'business_id': business_id,
            'service_id': service_id,
            'slot_date': date,
            'slot_time': current_time.strftime('%H:%M'),
            'duration': duration,
            'status': 'available'
        }
        slots.append(slot)
        
        # Move to next slot (assuming 30-minute intervals)
        current_time += timedelta(minutes=30)
    
    return slots

@time_slots_bp.route('/<slot_id>/book', methods=['PUT'])
def book_time_slot(slot_id):
    """Book a time slot"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        data = request.get_json()
        appointment_id = data.get('appointment_id')
        
        if not appointment_id:
            return jsonify({'error': 'Appointment ID is required'}), 400
        
        # Update slot status to booked
        result = supabase.table('time_slots').update({
            'status': 'booked',
            'appointment_id': appointment_id,
            'updated_at': datetime.now().isoformat()
        }).eq('id', slot_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Time slot not found'}), 404
        
        return jsonify(result.data[0])
    except Exception as e:
        logger.error(f"Error booking time slot: {e}")
        return jsonify({'error': 'Failed to book time slot'}), 500

@time_slots_bp.route('/<slot_id>/release', methods=['PUT'])
def release_time_slot(slot_id):
    """Release a booked time slot"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        # Update slot status to available
        result = supabase.table('time_slots').update({
            'status': 'available',
            'appointment_id': None,
            'updated_at': datetime.now().isoformat()
        }).eq('id', slot_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Time slot not found'}), 404
        
        return jsonify(result.data[0])
    except Exception as e:
        logger.error(f"Error releasing time slot: {e}")
        return jsonify({'error': 'Failed to release time slot'}), 500

@time_slots_bp.route('/business/<business_id>/block', methods=['POST'])
def block_time_slots(business_id):
    """Block time slots for a business"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        data = request.get_json()
        date = data.get('date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        reason = data.get('reason', 'Blocked by business')
        
        if not date or not start_time or not end_time:
            return jsonify({'error': 'Date, start time, and end time are required'}), 400
        
        # Create blocked slots
        blocked_slots = []
        current_time = datetime.strptime(start_time, '%H:%M')
        end_dt = datetime.strptime(end_time, '%H:%M')
        
        while current_time < end_dt:
            slot = {
                'id': str(uuid.uuid4()),
                'business_id': business_id,
                'slot_date': date,
                'slot_time': current_time.strftime('%H:%M'),
                'duration': 30,
                'status': 'blocked',
                'notes': reason
            }
            blocked_slots.append(slot)
            current_time += timedelta(minutes=30)
        
        if blocked_slots:
            result = supabase.table('time_slots').insert(blocked_slots).execute()
            return jsonify({
                'message': f'Blocked {len(blocked_slots)} time slots',
                'slots': result.data
            })
        else:
            return jsonify({'message': 'No slots to block'})
            
    except Exception as e:
        logger.error(f"Error blocking time slots: {e}")
        return jsonify({'error': 'Failed to block time slots'}), 500
