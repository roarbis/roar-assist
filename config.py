import os
from dotenv import load_dotenv

# Explicitly load .env from the project root (not relying on cwd)
_basedir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_basedir, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-fallback-key')

    # Database configuration - PostgreSQL in production, SQLite for local dev
    DATABASE_URL = os.environ.get('DATABASE_URL')
    if DATABASE_URL:
        # Render provides DATABASE_URL, use PostgreSQL
        # Fix for sqlalchemy (postgres:// -> postgresql://)
        if DATABASE_URL.startswith('postgres://'):
            DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    else:
        # Local development - use SQLite
        SQLALCHEMY_DATABASE_URI = 'sqlite:///nutri_track.db'

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload
