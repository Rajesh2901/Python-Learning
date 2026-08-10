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
