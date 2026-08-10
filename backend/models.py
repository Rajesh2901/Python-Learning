from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from database import Base

class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(String, unique=True, index=True)
    completed = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CustomTask(Base):
    __tablename__ = "custom_tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    priority = Column(String, default="medium")  # low, medium, high
    done = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
