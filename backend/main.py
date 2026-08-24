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

# Startup database seeding
@app.on_event("startup")
def seed_database():
    db = next(get_db())
    if db.query(models.InterviewQuestion).count() == 0:
        questions = [
            models.InterviewQuestion(
                title="Two Sum",
                difficulty="Easy",
                category="Array",
                frequency_index=9.5,
                company_tags="Google,Meta,Amazon,Apple",
                problem_statement="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
                starter_code="""def two_sum(nums, target):
    # Write your code here
    pass

# Testing the code
print(two_sum([2, 7, 11, 15], 9))  # Expected: [0, 1]
""",
                solution_code="""def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

print(two_sum([2, 7, 11, 15], 9))
"""
            ),
            models.InterviewQuestion(
                title="Merge Two Sorted Lists",
                difficulty="Easy",
                category="Linked List",
                frequency_index=8.2,
                company_tags="Amazon,Microsoft,Apple",
                problem_statement="Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.",
                starter_code="""class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def merge_two_lists(l1, l2):
    # Write your code here
    pass
""",
                solution_code="""class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def merge_two_lists(l1, l2):
    dummy = ListNode()
    curr = dummy
    while l1 and l2:
        if l1.val < l2.val:
            curr.next = l1
            l1 = l1.next
        else:
            curr.next = l2
            l2 = l2.next
        curr = curr.next
    curr.next = l1 or l2
    return dummy.next
"""
            ),
            models.InterviewQuestion(
                title="Binary Tree Level Order Traversal",
                difficulty="Medium",
                category="Tree",
                frequency_index=8.8,
                company_tags="Meta,Google,Amazon",
                problem_statement="Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
                starter_code="""class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def level_order(root):
    # Write your code here
    pass
""",
                solution_code="""class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def level_order(root):
    if not root:
        return []
    result = []
    queue = [root]
    while queue:
        level_size = len(queue)
        level = []
        for _ in range(level_size):
            node = queue.pop(0)
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result
"""
            ),
            models.InterviewQuestion(
                title="Number of Islands",
                difficulty="Medium",
                category="Graph",
                frequency_index=9.2,
                company_tags="Meta,Amazon,Google,Microsoft",
                problem_statement="Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
                starter_code="""def num_islands(grid):
    # Write your code here
    pass

grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]
print("Islands count:", num_islands(grid))  # Expected: 1
""",
                solution_code="""def num_islands(grid):
    if not grid:
        return 0
    count = 0
    rows, cols = len(grid), len(grid[0])
    
    def dfs(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] == "0":
            return
        grid[r][c] = "0"
        dfs(r+1, c)
        dfs(r-1, c)
        dfs(r, c+1)
        dfs(r, c-1)
        
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                count += 1
                dfs(r, c)
    return count
"""
            ),
            models.InterviewQuestion(
                title="Kth Largest Element in an Array",
                difficulty="Medium",
                category="Heap",
                frequency_index=7.5,
                company_tags="Meta,Amazon,Apple",
                problem_statement="Given an integer array nums and an integer k, return the kth largest element in the array.\n\nNote that it is the kth largest element in the sorted order, not the kth distinct element.",
                starter_code="""import heapq

def find_kth_largest(nums, k):
    # Write your code here
    pass

print(find_kth_largest([3,2,1,5,6,4], 2))  # Expected: 5
""",
                solution_code="""import heapq

def find_kth_largest(nums, k):
    heap = nums[:k]
    heapq.heapify(heap)
    for num in nums[k:]:
        if num > heap[0]:
            heapq.heappushpop(heap, num)
    return heap[0]

print(find_kth_largest([3,2,1,5,6,4], 2))
"""
            ),
            models.InterviewQuestion(
                title="Valid Parentheses",
                difficulty="Easy",
                category="Stack/Queue",
                frequency_index=8.9,
                company_tags="Meta,Google,Amazon,Microsoft,Apple",
                problem_statement="Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
                starter_code="""def is_valid(s):
    # Write your code here
    pass

print(is_valid("()[]{}"))  # Expected: True
""",
                solution_code="""def is_valid(s):
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack

print(is_valid("()[]{}"))
"""
            ),
            models.InterviewQuestion(
                title="Group Anagrams",
                difficulty="Medium",
                category="Hash Table",
                frequency_index=8.0,
                company_tags="Meta,Amazon,Apple",
                problem_statement="Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
                starter_code="""def group_anagrams(strs):
    # Write your code here
    pass

print(group_anagrams(["eat","tea","tan","ate","nat","bat"]))
""",
                solution_code="""from collections import defaultdict

def group_anagrams(strs):
    groups = defaultdict(list)
    for s in strs:
        key = "".join(sorted(s))
        groups[key].append(s)
    return list(groups.values())

print(group_anagrams(["eat","tea","tan","ate","nat","bat"]))
"""
            )
        ]
        db.add_all(questions)
        db.commit()
        print("Successfully seeded database with interview questions!")

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

# Interview Prep endpoints
@app.get("/api/questions", response_model=List[schemas.InterviewQuestionResponse])
def get_questions(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    company: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.InterviewQuestion)
    if category:
        query = query.filter(models.InterviewQuestion.category == category)
    if difficulty:
        query = query.filter(models.InterviewQuestion.difficulty == difficulty)
    if company:
        query = query.filter(models.InterviewQuestion.company_tags.like(f"%{company}%"))
    return query.all()

@app.get("/api/questions/{question_id}", response_model=schemas.InterviewQuestionResponse)
def get_question(question_id: int, db: Session = Depends(get_db)):
    question = db.query(models.InterviewQuestion).filter(models.InterviewQuestion.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question

@app.post("/api/performance", response_model=schemas.UserPerformanceLogResponse)
def log_performance(log: schemas.UserPerformanceLogCreate, db: Session = Depends(get_db)):
    db_log = models.UserPerformanceLog(
        question_id=log.question_id,
        status=log.status,
        execution_time_ms=log.execution_time_ms
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@app.get("/api/performance/history", response_model=List[schemas.UserPerformanceLogResponse])
def get_performance_history(db: Session = Depends(get_db)):
    return db.query(models.UserPerformanceLog).order_by(models.UserPerformanceLog.created_at.desc()).all()

@app.get("/api/recommendations", response_model=List[schemas.InterviewQuestionResponse])
def get_recommendations(db: Session = Depends(get_db)):
    failed_logs = db.query(models.UserPerformanceLog).filter(models.UserPerformanceLog.status == "Fail").all()
    failed_question_ids = [log.question_id for log in failed_logs]
    
    failed_categories = []
    if failed_question_ids:
        failed_questions = db.query(models.InterviewQuestion).filter(models.InterviewQuestion.id.in_(failed_question_ids)).all()
        failed_categories = list(set([q.category for q in failed_questions]))
        
    success_logs = db.query(models.UserPerformanceLog).filter(models.UserPerformanceLog.status == "Success").all()
    success_question_ids = list(set([log.question_id for log in success_logs]))
    
    recommendations = []
    if failed_categories:
        recommendations = db.query(models.InterviewQuestion).filter(
            models.InterviewQuestion.category.in_(failed_categories),
            ~models.InterviewQuestion.id.in_(success_question_ids)
        ).limit(3).all()
        
    if len(recommendations) < 3:
        needed = 3 - len(recommendations)
        extra = db.query(models.InterviewQuestion).filter(
            ~models.InterviewQuestion.id.in_(success_question_ids)
        ).order_by(models.InterviewQuestion.frequency_index.desc()).limit(needed).all()
        recommendations.extend(extra)
        
    return recommendations[:3]
