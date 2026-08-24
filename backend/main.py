from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import sys
import io
import traceback
import urllib.request
import re
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

# Scraper for docs.python.org
def scrape_python_org_doc(url: str) -> str:
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            html = response.read().decode('utf-8')
            
        # Extract text content between body / class="body" tags
        body_match = re.search(r'<section[^>]*class="body"[^>]*>(.*?)</section>', html, re.DOTALL)
        if not body_match:
            body_match = re.search(r'<div[^>]*class="body"[^>]*>(.*?)</div[^>]*>', html, re.DOTALL)
            
        if body_match:
            content = body_match.group(1)
            # Remove scripts and style tags
            content = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.DOTALL)
            content = re.sub(r'<style[^>]*>.*?</style>', '', content, flags=re.DOTALL)
            # Convert basic tags to simple markdown-ish format
            content = re.sub(r'<h1[^>]*>(.*?)</h1>', r'\n# \1\n', content, flags=re.DOTALL)
            content = re.sub(r'<h2[^>]*>(.*?)</h2>', r'\n## \1\n', content, flags=re.DOTALL)
            content = re.sub(r'<h3[^>]*>(.*?)</h3>', r'\n### \1\n', content, flags=re.DOTALL)
            content = re.sub(r'<p[^>]*>(.*?)</p>', r'\n\1\n', content, flags=re.DOTALL)
            content = re.sub(r'<pre[^>]*>(.*?)</pre>', r'\n```python\n\1\n```\n', content, flags=re.DOTALL)
            content = re.sub(r'<code[^>]*>(.*?)</code>', r'`\1`', content, flags=re.DOTALL)
            # Strip remaining tags
            content = re.sub(r'<[^>]*>', '', content)
            # Unescape HTML entities
            content = content.replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&').replace('&quot;', '"')
            return content.strip()
    except Exception as e:
        print(f"Scraper error: {e}")
    return ""

# Startup database seeding
@app.on_event("startup")
def seed_database():
    db = next(get_db())
    
    # 1. Seed Interview questions
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
            )
        ]
        db.add_all(questions)
        db.commit()

    # 2. Seed Documentation topics
    if db.query(models.DocumentationTopic).count() == 0:
        doc_topics = [
            models.DocumentationTopic(
                topic_name="Metaclasses",
                python_org_url="https://docs.python.org/3/reference/datamodel.html#metaclasses",
                parsed_markdown="""# Metaclasses in Python

According to the official **Python 3 Data Model Reference**:
By default, classes are constructed using `type()`. The class body is executed in a new namespace and the class name is bound locally to the result of `type(name, bases, dict)`.

### Defining Metaclasses
A metaclass is a class whose instances are classes. Metaclasses can be defined by passing the `metaclass` keyword argument in the class definition:
```python
class Meta(type):
    def __new__(cls, name, bases, dct):
        x = super().__new__(cls, name, bases, dct)
        x.custom_attribute = 'added_by_metaclass'
        return x

class MyClass(metaclass=Meta):
    pass

print(MyClass.custom_attribute) # Output: 'added_by_metaclass'
```
"""
            ),
            models.DocumentationTopic(
                topic_name="Python Data Model",
                python_org_url="https://docs.python.org/3/reference/datamodel.html",
                parsed_markdown="""# The Python Data Model

The Python Data Model is the backbone of Python's **Object-Oriented design**. Objects are Python's abstraction for data. All data in a Python program is represented by objects or by relations between objects.

### Special Methods (Dunder Methods)
Dunder methods allow custom user-defined classes to hook into built-in operators:
*   `__init__(self, ...)`: Constructor initialization.
*   `__str__(self)`: Human-readable string representation (`str()`).
*   `__repr__(self)`: Formal developer string representation (`repr()`).
*   `__len__(self)`: Emulates sequence size calculations (`len()`).
*   `__getitem__(self, key)`: Subscript indexing access (`obj[key]`).
"""
            ),
            models.DocumentationTopic(
                topic_name="Decorators",
                python_org_url="https://docs.python.org/3/reference/compound_stmts.html#function-definitions",
                parsed_markdown="""# Function Decorators

A function definition may be wrapped by one or more **decorator expressions**. Decorators are evaluated when the function is defined, in the scope that contains the function definition.

### Syntactic Sugar
A decorator expression `@decorator` is syntactic sugar for re-binding the function object:
```python
@dec2
@dec1
def func():
    pass

# is equivalent to:
func = dec2(dec1(func))
```
"""
            ),
            models.DocumentationTopic(
                topic_name="Asynchronous Programming",
                python_org_url="https://docs.python.org/3/library/asyncio.html",
                parsed_markdown="""# Asynchronous Programming (asyncio)

`asyncio` is a library to write concurrent code using the **async/await** syntax. It is used as a foundation for multiple asynchronous frameworks.

### Event Loops and Coroutines
A coroutine is a function declared with `async def`. Coroutines can be awaited using the `await` keyword within other coroutines.
```python
import asyncio

async def main():
    print('hello')
    await asyncio.sleep(1)
    print('world')

asyncio.run(main())
```
"""
            )
        ]
        db.add_all(doc_topics)
        db.commit()

    # 3. Seed ChallengeProblems
    if db.query(models.ChallengeProblem).count() == 0:
        challenges = [
            models.ChallengeProblem(
                title="Singleton Metaclass Pattern",
                difficulty="Hard",
                category="Metaclasses",
                description="Implement a metaclass named `Singleton` that ensures a class has only one instance. When instantiation is called again, return the cached instance.",
                starter_code="""class Singleton(type):
    # Implement the metaclass singleton cache
    _instances = {}
    def __call__(cls, *args, **kwargs):
        pass

class Logger(metaclass=Singleton):
    def __init__(self):
        self.log_file = "app.log"

logger1 = Logger()
logger2 = Logger()
print("Same instance:", logger1 is logger2)  # Expected: True
""",
                solution_code="""class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Logger(metaclass=Singleton):
    def __init__(self):
        self.log_file = "app.log"

logger1 = Logger()
logger2 = Logger()
print("Same instance:", logger1 is logger2)
""",
                reference_url="https://docs.python.org/3/reference/datamodel.html#metaclasses"
            ),
            models.ChallengeProblem(
                title="Memoization Decorator",
                difficulty="Medium",
                category="Decorators",
                description="Write a decorator named `memoize` that caches the result of function arguments to optimize subsequent calls of identical inputs (such as Fibonacci calculations).",
                starter_code="""def memoize(func):
    # Implement caching wrapper
    pass

@memoize
def fib(n):
    if n < 2: return n
    return fib(n-1) + fib(n-2)

print("Fibonacci(30) value:", fib(30))  # Expected: 832040
""",
                solution_code="""def memoize(func):
    cache = {}
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    return wrapper

@memoize
def fib(n):
    if n < 2: return n
    return fib(n-1) + fib(n-2)

print("Fibonacci(30) value:", fib(30))
""",
                reference_url="https://docs.python.org/3/reference/compound_stmts.html#function-definitions"
            )
        ]
        db.add_all(challenges)
        db.commit()

    # 4. Seed CodeReviewSimulations
    if db.query(models.CodeReviewSimulation).count() == 0:
        reviews = [
            models.CodeReviewSimulation(
                title="Mutable Default Arguments",
                category="Python Data Model",
                code_with_bugs="""def append_to_list(element, target_list=[]):
    target_list.append(element)
    return target_list

# Demonstration of the unexpected state sharing bug:
list1 = append_to_list(10)
list2 = append_to_list(20)
print(list2) # Returns [10, 20] instead of [20]!
""",
                bug_line_number=1,
                explanation="In Python, default arguments are evaluated ONCE at function definition time. Using a mutable object (like a list `[]`) causes all function calls without custom list parameters to share the same object ref.",
                corrected_code="""def append_to_list(element, target_list=None):
    if target_list is None:
        target_list = []
    target_list.append(element)
    return target_list
"""
            ),
            models.CodeReviewSimulation(
                title="Improper Resource Cleanup",
                category="Context Managers",
                code_with_bugs="""def write_log(message):
    file = open("sys.log", "a")
    file.write(message + "\\n")
    # If file.write() fails/throws exception, the descriptor leaks!
    file.close()
""",
                bug_line_number=2,
                explanation="Opening files without context managers or try-finally guarantees file descriptors will leak in the event of mid-execution errors. The `with` statement calls `__exit__` automatically.",
                corrected_code="""def write_log(message):
    with open("sys.log", "a") as file:
        file.write(message + "\\n")
"""
            )
        ]
        db.add_all(reviews)
        db.commit()
        print("Successfully seeded all database items!")

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
        
    db_task.delete(db_task)
    db.commit()
    return {"detail": "Task deleted successfully"}

# 3D Visualizer Interview endpoints
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

# New Documentation & Code Review Endpoints
@app.get("/api/docs/topics", response_model=List[schemas.DocumentationTopicResponse])
def get_docs_topics(db: Session = Depends(get_db)):
    return db.query(models.DocumentationTopic).all()

@app.get("/api/docs/fetch", response_model=schemas.DocumentationTopicResponse)
def fetch_docs_topic(topic_name: str, db: Session = Depends(get_db)):
    topic = db.query(models.DocumentationTopic).filter(
        models.DocumentationTopic.topic_name == topic_name
    ).first()
    
    if not topic:
        raise HTTPException(status_code=404, detail="Documentation topic not found")
        
    # Attempt to fetch fresh from docs.python.org
    fresh_content = scrape_python_org_doc(topic.python_org_url)
    if fresh_content:
        topic.parsed_markdown = fresh_content
        db.commit()
        db.refresh(topic)
        
    return topic

@app.get("/api/challenges", response_model=List[schemas.ChallengeProblemResponse])
def get_challenges(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.ChallengeProblem)
    if category:
        query = query.filter(models.ChallengeProblem.category == category)
    return query.all()

@app.get("/api/codereview", response_model=List[schemas.CodeReviewSimulationResponse])
def get_reviews(db: Session = Depends(get_db)):
    return db.query(models.CodeReviewSimulation).all()
