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

# New Documentation & Code Review Schemas
class DocumentationTopicBase(BaseModel):
    topic_name: str
    python_org_url: str
    raw_html_content: Optional[str] = None
    parsed_markdown: Optional[str] = None

class DocumentationTopicCreate(DocumentationTopicBase):
    pass

class DocumentationTopicResponse(DocumentationTopicBase):
    id: int
    last_fetched: datetime

    class Config:
        from_attributes = True

class ChallengeProblemBase(BaseModel):
    title: str
    difficulty: str
    category: str
    description: str
    starter_code: str
    solution_code: str
    reference_url: str

class ChallengeProblemCreate(ChallengeProblemBase):
    pass

class ChallengeProblemResponse(ChallengeProblemBase):
    id: int

    class Config:
        from_attributes = True

class CodeReviewSimulationBase(BaseModel):
    title: str
    category: str
    code_with_bugs: str
    bug_line_number: int
    explanation: str
    corrected_code: str

class CodeReviewSimulationCreate(CodeReviewSimulationBase):
    pass

class CodeReviewSimulationResponse(CodeReviewSimulationBase):
    id: int

    class Config:
        from_attributes = True
