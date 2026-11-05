# AI-Based Knowledge Graph for Academic Learning

An intelligent, full-stack academic learning platform that organises college-level educational content into an interactive Knowledge Graph and provides interactive demonstrations for Data Structures & Algorithms (Trees, Adjacency Matrix, BFS, DFS, Kruskal's MST, Prim's MST, 0/1 Knapsack DP, Backtracking, and Branch & Bound).

---

## 1. System Architecture

The application adopts a modern full-stack decoupled architecture:
- **Frontend**: React 19 SPA, TypeScript, Tailwind CSS, Framer Motion / Motion, Lucide Icons, Canvas Confetti, and an interactive SVG Knowledge Graph visualizer with real-time zooming, panning, node dragging, prerequisite tracing, and shortest-path computation.
- **Backend**: Express.js REST API server with JWT authentication, CORS, input validation, and algorithm execution engines.
- **Pure Logic Algorithm Layer**: Decoupled, testable computational modules tested with Node's native test runner (`node:test`, `node:assert/strict`).
- **Database Layer**: In-memory relational database with atomic disk persistence (`data/academic_knowledge_graph.json`) seeded with accredited college syllabus data.

---

## 2. Database Schema

The database model incorporates the following primary entities:

### 1. `Users`
- `id`: string (PK)
- `name`: string
- `email`: string (Unique)
- `role`: `'student' | 'faculty' | 'admin'`
- `avatar`: string
- `createdAt`: ISO Timestamp

### 2. `Subjects`
- `id`: string (PK, e.g. `subj-dsa`)
- `code`: string (e.g. `CS-201`)
- `name`: string
- `description`: string
- `color`: string (Hex code)
- `iconName`: string
- `orderIndex`: number

### 3. `Units`
- `id`: string (PK)
- `subjectId`: string (FK -> Subjects)
- `unitNumber`: number (e.g. 1, 2, 3, 4)
- `name`: string
- `description`: string

### 4. `Topics`
- `id`: string (PK, e.g. `top-trees`, `top-kruskal`)
- `subjectId`: string (FK -> Subjects)
- `unitId`: string (FK -> Units)
- `code`: string (e.g. `DSA-T01`)
- `name`: string
- `description`: string
- `difficulty`: `'Beginner' | 'Intermediate' | 'Advanced'`
- `estHours`: number
- `iconName`: string
- `orderIndex`: number

### 5. `Subtopics`
- `id`: string (PK)
- `topicId`: string (FK -> Topics)
- `name`: string
- `description`: string
- `durationMinutes`: number

### 6. `TopicRelationships`
- `id`: string (PK)
- `sourceTopicId`: string (FK -> Topics)
- `targetTopicId`: string (FK -> Topics)
- `relationshipType`: `'PREREQUISITE_OF' | 'RELATED_TO' | 'PART_OF' | 'DEPENDS_ON'`
- `weight`: number (Cognitive distance / hours / difficulty)
- `description`: string

### 7. `LearningResources`
- `id`: string (PK)
- `topicId`: string (FK -> Topics)
- `title`: string
- `type`: `'note' | 'pdf' | 'video' | 'link' | 'practice'`
- `url`: string
- `durationMinutes`: number
- `learningValue`: number (Points used in 0/1 Knapsack optimization)
- `description`: string
- `author`: string

### 8. `UserProgress`
- `id`: string (PK)
- `userId`: string (FK -> Users)
- `topicId`: string (FK -> Topics)
- `isCompleted`: boolean
- `completionDate`: ISO Timestamp
- `notes`: string
- `bookmarked`: boolean
- `quizScore`: number

### 9. `LearningPaths`
- `id`: string (PK)
- `userId`: string (FK -> Users)
- `title`: string
- `subjectId`: string (FK -> Subjects)
- `targetTopicId`: string (FK -> Topics)
- `sequenceTopicIds`: string[] (Topologically sorted concept sequence)
- `status`: `'in_progress' | 'completed'`
- `createdAt`: ISO Timestamp

---

## 3. Implemented College DSA Algorithms

| # | Algorithm | Application on Academic Knowledge Graph | Complexity |
|---|---|---|---|
| **1** | **Trees Hierarchy** | Models Course &rarr; Subject &rarr; Unit &rarr; Topic &rarr; Subtopic with Preorder, Postorder, and Level-order traversals | $O(N)$ Traversal, $O(H)$ Stack |
| **2** | **Adjacency Matrix** | Dense boolean & weighted matrix mapping concept pairwise relations with instant lookup | $O(1)$ query, $O(V^2)$ storage |
| **3** | **Breadth-First Search (BFS)** | Layer-by-layer exploration using FIFO queue; finds unweighted shortest conceptual hops | $O(V + E)$ Time, $O(V)$ Queue |
| **4** | **Depth-First Search (DFS)** | Recursive exploration of prerequisite chains to foundational fundamentals before advancing | $O(V + E)$ Time, $O(V)$ Stack |
| **5** | **Kruskal's Algorithm** | Greedy Minimum Spanning Tree across weighted concepts using Disjoint Set Union (Union-Find) | $O(E \log E)$ Time |
| **6** | **Prim's Algorithm** | Greedy cut-property tree expansion starting from a chosen seed vertex | $O(E + V \log V)$ Time |
| **7** | **0/1 Knapsack DP** | Optimizes study time allocation: selects optimal resource subset maximizing points within study hours | $O(N \cdot W)$ Pseudo-polynomial |
| **8** | **Backtracking** | Generates valid semester study orders and immediately prunes sequences that violate prerequisites | $O(b^d)$ with constraint pruning |
| **9** | **Branch and Bound** | Prunes search paths whose upper bound on cognitive efficiency cannot beat the current best solution | Best-First Search with Bounding |

---

## 4. REST API Documentation

### Authentication
- `POST /api/auth/login` - Authenticate student or faculty user.
- `POST /api/auth/register` - Create user profile.
- `GET /api/auth/me` - Get current session user.

### Knowledge Graph
- `GET /api/graph` - Full knowledge graph nodes, directed edges, degree metrics, and completion state.
- `GET /api/graph/shortest-path?sourceId=...&targetId=...` - Dijkstra shortest path between two concepts.

### Subjects, Units, Topics & Subtopics
- `GET /api/subjects`, `POST /api/subjects` - List or create academic subjects.
- `GET /api/units`, `POST /api/units` - List or create academic units.
- `GET /api/topics`, `POST /api/topics`, `PUT /api/topics/:id`, `DELETE /api/topics/:id` - Full topic management.
- `GET /api/subtopics`, `POST /api/subtopics` - Subtopic checklist endpoints.

### Relationships
- `GET /api/relationships`, `POST /api/relationships`, `DELETE /api/relationships/:id` - Directed prerequisite and correlation edges.

### DSA Algorithm Engines
- `POST /api/algorithms/bfs` - Run BFS step trace from start node.
- `POST /api/algorithms/dfs` - Run DFS call-stack trace from start node.
- `POST /api/algorithms/kruskal` - Compute MST via Kruskal & Union-Find.
- `POST /api/algorithms/prim` - Compute MST via Prim from chosen seed.
- `POST /api/algorithms/knapsack` - 0/1 Knapsack dynamic programming resource optimization.
- `POST /api/algorithms/backtracking` - Backtracking sequence generator with prerequisite pruning.
- `POST /api/algorithms/branch-and-bound` - Branch and bound bounding path optimization.
- `GET /api/algorithms/tree-hierarchy?order=preorder` - Curriculum tree traversal.
- `GET /api/algorithms/adjacency-matrix?subjectId=...` - 2D adjacency matrix.

### Learning Paths & Progress
- `GET /api/learning-paths/recommend?targetTopicId=...` - Topologically sorted prerequisite-first roadmap.
- `GET /api/learning-paths`, `POST /api/learning-paths` - Student saved paths.
- `GET /api/progress`, `POST /api/progress/toggle`, `POST /api/progress/notes` - Real-time student progress tracking.
- `POST /api/seed/reset` - Restores default accredited college curriculum seed.

---

## 5. Installation & Local Development

### Prerequisites
- Node.js 18+ (Node 20 or 22 recommended)
- npm or yarn

### Steps:
```bash
# 1. Install dependencies
npm install

# 2. Run pure logic unit tests
npm test

# 3. Start development server (serves both API and Vite UI on port 3000)
npm run dev

# 4. Open in browser
http://localhost:3000
```

---

## 6. Production Deployment

### Build and Run:
```bash
# Build client assets
npm run build

# Start production server
npm start
```
The application will launch Express on `http://0.0.0.0:3000`, serving `/api/*` endpoints and pre-compiled static assets from `dist/`.

---

## 7. Faculty / Evaluation Demo Guide
1. **Interactive Knowledge Graph**: Click "Graph Explorer" to drag nodes, zoom/pan, click concepts to slide out the details drawer, and click "Trace Prerequisites" to illuminate upstream dependencies in golden pulse edges.
2. **Shortest Route Discovery**: In Graph Explorer, click "Shortest Route", select any two concepts (e.g. `Trees` &rarr; `0/1 Knapsack Problem`), and witness the optimal route traced with edge weights.
3. **9 DSA Simulators**: Open "DSA Lab" to run interactive step-by-step executions of BFS, DFS, Kruskal's MST (with Union-Find), Prim's cut growth, 0/1 Knapsack DP table, Backtracking, and Branch & Bound.
4. **Prerequisite Roadmaps**: Open "Learning Paths" to pick any goal topic (e.g. `Kruskal's Algorithm`) and view the recommended prerequisite-first flowchart.
5. **Real-Time Progress Tracking**: Check off concepts to observe celebratory confetti and dynamic progress updates on the Student Dashboard.
