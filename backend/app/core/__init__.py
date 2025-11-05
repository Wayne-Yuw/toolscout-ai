"""Core package initialization"""

from app.core.config import settings
# Database imports temporarily disabled for MVP (no database)
# from app.core.database import Base, engine, get_db

__all__ = ["settings"]  # "Base", "engine", "get_db"
