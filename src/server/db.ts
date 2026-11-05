import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Subject,
  Unit,
  Topic,
  Subtopic,
  TopicRelationship,
  LearningResource,
  UserProgress,
  LearningPath,
  GraphNode,
  GraphEdge,
  KnowledgeGraphData,
} from '../types/index.ts';

export interface DatabaseSchema {
  users: User[];
  subjects: Subject[];
  units: Unit[];
  topics: Topic[];
  subtopics: Subtopic[];
  relationships: TopicRelationship[];
  resources: LearningResource[];
  progress: UserProgress[];
  learningPaths: LearningPath[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'academic_knowledge_graph.json');

// Initial seed data representing real college syllabus
function getInitialSeedData(): DatabaseSchema {
  const passwordHash = bcrypt.hashSync('student123', 10);
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);

  const users: User[] = [
    {
      id: 'usr-student-1',
      name: 'Alex Rivera',
      email: 'alex.rivera@university.edu',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-faculty-1',
      name: 'Dr. Priya Sharma',
      email: 'priya.sharma@university.edu',
      role: 'faculty',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    },
  ];

  const subjects: Subject[] = [
    {
      id: 'subj-dsa',
      code: 'CS-201',
      name: 'Data Structures & Algorithms',
      description: 'Comprehensive study of hierarchical structures, graph theory, greedy paradigms, dynamic programming, and combinatorial search.',
      color: '#3b82f6', // blue
      iconName: 'Network',
      orderIndex: 1,
    },
    {
      id: 'subj-dbms',
      code: 'CS-204',
      name: 'Database Management Systems',
      description: 'Relational database theory, normalization, B+ tree indexing, transaction management, and ACID guarantees.',
      color: '#8b5cf6', // purple
      iconName: 'Database',
      orderIndex: 2,
    },
    {
      id: 'subj-os',
      code: 'CS-208',
      name: 'Operating Systems',
      description: 'Process virtualization, CPU scheduling algorithms, mutual exclusion primitives, and virtual memory paging.',
      color: '#10b981', // emerald
      iconName: 'Cpu',
      orderIndex: 3,
    },
    {
      id: 'subj-cn',
      code: 'CS-212',
      name: 'Computer Networks',
      description: 'Protocol layering, Dijkstra link-state routing, TCP congestion control algorithms, and distributed DNS/HTTP.',
      color: '#f59e0b', // amber
      iconName: 'Radio',
      orderIndex: 4,
    },
  ];

  const units: Unit[] = [
    // DSA Units
    {
      id: 'unit-dsa-1',
      subjectId: 'subj-dsa',
      unitNumber: 1,
      name: 'Trees & Hierarchical Structures',
      description: 'Binary trees, binary search trees, self-balancing rotations, and recursive traversals.',
    },
    {
      id: 'unit-dsa-2',
      subjectId: 'subj-dsa',
      unitNumber: 2,
      name: 'Graph Algorithms & Spanning Trees',
      description: 'Adjacency matrices, BFS, DFS, Kruskal, and Prim minimum spanning tree algorithms.',
    },
    {
      id: 'unit-dsa-3',
      subjectId: 'subj-dsa',
      unitNumber: 3,
      name: 'Dynamic Programming Paradigms',
      description: 'Overlapping subproblems, optimal substructure, 0/1 Knapsack, and memoized state tables.',
    },
    {
      id: 'unit-dsa-4',
      subjectId: 'subj-dsa',
      unitNumber: 4,
      name: 'Backtracking & Branch and Bound',
      description: 'State space tree generation, prerequisite pruning, bounding relaxations, and combinatorial search.',
    },

    // DBMS Units
    {
      id: 'unit-dbms-1',
      subjectId: 'subj-dbms',
      unitNumber: 1,
      name: 'Relational Model & Algebra',
      description: 'Entities, attributes, primary/foreign keys, and relational calculus.',
    },
    {
      id: 'unit-dbms-2',
      subjectId: 'subj-dbms',
      unitNumber: 2,
      name: 'Normalization & Schema Design',
      description: 'Functional dependencies, 1NF, 2NF, 3NF, and Boyce-Codd Normal Form (BCNF).',
    },
    {
      id: 'unit-dbms-3',
      subjectId: 'subj-dbms',
      unitNumber: 3,
      name: 'Transactions & Concurrency',
      description: 'ACID properties, two-phase locking (2PL), serializability, and WAL logging.',
    },

    // OS Units
    {
      id: 'unit-os-1',
      subjectId: 'subj-os',
      unitNumber: 1,
      name: 'Process Management & Scheduling',
      description: 'PCB state transitions, context switching, Round Robin, and SJF scheduling.',
    },
    {
      id: 'unit-os-2',
      subjectId: 'subj-os',
      unitNumber: 2,
      name: 'Memory Management & Virtual Memory',
      description: 'Paging, segmentation, TLB caching, and LRU page replacement policies.',
    },
  ];

  const topics: Topic[] = [
    // Unit 1: Trees
    {
      id: 'top-trees',
      subjectId: 'subj-dsa',
      unitId: 'unit-dsa-1',
      code: 'DSA-T01',
      name: 'Trees',
      description: 'Fundamental hierarchical data structure with root, parent, child, ancestor nodes and recursive definitions.',
      difficulty: 'Beginner',
      estHours: 3,
      iconName: 'GitFork',
      orderIndex: 1,
    },
    {
      id: 'top-binary-trees',
      subjectId: 'subj-dsa',
      unitId: 'unit-dsa-1',
      code: 'DSA-T02',
      name: 'Binary Trees',
      description: 'Tree data structure in which each node has at most two children: left child and right child.',
      difficulty: 'Beginner',
      estHours: 4,
      iconName: 'Binary',
      orderIndex: 2,
    },
    {
      id: 'top-bst',
      subjectId: 'subj-dsa',
      unitId: 'unit-dsa-1',
      code: 'DSA-T03',
      name: 'Binary Search Trees',
      description: 'Node-based binary tree with the BST property: left subtree keys < node key < right subtree keys.',
      difficulty: 'Intermediate',
      estHours: 5,
      iconName: 'Search',
      orderIndex: 3,
    },
    {
      id: 'top-tree-traversal',
      subjectId: 'subj-dsa',
      unitId: 'unit-dsa-1',
      code: 'DSA-T04',
      name: 'Tree Traversal',
      description: 'In-order, Pre-order, Post-order depth-first traversals and Level-order breadth-first traversals.',
      difficulty: 'Intermediate',
      estHours: 4,
      iconName: 'ListOrdered',
      orderIndex: 4,
    },

    // Unit 2: Graphs
    {
      id: 'top-graphs',
      subjectId: 'subj-dsa',
      unitId: 'unit-dsa-2',
      code: 'DSA-G01',
      name: 'Graphs',
      description: 'Non-linear data structure consisting of vertices (nodes) and edges representing pair-wise relationships.',
      difficulty: 'Intermediate',
      estHours: 4,
      iconName: 'Share2',
      orderIndex: 1,
    },
    {
      id: 'top-adj-matrix',
      subjectId: 'subj-dsa',
      unitId: 'unit-dsa-2',
      code: 'DSA-G02',
      name: 'Adjacency Matrix',
      description: '2D square matrix used to represent finite graphs with boolean or edge weight values.',
      difficulty: 'Beginner',
      estHours: 3,
      iconName: 'Grid',
      orderIndex: 2,
    },
    {
      id: 'top-bfs',
      subjectId: 'subj-dsa',
      unitId: 'unit-dsa-2',
      code: 'DSA-G03',
      name: 'Breadth-First Search (BFS)',
      description: 'Graph traversal algorithm using FIFO queue to visit vertices level by level, finding unweighted shortest paths.',
      difficulty: 'Intermediate',
      estHours: 5,
      iconName: 'Waves',
      orderIndex: 3,
    },
    {
      id: 'top-dfs',
      subjectId: 'subj-dsa',
      unitId: 'unit-dsa-2',
      code: 'DSA-G04',
      name: 'Depth-First Search (DFS)',
      description: 'Graph traversal algorithm using recursion/stack to explore as deep as possible before backtracking.',
      difficulty: 'Intermediate',
      estHours: 5,
      iconName: 'CornerDownRight',
      orderIndex: 4,
    },
    {
      id: 'top-kruskal',
      subjectId: 'subj-dsa',
      unitId: 'unit-dsa-2',
      code: 'DSA-G05',
      name: "Kruskal's Algorithm",
      description: 'Greedy Minimum Spanning Tree algorithm sorting edges and uniting components using Disjoint Set Union (Union-Find).',
      difficulty: 'Advanced',
      estHours: 6,
      iconName: 'Shuffle',
      orderIndex: 5,
    },
    {
      id: 'top-prim',
      subjectId: 'subj-dsa',
      unitId: 'unit-dsa-2',
      code: 'DSA-G06',
      name: "Prim's Algorithm",
      description: 'Greedy Minimum Spanning Tree algorithm growing a single tree from a starting vertex by selecting minimal cut edges.',
      difficulty: 'Advanced',
      estHours: 6,
      iconName: 'Anchor',
      orderIndex: 6,
    },

    // Unit 3: Dynamic Programming
    {
      id: 'top-dp',
      subjectId: 'subj-dsa',
      unitId: 'unit-dsa-3',
      code: 'DSA-DP01',
      name: 'Dynamic Programming',
      description: 'Algorithmic technique solving complex optimization problems by breaking them into overlapping subproblems and memoizing states.',
      difficulty: 'Intermediate',
      estHours: 6,
      iconName: 'Layers',
      orderIndex: 1,
    },
    {
      id: 'top-knapsack',
      subjectId: 'subj-dsa',
      unitId: 'unit-dsa-3',
      code: 'DSA-DP02',
      name: '0/1 Knapsack Problem',
      description: 'Classic DP optimization problem determining the most valuable combination of items without exceeding a strict capacity limit.',
      difficulty: 'Advanced',
      estHours: 7,
      iconName: 'Briefcase',
      orderIndex: 2,
    },

    // Unit 4: Backtracking & Branch and Bound
    {
      id: 'top-backtracking',
      subjectId: 'subj-dsa',
      unitId: 'unit-dsa-4',
      code: 'DSA-BB01',
      name: 'Backtracking',
      description: 'Systematic search through candidate solutions that immediately abandons (backtracks) when a constraint is violated.',
      difficulty: 'Intermediate',
      estHours: 5,
      iconName: 'Undo2',
      orderIndex: 1,
    },
    {
      id: 'top-branch-bound',
      subjectId: 'subj-dsa',
      unitId: 'unit-dsa-4',
      code: 'DSA-BB02',
      name: 'Branch and Bound',
      description: 'State space search optimization using bounding functions (upper/lower bounds) to prune non-optimal candidate subtrees.',
      difficulty: 'Advanced',
      estHours: 7,
      iconName: 'Scissors',
      orderIndex: 2,
    },

    // DBMS Topics
    {
      id: 'top-rel-model',
      subjectId: 'subj-dbms',
      unitId: 'unit-dbms-1',
      code: 'DB-01',
      name: 'Relational Model',
      description: 'Tabular representation of data with tuples, relations, primary keys, and candidate keys.',
      difficulty: 'Beginner',
      estHours: 4,
      iconName: 'Table',
      orderIndex: 1,
    },
    {
      id: 'top-normalization',
      subjectId: 'subj-dbms',
      unitId: 'unit-dbms-2',
      code: 'DB-02',
      name: 'Database Normalization',
      description: 'Methodical process of minimizing data redundancy and dependency anomalies (1NF, 2NF, 3NF, BCNF).',
      difficulty: 'Intermediate',
      estHours: 6,
      iconName: 'Sliders',
      orderIndex: 2,
    },
    {
      id: 'top-transactions',
      subjectId: 'subj-dbms',
      unitId: 'unit-dbms-3',
      code: 'DB-03',
      name: 'ACID & Transactions',
      description: 'Atomicity, Consistency, Isolation, and Durability guarantees in concurrent transaction processing.',
      difficulty: 'Advanced',
      estHours: 5,
      iconName: 'ShieldCheck',
      orderIndex: 3,
    },

    // OS Topics
    {
      id: 'top-cpu-sched',
      subjectId: 'subj-os',
      unitId: 'unit-os-1',
      code: 'OS-01',
      name: 'CPU Scheduling Algorithms',
      description: 'Preemptive and non-preemptive policies including FCFS, Shortest Job First (SJF), and Priority Round Robin.',
      difficulty: 'Intermediate',
      estHours: 5,
      iconName: 'Clock',
      orderIndex: 1,
    },
    {
      id: 'top-virt-mem',
      subjectId: 'subj-os',
      unitId: 'unit-os-2',
      code: 'OS-02',
      name: 'Virtual Memory & Paging',
      description: 'Hardware address translation, page tables, page faults, and working-set replacement strategies.',
      difficulty: 'Advanced',
      estHours: 6,
      iconName: 'HardDrive',
      orderIndex: 2,
    },
  ];

  const subtopics: Subtopic[] = [
    { id: 'sub-trees-1', topicId: 'top-trees', name: 'Tree Terminology (Root, Degree, Depth, Height)', description: 'Essential definitions and terminology for tree nodes.', durationMinutes: 30 },
    { id: 'sub-trees-2', topicId: 'top-trees', name: 'N-ary Trees vs Binary Trees', description: 'Degree limits and representation techniques.', durationMinutes: 40 },
    { id: 'sub-bt-1', topicId: 'top-binary-trees', name: 'Full, Complete, and Perfect Binary Trees', description: 'Structural invariants of binary tree categories.', durationMinutes: 45 },
    { id: 'sub-bst-1', topicId: 'top-bst', name: 'BST Insertion and Deletion Algorithms', description: 'Preserving BST invariants upon node removal (inorder predecessor/successor).', durationMinutes: 60 },
    { id: 'sub-bst-2', topicId: 'top-bst', name: 'Time Complexity Analysis: Best vs Degenerate O(N)', description: 'Degeneracy into linked list and necessity of self-balancing.', durationMinutes: 40 },
    { id: 'sub-traversal-1', topicId: 'top-tree-traversal', name: 'Recursive vs Iterative DFS Traversals', description: 'Call-stack vs explicit stack mechanics.', durationMinutes: 50 },
    { id: 'sub-traversal-2', topicId: 'top-tree-traversal', name: 'Breadth-First Level Order Traversal', description: 'Queue-based traversal printing level by level.', durationMinutes: 40 },
    { id: 'sub-graphs-1', topicId: 'top-graphs', name: 'Directed vs Undirected Graphs', description: 'Symmetric vs asymmetric relation matrices.', durationMinutes: 35 },
    { id: 'sub-adj-1', topicId: 'top-adj-matrix', name: 'Adjacency Matrix vs Adjacency List Space Tradeoffs', description: 'O(V^2) vs O(V+E) density comparisons.', durationMinutes: 45 },
    { id: 'sub-bfs-1', topicId: 'top-bfs', name: 'FIFO Queue Implementation & Shortest Path Property', description: 'Unweighted single-source shortest path proofs.', durationMinutes: 55 },
    { id: 'sub-dfs-1', topicId: 'top-dfs', name: 'Cycle Detection in Directed Graphs using Coloring', description: 'White, Grey, Black vertex states.', durationMinutes: 50 },
    { id: 'sub-kruskal-1', topicId: 'top-kruskal', name: 'Union-Find with Path Compression and Rank', description: 'Near O(1) amortized inverse Ackermann complexity.', durationMinutes: 60 },
    { id: 'sub-prim-1', topicId: 'top-prim', name: 'Cut Property & Min-Priority Queue Implementation', description: 'Dense vs sparse graphs suitability.', durationMinutes: 60 },
    { id: 'sub-dp-1', topicId: 'top-dp', name: 'Memoization (Top-down) vs Tabulation (Bottom-up)', description: 'Tradeoffs between recursion stack and iterative state arrays.', durationMinutes: 55 },
    { id: 'sub-knapsack-1', topicId: 'top-knapsack', name: '2D DP Recurrence Formulation: dp[i][w]', description: 'Include vs exclude item decisions.', durationMinutes: 70 },
    { id: 'sub-backtracking-1', topicId: 'top-backtracking', name: 'N-Queens Problem & State Pruning', description: 'Bounding column, diagonal, and anti-diagonal checks.', durationMinutes: 65 },
    { id: 'sub-bb-1', topicId: 'top-branch-bound', name: 'Upper Bound Relaxation & Priority Queue Pruning', description: 'Branch and bound search tree pruning proofs.', durationMinutes: 75 },
  ];

  const relationships: TopicRelationship[] = [
    // Prerequisites:
    // Trees -> Binary Trees -> BST
    { id: 'rel-1', sourceTopicId: 'top-trees', targetTopicId: 'top-binary-trees', relationshipType: 'PREREQUISITE_OF', weight: 2, description: 'Understanding tree terminology is prerequisite for binary tree constraints.' },
    { id: 'rel-2', sourceTopicId: 'top-binary-trees', targetTopicId: 'top-bst', relationshipType: 'PREREQUISITE_OF', weight: 3, description: 'Binary tree structure is required before learning BST ordering properties.' },
    { id: 'rel-3', sourceTopicId: 'top-binary-trees', targetTopicId: 'top-tree-traversal', relationshipType: 'PREREQUISITE_OF', weight: 2, description: 'Traversals operate directly over binary tree nodes.' },
    
    // Graphs & Representations
    { id: 'rel-4', sourceTopicId: 'top-graphs', targetTopicId: 'top-adj-matrix', relationshipType: 'PREREQUISITE_OF', weight: 2, description: 'Graph mathematical definition precedes matrix implementation.' },
    { id: 'rel-5', sourceTopicId: 'top-adj-matrix', targetTopicId: 'top-bfs', relationshipType: 'PREREQUISITE_OF', weight: 3, description: 'BFS queries neighbors via adjacency representations.' },
    { id: 'rel-6', sourceTopicId: 'top-adj-matrix', targetTopicId: 'top-dfs', relationshipType: 'PREREQUISITE_OF', weight: 3, description: 'DFS recursively traverses adjacency representations.' },
    
    // Traversals -> Minimum Spanning Trees
    { id: 'rel-7', sourceTopicId: 'top-bfs', targetTopicId: 'top-prim', relationshipType: 'PREREQUISITE_OF', weight: 4, description: 'Prim is a greedy cut expansion conceptually related to BFS exploration.' },
    { id: 'rel-8', sourceTopicId: 'top-dfs', targetTopicId: 'top-kruskal', relationshipType: 'PREREQUISITE_OF', weight: 4, description: 'Understanding connected components prepares for Union-Find cycles.' },
    
    // Dynamic Programming
    { id: 'rel-9', sourceTopicId: 'top-dp', targetTopicId: 'top-knapsack', relationshipType: 'PREREQUISITE_OF', weight: 5, description: 'Understanding optimal substructure is prerequisite for 0/1 knapsack formulation.' },
    
    // Backtracking & Branch and Bound
    { id: 'rel-10', sourceTopicId: 'top-tree-traversal', targetTopicId: 'top-backtracking', relationshipType: 'PREREQUISITE_OF', weight: 3, description: 'Backtracking is depth-first search on implicit state space trees.' },
    { id: 'rel-11', sourceTopicId: 'top-backtracking', targetTopicId: 'top-branch-bound', relationshipType: 'PREREQUISITE_OF', weight: 4, description: 'Branch and bound enhances backtracking with bounding relaxations.' },
    { id: 'rel-12', sourceTopicId: 'top-knapsack', targetTopicId: 'top-branch-bound', relationshipType: 'RELATED_TO', weight: 4, description: 'Branch and bound frequently solves 0/1 knapsack via fractional relaxation.' },
    
    // Inter-subject relationships
    { id: 'rel-13', sourceTopicId: 'top-bst', targetTopicId: 'top-normalization', relationshipType: 'RELATED_TO', weight: 3, description: 'B-tree indexing in databases extends multi-way balanced BST concepts.' },
    { id: 'rel-14', sourceTopicId: 'top-graphs', targetTopicId: 'top-cpu-sched', relationshipType: 'RELATED_TO', weight: 3, description: 'Resource Allocation Graphs in OS detect deadlocks using cycle detection.' },
    { id: 'rel-15', sourceTopicId: 'top-bfs', targetTopicId: 'top-cpu-sched', relationshipType: 'RELATED_TO', weight: 2, description: 'FIFO ready queues mirror BFS queue mechanics.' },
  ];

  const resources: LearningResource[] = [
    // DSA Resources
    {
      id: 'res-1',
      topicId: 'top-trees',
      title: 'Stanford CS106B: Introduction to Hierarchical Trees',
      type: 'video',
      url: 'https://youtube.com',
      durationMinutes: 45,
      learningValue: 60,
      description: 'Core concepts of tree nodes, height calculation, and recursion basics.',
      author: 'Stanford Computer Science',
    },
    {
      id: 'res-2',
      topicId: 'top-trees',
      title: 'Complete Tree Invariants & Terminology Notes',
      type: 'note',
      url: '#notes-trees',
      durationMinutes: 20,
      learningValue: 35,
      description: 'Comprehensive college notes covering leaf nodes, subtrees, and ancestor formulas.',
      author: 'Prof. Miller',
    },
    {
      id: 'res-3',
      topicId: 'top-bst',
      title: 'Interactive BST Insertion & Deletion Guide',
      type: 'practice',
      url: '#practice-bst',
      durationMinutes: 50,
      learningValue: 80,
      description: 'Interactive step-by-step coding walkthrough of BST rotation and node removal.',
      author: 'MIT OpenCourseWare',
    },
    {
      id: 'res-4',
      topicId: 'top-adj-matrix',
      title: 'Graph Storage Representation & Benchmarks PDF',
      type: 'pdf',
      url: '#pdf-graph-matrix',
      durationMinutes: 30,
      learningValue: 45,
      description: 'Mathematical matrix multiplication, transitive closures, and memory cache locality.',
      author: 'ACM Curriculum Series',
    },
    {
      id: 'res-5',
      topicId: 'top-bfs',
      title: 'BFS Wavefront Animation & Unweighted Shortest Path',
      type: 'video',
      url: 'https://youtube.com',
      durationMinutes: 35,
      learningValue: 65,
      description: 'Visualizing FIFO queues, frontier level discovery, and edge relaxations.',
      author: 'VisualAlgo Education',
    },
    {
      id: 'res-6',
      topicId: 'top-dfs',
      title: 'DFS Deep Exploration & Topological Ordering Guide',
      type: 'note',
      url: '#notes-dfs',
      durationMinutes: 30,
      learningValue: 60,
      description: 'Recursion stacks, back edges, forward edges, and cross edges explanation.',
      author: 'Dr. Priya Sharma',
    },
    {
      id: 'res-7',
      topicId: 'top-kruskal',
      title: "Kruskal's Algorithm & Disjoint-Set Union Deep Dive",
      type: 'pdf',
      url: '#pdf-kruskal',
      durationMinutes: 60,
      learningValue: 90,
      description: 'Rigorous proof of cut property and Union-Find rank with path compression.',
      author: 'Sedgewick Algorithms',
    },
    {
      id: 'res-8',
      topicId: 'top-prim',
      title: "Prim's Algorithm Interactive Min-Heap Implementation",
      type: 'practice',
      url: '#practice-prim',
      durationMinutes: 55,
      learningValue: 85,
      description: 'Hands-on practice constructing minimum spanning trees from arbitrary roots.',
      author: 'GeeksforGeeks Academic',
    },
    {
      id: 'res-9',
      topicId: 'top-knapsack',
      title: '0/1 Knapsack Tabulation vs Space Optimization',
      type: 'video',
      url: 'https://youtube.com',
      durationMinutes: 40,
      learningValue: 75,
      description: 'Step-by-step derivation of the 2D matrix transition and 1D array optimization.',
      author: 'CS50 Beyond',
    },
    {
      id: 'res-10',
      topicId: 'top-knapsack',
      title: 'Curated 0/1 Knapsack Practice Problem Set',
      type: 'practice',
      url: '#practice-knapsack',
      durationMinutes: 45,
      learningValue: 80,
      description: 'Ten college-level examination questions on knapsack decision trees.',
      author: 'Prof. Davis',
    },
    {
      id: 'res-11',
      topicId: 'top-backtracking',
      title: 'Backtracking State Space Trees & Constraint Pruning',
      type: 'note',
      url: '#notes-backtracking',
      durationMinutes: 35,
      learningValue: 60,
      description: 'Clear breakdown of base cases, recursive candidate generation, and state rollback.',
      author: 'Dr. Priya Sharma',
    },
    {
      id: 'res-12',
      topicId: 'top-branch-bound',
      title: 'Branch and Bound vs Dynamic Programming Comparison',
      type: 'pdf',
      url: '#pdf-branch-bound',
      durationMinutes: 50,
      learningValue: 85,
      description: 'Comparative study on exponential state space reduction using optimistic bounds.',
      author: 'IEEE Computer Society',
    },
  ];

  const progress: UserProgress[] = [
    {
      id: 'prog-1',
      userId: 'usr-student-1',
      topicId: 'top-trees',
      isCompleted: true,
      completionDate: '2026-10-15T14:30:00Z',
      notes: 'Understood tree terminology and root invariants thoroughly.',
      bookmarked: true,
      quizScore: 95,
    },
    {
      id: 'prog-2',
      userId: 'usr-student-1',
      topicId: 'top-binary-trees',
      isCompleted: true,
      completionDate: '2026-10-18T10:15:00Z',
      notes: 'Mastered maximum node counts at level i: 2^i.',
      bookmarked: false,
      quizScore: 90,
    },
    {
      id: 'prog-3',
      userId: 'usr-student-1',
      topicId: 'top-tree-traversal',
      isCompleted: true,
      completionDate: '2026-10-22T16:00:00Z',
      notes: 'Inorder traversal of BST naturally produces sorted sequence!',
      bookmarked: true,
      quizScore: 88,
    },
    {
      id: 'prog-4',
      userId: 'usr-student-1',
      topicId: 'top-graphs',
      isCompleted: true,
      completionDate: '2026-10-25T11:20:00Z',
      notes: 'Reviewed vertex degrees and dense vs sparse graph metrics.',
      bookmarked: false,
      quizScore: 92,
    },
    {
      id: 'prog-5',
      userId: 'usr-student-1',
      topicId: 'top-adj-matrix',
      isCompleted: true,
      completionDate: '2026-10-28T09:45:00Z',
      notes: 'Implemented 2D array representation in C++ and Python.',
      bookmarked: false,
      quizScore: 94,
    },
    {
      id: 'prog-6',
      userId: 'usr-student-1',
      topicId: 'top-bfs',
      isCompleted: false,
      notes: 'Currently practicing shortest path finding using FIFO queue.',
      bookmarked: true,
    },
  ];

  const learningPaths: LearningPath[] = [
    {
      id: 'path-1',
      userId: 'usr-student-1',
      title: 'Foundations of Graph Algorithms & MST Mastery',
      subjectId: 'subj-dsa',
      targetTopicId: 'top-kruskal',
      sequenceTopicIds: ['top-trees', 'top-binary-trees', 'top-graphs', 'top-adj-matrix', 'top-dfs', 'top-kruskal'],
      status: 'in_progress',
      createdAt: '2026-10-12T08:00:00Z',
    },
    {
      id: 'path-2',
      userId: 'usr-student-1',
      title: 'Combinatorial Optimization & Search Track',
      subjectId: 'subj-dsa',
      targetTopicId: 'top-branch-bound',
      sequenceTopicIds: ['top-trees', 'top-tree-traversal', 'top-dp', 'top-knapsack', 'top-backtracking', 'top-branch-bound'],
      status: 'in_progress',
      createdAt: '2026-10-20T12:00:00Z',
    },
  ];

  return {
    users,
    subjects,
    units,
    topics,
    subtopics,
    relationships,
    resources,
    progress,
    learningPaths,
  };
}

class AcademicDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content);
      }
    } catch (err) {
      console.warn('Could not read existing database, initializing fresh seed data.', err);
    }

    const initial = getInitialSeedData();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave: DatabaseSchema = this.data): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to file:', err);
    }
  }

  // Reset database to initial accredited seed state
  public resetToSeed(): DatabaseSchema {
    this.data = getInitialSeedData();
    this.saveData();
    return this.data;
  }

  // Users
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.saveData();
    return newUser;
  }

  // Subjects
  public getSubjects(): Subject[] {
    return [...this.data.subjects].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  public getSubjectById(id: string): Subject | undefined {
    return this.data.subjects.find(s => s.id === id);
  }

  public createSubject(subject: Omit<Subject, 'id'>): Subject {
    const newSubject: Subject = {
      ...subject,
      id: `subj-${Date.now()}`,
    };
    this.data.subjects.push(newSubject);
    this.saveData();
    return newSubject;
  }

  // Units
  public getUnits(subjectId?: string): Unit[] {
    if (subjectId) {
      return this.data.units.filter(u => u.subjectId === subjectId);
    }
    return this.data.units;
  }

  public createUnit(unit: Omit<Unit, 'id'>): Unit {
    const newUnit: Unit = {
      ...unit,
      id: `unit-${Date.now()}`,
    };
    this.data.units.push(newUnit);
    this.saveData();
    return newUnit;
  }

  // Topics
  public getTopics(subjectId?: string, unitId?: string): (Topic & { subtopics: Subtopic[] })[] {
    let filtered = this.data.topics;
    if (subjectId) {
      filtered = filtered.filter(t => t.subjectId === subjectId);
    }
    if (unitId) {
      filtered = filtered.filter(t => t.unitId === unitId);
    }

    return filtered.map(t => ({
      ...t,
      subtopics: this.data.subtopics.filter(st => st.topicId === t.id),
    }));
  }

  public getTopicById(id: string): (Topic & { subtopics: Subtopic[] }) | undefined {
    const t = this.data.topics.find(item => item.id === id);
    if (!t) return undefined;
    return {
      ...t,
      subtopics: this.data.subtopics.filter(st => st.topicId === t.id),
    };
  }

  public createTopic(topic: Omit<Topic, 'id'>): Topic {
    const newTopic: Topic = {
      ...topic,
      id: `top-${Date.now()}`,
    };
    this.data.topics.push(newTopic);
    this.saveData();
    return newTopic;
  }

  public updateTopic(id: string, updates: Partial<Topic>): Topic | undefined {
    const index = this.data.topics.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    this.data.topics[index] = { ...this.data.topics[index], ...updates };
    this.saveData();
    return this.data.topics[index];
  }

  public deleteTopic(id: string): boolean {
    const initialLen = this.data.topics.length;
    this.data.topics = this.data.topics.filter(t => t.id !== id);
    // Also cascade delete relationships and subtopics
    this.data.relationships = this.data.relationships.filter(
      r => r.sourceTopicId !== id && r.targetTopicId !== id
    );
    this.data.subtopics = this.data.subtopics.filter(st => st.topicId !== id);
    this.data.resources = this.data.resources.filter(res => res.topicId !== id);
    this.data.progress = this.data.progress.filter(p => p.topicId !== id);
    this.saveData();
    return this.data.topics.length < initialLen;
  }

  // Subtopics
  public getSubtopics(topicId?: string): Subtopic[] {
    if (topicId) {
      return this.data.subtopics.filter(st => st.topicId === topicId);
    }
    return this.data.subtopics;
  }

  public createSubtopic(subtopic: Omit<Subtopic, 'id'>): Subtopic {
    const newSub: Subtopic = {
      ...subtopic,
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    this.data.subtopics.push(newSub);
    this.saveData();
    return newSub;
  }

  // Relationships
  public getRelationships(): TopicRelationship[] {
    return this.data.relationships;
  }

  public createRelationship(rel: Omit<TopicRelationship, 'id'>): TopicRelationship {
    const newRel: TopicRelationship = {
      ...rel,
      id: `rel-${Date.now()}`,
    };
    this.data.relationships.push(newRel);
    this.saveData();
    return newRel;
  }

  public deleteRelationship(id: string): boolean {
    const len = this.data.relationships.length;
    this.data.relationships = this.data.relationships.filter(r => r.id !== id);
    this.saveData();
    return this.data.relationships.length < len;
  }

  // Resources
  public getResources(topicId?: string): LearningResource[] {
    if (topicId) {
      return this.data.resources.filter(r => r.topicId === topicId);
    }
    return this.data.resources;
  }

  public createResource(resource: Omit<LearningResource, 'id'>): LearningResource {
    const newRes: LearningResource = {
      ...resource,
      id: `res-${Date.now()}`,
    };
    this.data.resources.push(newRes);
    this.saveData();
    return newRes;
  }

  public deleteResource(id: string): boolean {
    const len = this.data.resources.length;
    this.data.resources = this.data.resources.filter(r => r.id !== id);
    this.saveData();
    return this.data.resources.length < len;
  }

  // User Progress
  public getUserProgress(userId: string): UserProgress[] {
    return this.data.progress.filter(p => p.userId === userId);
  }

  public toggleTopicCompletion(userId: string, topicId: string): UserProgress {
    let item = this.data.progress.find(p => p.userId === userId && p.topicId === topicId);
    if (!item) {
      item = {
        id: `prog-${Date.now()}`,
        userId,
        topicId,
        isCompleted: true,
        completionDate: new Date().toISOString(),
      };
      this.data.progress.push(item);
    } else {
      item.isCompleted = !item.isCompleted;
      item.completionDate = item.isCompleted ? new Date().toISOString() : undefined;
    }
    this.saveData();
    return item;
  }

  public updateProgressNotes(userId: string, topicId: string, notes: string, bookmarked?: boolean): UserProgress {
    let item = this.data.progress.find(p => p.userId === userId && p.topicId === topicId);
    if (!item) {
      item = {
        id: `prog-${Date.now()}`,
        userId,
        topicId,
        isCompleted: false,
        notes,
        bookmarked: bookmarked ?? false,
      };
      this.data.progress.push(item);
    } else {
      item.notes = notes;
      if (bookmarked !== undefined) item.bookmarked = bookmarked;
    }
    this.saveData();
    return item;
  }

  // Learning Paths
  public getLearningPaths(userId?: string): LearningPath[] {
    if (userId) {
      return this.data.learningPaths.filter(lp => lp.userId === userId);
    }
    return this.data.learningPaths;
  }

  public createLearningPath(pathData: Omit<LearningPath, 'id' | 'createdAt'>): LearningPath {
    const newPath: LearningPath = {
      ...pathData,
      id: `path-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.learningPaths.push(newPath);
    this.saveData();
    return newPath;
  }

  // Knowledge Graph Data generator with degree calculations and visual metadata
  public getKnowledgeGraph(userId: string = 'usr-student-1'): KnowledgeGraphData {
    const userProgress = this.getUserProgress(userId);
    const completedTopicIds = new Set(
      userProgress.filter(p => p.isCompleted).map(p => p.topicId)
    );

    const subjectMap = new Map(this.data.subjects.map(s => [s.id, s]));

    // Build degree counts
    const inDegreeMap = new Map<string, number>();
    const outDegreeMap = new Map<string, number>();

    for (const rel of this.data.relationships) {
      outDegreeMap.set(rel.sourceTopicId, (outDegreeMap.get(rel.sourceTopicId) || 0) + 1);
      inDegreeMap.set(rel.targetTopicId, (inDegreeMap.get(rel.targetTopicId) || 0) + 1);
    }

    const nodes: GraphNode[] = this.data.topics.map(topic => {
      const subject = subjectMap.get(topic.subjectId);
      const inDeg = inDegreeMap.get(topic.id) || 0;
      const outDeg = outDegreeMap.get(topic.id) || 0;

      return {
        id: topic.id,
        label: topic.name,
        type: 'topic',
        subjectId: topic.subjectId,
        unitId: topic.unitId,
        difficulty: topic.difficulty,
        estHours: topic.estHours,
        color: subject?.color || '#3b82f6',
        isCompleted: completedTopicIds.has(topic.id),
        degree: inDeg + outDeg,
        inDegree: inDeg,
        outDegree: outDeg,
      };
    });

    const edges: GraphEdge[] = this.data.relationships.map(rel => ({
      id: rel.id,
      source: rel.sourceTopicId,
      target: rel.targetTopicId,
      type: rel.relationshipType,
      weight: rel.weight,
      label: rel.relationshipType.replace('_', ' ').toLowerCase(),
    }));

    return { nodes, edges };
  }
}

export const db = new AcademicDatabase();
