from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text
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

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    difficulty = Column(String, index=True) # Easy, Medium, Hard
    category = Column(String, index=True) # Array, Tree, Graph, Heap, Linked List, Stack/Queue, etc.
    frequency_index = Column(Float, default=1.0)
    company_tags = Column(String, index=True) # comma-separated e.g. "Meta,Google"
    problem_statement = Column(Text)
    starter_code = Column(Text)
    solution_code = Column(Text)

class UserPerformanceLog(Base):
    __tablename__ = "user_performance_logs"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, index=True)
    status = Column(String) # Success, Fail
    execution_time_ms = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
