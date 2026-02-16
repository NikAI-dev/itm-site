"""
Configuration management for the ITM-Site backend.
Reads from .env file or uses sensible defaults.
"""

import os
from pathlib import Path

# Load .env if it exists
def load_env():
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    key, value = line.split("=", 1)
                    os.environ.setdefault(key.strip(), value.strip())

load_env()

class Config:
    """Base configuration"""
    # Flask
    DEBUG = False
    ENV = os.getenv("FLASK_ENV", "development")
    
    # Blocks
    BLOCKS_DIR = os.getenv("BLOCKS_DIR", os.path.dirname(__file__))
    BLOCKS_JSON = os.getenv("BLOCKS_JSON", "blocks.json")
    
    # API
    HOST = os.getenv("API_HOST", "0.0.0.0")
    PORT = int(os.getenv("API_PORT", 5000))
    ALLOWED_ORIGINS = os.getenv(
        "API_ALLOWED_ORIGINS", 
        "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")
    
    # File Upload
    MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", 10))
    MAX_IMAGE_WIDTH = int(os.getenv("MAX_IMAGE_WIDTH", 512))
    MIN_IMAGE_WIDTH = int(os.getenv("MIN_IMAGE_WIDTH", 1))
    
    # Processing
    CONVERSION_TIMEOUT_SECONDS = int(os.getenv("CONVERSION_TIMEOUT_SECONDS", 30))


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    ENV = "development"


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    ENV = "production"


# Select config based on environment
if os.getenv("FLASK_ENV") == "production":
    config = ProductionConfig()
else:
    config = DevelopmentConfig()
