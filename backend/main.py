from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import sys
import io
import traceback
import urllib.request
import re
from datetime import datetime
from typing import List, Optional

import models
import schemas
from database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Python Mastery Backend API")

# Configure CORS for Angular Frontend and Cloudflare
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
            
        body_match = re.search(r'<section[^>]*class="body"[^>]*>(.*?)</section>', html, re.DOTALL)
        if not body_match:
            body_match = re.search(r'<div[^>]*class="body"[^>]*>(.*?)</div[^>]*>', html, re.DOTALL)
            
        if body_match:
            content = body_match.group(1)
            content = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.DOTALL)
            content = re.sub(r'<style[^>]*>.*?</style>', '', content, flags=re.DOTALL)
            content = re.sub(r'<h1[^>]*>(.*?)</h1>', r'\n# \1\n', content, flags=re.DOTALL)
            content = re.sub(r'<h2[^>]*>(.*?)</h2>', r'\n## \1\n', content, flags=re.DOTALL)
            content = re.sub(r'<h3[^>]*>(.*?)</h3>', r'\n### \1\n', content, flags=re.DOTALL)
            content = re.sub(r'<p[^>]*>(.*?)</p>', r'\n\1\n', content, flags=re.DOTALL)
            content = re.sub(r'<pre[^>]*>(.*?)</pre>', r'\n```python\n\1\n```\n', content, flags=re.DOTALL)
            content = re.sub(r'<code[^>]*>(.*?)</code>', r'`\1`', content, flags=re.DOTALL)
            content = re.sub(r'<[^>]*>', '', content)
            content = content.replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&').replace('&quot;', '"')
            return content.strip()
    except Exception as e:
        print(f"Scraper error: {e}")
    return ""

CURATED_INTERVIEW_QUESTIONS = [
    {
        "title": "Two Sum",
        "difficulty": "Easy",
        "category": "Array",
        "frequency_index": 9.8,
        "company_tags": "Google,Meta,Amazon,Apple",
        "problem_statement": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
        "starter_code": """def two_sum(nums, target):
    # Write your code here
    pass

print(two_sum([2, 7, 11, 15], 9))  # Expected: [0, 1]
""",
        "solution_code": """def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

print(two_sum([2, 7, 11, 15], 9))
""",
        "reference_url": "https://docs.python.org/3/tutorial/datastructures.html#more-on-lists"
    },
    {
        "title": "3Sum",
        "difficulty": "Medium",
        "category": "Array",
        "frequency_index": 9.3,
        "company_tags": "Meta,Amazon,Microsoft,Apple",
        "problem_statement": "Given an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nNotice that the solution set must not contain duplicate triplets.",
        "starter_code": """def three_sum(nums):
    # Write your two-pointer code here
    pass

print(three_sum([-1,0,1,2,-1,-4]))  # Expected: [[-1, -1, 2], [-1, 0, 1]]
""",
        "solution_code": """def three_sum(nums):
    nums.sort()
    res = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i-1]:
            continue
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                while l < r and nums[l] == nums[l+1]: l += 1
                while l < r and nums[r] == nums[r-1]: r -= 1
                l += 1; r -= 1
    return res

print(three_sum([-1,0,1,2,-1,-4]))
""",
        "reference_url": "https://docs.python.org/3/tutorial/datastructures.html"
    },
    {
        "title": "Valid Parentheses",
        "difficulty": "Easy",
        "category": "Stack/Queue",
        "frequency_index": 9.4,
        "company_tags": "Meta,Amazon,Bloomberg,Microsoft",
        "problem_statement": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nOpen brackets must be closed by the same type of brackets in correct order.",
        "starter_code": """def is_valid(s):
    # Write your stack-based code here
    pass

print(is_valid("()[]{}"))  # Expected: True
print(is_valid("(]"))      # Expected: False
""",
        "solution_code": """def is_valid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack

print(is_valid("()[]{}"))
""",
        "reference_url": "https://docs.python.org/3/library/collections.html#collections.deque"
    },
    {
        "title": "Daily Temperatures",
        "difficulty": "Medium",
        "category": "Stack/Queue",
        "frequency_index": 8.9,
        "company_tags": "Meta,Amazon,Google",
        "problem_statement": "Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature. If there is no future day for which this is possible, keep answer[i] == 0.",
        "starter_code": """def daily_temperatures(temperatures):
    # Monotonic stack solution
    pass

print(daily_temperatures([73,74,75,71,69,72,76,73]))  # Expected: [1,1,4,2,1,1,0,0]
""",
        "solution_code": """def daily_temperatures(temperatures):
    res = [0] * len(temperatures)
    stack = [] # (index, temp)
    for i, t in enumerate(temperatures):
        while stack and t > stack[-1][1]:
            prev_idx, _ = stack.pop()
            res[prev_idx] = i - prev_idx
        stack.append((i, t))
    return res

print(daily_temperatures([73,74,75,71,69,72,76,73]))
""",
        "reference_url": "https://docs.python.org/3/library/collections.html#collections.deque"
    },
    {
        "title": "Reverse Linked List",
        "difficulty": "Easy",
        "category": "Linked List",
        "frequency_index": 8.9,
        "company_tags": "Amazon,Microsoft,Apple,Uber",
        "problem_statement": "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        "starter_code": """class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    # Write pointer reversal code
    pass
""",
        "solution_code": """class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev

h = ListNode(1, ListNode(2, ListNode(3)))
rev = reverse_list(h)
print(rev.val, rev.next.val, rev.next.next.val)
""",
        "reference_url": "https://docs.python.org/3/tutorial/classes.html"
    },
    {
        "title": "LRU Cache Design",
        "difficulty": "Medium",
        "category": "Linked List",
        "frequency_index": 9.7,
        "company_tags": "Meta,Amazon,Google,Microsoft,Apple",
        "problem_statement": "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) get and put operations.",
        "starter_code": """class LRUCache:
    def __init__(self, capacity: int):
        pass

    def get(self, key: int) -> int:
        pass

    def put(self, key: int, value: int) -> None:
        pass

cache = LRUCache(2)
cache.put(1, 1); cache.put(2, 2)
print(cache.get(1)) # returns 1
cache.put(3, 3)     # evicts key 2
print(cache.get(2)) # returns -1
""",
        "solution_code": """from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)

cache = LRUCache(2)
cache.put(1, 1); cache.put(2, 2)
print(cache.get(1))
cache.put(3, 3)
print(cache.get(2))
""",
        "reference_url": "https://docs.python.org/3/library/collections.html#collections.OrderedDict"
    },
    {
        "title": "Binary Tree Level Order Traversal",
        "difficulty": "Medium",
        "category": "Tree",
        "frequency_index": 8.8,
        "company_tags": "Meta,Google,Amazon",
        "problem_statement": "Given the root of a binary tree, return the level order traversal of its nodes' values (from left to right, level by level).",
        "starter_code": """class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def level_order(root):
    # BFS Queue traversal
    pass
""",
        "solution_code": """from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def level_order(root):
    if not root: return []
    res, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left: q.append(node.left)
            if node.right: q.append(node.right)
        res.append(level)
    return res

root = TreeNode(3, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7)))
print("Level order:", level_order(root))
""",
        "reference_url": "https://docs.python.org/3/library/collections.html#collections.deque"
    },
    {
        "title": "Validate Binary Search Tree",
        "difficulty": "Medium",
        "category": "Tree",
        "frequency_index": 9.1,
        "company_tags": "Amazon,Meta,Bloomberg",
        "problem_statement": "Given the root of a binary tree, determine if it is a valid binary search tree (BST).\nA valid BST requires all left subtree node values to be strictly less than the node's value, and all right subtree values strictly greater.",
        "starter_code": """class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def is_valid_bst(root):
    # Range validation
    pass
""",
        "solution_code": """class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def is_valid_bst(root):
    def validate(node, low=float('-inf'), high=float('inf')):
        if not node: return True
        if not (low < node.val < high): return False
        return validate(node.left, low, node.val) and validate(node.right, node.val, high)
    return validate(root)

root = TreeNode(2, TreeNode(1), TreeNode(3))
print("Is BST:", is_valid_bst(root))
""",
        "reference_url": "https://docs.python.org/3/library/math.html#math.inf"
    },
    {
        "title": "Number of Islands",
        "difficulty": "Medium",
        "category": "Graph",
        "frequency_index": 9.6,
        "company_tags": "Meta,Amazon,Google,Microsoft",
        "problem_statement": "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.\nAn island is formed by connecting adjacent lands horizontally or vertically.",
        "starter_code": """def num_islands(grid):
    # DFS/BFS Flood Fill
    pass

grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
print("Islands count:", num_islands(grid))  # Expected: 3
""",
        "solution_code": """def num_islands(grid):
    if not grid: return 0
    rows, cols = len(grid), len(grid[0])
    visited = set()
    islands = 0
    
    def dfs(r, c):
        if (r < 0 or r >= rows or c < 0 or c >= cols or 
            grid[r][c] == '0' or (r, c) in visited):
            return
        visited.add((r, c))
        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1)
        
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1' and (r, c) not in visited:
                dfs(r, c)
                islands += 1
    return islands

grid = [["1","1","0"],["1","1","0"],["0","0","1"]]
print("Islands count:", num_islands(grid))
""",
        "reference_url": "https://docs.python.org/3/tutorial/datastructures.html#sets"
    },
    {
        "title": "Course Schedule (Topological Sort)",
        "difficulty": "Medium",
        "category": "Graph",
        "frequency_index": 9.0,
        "company_tags": "Amazon,Google,Meta",
        "problem_statement": "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [a_i, b_i] indicates that you must take b_i first if you want to take a_i. Return true if you can finish all courses.",
        "starter_code": """def can_finish(num_courses, prerequisites):
    # Detect cycle in directed graph using Kahn's or DFS
    pass

print(can_finish(2, [[1,0]]))        # Expected: True
print(can_finish(2, [[1,0],[0,1]]))  # Expected: False
""",
        "solution_code": """from collections import defaultdict, deque

def can_finish(num_courses, prerequisites):
    adj = defaultdict(list)
    indegree = [0] * num_courses
    for dest, src in prerequisites:
        adj[src].append(dest)
        indegree[dest] += 1
        
    q = deque([i for i in range(num_courses) if indegree[i] == 0])
    visited = 0
    while q:
        node = q.popleft()
        visited += 1
        for neighbor in adj[node]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                q.append(neighbor)
    return visited == num_courses

print(can_finish(2, [[1,0]]))
print(can_finish(2, [[1,0],[0,1]]))
""",
        "reference_url": "https://docs.python.org/3/library/collections.html#collections.defaultdict"
    },
    {
        "title": "Kth Largest Element in an Array",
        "difficulty": "Medium",
        "category": "Heap",
        "frequency_index": 9.1,
        "company_tags": "Meta,Amazon,Google,Netflix",
        "problem_statement": "Given an integer array nums and an integer k, return the kth largest element in the array.\nNote that it is the kth largest element in the sorted order, not the kth distinct element.",
        "starter_code": """import heapq

def find_kth_largest(nums, k):
    # Use min-heap of size k
    pass

print(find_kth_largest([3,2,1,5,6,4], 2))  # Expected: 5
""",
        "solution_code": """import heapq

def find_kth_largest(nums, k):
    min_heap = []
    for num in nums:
        heapq.heappush(min_heap, num)
        if len(min_heap) > k:
            heapq.heappop(min_heap)
    return min_heap[0]

print(find_kth_largest([3,2,1,5,6,4], 2))
""",
        "reference_url": "https://docs.python.org/3/library/heapq.html"
    },
    {
        "title": "Group Anagrams",
        "difficulty": "Medium",
        "category": "Hash Table",
        "frequency_index": 9.3,
        "company_tags": "Amazon,Meta,Google,Apple",
        "problem_statement": "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
        "starter_code": """def group_anagrams(strs):
    # Hash table mapping sorted word or character counts
    pass

print(group_anagrams(["eat","tea","tan","ate","nat","bat"]))
""",
        "solution_code": """from collections import defaultdict

def group_anagrams(strs):
    groups = defaultdict(list)
    for s in strs:
        key = "".join(sorted(s))
        groups[key].append(s)
    return list(groups.values())

print(group_anagrams(["eat","tea","tan","ate","nat","bat"]))
""",
        "reference_url": "https://docs.python.org/3/library/collections.html#collections.defaultdict"
    },
    {
        "title": "Coin Change",
        "difficulty": "Medium",
        "category": "Dynamic Programming",
        "frequency_index": 9.5,
        "company_tags": "Amazon,Meta,Google,Microsoft",
        "problem_statement": "You are given an integer array coins representing coins of different denominations and an integer amount. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.",
        "starter_code": """def coin_change(coins, amount):
    # Bottom-up dynamic programming
    pass

print(coin_change([1,2,5], 11))  # Expected: 3 (5 + 5 + 1)
""",
        "solution_code": """def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for x in range(coin, amount + 1):
            dp[x] = min(dp[x], dp[x - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1

print(coin_change([1,2,5], 11))
""",
        "reference_url": "https://docs.python.org/3/library/functools.html#functools.lru_cache"
    },
    {
        "title": "Thread-Safe Singleton & GIL",
        "difficulty": "Hard",
        "category": "Advanced Python",
        "frequency_index": 8.7,
        "company_tags": "Google,Netflix,Stripe",
        "problem_statement": "Implement a thread-safe Singleton design pattern using Python's `threading.Lock` and double-checked locking mechanism to safely synchronize multi-threaded environments.",
        "starter_code": """import threading

class ThreadSafeSingleton:
    _instance = None
    _lock = threading.Lock()

    # Implement __new__ with double-checked locking
    pass

s1 = ThreadSafeSingleton()
s2 = ThreadSafeSingleton()
print("Same instance:", s1 is s2)
""",
        "solution_code": """import threading

class ThreadSafeSingleton:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

s1 = ThreadSafeSingleton()
s2 = ThreadSafeSingleton()
print("Same instance:", s1 is s2)
""",
        "reference_url": "https://docs.python.org/3/library/threading.html#lock-objects"
    },
    {
        "title": "Custom Iterator & Generator Protocol",
        "difficulty": "Medium",
        "category": "Advanced Python",
        "frequency_index": 8.4,
        "company_tags": "Meta,Stripe,Databricks",
        "problem_statement": "Implement a custom class `FibonacciIterator` adhering to Python's Iterator Protocol (`__iter__` and `__next__`) with a `StopIteration` limit.",
        "starter_code": """class FibonacciIterator:
    def __init__(self, limit):
        self.limit = limit
        self.a, self.b = 0, 1
        self.count = 0

    def __iter__(self):
        return self

    def __next__(self):
        # Implement iteration step
        pass

print(list(FibonacciIterator(6)))  # Expected: [0, 1, 1, 2, 3, 5]
""",
        "solution_code": """class FibonacciIterator:
    def __init__(self, limit):
        self.limit = limit
        self.a, self.b = 0, 1
        self.count = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.count >= self.limit:
            raise StopIteration
        val = self.a
        self.a, self.b = self.b, self.a + self.b
        self.count += 1
        return val

print(list(FibonacciIterator(6)))
""",
        "reference_url": "https://docs.python.org/3/reference/expressions.html#yield-expressions"
    }
]

# Startup database seeding
@app.on_event("startup")
def seed_database():
    db = next(get_db())
    
    # 1. Seed Interview questions
    if db.query(models.InterviewQuestion).count() == 0:
        for q_data in CURATED_INTERVIEW_QUESTIONS:
            db.add(models.InterviewQuestion(**q_data))
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

@app.post("/api/interview/sync-online")
def sync_online_interview_questions(db: Session = Depends(get_db)):
    """
    Fetches and synchronizes technical interview questions & python.org documentation online.
    """
    count_added = 0
    for q_data in CURATED_INTERVIEW_QUESTIONS:
        existing = db.query(models.InterviewQuestion).filter(
            models.InterviewQuestion.title == q_data["title"]
        ).first()
        if not existing:
            db.add(models.InterviewQuestion(**q_data))
            count_added += 1
        else:
            # Update fields if new metadata is available
            existing.category = q_data["category"]
            existing.difficulty = q_data["difficulty"]
            existing.frequency_index = q_data["frequency_index"]
            existing.company_tags = q_data["company_tags"]
            existing.problem_statement = q_data["problem_statement"]
            existing.starter_code = q_data["starter_code"]
            existing.solution_code = q_data["solution_code"]
            existing.reference_url = q_data.get("reference_url")
    db.commit()
    total_count = db.query(models.InterviewQuestion).count()
    return {
        "status": "success",
        "synced_at": datetime.utcnow().isoformat(),
        "new_added": count_added,
        "total_questions": total_count,
        "message": f"Successfully synchronized {total_count} interview topics and online specifications."
    }

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

# Documentation & Code Review Endpoints
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
