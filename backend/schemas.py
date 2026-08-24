from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class UserProgressBase(BaseModel):
    topic_id: str
    completed: bool

class UserProgressCreate(UserProgressBase):
    pass

class UserProgressResponse(UserProgressBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

class CustomTaskBase(BaseModel):
    title: str
    priority: str
    done: bool = False

class CustomTaskCreate(CustomTaskBase):
    pass

class CustomTaskResponse(CustomTaskBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CodeRunRequest(BaseModel):
    code: str

class CodeRunResponse(BaseModel):
    stdout: str
    stderr: str
    error: Optional[str] = None

class InterviewQuestionBase(BaseModel):
    title: str
    difficulty: str
    category: str
    frequency_index: float
    company_tags: str
    problem_statement: str
    starter_code: str
    solution_code: str

class InterviewQuestionCreate(InterviewQuestionBase):
    pass

class InterviewQuestionResponse(InterviewQuestionBase):
    id: int

    class Config:
        from_attributes = True

class UserPerformanceLogBase(BaseModel):
    question_id: int
    status: str
    execution_time_ms: int

class UserPerformanceLogCreate(UserPerformanceLogBase):
    pass

class UserPerformanceLogResponse(UserPerformanceLogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
