import os
import logging
from redmail import gmail
from datetime import datetime

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.gmail_username = os.getenv('GMAIL_USERNAME')
        self.gmail_password = os.getenv('GMAIL_PASSWORD')
        
        if not self.gmail_username or not self.gmail_password:
            logger.warning("GMAIL_USERNAME or GMAIL_PASSWORD not found. Email disabled.")
            self.enabled = False
        else:
            self.enabled = True
            # Configure Gmail
            gmail.username = self.gmail_username
            gmail.password = self.gmail_password
            logger.info("Email service enabled with Gmail")

    def send_appointment_confirmation(self, appointment_data, business_data, customer_data):
        """Send simple confirmation email to customer"""
        if not self.enabled:
            logger.warning("Email service disabled. Skipping email.")
            return False

        try:
            # Format date and time
            date = datetime.strptime(appointment_data['date'], '%Y-%m-%d').strftime('%A, %B %d, %Y')
            time = datetime.strptime(appointment_data['time'], '%H:%M').strftime('%I:%M %p')
            
            # Simple HTML email
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #3B82F6;">Appointment Confirmed!</h2>
                <p>Hi {customer_data['name']},</p>
                <p>Your appointment has been successfully booked.</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Appointment Details:</h3>
                    <p><strong>Business:</strong> {business_data['name']}</p>
                    <p><strong>Service:</strong> {appointment_data['service_name']}</p>
                    <p><strong>Date:</strong> {date}</p>
                    <p><strong>Time:</strong> {time}</p>
                    <p><strong>Price:</strong> ${appointment_data['service_price']}</p>
                    <p><strong>Address:</strong> {business_data['address']}</p>
                    <p><strong>Phone:</strong> {business_data['phone']}</p>
                </div>
                
                <p>Thank you for choosing {business_data['name']}!</p>
            </div>
            """
            
            # Simple text email
            text_content = f"""
Appointment Confirmation

Hi {customer_data['name']},

Your appointment has been successfully booked.

APPOINTMENT DETAILS:
Business: {business_data['name']}
Service: {appointment_data['service_name']}
Date: {date}
Time: {time}
Price: ${appointment_data['service_price']}
Address: {business_data['address']}
Phone: {business_data['phone']}

Thank you for choosing {business_data['name']}!
            """

            # Send email
            gmail.send(
                subject=f"Appointment Confirmation - {business_data['name']}",
                receivers=[customer_data['email']],
                html=html_content,
                text=text_content
            )
            
            logger.info(f"Confirmation email sent to {customer_data['email']}")
            return True

        except Exception as e:
            logger.error(f"Error sending confirmation email: {e}")
            return False

    def send_appointment_notification_to_business(self, appointment_data, business_data, customer_data):
        """Send simple notification email to business"""
        if not self.enabled:
            logger.warning("Email service disabled. Skipping email.")
            return False

        try:
            # Format date and time
            date = datetime.strptime(appointment_data['date'], '%Y-%m-%d').strftime('%A, %B %d, %Y')
            time = datetime.strptime(appointment_data['time'], '%H:%M').strftime('%I:%M %p')
            
            # Simple HTML email
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #10B981;">New Appointment Received</h2>
                <p>You have received a new appointment booking.</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Customer Information:</h3>
                    <p><strong>Name:</strong> {customer_data['name']}</p>
                    <p><strong>Email:</strong> {customer_data['email']}</p>
                    <p><strong>Phone:</strong> {customer_data.get('phone', 'Not provided')}</p>
                    
                    <h3>Appointment Details:</h3>
                    <p><strong>Service:</strong> {appointment_data['service_name']}</p>
                    <p><strong>Date:</strong> {date}</p>
                    <p><strong>Time:</strong> {time}</p>
                    <p><strong>Price:</strong> ${appointment_data['service_price']}</p>
                </div>
                
                <p>Please log into your dashboard to manage this appointment.</p>
            </div>
            """
            
            # Simple text email
            text_content = f"""
New Appointment Received

You have received a new appointment booking.

CUSTOMER INFORMATION:
Name: {customer_data['name']}
Email: {customer_data['email']}
Phone: {customer_data.get('phone', 'Not provided')}

APPOINTMENT DETAILS:
Service: {appointment_data['service_name']}
Date: {date}
Time: {time}
Price: ${appointment_data['service_price']}

Please log into your dashboard to manage this appointment.
            """

            # Send email
            gmail.send(
                subject=f"New Appointment - {customer_data['name']}",
                receivers=[business_data['email']],
                html=html_content,
                text=text_content
            )
            
            logger.info(f"Notification email sent to business {business_data['email']}")
            return True

        except Exception as e:
            logger.error(f"Error sending business notification email: {e}")
            return False
