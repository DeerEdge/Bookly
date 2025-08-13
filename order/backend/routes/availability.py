from flask import Blueprint, request, jsonify
from datetime import datetime, date, timedelta
import uuid
import logging
from services.database import DatabaseService

availability_bp = Blueprint('availability', __name__)
logger = logging.getLogger(__name__)

# Initialize database service
try:
    db_service = DatabaseService()
    supabase = db_service.get_supabase_client()
except Exception as e:
    logger.error(f"Failed to initialize database service: {e}")
    db_service = None
    supabase = None

def get_day_of_week_key(date_obj):
    """Convert date to day key used in business hours"""
    day_map = {
        0: 'monday',    # Monday
        1: 'tuesday',   # Tuesday  
        2: 'wednesday', # Wednesday
        3: 'thursday',  # Thursday
        4: 'friday',    # Friday
        5: 'saturday',  # Saturday
        6: 'sunday'     # Sunday
    }
    return day_map.get(date_obj.weekday(), 'sunday')

def slots_to_time_ranges(selected_slots):
    """Convert slot numbers to HH:MM time strings"""
    times = []
    for slot in selected_slots:
        # Each slot is 30 minutes, starting from 5:00 AM (slot 0)
        hour = 5 + (slot // 2)
        minute = (slot % 2) * 30
        times.append(f"{hour:02d}:{minute:02d}")
    return times

@availability_bp.route('/business/<business_id>/date/<date_str>', methods=['GET'])
def get_available_slots(business_id, date_str):
    """Get available time slots for a specific business and date"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        # Validate date format
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Don't allow booking in the past
        if target_date < date.today():
            return jsonify({'available_slots': []})
        
        # Get day of week for business hours lookup
        day_key = get_day_of_week_key(target_date)
        day_number = {
            'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4,
            'friday': 5, 'saturday': 6, 'sunday': 0
        }.get(day_key, 0)
        
        # Step 1: Get business hours for this day
        hours_result = supabase.table('business_hours').select('*').eq('business_id', business_id).eq('day_of_week', day_number).execute()
        
        business_hours = None
        if hours_result.data:
            business_hours = hours_result.data[0]
        
        # If no business hours set or day is closed, return empty
        if not business_hours or business_hours.get('is_closed', False):
            return jsonify({'available_slots': []})
        
        # Get selected time slots for this day
        selected_slots = business_hours.get('selected_slots', [])
        if not selected_slots:
            return jsonify({'available_slots': []})
        
        # Convert slots to time strings
        available_times = slots_to_time_ranges(selected_slots)
        
        # Step 2: Check if this specific date is marked as closed
        try:
            closed_result = supabase.table('closed_dates').select('*').eq('business_id', business_id).eq('closed_date', date_str).execute()
            if closed_result.data:
                # Date is specifically closed
                return jsonify({'available_slots': []})
        except Exception as e:
            # If closed_dates table doesn't exist, continue without checking
            logger.warning(f"Could not check closed dates: {e}")
        
        # Step 3: Get existing appointments for this date
        appointments_result = supabase.table('appointments').select('appointment_time').eq('business_id', business_id).eq('appointment_date', date_str).execute()
        
        booked_times = set()
        if appointments_result.data:
            for apt in appointments_result.data:
                apt_time = apt.get('appointment_time', '')
                if apt_time:
                    # Normalize to HH:MM format
                    booked_times.add(apt_time[:5])
        
        # Step 4: Filter out booked times
        available_slots = [time for time in available_times if time not in booked_times]
        
        # Step 5: If it's today, filter out past times
        if target_date == date.today():
            current_time = datetime.now().time()
            available_slots = [
                time for time in available_slots 
                if datetime.strptime(time, '%H:%M').time() > current_time
            ]
        
        return jsonify({
            'available_slots': available_slots,
            'business_hours': {
                'day': day_key,
                'is_open': not business_hours.get('is_closed', False),
                'selected_slots': selected_slots
            },
            'booked_times': list(booked_times),
            'date': date_str
        })
        
    except Exception as e:
        logger.error(f"Error getting available slots: {e}")
        return jsonify({'error': 'Failed to get available slots'}), 500

@availability_bp.route('/business/<business_id>/range', methods=['GET'])
def get_available_slots_range(business_id):
    """Get available slots for a date range"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        # Get query parameters
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        if not start_date_str or not end_date_str:
            return jsonify({'error': 'start_date and end_date parameters required'}), 400
        
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        if end_date < start_date:
            return jsonify({'error': 'end_date must be after start_date'}), 400
        
        # Limit range to prevent abuse
        if (end_date - start_date).days > 30:
            return jsonify({'error': 'Date range cannot exceed 30 days'}), 400
        
        # Get availability for each date in range
        availability_by_date = {}
        current_date = start_date
        
        while current_date <= end_date:
            date_str = current_date.strftime('%Y-%m-%d')
            
            # Use the single date endpoint logic
            try:
                # This is a bit of a hack - we're calling our own endpoint internally
                # In a real app, you'd extract the logic to a shared function
                day_key = get_day_of_week_key(current_date)
                day_number = {
                    'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4,
                    'friday': 5, 'saturday': 6, 'sunday': 0
                }.get(day_key, 0)
                
                # Get business hours
                hours_result = supabase.table('business_hours').select('*').eq('business_id', business_id).eq('day_of_week', day_number).execute()
                
                if not hours_result.data or hours_result.data[0].get('is_closed', False):
                    availability_by_date[date_str] = []
                else:
                    business_hours = hours_result.data[0]
                    selected_slots = business_hours.get('selected_slots', [])
                    available_times = slots_to_time_ranges(selected_slots)
                    
                    # Check closed dates
                    try:
                        closed_result = supabase.table('closed_dates').select('*').eq('business_id', business_id).eq('closed_date', date_str).execute()
                        if closed_result.data:
                            availability_by_date[date_str] = []
                            current_date += timedelta(days=1)
                            continue
                    except:
                        pass
                    
                    # Get appointments
                    appointments_result = supabase.table('appointments').select('appointment_time').eq('business_id', business_id).eq('appointment_date', date_str).execute()
                    
                    booked_times = set()
                    if appointments_result.data:
                        for apt in appointments_result.data:
                            apt_time = apt.get('appointment_time', '')
                            if apt_time:
                                booked_times.add(apt_time[:5])
                    
                    # Filter available times
                    available_slots = [time for time in available_times if time not in booked_times]
                    
                    # Filter past times if today
                    if current_date == date.today():
                        current_time = datetime.now().time()
                        available_slots = [
                            time for time in available_slots 
                            if datetime.strptime(time, '%H:%M').time() > current_time
                        ]
                    
                    availability_by_date[date_str] = available_slots
                    
            except Exception as e:
                logger.error(f"Error processing date {date_str}: {e}")
                availability_by_date[date_str] = []
            
            current_date += timedelta(days=1)
        
        return jsonify({
            'availability': availability_by_date,
            'start_date': start_date_str,
            'end_date': end_date_str
        })
        
    except Exception as e:
        logger.error(f"Error getting availability range: {e}")
        return jsonify({'error': 'Failed to get availability range'}), 500

@availability_bp.route('/business/<business_id>/summary', methods=['GET'])
def get_business_availability_summary(business_id):
    """Get a summary of business availability (business hours + closed dates)"""
    try:
        if not supabase:
            return jsonify({'error': 'Database connection not available'}), 500
        
        # Get all business hours
        hours_result = supabase.table('business_hours').select('*').eq('business_id', business_id).execute()
        
        # Convert to day-based format
        hours_by_day = {}
        for hour in hours_result.data:
            day_map = {
                0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
                4: 'thursday', 5: 'friday', 6: 'saturday'
            }
            day_name = day_map.get(hour['day_of_week'])
            if day_name:
                selected_slots = hour.get('selected_slots', [])
                hours_by_day[day_name] = {
                    'is_open': not hour.get('is_closed', False),
                    'selected_slots': selected_slots,
                    'available_times': slots_to_time_ranges(selected_slots) if selected_slots else []
                }
        
        # Fill in missing days
        for day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']:
            if day not in hours_by_day:
                hours_by_day[day] = {
                    'is_open': False,
                    'selected_slots': [],
                    'available_times': []
                }
        
        # Get closed dates (next 30 days)
        start_date = date.today()
        end_date = start_date + timedelta(days=30)
        
        closed_dates = []
        try:
            closed_result = supabase.table('closed_dates').select('*').eq('business_id', business_id).gte('closed_date', start_date.strftime('%Y-%m-%d')).lte('closed_date', end_date.strftime('%Y-%m-%d')).execute()
            closed_dates = [item['closed_date'] for item in closed_result.data]
        except Exception as e:
            logger.warning(f"Could not get closed dates: {e}")
        
        return jsonify({
            'business_hours': hours_by_day,
            'closed_dates': closed_dates,
            'summary_period': {
                'start': start_date.strftime('%Y-%m-%d'),
                'end': end_date.strftime('%Y-%m-%d')
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting availability summary: {e}")
        return jsonify({'error': 'Failed to get availability summary'}), 500
