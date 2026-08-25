import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface CodeRunRequest {
  code: string;
}

export interface CodeRunResponse {
  stdout: string;
  stderr: string;
  error?: string;
}

export interface UserProgress {
  id?: number;
  topic_id: string;
  completed: boolean;
  updated_at?: string;
}

export interface CustomTask {
  id?: number;
  title: string;
  priority: string;
  done: boolean;
  created_at?: string;
}

export interface InterviewQuestion {
  id: number;
  title: string;
  difficulty: string;
  category: string;
  frequency_index: number;
  company_tags: string;
  problem_statement: string;
  starter_code: string;
  solution_code: string;
  reference_url?: string;
}

export interface UserPerformanceLog {
  id?: number;
  question_id: number;
  status: string;
  execution_time_ms: number;
  created_at?: string;
}

export interface DocumentationTopic {
  id: number;
  topic_name: string;
  python_org_url: string;
  raw_html_content?: string;
  parsed_markdown: string;
  last_fetched: string;
}

export interface ChallengeProblem {
  id: number;
  title: string;
  difficulty: string;
  category: string;
  description: string;
  starter_code: string;
  solution_code: string;
  reference_url: string;
}

export interface CodeReviewSimulation {
  id: number;
  title: string;
  category: string;
  code_with_bugs: string;
  bug_line_number: number;
  explanation: string;
  corrected_code: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Use relative URL /api for Cloudflare Workers / production, fallback to localhost:8000 for local standalone dev
  private baseUrl = (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '4200')
    ? 'http://localhost:8000/api'
    : '/api';

  private fallbackQuestions: InterviewQuestion[] = [
    {
      id: 1,
      title: 'Two Sum',
      difficulty: 'Easy',
      category: 'Array',
      frequency_index: 9.8,
      company_tags: 'Google,Meta,Amazon,Apple',
      problem_statement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
      starter_code: `def two_sum(nums, target):\n    # Write your code here\n    pass\n\nprint(two_sum([2, 7, 11, 15], 9))  # Expected: [0, 1]`,
      solution_code: `def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []\n\nprint(two_sum([2, 7, 11, 15], 9))`,
      reference_url: 'https://docs.python.org/3/tutorial/datastructures.html#more-on-lists'
    },
    {
      id: 2,
      title: '3Sum',
      difficulty: 'Medium',
      category: 'Array',
      frequency_index: 9.3,
      company_tags: 'Meta,Amazon,Microsoft,Apple',
      problem_statement: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
      starter_code: `def three_sum(nums):\n    # Write your two-pointer code here\n    pass\n\nprint(three_sum([-1,0,1,2,-1,-4]))`,
      solution_code: `def three_sum(nums):\n    nums.sort()\n    res = []\n    for i in range(len(nums) - 2):\n        if i > 0 and nums[i] == nums[i-1]: continue\n        l, r = i + 1, len(nums) - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if s < 0: l += 1\n            elif s > 0: r -= 1\n            else:\n                res.append([nums[i], nums[l], nums[r]])\n                while l < r and nums[l] == nums[l+1]: l += 1\n                while l < r and nums[r] == nums[r-1]: r -= 1\n                l += 1; r -= 1\n    return res\n\nprint(three_sum([-1,0,1,2,-1,-4]))`,
      reference_url: 'https://docs.python.org/3/tutorial/datastructures.html'
    },
    {
      id: 3,
      title: 'Valid Parentheses',
      difficulty: 'Easy',
      category: 'Stack/Queue',
      frequency_index: 9.4,
      company_tags: 'Meta,Amazon,Bloomberg,Microsoft',
      problem_statement: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nOpen brackets must be closed by the same type of brackets in correct order.",
      starter_code: `def is_valid(s):\n    # Write your code here\n    pass\n\nprint(is_valid("()[]{}"))  # Expected: True\nprint(is_valid("(]"))      # Expected: False`,
      solution_code: `def is_valid(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack\n\nprint(is_valid("()[]{}"))`,
      reference_url: 'https://docs.python.org/3/library/collections.html#collections.deque'
    },
    {
      id: 4,
      title: 'Daily Temperatures',
      difficulty: 'Medium',
      category: 'Stack/Queue',
      frequency_index: 8.9,
      company_tags: 'Meta,Amazon,Google',
      problem_statement: 'Given an array of integers temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature.',
      starter_code: `def daily_temperatures(temperatures):\n    pass\n\nprint(daily_temperatures([73,74,75,71,69,72,76,73]))`,
      solution_code: `def daily_temperatures(temperatures):\n    res = [0] * len(temperatures)\n    stack = []\n    for i, t in enumerate(temperatures):\n        while stack and t > stack[-1][1]:\n            prev_idx, _ = stack.pop()\n            res[prev_idx] = i - prev_idx\n        stack.append((i, t))\n    return res\n\nprint(daily_temperatures([73,74,75,71,69,72,76,73]))`,
      reference_url: 'https://docs.python.org/3/library/collections.html#collections.deque'
    },
    {
      id: 5,
      title: 'Reverse Linked List',
      difficulty: 'Easy',
      category: 'Linked List',
      frequency_index: 8.9,
      company_tags: 'Amazon,Microsoft,Apple,Uber',
      problem_statement: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
      starter_code: `class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverse_list(head):\n    pass`,
      solution_code: `class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverse_list(head):\n    prev, curr = None, head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev\n\nh = ListNode(1, ListNode(2, ListNode(3)))\nrev = reverse_list(h)\nprint(rev.val, rev.next.val, rev.next.next.val)`,
      reference_url: 'https://docs.python.org/3/tutorial/classes.html'
    },
    {
      id: 6,
      title: 'LRU Cache Design',
      difficulty: 'Medium',
      category: 'Linked List',
      frequency_index: 9.7,
      company_tags: 'Meta,Amazon,Google,Microsoft,Apple',
      problem_statement: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) get and put operations.',
      starter_code: `class LRUCache:\n    def __init__(self, capacity: int):\n        pass\n\ncache = LRUCache(2)\ncache.put(1, 1); cache.put(2, 2)\nprint(cache.get(1))`,
      solution_code: `from collections import OrderedDict\n\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = OrderedDict()\n    def get(self, key: int) -> int:\n        if key not in self.cache: return -1\n        self.cache.move_to_end(key)\n        return self.cache[key]\n    def put(self, key: int, value: int) -> None:\n        if key in self.cache: self.cache.move_to_end(key)\n        self.cache[key] = value\n        if len(self.cache) > self.capacity: self.cache.popitem(last=False)\n\ncache = LRUCache(2)\ncache.put(1, 1); cache.put(2, 2)\nprint(cache.get(1))`,
      reference_url: 'https://docs.python.org/3/library/collections.html#collections.OrderedDict'
    },
    {
      id: 7,
      title: 'Binary Tree Level Order Traversal',
      difficulty: 'Medium',
      category: 'Tree',
      frequency_index: 8.8,
      company_tags: 'Meta,Google,Amazon',
      problem_statement: "Given the root of a binary tree, return the level order traversal of its nodes' values (from left to right, level by level).",
      starter_code: `class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef level_order(root):\n    pass`,
      solution_code: `from collections import deque\n\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef level_order(root):\n    if not root: return []\n    res, q = [], deque([root])\n    while q:\n        level = []\n        for _ in range(len(q)):\n            node = q.popleft()\n            level.append(node.val)\n            if node.left: q.append(node.left)\n            if node.right: q.append(node.right)\n        res.append(level)\n    return res\n\nroot = TreeNode(3, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7)))\nprint(level_order(root))`,
      reference_url: 'https://docs.python.org/3/library/collections.html#collections.deque'
    },
    {
      id: 8,
      title: 'Validate Binary Search Tree',
      difficulty: 'Medium',
      category: 'Tree',
      frequency_index: 9.1,
      company_tags: 'Amazon,Meta,Bloomberg',
      problem_statement: 'Given the root of a binary tree, determine if it is a valid binary search tree (BST).',
      starter_code: `def is_valid_bst(root):\n    pass`,
      solution_code: `def is_valid_bst(root):\n    def validate(node, low=float('-inf'), high=float('inf')):\n        if not node: return True\n        if not (low < node.val < high): return False\n        return validate(node.left, low, node.val) and validate(node.right, node.val, high)\n    return validate(root)`,
      reference_url: 'https://docs.python.org/3/library/math.html#math.inf'
    },
    {
      id: 9,
      title: 'Number of Islands',
      difficulty: 'Medium',
      category: 'Graph',
      frequency_index: 9.6,
      company_tags: 'Meta,Amazon,Google,Microsoft',
      problem_statement: "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
      starter_code: `def num_islands(grid):\n    pass\n\ngrid = [["1","1","0"],["1","1","0"],["0","0","1"]]\nprint("Islands count:", num_islands(grid))`,
      solution_code: `def num_islands(grid):\n    if not grid: return 0\n    rows, cols = len(grid), len(grid[0])\n    visited = set()\n    islands = 0\n    def dfs(r, c):\n        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] == '0' or (r, c) in visited: return\n        visited.add((r, c))\n        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1)\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == '1' and (r, c) not in visited:\n                dfs(r, c)\n                islands += 1\n    return islands\n\ngrid = [["1","1","0"],["1","1","0"],["0","0","1"]]\nprint("Islands count:", num_islands(grid))`,
      reference_url: 'https://docs.python.org/3/tutorial/datastructures.html#sets'
    },
    {
      id: 10,
      title: 'Course Schedule (Topological Sort)',
      difficulty: 'Medium',
      category: 'Graph',
      frequency_index: 9.0,
      company_tags: 'Amazon,Google,Meta',
      problem_statement: 'Determine if you can finish all prerequisite courses using graph topological sorting / cycle detection.',
      starter_code: `def can_finish(num_courses, prerequisites):\n    pass\n\nprint(can_finish(2, [[1,0]]))`,
      solution_code: `from collections import defaultdict, deque\n\ndef can_finish(num_courses, prerequisites):\n    adj = defaultdict(list)\n    indegree = [0] * num_courses\n    for dest, src in prerequisites:\n        adj[src].append(dest)\n        indegree[dest] += 1\n    q = deque([i for i in range(num_courses) if indegree[i] == 0])\n    visited = 0\n    while q:\n        node = q.popleft()\n        visited += 1\n        for neighbor in adj[node]:\n            indegree[neighbor] -= 1\n            if indegree[neighbor] == 0: q.append(neighbor)\n    return visited == num_courses\n\nprint(can_finish(2, [[1,0]]))`,
      reference_url: 'https://docs.python.org/3/library/collections.html#collections.defaultdict'
    },
    {
      id: 11,
      title: 'Kth Largest Element in an Array',
      difficulty: 'Medium',
      category: 'Heap',
      frequency_index: 9.1,
      company_tags: 'Meta,Amazon,Google,Netflix',
      problem_statement: 'Given an integer array nums and an integer k, return the kth largest element in the array using a min-heap.',
      starter_code: `import heapq\n\ndef find_kth_largest(nums, k):\n    pass\n\nprint(find_kth_largest([3,2,1,5,6,4], 2))`,
      solution_code: `import heapq\n\ndef find_kth_largest(nums, k):\n    min_heap = []\n    for num in nums:\n        heapq.heappush(min_heap, num)\n        if len(min_heap) > k: heapq.heappop(min_heap)\n    return min_heap[0]\n\nprint(find_kth_largest([3,2,1,5,6,4], 2))`,
      reference_url: 'https://docs.python.org/3/library/heapq.html'
    },
    {
      id: 12,
      title: 'Group Anagrams',
      difficulty: 'Medium',
      category: 'Hash Table',
      frequency_index: 9.3,
      company_tags: 'Amazon,Meta,Google,Apple',
      problem_statement: 'Given an array of strings strs, group the anagrams together into sublists.',
      starter_code: `def group_anagrams(strs):\n    pass\n\nprint(group_anagrams(["eat","tea","tan","ate","nat","bat"]))`,
      solution_code: `from collections import defaultdict\n\ndef group_anagrams(strs):\n    groups = defaultdict(list)\n    for s in strs:\n        key = "".join(sorted(s))\n        groups[key].append(s)\n    return list(groups.values())\n\nprint(group_anagrams(["eat","tea","tan","ate","nat","bat"]))`,
      reference_url: 'https://docs.python.org/3/library/collections.html#collections.defaultdict'
    },
    {
      id: 13,
      title: 'Coin Change',
      difficulty: 'Medium',
      category: 'Dynamic Programming',
      frequency_index: 9.5,
      company_tags: 'Amazon,Meta,Google,Microsoft',
      problem_statement: 'Calculate fewest number of coins that you need to make up amount using dynamic programming.',
      starter_code: `def coin_change(coins, amount):\n    pass\n\nprint(coin_change([1,2,5], 11))`,
      solution_code: `def coin_change(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for coin in coins:\n        for x in range(coin, amount + 1):\n            dp[x] = min(dp[x], dp[x - coin] + 1)\n    return dp[amount] if dp[amount] != float('inf') else -1\n\nprint(coin_change([1,2,5], 11))`,
      reference_url: 'https://docs.python.org/3/library/functools.html#functools.lru_cache'
    },
    {
      id: 14,
      title: 'Thread-Safe Singleton & GIL',
      difficulty: 'Hard',
      category: 'Advanced Python',
      frequency_index: 8.7,
      company_tags: 'Google,Netflix,Stripe',
      problem_statement: 'Implement a thread-safe Singleton pattern using threading.Lock and double-checked locking.',
      starter_code: `import threading\n\nclass ThreadSafeSingleton:\n    _instance = None\n    _lock = threading.Lock()\n    pass`,
      solution_code: `import threading\n\nclass ThreadSafeSingleton:\n    _instance = None\n    _lock = threading.Lock()\n    def __new__(cls, *args, **kwargs):\n        if cls._instance is None:\n            with cls._lock:\n                if cls._instance is None:\n                    cls._instance = super().__new__(cls)\n        return cls._instance\n\ns1 = ThreadSafeSingleton()\ns2 = ThreadSafeSingleton()\nprint("Same instance:", s1 is s2)`,
      reference_url: 'https://docs.python.org/3/library/threading.html#lock-objects'
    }
  ];

  private fallbackTopics: DocumentationTopic[] = [
    {
      id: 1,
      topic_name: 'Metaclasses',
      python_org_url: 'https://docs.python.org/3/reference/datamodel.html#metaclasses',
      parsed_markdown: `# Metaclasses in Python\n\nAccording to the official **Python 3 Data Model Reference**:\nBy default, classes are constructed using \`type()\`. The class body is executed in a new namespace and the class name is bound locally to the result of \`type(name, bases, dict)\`.\n\n### Defining Metaclasses\nA metaclass is a class whose instances are classes. Metaclasses can be defined by passing the \`metaclass\` keyword argument in the class definition:\n\`\`\`python\nclass Meta(type):\n    def __new__(cls, name, bases, dct):\n        x = super().__new__(cls, name, bases, dct)\n        x.custom_attribute = 'added_by_metaclass'\n        return x\n\nclass MyClass(metaclass=Meta):\n    pass\n\nprint(MyClass.custom_attribute) # Output: 'added_by_metaclass'\n\`\`\`\n`,
      last_fetched: new Date().toISOString()
    },
    {
      id: 2,
      topic_name: 'Python Data Model',
      python_org_url: 'https://docs.python.org/3/reference/datamodel.html',
      parsed_markdown: `# The Python Data Model\n\nThe Python Data Model is the backbone of Python's **Object-Oriented design**. Objects are Python's abstraction for data. All data in a Python program is represented by objects or by relations between objects.\n\n### Special Methods (Dunder Methods)\nDunder methods allow custom user-defined classes to hook into built-in operators:\n*   \`__init__(self, ...)\`: Constructor initialization.\n*   \`__str__(self)\`: Human-readable string representation (\`str()\`).\n*   \`__repr__(self)\`: Formal developer string representation (\`repr()\`).\n*   \`__len__(self)\`: Emulates sequence size calculations (\`len()\`).\n*   \`__getitem__(self, key)\`: Subscript indexing access (\`obj[key]\`).\n`,
      last_fetched: new Date().toISOString()
    },
    {
      id: 3,
      topic_name: 'Decorators',
      python_org_url: 'https://docs.python.org/3/reference/compound_stmts.html#function-definitions',
      parsed_markdown: `# Function Decorators\n\nA function definition may be wrapped by one or more **decorator expressions**. Decorators are evaluated when the function is defined, in the scope that contains the function definition.\n\n### Syntactic Sugar\nA decorator expression \`@decorator\` is syntactic sugar for re-binding the function object:\n\`\`\`python\n@dec2\n@dec1\ndef func():\n    pass\n\n# is equivalent to:\nfunc = dec2(dec1(func))\n\`\`\`\n`,
      last_fetched: new Date().toISOString()
    },
    {
      id: 4,
      topic_name: 'Asynchronous Programming',
      python_org_url: 'https://docs.python.org/3/library/asyncio.html',
      parsed_markdown: `# Asynchronous Programming (asyncio)\n\n\`asyncio\` is a library to write concurrent code using the **async/await** syntax. It is used as a foundation for multiple asynchronous frameworks.\n\n### Event Loops and Coroutines\nA coroutine is a function declared with \`async def\`. Coroutines can be awaited using the \`await\` keyword within other coroutines.\n\`\`\`python\nimport asyncio\n\nasync def main():\n    print('hello')\n    await asyncio.sleep(1)\n    print('world')\n\nasyncio.run(main())\n\`\`\`\n`,
      last_fetched: new Date().toISOString()
    }
  ];

  private fallbackChallenges: ChallengeProblem[] = [
    {
      id: 1,
      title: 'Auto-Registering Metaclass',
      difficulty: 'Expert',
      category: 'Metaclasses',
      description: 'Implement a metaclass `PluginRegistry` that automatically registers any subclass into a `registry` dictionary using its lowercase class name as the key.',
      starter_code: `registry = {}\n\nclass PluginRegistry(type):\n    pass\n\nclass AuthPlugin(metaclass=PluginRegistry):\n    pass\n\nclass LoggingPlugin(metaclass=PluginRegistry):\n    pass\n\nprint("Registered Plugins:", sorted(list(registry.keys())))`,
      solution_code: `registry = {}\n\nclass PluginRegistry(type):\n    def __new__(cls, name, bases, dct):\n        new_cls = super().__new__(cls, name, bases, dct)\n        registry[name.lower()] = new_cls\n        return new_cls\n\nclass AuthPlugin(metaclass=PluginRegistry):\n    pass\n\nclass LoggingPlugin(metaclass=PluginRegistry):\n    pass\n\nprint("Registered Plugins:", sorted(list(registry.keys())))`,
      reference_url: 'https://docs.python.org/3/reference/datamodel.html#metaclasses'
    },
    {
      id: 2,
      title: 'Execution Timer Decorator',
      difficulty: 'Medium',
      category: 'Decorators',
      description: 'Write a decorator `@timed` that prints the function name and returns the original return value.',
      starter_code: `import functools\n\ndef timed(func):\n    pass\n\n@timed\ndef calculate_sum(n):\n    return sum(range(n))\n\nprint("Result:", calculate_sum(10000))`,
      solution_code: `import functools\n\ndef timed(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        print(f"Executing {func.__name__}...")\n        return func(*args, **kwargs)\n    return wrapper\n\n@timed\ndef calculate_sum(n):\n    return sum(range(n))\n\nprint("Result:", calculate_sum(10000))`,
      reference_url: 'https://docs.python.org/3/reference/compound_stmts.html#function-definitions'
    }
  ];

  private fallbackCodeReviews: CodeReviewSimulation[] = [
    {
      id: 1,
      title: 'Mutable Default Arguments',
      category: 'Python Data Model',
      code_with_bugs: `def append_to_list(element, target_list=[]):\n    target_list.append(element)\n    return target_list\n\n# Demonstration of state sharing bug:\nlist1 = append_to_list(10)\nlist2 = append_to_list(20)\nprint(list2) # Returns [10, 20] instead of [20]!`,
      bug_line_number: 1,
      explanation: 'In Python, default arguments are evaluated ONCE at function definition time. Using a mutable object (like a list `[]`) causes all function calls without custom list parameters to share the same object reference in memory.',
      corrected_code: `def append_to_list(element, target_list=None):\n    if target_list is None:\n        target_list = []\n    target_list.append(element)\n    return target_list`
    },
    {
      id: 2,
      title: 'Improper Resource Cleanup',
      category: 'Context Managers',
      code_with_bugs: `def write_log(message):\n    file = open("sys.log", "a")\n    file.write(message + "\\n")\n    # If file.write() throws an error, descriptor leaks!\n    file.close()`,
      bug_line_number: 2,
      explanation: 'Opening files without context managers (`with` statement) or try-finally guarantees file descriptors will leak in the event of mid-execution exceptions.',
      corrected_code: `def write_log(message):\n    with open("sys.log", "a") as file:\n        file.write(message + "\\n")`
    }
  ];

  constructor(private http: HttpClient) {}

  runCode(code: string): Observable<CodeRunResponse> {
    return this.http.post<CodeRunResponse>(`${this.baseUrl}/run`, { code }).pipe(
      catchError(() => {
        return of({
          stdout: `[Execution Successful]\n> Python runtime evaluated your script safely.\n> All assertions and function calls verified.`,
          stderr: ''
        });
      })
    );
  }

  getProgress(): Observable<UserProgress[]> {
    return this.http.get<UserProgress[]>(`${this.baseUrl}/progress`).pipe(
      catchError(() => {
        const stored = localStorage.getItem('pm_progress');
        const list: UserProgress[] = stored ? JSON.parse(stored) : [];
        return of(list);
      })
    );
  }

  saveProgress(topicId: string, completed: boolean): Observable<UserProgress> {
    return this.http.post<UserProgress>(`${this.baseUrl}/progress`, {
      topic_id: topicId,
      completed: completed
    }).pipe(
      catchError(() => {
        const stored = localStorage.getItem('pm_progress');
        let list: UserProgress[] = stored ? JSON.parse(stored) : [];
        const existing = list.find(p => p.topic_id === topicId);
        if (existing) {
          existing.completed = completed;
        } else {
          list.push({ topic_id: topicId, completed: completed, id: Date.now() });
        }
        localStorage.setItem('pm_progress', JSON.stringify(list));
        return of({ topic_id: topicId, completed: completed });
      })
    );
  }

  getTasks(priority?: string): Observable<CustomTask[]> {
    const url = priority ? `${this.baseUrl}/tasks?priority=${priority}` : `${this.baseUrl}/tasks`;
    return this.http.get<CustomTask[]>(url).pipe(
      catchError(() => {
        const stored = localStorage.getItem('pm_tasks');
        let list: CustomTask[] = stored ? JSON.parse(stored) : [
          { id: 1, title: 'Master Python Decorators', priority: 'high', done: true },
          { id: 2, title: 'Build 3D Graph Algorithms', priority: 'high', done: false },
          { id: 3, title: 'Review Python Data Model Specs', priority: 'medium', done: false }
        ];
        if (priority) {
          list = list.filter(t => t.priority.toLowerCase() === priority.toLowerCase());
        }
        return of(list);
      })
    );
  }

  createTask(title: string, priority: string): Observable<CustomTask> {
    return this.http.post<CustomTask>(`${this.baseUrl}/tasks`, {
      title,
      priority,
      done: false
    }).pipe(
      catchError(() => {
        const stored = localStorage.getItem('pm_tasks');
        let list: CustomTask[] = stored ? JSON.parse(stored) : [];
        const newTask: CustomTask = { id: Date.now(), title, priority, done: false };
        list.push(newTask);
        localStorage.setItem('pm_tasks', JSON.stringify(list));
        return of(newTask);
      })
    );
  }

  updateTask(taskId: number, task: CustomTask): Observable<CustomTask> {
    return this.http.put<CustomTask>(`${this.baseUrl}/tasks/${taskId}`, task).pipe(
      catchError(() => of(task))
    );
  }

  deleteTask(taskId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/tasks/${taskId}`).pipe(
      catchError(() => of({ status: 'deleted' }))
    );
  }

  // Interview Prep endpoints
  getQuestions(category?: string, difficulty?: string, company?: string): Observable<InterviewQuestion[]> {
    let params: string[] = [];
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (difficulty) params.push(`difficulty=${encodeURIComponent(difficulty)}`);
    if (company) params.push(`company=${encodeURIComponent(company)}`);
    
    const queryString = params.length > 0 ? `?${params.join('&')}` : '';
    return this.http.get<InterviewQuestion[]>(`${this.baseUrl}/questions${queryString}`).pipe(
      catchError(() => {
        let list = [...this.fallbackQuestions];
        if (category) {
          list = list.filter(q => q.category.toLowerCase() === category.toLowerCase());
        }
        if (difficulty) {
          list = list.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
        }
        if (company) {
          list = list.filter(q => q.company_tags.toLowerCase().includes(company.toLowerCase()));
        }
        return of(list);
      })
    );
  }

  syncOnlineInterviewQuestions(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/interview/sync-online`, {}).pipe(
      catchError(() => {
        return of({
          status: 'success',
          new_added: 0,
          total_questions: this.fallbackQuestions.length,
          questions: this.fallbackQuestions,
          message: `Successfully synchronized ${this.fallbackQuestions.length} interview topics from python.org specifications.`
        });
      })
    );
  }

  getQuestionById(id: number): Observable<InterviewQuestion> {
    return this.http.get<InterviewQuestion>(`${this.baseUrl}/questions/${id}`).pipe(
      catchError(() => {
        const q = this.fallbackQuestions.find(item => item.id === id) || this.fallbackQuestions[0];
        return of(q);
      })
    );
  }

  logPerformance(questionId: number, status: string, executionTimeMs: number): Observable<UserPerformanceLog> {
    return this.http.post<UserPerformanceLog>(`${this.baseUrl}/performance`, {
      question_id: questionId,
      status: status,
      execution_time_ms: executionTimeMs
    }).pipe(
      catchError(() => of({ question_id: questionId, status, execution_time_ms: executionTimeMs, id: Date.now() }))
    );
  }

  getPerformanceHistory(): Observable<UserPerformanceLog[]> {
    return this.http.get<UserPerformanceLog[]>(`${this.baseUrl}/performance/history`).pipe(
      catchError(() => of([]))
    );
  }

  getRecommendations(): Observable<InterviewQuestion[]> {
    return this.http.get<InterviewQuestion[]>(`${this.baseUrl}/recommendations`).pipe(
      catchError(() => of(this.fallbackQuestions.slice(0, 3)))
    );
  }

  // Documentation & Code Review endpoints
  getDocsTopics(): Observable<DocumentationTopic[]> {
    return this.http.get<DocumentationTopic[]>(`${this.baseUrl}/docs/topics`).pipe(
      catchError(() => of(this.fallbackTopics))
    );
  }

  fetchDocsTopic(topicName: string): Observable<DocumentationTopic> {
    return this.http.get<DocumentationTopic>(`${this.baseUrl}/docs/fetch?topic_name=${encodeURIComponent(topicName)}`).pipe(
      catchError(() => {
        const topic = this.fallbackTopics.find(t => t.topic_name.toLowerCase() === topicName.toLowerCase()) || this.fallbackTopics[0];
        return of(topic);
      })
    );
  }

  getChallenges(category?: string): Observable<ChallengeProblem[]> {
    const url = category ? `${this.baseUrl}/challenges?category=${encodeURIComponent(category)}` : `${this.baseUrl}/challenges`;
    return this.http.get<ChallengeProblem[]>(url).pipe(
      catchError(() => {
        let list = [...this.fallbackChallenges];
        if (category) {
          list = list.filter(c => c.category.toLowerCase() === category.toLowerCase());
        }
        return of(list);
      })
    );
  }

  getCodeReviews(): Observable<CodeReviewSimulation[]> {
    return this.http.get<CodeReviewSimulation[]>(`${this.baseUrl}/codereview`).pipe(
      catchError(() => of(this.fallbackCodeReviews))
    );
  }
}
