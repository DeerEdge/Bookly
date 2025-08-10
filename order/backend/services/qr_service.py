import os
import logging
import requests
from qrcodegen import QrCode
from config import Config

logger = logging.getLogger(__name__)

class QRCodeService:
    def __init__(self):
        try:
            self.bucket_name = 'business-qr-codes'
            self.enabled = True
            # Validate configuration
            Config.validate_supabase_config()
        except Exception as e:
            logger.error(f"Failed to initialize QR code service: {e}")
            self.enabled = False

    def _qr_code_to_svg(self, qr_code, scale=4):
        """Convert QR code to SVG string"""
        size = qr_code.get_size()
        svg_size = size * scale

        svg_parts = [
            f'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 {svg_size} {svg_size}" stroke="none">',
            f'<rect width="{svg_size}" height="{svg_size}" fill="white"/>'
        ]

        for y in range(size):
            for x in range(size):
                if qr_code.get_module(x, y):
                    svg_parts.append(
                        f'<rect x="{x * scale}" y="{y * scale}" width="{scale}" height="{scale}" fill="black"/>'
                    )

        svg_parts.append('</svg>')
        return ''.join(svg_parts)

    def _ensure_bucket_exists(self):
        """Ensure the bucket exists, create if it doesn't"""
        try:
            # Check if bucket exists by trying to list it
            url = f"{Config.SUPABASE_URL}/storage/v1/bucket"
            headers = {
                'Authorization': f'Bearer {Config.SUPABASE_SERVICE_KEY}',
                'apikey': Config.SUPABASE_SERVICE_KEY
            }
            
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                buckets = response.json()
                bucket_names = [bucket.get('name', '') for bucket in buckets]
                
                if self.bucket_name in bucket_names:
                    logger.info(f"Bucket {self.bucket_name} already exists")
                    return True
            
            # Try to create the bucket if it doesn't exist
            create_url = f"{Config.SUPABASE_URL}/storage/v1/bucket"
            create_data = {
                'id': self.bucket_name,
                'name': self.bucket_name,
                'public': True  # Make bucket public so QR codes are accessible
            }
            
            create_response = requests.post(create_url, headers=headers, json=create_data)
            if create_response.status_code == 200:
                logger.info(f"Created public bucket: {self.bucket_name}")
                return True
            else:
                logger.warning(f"Could not create bucket: {create_response.text}")
                return True  # Continue anyway
                
        except Exception as e:
            logger.error(f"Error in bucket handling: {e}")
            return False

    def generate_business_qr_code(self, business_id, business_slug, business_name):
        """Generate QR code for a business and upload to Supabase storage"""
        if not self.enabled:
            logger.error("QR code service not available")
            return None

        try:
            # Try to ensure bucket exists
            self._ensure_bucket_exists()

            # Create the URL that the QR code will point to
            base_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
            booking_url = f"{base_url}/{business_slug}"

            # Generate QR code
            qr_code = QrCode.encode_text(booking_url, QrCode.Ecc.MEDIUM)

            # Convert to SVG string
            svg_content = self._qr_code_to_svg(qr_code, scale=4)

            # Create filename
            filename = f"{business_id}.svg"

            # Upload to Supabase storage using REST API
            try:
                upload_url = f"{Config.SUPABASE_URL}/storage/v1/object/{self.bucket_name}/{filename}"
                
                headers = {
                    'Authorization': f'Bearer {Config.SUPABASE_SERVICE_KEY}',
                    'apikey': Config.SUPABASE_SERVICE_KEY,
                    'Content-Type': 'image/svg+xml'
                }
                
                # Convert SVG content to bytes
                svg_bytes = svg_content.encode('utf-8')
                
                # Upload with upsert option
                upload_data = {
                    'upsert': True
                }
                
                response = requests.post(
                    upload_url, 
                    headers=headers, 
                    data=svg_bytes,
                    params=upload_data
                )

                if response.status_code == 200:
                    # Update the business record with the QR code filename
                    self._update_business_qr_code_name(business_id, filename)
                    
                    # Get the download URL (not public URL)
                    download_url = self.get_business_qr_code_download_url(business_id)
                    logger.info(f"QR code uploaded successfully: {download_url}")
                    return download_url
                else:
                    logger.error(f"Failed to upload QR code: HTTP {response.status_code}")
                    logger.error(f"Response: {response.text}")
                    return None

            except Exception as upload_error:
                logger.error(f"Error uploading QR code to storage: {upload_error}")
                # Try to get existing URL if upload failed
                try:
                    existing_url = self.get_business_qr_code_download_url(business_id)
                    if existing_url:
                        logger.info(f"Using existing QR code: {existing_url}")
                        return existing_url
                except:
                    pass
                return None

        except Exception as e:
            logger.error(f"Error generating QR code: {e}")
            return None

    def _update_business_qr_code_name(self, business_id, filename):
        """Update the business record with the QR code filename"""
        try:
            update_url = f"{Config.SUPABASE_URL}/rest/v1/businesses?id=eq.{business_id}"
            
            headers = {
                'Authorization': f'Bearer {Config.SUPABASE_SERVICE_KEY}',
                'apikey': Config.SUPABASE_SERVICE_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
            
            update_data = {
                'qr_code_name': filename  # Store the actual filename
            }
            
            response = requests.patch(update_url, headers=headers, json=update_data)
            
            if response.status_code == 200:
                logger.info(f"Updated business {business_id} with QR code filename: {filename}")
                return True
            else:
                logger.warning(f"Could not update business QR code name: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error updating business QR code name: {e}")
            return False

    def get_business_qr_code_download_url(self, business_id):
        """Get the download URL for a business's QR code using proper Supabase storage method"""
        if not self.enabled:
            return None

        try:
            # For frontend display, return the Flask endpoint that serves the image
            # This avoids authentication issues and serves the SVG directly
            base_url = os.getenv('FLASK_URL', 'http://localhost:3001')
            image_url = f"{base_url}/api/businesses/{business_id}/qr-code/image"
            return image_url
        except Exception as e:
            logger.error(f"Error getting QR code download URL: {e}")
            return None

    def get_business_qr_code_url(self, business_id):
        """Get the public URL for a business's QR code (deprecated - use download URL instead)"""
        if not self.enabled:
            return None

        try:
            filename = f"{business_id}.svg"
            # Try public URL first, but this may not work due to storage policies
            public_url = f"{Config.SUPABASE_URL}/storage/v1/object/public/{self.bucket_name}/{filename}"
            return public_url
        except Exception as e:
            logger.error(f"Error getting QR code URL: {e}")
            return None

    def delete_business_qr_code(self, business_id):
        """Delete a business's QR code from storage"""
        if not self.enabled:
            return False

        try:
            filename = f"{business_id}.svg"
            delete_url = f"{Config.SUPABASE_URL}/storage/v1/object/{self.bucket_name}/{filename}"
            
            headers = {
                'Authorization': f'Bearer {Config.SUPABASE_SERVICE_KEY}',
                'apikey': Config.SUPABASE_SERVICE_KEY
            }
            
            response = requests.delete(delete_url, headers=headers)
            
            if response.status_code == 200:
                logger.info(f"QR code deleted: {filename}")
                return True
            else:
                logger.warning(f"Could not delete QR code: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error deleting QR code: {e}")
            return False
