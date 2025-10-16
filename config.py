"""
Configuration module for the Flask app.
Loads environment variables from .env file.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base configuration."""
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
    REDIS_USERNAME = os.getenv("REDIS_USERNAME", "default")
    REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", False)

