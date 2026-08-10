from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import sys
import io
import traceback
from typing import List, Optional

import models
import schemas
from database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Python Mastery Backend API")

# Configure CORS for Angular Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Safe Code Execution Utility
def execute_python_code(code: str):
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    
    redirected_output = sys.stdout = io.StringIO()
    redirected_error = sys.stderr = io.StringIO()
    
    stdout, stderr, err_msg = "", "", None
    try:
        # Create an isolated global context
        local_scope = {}
        exec(code, {"__builtins__": __builtins__}, local_scope)
        stdout = redirected_output.getvalue()
        stderr = redirected_error.getvalue()
    except Exception as e:
        stdout = redirected_output.getvalue()
        stderr = redirected_error.getvalue()
        err_msg = "".join(traceback.format_exception_only(type(e), e)).strip()
    finally:
        sys.stdout = old_stdout
        sys.stderr = old_stderr
        
    return stdout, stderr, err_msg

# ==========================================================================
# ENDPOINTS
# ==========================================================================

@app.post("/api/run", response_model=schemas.CodeRunResponse)
def run_code(request: schemas.CodeRunRequest):
    stdout, stderr, error = execute_python_code(request.code)
    return schemas.CodeRunResponse(stdout=stdout, stderr=stderr, error=error)

@app.get("/api/progress", response_model=List[schemas.UserProgressResponse])
def get_all_progress(db: Session = Depends(get_db)):
    return db.query(models.UserProgress).all()

@app.post("/api/progress", response_model=schemas.UserProgressResponse)
def upsert_progress(progress: schemas.UserProgressCreate, db: Session = Depends(get_db)):
    db_progress = db.query(models.UserProgress).filter(
        models.UserProgress.topic_id == progress.topic_id
    ).first()
    
    if db_progress:
        db_progress.completed = progress.completed
    else:
        db_progress = models.UserProgress(
            topic_id=progress.topic_id,
            completed=progress.completed
        )
        db.add(db_progress)
        
    db.commit()
    db.refresh(db_progress)
    return db_progress

@app.get("/api/tasks", response_model=List[schemas.CustomTaskResponse])
def get_tasks(priority: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.CustomTask)
    if priority:
        query = query.filter(models.CustomTask.priority == priority)
    return query.all()

@app.post("/api/tasks", response_model=schemas.CustomTaskResponse)
def create_task(task: schemas.CustomTaskCreate, db: Session = Depends(get_db)):
    db_task = models.CustomTask(
        title=task.title,
        priority=task.priority,
        done=task.done
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.put("/api/tasks/{task_id}", response_model=schemas.CustomTaskResponse)
def update_task(task_id: int, task: schemas.CustomTaskCreate, db: Session = Depends(get_db)):
    db_task = db.query(models.CustomTask).filter(models.CustomTask.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    db_task.title = task.title
    db_task.priority = task.priority
    db_task.done = task.done
    
    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.CustomTask).filter(models.CustomTask.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    db.delete(db_task)
    db.commit()
    return {"detail": "Task deleted successfully"}
