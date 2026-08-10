/**
 * app.js
 * Core logic for Python Mastery educational website.
 * Contains: SPA routing, Pyodide compiler load/run loop, course catalog database, and visualizer events.
 */

// ==========================================================================
// COURSE DATABASE (Content Catalog)
// ==========================================================================
const topicsDatabase = [
    {
        id: "1.1",
        phase: "Phase 1: Core Language",
        title: "Variables & Data Types",
        breadcrumb: "Module 1.1",
        content: `
            <p>Python is a <strong>dynamically typed</strong> language. Unlike TypeScript or Java, you don't need to declare types explicitly (e.g., <code>let x: string</code>). The Python interpreter determines the type at runtime based on the value assigned.</p>
            <p>However, types are still strict. Python does not implicitly convert incompatible types at runtime (e.g., adding a number to a string will fail, unlike JavaScript which converts them).</p>
            <div class="note-box">
                <strong>Key Syntax Reminder:</strong> To print variables cleanly, use <strong>f-strings</strong> (Formatted String Literals) by placing an <code>f</code> before the quotes: <code>f"Hello, {name}"</code>.
            </div>
        `,
        examples: [
            {
                title: "Example: Basic Types",
                description: "Observe how variables are instantiated and checked using the <code>type()</code> function.",
                code: `name = "Rajesh"
age = 27
hourly_rate = 75.5
is_dev = True
skills = None

print("Types at runtime:")
print("name is", type(name))
print("age is", type(age))
print("rate is", type(hourly_rate))
print("is_dev is", type(is_dev))
print("skills is", type(skills))`
            },
            {
                title: "Live Problem 1.1",
                description: "<strong>Challenge:</strong> Write a script that stores your name, years of experience, and primary skill in variables, then prints <code>'Rajesh has 4 years of experience in Angular.'</code> using an f-string.",
                code: `# Starter code
name = "Rajesh"
years = 4
skill = "Angular"

# Write your print statement below this line
# Hint: use f"..."
`
            }
        ]
    },
    {
        id: "1.2",
        phase: "Phase 1: Core Language",
        title: "Core Data Structures",
        breadcrumb: "Module 1.2",
        content: `
            <p>Python has four built-in collection data structures that form the core of daily programming:</p>
            <ul>
                <li><strong>List</strong>: Ordered, mutable sequence (similar to JS arrays). Defined with square brackets <code>[]</code>.</li>
                <li><strong>Dictionary (Dict)</strong>: Key-value hash maps (similar to JS objects). Defined with curly brackets <code>{}</code>.</li>
                <li><strong>Tuple</strong>: Ordered, immutable records. Ideal for read-only constants. Defined with parentheses <code>()</code>.</li>
                <li><strong>Set</strong>: Unordered collections of unique elements. Automatically deduplicates inputs. Defined with <code>{}</code>.</li>
            </ul>
        `,
        examples: [
            {
                title: "Example: Operations",
                description: "See how lists and dicts are declared and accessed.",
                code: `# Standard List
skills = ["Angular", "Node.js", "AWS"]
print("First skill:", skills[0])

# Dictionary lookup
profile = {"name": "Rajesh", "role": "Senior Engineer", "years": 4}
print("Profile role:", profile["role"])`
            },
            {
                title: "Live Problem 1.2",
                description: "<strong>Challenge:</strong> Print the names of employees working in 'Engineering', calculate total payroll, and find the highest-paid employee.",
                code: `# Simulating API response data
employees = [
    {"name": "Rajesh", "dept": "Engineering", "salary": 90000},
    {"name": "Priya", "dept": "Design", "salary": 75000},
    {"name": "Karthik", "dept": "Engineering", "salary": 95000},
]

print("Engineering Team:")
# 1. Print names in Engineering
# Your code here...

# 2. Calculate and print total salary
# Your code here...

# 3. Find and print highest paid employee
# Your code here...
`
            }
        ]
    },
    {
        id: "1.3",
        phase: "Phase 1: Core Language",
        title: "Comprehensions",
        breadcrumb: "Module 1.3",
        content: `
            <p>Comprehensions provide a concise way to construct new sequences (lists, dicts, sets) from existing sequences. They are the highest-leverage idiom in Python, replacing verbose <code>for</code> loops.</p>
            <p>Syntax: <code>[expression for item in iterable if condition]</code></p>
        `,
        examples: [
            {
                title: "Example: List Squares",
                description: "Compare a standard append loop with a list comprehension.",
                code: `# Old Way:
squares = []
for x in range(5):
    squares.append(x ** 2)
print("Standard Loop:", squares)

# Pythonic Way:
squares_comp = [x ** 2 for x in range(5)]
print("Comprehension:", squares_comp)`
            },
            {
                title: "Live Problem 1.3",
                description: "<strong>Challenge:</strong> Generate a list of words longer than 4 letters in uppercase, and create a dictionary mapping each word to its length.",
                code: `words = ["python", "angular", "typescript", "go", "rust"]

# 1. Words > 4 letters in UPPERCASE
uppercase_long = ...
print(uppercase_long)

# 2. Dictionary mapping word -> length
word_map = ...
print(word_map)
`
            }
        ]
    },
    {
        id: "1.4",
        phase: "Phase 1: Core Language",
        title: "Functions & Arguments",
        breadcrumb: "Module 1.4",
        content: `
            <p>Python functions are declared using the <code>def</code> keyword. Python supports positional parameters, default arguments, arbitrary arguments (<code>*args</code>), keyword arguments (<code>**kwargs</code>), and keyword-only boundary parameters (indicated by a lone asterisk <code>*</code>).</p>
        `,
        examples: [
            {
                title: "Example: Dynamic Arguments",
                description: "Watch how <code>*args</code> captures positional arguments as a tuple, and <code>**kwargs</code> captures keywords as a dictionary.",
                code: def inspect_args(*args, **kwargs):
    print("Positional arguments tuple:", args)
    print("Keyword arguments dictionary:", kwargs)

inspect_args(1, 2, "three", country="India", city="Chennai")`
            },
            {
                title: "Live Problem 1.4",
                description: "<strong>Challenge:</strong> Write a function <code>calculate_bonus(salary, years, *, is_manager=False)</code>. It returns a 10% bonus if years >= 3, else 5%. Add an extra 5% if they are a manager. Guard it to ensure <code>is_manager</code> is keyword-only.",
                code: `# Write function calculate_bonus here

# Testing calls:
# print(calculate_bonus(90000, 4))               # Expected: 9000.0
# print(calculate_bonus(90000, 2))               # Expected: 4500.0
# print(calculate_bonus(90000, 4, is_manager=True))  # Expected: 13500.0
`
            }
        ]
    },
    {
        id: "1.5",
        phase: "Phase 1: Core Language",
        title: "Control Flow & Loops",
        breadcrumb: "Module 1.5",
        content: `
            <p>Python utilizes standard flow statements: <code>if-elif-else</code>, <code>while</code>, and <code>for</code> loops. In Python, loops also support an optional <code>else</code> block, which executes only if the loop runs to completion without hitting a <code>break</code> statement.</p>
        `,
        examples: [
            {
                title: "Example: Enumerate",
                description: "Use <code>enumerate()</code> to loop over items while automatically keeping track of the current index.",
                code: `frameworks = ["Angular", "NodeJS", "FastAPI"]
for index, name in enumerate(frameworks, start=1):
    print(f"{index}. {name}")`
            },
            {
                title: "Live Problem 1.5",
                description: "<strong>Challenge:</strong> Loop through the attempts list and check details against the <code>users</code> database. Print success or warning messages, and trigger 'Access denied' after failures.",
                code: `users = {"rajesh": "pass123", "priya": "abc456"}
attempts = [
    ("rajesh", "wrongpass"),
    ("rajesh", "pass123")
]

# Write checking logic using a loop
`
            }
        ]
    },
    {
        id: "1.6",
        phase: "Phase 1: Core Language",
        title: "Exception Handling",
        breadcrumb: "Module 1.6",
        content: `
            <p>Errors in Python are managed with <code>try-except-finally</code> blocks. You should always catch specific exception subclasses rather than utilizing empty bare <code>except:</code> statements, which could hide code bugs.</p>
        `,
        examples: [
            {
                title: "Example: Catching ZeroDivision",
                description: "Prevent calculator faults by catching numeric issues.",
                code: `try:
    val = 10 / 0
except ZeroDivisionError as error:
    print("Caught error:", error)
finally:
    print("Cleanup statements run here.")`
            },
            {
                title: "Live Problem 1.6",
                description: "<strong>Challenge:</strong> Write a function <code>safe_divide(a, b)</code> that returns division results but handles <code>ZeroDivisionError</code> and <code>TypeError</code> safely, returning <code>None</code> for either exception.",
                code: `# Write safe_divide(a, b) function
def safe_divide(a, b):
    pass

# Test values:
# print(safe_divide(10, 2))     # Expected: 5.0
# print(safe_divide(10, 0))     # Expected: None
# print(safe_divide(10, "a"))   # Expected: None
`
            }
        ]
    },
    {
        id: "1.7",
        phase: "Phase 1: Core Language",
        title: "File I/O & CSV handling",
        breadcrumb: "Module 1.7",
        content: `
            <p>File operations in Python are performed using the <code>open()</code> function. The recommended practice is to use the <code>with</code> statement, which creates a <strong>context manager</strong> that automatically closes the file when execution exits the block, preventing resource leaks.</p>
            <p>For structured tabular data, Python includes a built-in <code>csv</code> module that makes parsing comma-separated files straightforward.</p>
        `,
        examples: [
            {
                title: "Example: Reading & Writing Files",
                description: "Observe how to open, write, and read a plain text file safely using the <code>with</code> block.",
                code: `# Writing a file
with open("data.txt", "w") as file:
    file.write("Hello from Python Mastery!\\n")
    file.write("This is a second line.\\n")

# Reading the file back
with open("data.txt", "r") as file:
    content = file.read()
    print("File Content:")
    print(content)`
            },
            {
                title: "Live Problem 1.7",
                description: "<strong>Challenge:</strong> Write a script that parses a simulated CSV data string, calculates the total revenue (<code>units * price</code>) for each product, and prints the grand total of all revenue.",
                code: `import csv
import io

# Simulated sales CSV data
csv_data = """product,units,price
Widget,10,25.5
Gadget,5,80.0
Gizmo,20,15.0"""

# Use csv.DictReader on a StringIO object to parse
data_stream = io.StringIO(csv_data.strip())
reader = csv.DictReader(data_stream)

grand_total = 0.0

for row in reader:
    # 1. Extract and cast variables
    # 2. Compute revenue
    # 3. Print product name and calculated revenue
    # Your code here...
    pass

# 4. Print grand total
# Your code here...
`
            }
        ]
    },
    {
        id: "2.1",
        phase: "Phase 2: Pythonic Idioms",
        title: "Classes & OOP",
        breadcrumb: "Module 2.1",
        content: `
            <p>Object-Oriented Programming (OOP) in Python centers on classes defined with the <code>class</code> keyword. Python classes support constructor initializers (<code>__init__</code>), instance methods (which must accept <code>self</code> as the first parameter), class attributes, and multi-class inheritance.</p>
        `,
        examples: [
            {
                title: "Example: Basic Class",
                description: "Declare a simple bank account class with deposit and withdraw methods.",
                code: `class BankAccount:
    bank_name = "Python Bank"  # Class attribute (shared)

    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance  # Instance attribute

    def deposit(self, amount):
        if amount > 0:
            self.balance += amount
            print(f"Deposited {amount}. New Balance: {self.balance}")

    def __str__(self):
        return f"{self.owner}'s account: ${self.balance}"

acc = BankAccount("Rajesh", 1000)
acc.deposit(200)
print(acc)`
            },
            {
                title: "Live Problem 2.1",
                description: "<strong>Challenge:</strong> Extend <code>BankAccount</code> by implementing a <code>transfer(self, target_account, amount)</code> method that withdraws from the current account and deposits into another, raising a <code>ValueError</code> if there are insufficient funds.",
                code: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        self.balance -= amount

    # Write the transfer method here
    def transfer(self, target_account, amount):
        pass

# Test code
a1 = BankAccount("Rajesh", 1000)
a2 = BankAccount("Priya", 500)
try:
    a1.transfer(a2, 300)
    print(f"Rajesh Balance: {a1.balance}") # Expected: 700
    print(f"Priya Balance: {a2.balance}")   # Expected: 800
except Exception as e:
    print("Error:", e)
`
            }
        ]
    },
    {
        id: "2.2",
        phase: "Phase 2: Pythonic Idioms",
        title: "Context Managers",
        breadcrumb: "Module 2.2",
        content: `
            <p>Context managers control resource setup and teardown inside <code>with</code> blocks. You can implement custom context managers by creating a class with <code>__enter__</code> and <code>__exit__</code> methods, or by using the <code>@contextmanager</code> decorator from the standard <code>contextlib</code> module.</p>
        `,
        examples: [
            {
                title: "Example: Custom Timer",
                description: "Create a context manager that benchmarks execution speed.",
                code: `import time

class Timer:
    def __enter__(self):
        self.start = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = time.time() - self.start
        print(f"Completed in {elapsed:.6f} seconds")

# Benchmark a comprehension
with Timer():
    sum(x**2 for x in range(100_000))`
            },
            {
                title: "Live Problem 2.2",
                description: "<strong>Challenge:</strong> Write a custom context manager <code>suppress_errors</code> that handles any exceptions raised inside its block, printing a warning instead of crashing the program.",
                code: `class suppress_errors:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        # Hint: return True to suppress the exception, else False
        if exc_type is not None:
            print(f"Suppressed error: {exc_val}")
            return True
        return False

# Test Code
with suppress_errors():
    print("About to divide by zero...")
    print(1 / 0)

print("Execution successfully continued after the block!")
`
            }
        ]
    },
    {
        id: "2.3",
        phase: "Phase 2: Pythonic Idioms",
        title: "Working with JSON & APIs",
        breadcrumb: "Module 2.3",
        content: `
            <p>Interacting with web endpoints is highly common. In Python, you can fetch remote resources using the standard <code>urllib</code> library or the third-party <code>requests</code> package. To decode JSON responses, use the <code>json</code> library or call the <code>.json()</code> method on your response payload.</p>
        `,
        examples: [
            {
                title: "Example: Python JSON Parsing",
                description: "Observe how Python translates JSON strings into standard dictionaries and lists.",
                code: `import json

json_data = '{"name": "Rajesh", "role": "Senior Engineer", "skills": ["Python", "Angular"]}'
profile = json.loads(json_data)

print("Parsed Name:", profile["name"])
print("Skills list:", profile["skills"])`
            },
            {
                title: "Live Problem 2.3",
                description: "<strong>Challenge:</strong> Simulate fetching API users and counting how many users live in a city whose name starts with a vowel (A, E, I, O, U).",
                code: `# Simulating fetched API data
users = [
    {"name": "Leanne Graham", "city": "Gwenborough"},
    {"name": "Ervin Howell", "city": "Ellicott City"},
    {"name": "Patricia Lebsack", "city": "Oakland"},
    {"name": "Chelsey Dietrich", "city": "Ipswich"},
    {"name": "Mrs. Dennis Schulist", "city": "South Port"}
]

vowel_cities_count = 0
vowels = "AEIOU"

# Iterate over users and filter cities starting with vowels
# Your code here...

print("Vowel starting cities count:", vowel_cities_count) # Expected: 2 (Ellicott City, Oakland)
`
            }
        ]
    },
    {
        id: "2.4",
        phase: "Phase 2: Pythonic Idioms",
        title: "Testing with pytest",
        breadcrumb: "Module 2.4",
        content: `
            <p>Testing in Python is dominated by the <code>pytest</code> framework. It uses standard <code>assert</code> statements, eliminating the need to write verbose JUnit/unittest patterns like <code>self.assertEqual()</code>.</p>
        `,
        examples: [
            {
                title: "Example: Simple Unit Test",
                description: "A demonstration of simple pytest functions.",
                code: `def add(a, b):
    return a + b

# pytest picks up functions prefixed with test_
def test_add_positive():
    assert add(2, 3) == 5

def test_add_negative():
    assert add(-1, -1) == -2

# Run tests
test_add_positive()
test_add_negative()
print("All assertions passed!")`
            },
            {
                title: "Live Problem 2.4",
                description: "<strong>Challenge:</strong> Write simple assertions to test your <code>safe_divide</code> exception-handling logic from Problem 1.6.",
                code: `def safe_divide(a, b):
    try:
        return a / b
    except (ZeroDivisionError, TypeError):
        return None

# Write test assertions here to check:
# 1. Normal division (10 / 2) returns 5.0
# 2. Division by zero (10 / 0) returns None
# 3. Invalid types (10 / "a") returns None

# Your assertions:
`
            }
        ]
    },
    {
        id: "3.1",
        phase: "Phase 3: Applied Track",
        title: "FastAPI REST APIs",
        breadcrumb: "Module 3.1",
        content: `
            <p>FastAPI is a modern, high-performance web framework for building APIs in Python. It relies on <strong>Pydantic</strong> for data verification and automatic OpenAPI documentation generation.</p>
        `,
        examples: [
            {
                title: "Example: Basic FastAPI Server",
                description: "A simple FastAPI endpoint routing implementation.",
                code: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Task(BaseModel):
    title: str
    done: bool = False

@app.get("/status")
def get_status():
    return {"status": "online"}

print("API Router initialized. Endpoints available: /status")`
            },
            {
                title: "Live Problem 3.1",
                description: "<strong>Challenge:</strong> Complete a basic FastAPI router logic to add task schemas to an in-memory list and fetch tasks filtered by priority.",
                code: `from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

class TaskSchema(BaseModel):
    id: int
    title: str
    priority: str  # e.g., "high", "medium", "low"

tasks_db = [
    TaskSchema(id=1, title="Build WebGL Canvas", priority="high"),
    TaskSchema(id=2, title="Refactor CSS variables", priority="low")
]

# Complete this route to filter by query priority if provided
@app.get("/tasks")
def read_tasks(priority: Optional[str] = None):
    # Your code here...
    return tasks_db
`
            }
        ]
    },
    {
        id: "3.2",
        phase: "Phase 3: Applied Track",
        title: "Environment & Auth Basics",
        breadcrumb: "Module 3.2",
        content: `
            <p>FastAPI apps handle credentials securely by loading settings from a <code>.env</code> file. For API protection, JSON Web Tokens (JWT) are signed and verified to establish session state, mapping directly to interceptor architectures.</p>
        `,
        examples: [
            {
                title: "Example: Environment Loading",
                description: "Load secret variables securely using python-dotenv.",
                code: `# Simulating os environment loading
import os

# Set dummy env key
os.environ["SECRET_KEY"] = "super-secret-key-123"

# Read key
secret = os.getenv("SECRET_KEY")
print("Successfully loaded SECRET_KEY:", secret[:5] + "...")`
            },
            {
                title: "Live Problem 3.2",
                description: "<strong>Challenge:</strong> Write a mock JWT signer function that encodes a dictionary token payload and verifies it.",
                code: `import base64
import json

def mock_sign_jwt(payload: dict) -> str:
    # Simulating simple JWT encoding (header.payload.signature)
    payload_bytes = json.dumps(payload).encode('utf-8')
    encoded_payload = base64.urlsafe_b64encode(payload_bytes).decode('utf-8')
    header = base64.urlsafe_b64encode(b'{"alg":"HS256"}').decode('utf-8')
    signature = "signature-placeholder"
    return f"{header}.{encoded_payload}.{signature}"

def mock_decode_jwt(token: str) -> dict:
    parts = token.split('.')
    payload_decoded = base64.urlsafe_b64decode(parts[1].encode('utf-8')).decode('utf-8')
    return json.loads(payload_decoded)

# Test encoding and decoding a user payload
user_payload = {"username": "rajesh", "role": "admin"}
token = mock_sign_jwt(user_payload)
print("Token:", token)

decoded = mock_decode_jwt(token)
print("Decoded Payload:", decoded) # Expected to match user_payload
`
            }
        ]
    },
    {
        id: "4.1",
        phase: "Phase 4: Consolidation",
        title: "Type Hints & mypy",
        breadcrumb: "Module 4.1",
        content: `
            <p>Type hints bring static analysis capabilities to Python, enabling compile-time validation (via tools like <code>mypy</code>) while keeping Python's dynamic runtime execution intact.</p>
        `,
        examples: [
            {
                title: "Example: Type Annotations",
                description: "Check how functions specify input and return types.",
                code: `from typing import List, Dict, Optional

def compute_average(scores: List[float]) -> float:
    return sum(scores) / len(scores)

def find_user(user_id: int) -> Optional[str]:
    users: Dict[int, str] = {1: "Rajesh", 2: "Priya"}
    return users.get(user_id)

print(compute_average([95.5, 88.0, 92.5]))
print(find_user(1))`
            },
            {
                title: "Live Problem 4.1",
                description: "<strong>Challenge:</strong> Correct the type signatures in this function to resolve static analysis lint warnings.",
                code: `from typing import List, Optional

# Challenge: Correct type annotations for this function
def filter_and_format_salaries(salaries: list, min_cutoff: float) -> list:
    filtered = [s for s in salaries if s >= min_cutoff]
    return [f"\\\${val:,.2f}" for val in filtered]

# Test
print(filter_and_format_salaries([45000.5, 90000.0, 72000.5], 50000.0))
`
            }
        ]
    },
    {
        id: "4.2",
        phase: "Phase 4: Consolidation",
        title: "Reading Real Code",
        breadcrumb: "Module 4.2",
        content: `
            <p>The final milestone of Python mastery is reading and parsing real open-source repositories (such as <code>requests</code>, <code>fastapi</code>, or <code>httpie</code>) to learn advanced structures and styling patterns.</p>
        `,
        examples: [
            {
                title: "Example: Checking Module Attributes",
                description: "Learn how to inspect functions inside an active module at runtime.",
                code: `import csv

# List all public attributes inside the csv module
attributes = [attr for attr in dir(csv) if not attr.startswith("_")]
print("Public CSV APIs:")
print(attributes[:10])`
            },
            {
                title: "Live Problem 4.2",
                description: "<strong>Challenge:</strong> Write a recursive function that traverses a directory structure (simulating standard module tree lookups) to count total Python source files.",
                code: `# Simulating directory tree data
source_tree = {
    "name": "project",
    "files": ["main.py", "README.md"],
    "subdirs": [
        {
            "name": "utils",
            "files": ["helpers.py", "formatting.py", "notes.txt"],
            "subdirs": []
        },
        {
            "name": "tests",
            "files": ["test_helpers.py"],
            "subdirs": []
        }
    ]
}

def count_py_files(node: dict) -> int:
    count = sum(1 for f in node.get("files", []) if f.endswith(".py"))
    for subdir in node.get("subdirs", []):
        count += count_py_files(subdir)
    return count

print("Total Python files found:", count_py_files(source_tree)) # Expected: 4
`
            }
        ]
    }
];

// ==========================================================================
// STATE MANAGEMENT
// ==========================================================================
let currentTopicIndex = 0;
let currentExampleIndex = 0;
let pyodideInstance = null;
let pyodideLoaded = false;

// ==========================================================================
// SPA ROUTING AND NAVIGATION
// ==========================================================================
function initRouting() {
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll(".page-section");

    function handleHashChange() {
        const hash = window.location.hash || "#home";
        
        // Update navigation active state
        navLinks.forEach(link => {
            if (link.getAttribute("href") === hash) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });

        // Show/hide relevant sections
        sections.forEach(sec => {
            const secId = `#${sec.id.replace("sec-", "")}`;
            if (secId === hash) {
                sec.classList.add("active");
                // Trigger visualizer initialization if needed
                if (hash === "#visualizer") {
                    setTimeout(() => {
                        if (window.visualizerApp && typeof window.visualizerApp.resize === "function") {
                            window.visualizerApp.resize();
                        }
                    }, 100);
                }
            } else {
                sec.classList.remove("active");
            }
        });

        // Scroll to top
        window.scrollTo(0, 0);
    }

    window.addEventListener("hashchange", handleHashChange);
    
    // Initial router invoke
    if (window.location.hash) {
        handleHashChange();
    }
}

// ==========================================================================
// TOPICS MODULE RENDERING
// ==========================================================================
function initTopics() {
    const topicList = document.getElementById("topic-sidebar-list");
    topicList.innerHTML = "";

    // Generate Sidebar list
    topicsDatabase.forEach((topic, index) => {
        const li = document.createElement("li");
        li.className = `topic-item ${index === currentTopicIndex ? "active" : ""}`;
        li.innerHTML = `
            <span>${topic.title}</span>
            <span class="status-dot"></span>
        `;
        li.addEventListener("click", () => selectTopic(index));
        topicList.appendChild(li);
    });

    selectTopic(0);
}

function selectTopic(index) {
    currentTopicIndex = index;
    currentExampleIndex = 0;
    
    // Update sidebar UI state
    const items = document.querySelectorAll("#topic-sidebar-list .topic-item");
    items.forEach((item, idx) => {
        if (idx === index) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    const topic = topicsDatabase[index];
    
    // Fill text values
    document.getElementById("topic-breadcrumb").innerText = `${topic.phase.toUpperCase()} : ${topic.breadcrumb.toUpperCase()}`;
    document.getElementById("topic-title").innerText = topic.title;
    document.getElementById("topic-body-content").innerHTML = topic.content;

    // Fill example tabs navigation
    const examplesNav = document.getElementById("examples-nav");
    examplesNav.innerHTML = "";
    topic.examples.forEach((ex, exIdx) => {
        const btn = document.createElement("button");
        btn.className = `tab-btn ${exIdx === 0 ? "active" : ""}`;
        btn.innerText = ex.title;
        btn.addEventListener("click", () => selectExample(exIdx));
        examplesNav.appendChild(btn);
    });

    selectExample(0);
}

function selectExample(exIdx) {
    currentExampleIndex = exIdx;
    
    // Update tab styles
    const tabs = document.querySelectorAll("#examples-nav .tab-btn");
    tabs.forEach((tab, idx) => {
        if (idx === exIdx) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });

    const ex = topicsDatabase[currentTopicIndex].examples[exIdx];
    document.getElementById("example-desc").innerHTML = ex.description;
    
    // Load code editor content
    const editor = document.getElementById("code-editor");
    editor.value = ex.code;

    // Clear previous console outputs
    document.getElementById("console-output").innerText = "Console is ready. Click 'Run Code' to execute.";
    document.getElementById("console-output").style.color = "var(--color-accent-cyan)";
}

// ==========================================================================
// PYODIDE INTEGRATION (Browser Compiler)
// ==========================================================================
async function loadPyodideCompiler() {
    const consoleOut = document.getElementById("console-output");
    consoleOut.innerText = "Initializing Python compiler inside WebAssembly... Please wait.";
    
    try {
        pyodideInstance = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/"
        });
        pyodideLoaded = true;
        consoleOut.innerText = "Python compiler loaded successfully. Standby.";
    } catch (err) {
        consoleOut.innerText = `Error loading WebAssembly compiler: ${err.message}`;
        consoleOut.style.color = "var(--color-accent-red)";
    }
}

async function runPythonCode() {
    const consoleOut = document.getElementById("console-output");
    if (!pyodideLoaded) {
        await loadPyodideCompiler();
        if (!pyodideLoaded) return;
    }

    const code = document.getElementById("code-editor").value;
    consoleOut.innerText = "Compiling and executing...";
    consoleOut.style.color = "var(--color-text-main)";

    // Capture standard outputs from Python
    try {
        pyodideInstance.runPython(`
            import sys
            import io
            sys.stdout = io.StringIO()
            sys.stderr = io.StringIO()
        `);

        // Execute code
        await pyodideInstance.runPythonAsync(code);

        // Fetch outputs
        const stdout = pyodideInstance.runPython("sys.stdout.getvalue()");
        const stderr = pyodideInstance.runPython("sys.stderr.getvalue()");

        if (stderr) {
            consoleOut.innerText = stderr;
            consoleOut.style.color = "var(--color-accent-red)";
        } else {
            consoleOut.innerText = stdout || "Code ran successfully (no output returned).";
            consoleOut.style.color = "var(--color-accent-green)";
            
            // Mark item as completed on successful run
            const items = document.querySelectorAll("#topic-sidebar-list .topic-item");
            if (items[currentTopicIndex]) {
                items[currentTopicIndex].classList.add("completed");
            }
        }
    } catch (err) {
        consoleOut.innerText = err.message;
        consoleOut.style.color = "var(--color-accent-red)";
    }
}

function resetCode() {
    const ex = topicsDatabase[currentTopicIndex].examples[currentExampleIndex];
    document.getElementById("code-editor").value = ex.code;
    const consoleOut = document.getElementById("console-output");
    consoleOut.innerText = "Editor reset. Standby.";
    consoleOut.style.color = "var(--color-accent-cyan)";
}

// ==========================================================================
// VISUALIZER STATE DELEGATION
// ==========================================================================
function initVisualizerControls() {
    const selectorButtons = document.querySelectorAll(".vis-select-btn");
    
    selectorButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            selectorButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const visType = btn.getAttribute("data-vis");
            if (window.visualizerApp && typeof window.visualizerApp.setVisualization === "function") {
                window.visualizerApp.setVisualization(visType);
            }
        });
    });

    // Control buttons events
    const speedSlider = document.getElementById("slider-speed");
    speedSlider.addEventListener("input", (e) => {
        if (window.visualizerApp) {
            window.visualizerApp.setSpeed(e.target.value);
        }
    });

    document.getElementById("btn-vis-play").addEventListener("click", () => {
        if (window.visualizerApp) {
            const isPlaying = window.visualizerApp.togglePlay();
            document.getElementById("btn-vis-play").innerHTML = isPlaying ? 
                '<i class="fa-solid fa-pause"></i> Pause' : '<i class="fa-solid fa-play"></i> Play';
        }
    });

    document.getElementById("btn-vis-step").addEventListener("click", () => {
        if (window.visualizerApp) {
            window.visualizerApp.step();
        }
    });

    document.getElementById("btn-vis-reset").addEventListener("click", () => {
        if (window.visualizerApp) {
            window.visualizerApp.reset();
            document.getElementById("btn-vis-play").innerHTML = '<i class="fa-solid fa-play"></i> Play';
        }
    });
}

// ==========================================================================
// CORE APP INITIALIZATION
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initRouting();
    initTopics();
    initVisualizerControls();

    // Setup Code runner events
    document.getElementById("btn-run-code").addEventListener("click", runPythonCode);
    document.getElementById("btn-reset-code").addEventListener("click", resetCode);

    // Theme Toggle
    const themeBtn = document.getElementById("theme-toggle");
    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("light-theme");
        const isLight = document.body.classList.contains("light-theme");
        themeBtn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        
        // Notify visualizer to update colors
        if (window.visualizerApp && typeof window.visualizerApp.updateColors === "function") {
            window.visualizerApp.updateColors(isLight);
        }
    });

    // Start background lazy loading of Pyodide WebAssembly files
    setTimeout(loadPyodideCompiler, 1500);
});
