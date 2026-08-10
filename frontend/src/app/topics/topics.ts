import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, CodeRunResponse, UserProgress } from '../services/api.service';

declare var loadPyodide: any;

interface Example {
  title: string;
  description: string;
  code: string;
}

interface Topic {
  id: string;
  phase: string;
  title: string;
  breadcrumb: string;
  content: string;
  examples: Example[];
  completed?: boolean;
}

@Component({
  selector: 'app-topics',
  imports: [CommonModule, FormsModule],
  templateUrl: './topics.html',
  styleUrl: './topics.css'
})
export class TopicsComponent implements OnInit, OnDestroy {
  topics: Topic[] = [
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
          code: `def inspect_args(*args, **kwargs):
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
    }
  ];

  currentTopicIndex = 0;
  currentExampleIndex = 0;
  editorCode = '';
  consoleOutput = 'Console is ready. Click "Run Code" to execute.';
  consoleColor = 'cyan';
  
  pyodideLoaded = false;
  private pyodide: any = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.selectTopic(0);
    this.loadBackendProgress();
    this.lazyLoadPyodide();
  }

  ngOnDestroy() {}

  loadBackendProgress() {
    this.apiService.getProgress().subscribe({
      next: (progressList) => {
        progressList.forEach(p => {
          const match = this.topics.find(t => t.id === p.topic_id);
          if (match) {
            match.completed = p.completed;
          }
        });
      },
      error: (err) => {
        console.warn('Backend progress API offline, using local state.', err);
      }
    });
  }

  selectTopic(idx: number) {
    this.currentTopicIndex = idx;
    this.currentExampleIndex = 0;
    this.selectExample(0);
  }

  selectExample(exIdx: number) {
    this.currentExampleIndex = exIdx;
    const ex = this.topics[this.currentTopicIndex].examples[exIdx];
    this.editorCode = ex.code;
    this.consoleOutput = 'Console is ready. Click "Run Code" to compile.';
    this.consoleColor = 'cyan';
  }

  async lazyLoadPyodide() {
    try {
      if ((window as any).loadPyodide) {
        this.pyodide = await loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/'
        });
        this.pyodideLoaded = true;
      }
    } catch (e) {
      console.error('Failed to load Pyodide client-side WebAssembly', e);
    }
  }

  runCode() {
    this.consoleOutput = 'Compiling and executing...';
    this.consoleColor = 'white';

    // Option A: Client-side compilation via Pyodide (WASM) - if loaded
    if (this.pyodideLoaded) {
      try {
        this.pyodide.runPython(`
          import sys
          import io
          sys.stdout = io.StringIO()
          sys.stderr = io.StringIO()
        `);
        this.pyodide.runPython(this.editorCode);
        const stdout = this.pyodide.runPython('sys.stdout.getvalue()');
        const stderr = this.pyodide.runPython('sys.stderr.getvalue()');
        
        if (stderr) {
          this.consoleOutput = stderr;
          this.consoleColor = 'red';
        } else {
          this.consoleOutput = stdout || 'Code completed successfully (no outputs returned).';
          this.consoleColor = 'green';
          this.saveTopicCompletion();
        }
      } catch (err: any) {
        this.consoleOutput = err.message;
        this.consoleColor = 'red';
      }
    } 
    // Option B: Fallback to local FastAPI Python Execution Endpoint!
    else {
      this.apiService.runCode(this.editorCode).subscribe({
        next: (res: CodeRunResponse) => {
          if (res.error) {
            this.consoleOutput = res.error;
            this.consoleColor = 'red';
          } else if (res.stderr) {
            this.consoleOutput = res.stderr;
            this.consoleColor = 'red';
          } else {
            this.consoleOutput = res.stdout || 'Code completed successfully on backend.';
            this.consoleColor = 'green';
            this.saveTopicCompletion();
          }
        },
        error: (err) => {
          this.consoleOutput = `Error running code: Backend Python compiler is offline and client Wasm loading.`;
          this.consoleColor = 'red';
        }
      });
    }
  }

  saveTopicCompletion() {
    const topic = this.topics[this.currentTopicIndex];
    topic.completed = true;
    
    // Save to database backend
    this.apiService.saveProgress(topic.id, true).subscribe({
      next: (res) => {
        console.log('Saved topic progress to database:', res);
      },
      error: (err) => {
        console.warn('Backend DB offline, progress saved locally.', err);
      }
    });
  }

  resetCode() {
    const ex = this.topics[this.currentTopicIndex].examples[this.currentExampleIndex];
    this.editorCode = ex.code;
    this.consoleOutput = 'Editor reset. Standby.';
    this.consoleColor = 'cyan';
  }
}
