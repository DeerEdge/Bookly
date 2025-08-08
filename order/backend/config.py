import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Supabase Configuration
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY')
    SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
    
    # Flask Configuration
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    @classmethod
    def validate_supabase_config(cls):
        """Validate that Supabase configuration is present"""
        if not cls.SUPABASE_URL:
            raise ValueError("SUPABASE_URL environment variable is required")
        if not cls.SUPABASE_KEY:
            raise ValueError("SUPABASE_KEY environment variable is required")
        if not cls.SUPABASE_SERVICE_KEY:
            raise ValueError("SUPABASE_SERVICE_KEY environment variable is required")
