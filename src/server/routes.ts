import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db.ts';
import {
  executeBFS,
  executeDFS,
  executeKruskal,
  executePrim,
  findShortestPath,
  topologicalSort,
  findPrerequisiteChain,
  SimpleEdge,
} from '../lib/algorithms/graphAlgorithms.ts';
import {
  solveKnapsackDP,
  generateBacktrackingSequences,
  solveBranchAndBoundPath,
} from '../lib/algorithms/optimizationAlgorithms.ts';
import {
  buildAcademicHierarchyTree,
  traverseAcademicTree,
} from '../lib/algorithms/treeHierarchy.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'academic-knowledge-graph-jwt-secret-key-2026';
const router = express.Router();

// Helper to authenticate user from token or fallback to default student
function getUserIdFromRequest(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      return decoded.id;
    } catch {
      // fallback
    }
  }
  return 'usr-student-1';
}

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------
router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid academic credentials' });
  }

  // Allow student123 or admin123 or any password for seamless demo testing
  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, {
    expiresIn: '7d',
  });

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

router.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (db.getUserByEmail(email)) {
    return res.status(400).json({ error: 'Email is already registered' });
  }

  const newUser = db.createUser({
    name,
    email,
    role: role === 'faculty' ? 'faculty' : 'student',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  });

  const token = jwt.sign({ id: newUser.id, role: newUser.role, email: newUser.email }, JWT_SECRET, {
    expiresIn: '7d',
  });

  return res.status(201).json({ token, user: newUser });
});

router.get('/auth/me', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const user = db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ user });
});

// -------------------------------------------------------------
// Subjects, Units, Topics Hierarchy Endpoints
// -------------------------------------------------------------
router.get('/subjects', (_req: Request, res: Response) => {
  const subjects = db.getSubjects();
  return res.json({ subjects });
});

router.post('/subjects', (req: Request, res: Response) => {
  const { code, name, description, color, iconName } = req.body;
  if (!code || !name) {
    return res.status(400).json({ error: 'Subject code and name are required' });
  }
  const count = db.getSubjects().length;
  const newSubject = db.createSubject({
    code,
    name,
    description: description || '',
    color: color || '#3b82f6',
    iconName: iconName || 'BookOpen',
    orderIndex: count + 1,
  });
  return res.status(201).json({ subject: newSubject });
});

router.get('/units', (req: Request, res: Response) => {
  const subjectId = req.query.subjectId as string | undefined;
  const units = db.getUnits(subjectId);
  return res.json({ units });
});

router.post('/units', (req: Request, res: Response) => {
  const { subjectId, unitNumber, name, description } = req.body;
  if (!subjectId || !name) {
    return res.status(400).json({ error: 'subjectId and name are required' });
  }
  const newUnit = db.createUnit({
    subjectId,
    unitNumber: Number(unitNumber) || 1,
    name,
    description: description || '',
  });
  return res.status(201).json({ unit: newUnit });
});

router.get('/topics', (req: Request, res: Response) => {
  const subjectId = req.query.subjectId as string | undefined;
  const unitId = req.query.unitId as string | undefined;
  const topics = db.getTopics(subjectId, unitId);
  return res.json({ topics });
});

router.get('/topics/:id', (req: Request, res: Response) => {
  const topic = db.getTopicById(req.params.id);
  if (!topic) {
    return res.status(404).json({ error: 'Topic not found' });
  }
  return res.json({ topic });
});

router.post('/topics', (req: Request, res: Response) => {
  const { subjectId, unitId, code, name, description, difficulty, estHours, iconName } = req.body;
  if (!subjectId || !unitId || !name) {
    return res.status(400).json({ error: 'subjectId, unitId, and name are required' });
  }
  const count = db.getTopics(subjectId).length;
  const newTopic = db.createTopic({
    subjectId,
    unitId,
    code: code || `T-${count + 1}`,
    name,
    description: description || '',
    difficulty: difficulty || 'Intermediate',
    estHours: Number(estHours) || 3,
    iconName: iconName || 'FileText',
    orderIndex: count + 1,
  });
  return res.status(201).json({ topic: newTopic });
});

router.put('/topics/:id', (req: Request, res: Response) => {
  const updated = db.updateTopic(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Topic not found' });
  }
  return res.json({ topic: updated });
});

router.delete('/topics/:id', (req: Request, res: Response) => {
  const deleted = db.deleteTopic(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Topic not found' });
  }
  return res.json({ success: true, message: 'Topic deleted successfully' });
});

// Subtopics
router.get('/subtopics', (req: Request, res: Response) => {
  const topicId = req.query.topicId as string | undefined;
  const subtopics = db.getSubtopics(topicId);
  return res.json({ subtopics });
});

router.post('/subtopics', (req: Request, res: Response) => {
  const { topicId, name, description, durationMinutes } = req.body;
  if (!topicId || !name) {
    return res.status(400).json({ error: 'topicId and name are required' });
  }
  const newSub = db.createSubtopic({
    topicId,
    name,
    description: description || '',
    durationMinutes: Number(durationMinutes) || 30,
  });
  return res.status(201).json({ subtopic: newSub });
});

// -------------------------------------------------------------
// Relationships Endpoints
// -------------------------------------------------------------
router.get('/relationships', (_req: Request, res: Response) => {
  const relationships = db.getRelationships();
  return res.json({ relationships });
});

router.post('/relationships', (req: Request, res: Response) => {
  const { sourceTopicId, targetTopicId, relationshipType, weight, description } = req.body;
  if (!sourceTopicId || !targetTopicId || !relationshipType) {
    return res.status(400).json({ error: 'sourceTopicId, targetTopicId, and relationshipType are required' });
  }
  const newRel = db.createRelationship({
    sourceTopicId,
    targetTopicId,
    relationshipType,
    weight: Number(weight) || 1,
    description: description || '',
  });
  return res.status(201).json({ relationship: newRel });
});

router.delete('/relationships/:id', (req: Request, res: Response) => {
  const success = db.deleteRelationship(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Relationship not found' });
  }
  return res.json({ success: true });
});

// -------------------------------------------------------------
// Knowledge Graph Visualizer Data Endpoint
// -------------------------------------------------------------
router.get('/graph', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const graphData = db.getKnowledgeGraph(userId);
  return res.json(graphData);
});

// Shortest exploration route between two topics
router.get('/graph/shortest-path', (req: Request, res: Response) => {
  const { sourceId, targetId } = req.query;
  if (!sourceId || !targetId) {
    return res.status(400).json({ error: 'sourceId and targetId query params are required' });
  }

  const topics = db.getTopics();
  const relationships = db.getRelationships();

  const simpleEdges: SimpleEdge[] = relationships.map(r => ({
    id: r.id,
    source: r.sourceTopicId,
    target: r.targetTopicId,
    weight: r.weight,
  }));

  const result = findShortestPath(
    topics.map(t => ({ id: t.id })),
    simpleEdges,
    String(sourceId),
    String(targetId),
    false
  );

  return res.json({
    ...result,
    sourceTopic: topics.find(t => t.id === sourceId),
    targetTopic: topics.find(t => t.id === targetId),
    pathTopics: result.path.map(id => topics.find(t => t.id === id)),
  });
});

// -------------------------------------------------------------
// DSA Algorithm Laboratory REST APIs
// -------------------------------------------------------------
// 1. Breadth-First Search (BFS)
router.post('/algorithms/bfs', (req: Request, res: Response) => {
  const { startTopicId = 'top-trees', isDirected = false } = req.body;
  const topics = db.getTopics();
  const relationships = db.getRelationships();

  const simpleEdges: SimpleEdge[] = relationships.map(r => ({
    id: r.id,
    source: r.sourceTopicId,
    target: r.targetTopicId,
    weight: r.weight,
  }));

  const result = executeBFS(
    topics.map(t => ({ id: t.id, label: t.name })),
    simpleEdges,
    startTopicId,
    Boolean(isDirected)
  );

  return res.json({
    startTopicId,
    ...result,
  });
});

// 2. Depth-First Search (DFS)
router.post('/algorithms/dfs', (req: Request, res: Response) => {
  const { startTopicId = 'top-trees', isDirected = false } = req.body;
  const topics = db.getTopics();
  const relationships = db.getRelationships();

  const simpleEdges: SimpleEdge[] = relationships.map(r => ({
    id: r.id,
    source: r.sourceTopicId,
    target: r.targetTopicId,
    weight: r.weight,
  }));

  const result = executeDFS(
    topics.map(t => ({ id: t.id, label: t.name })),
    simpleEdges,
    startTopicId,
    Boolean(isDirected)
  );

  return res.json({
    startTopicId,
    ...result,
  });
});

// 3. Kruskal's Minimum Spanning Tree
router.post('/algorithms/kruskal', (_req: Request, res: Response) => {
  const topics = db.getTopics('subj-dsa'); // Focus on DSA concept graph
  const relationships = db.getRelationships();

  const topicIdSet = new Set(topics.map(t => t.id));
  const dsaEdges = relationships
    .filter(r => topicIdSet.has(r.sourceTopicId) && topicIdSet.has(r.targetTopicId))
    .map(r => ({
      id: r.id,
      source: r.sourceTopicId,
      target: r.targetTopicId,
      weight: r.weight,
    }));

  const result = executeKruskal(topics, dsaEdges);
  return res.json({
    totalNodes: topics.length,
    ...result,
  });
});

// 4. Prim's Minimum Spanning Tree
router.post('/algorithms/prim', (req: Request, res: Response) => {
  const { startTopicId = 'top-trees' } = req.body;
  const topics = db.getTopics('subj-dsa');
  const relationships = db.getRelationships();

  const topicIdSet = new Set(topics.map(t => t.id));
  const dsaEdges = relationships
    .filter(r => topicIdSet.has(r.sourceTopicId) && topicIdSet.has(r.targetTopicId))
    .map(r => ({
      id: r.id,
      source: r.sourceTopicId,
      target: r.targetTopicId,
      weight: r.weight,
    }));

  const result = executePrim(topics, dsaEdges, startTopicId);
  return res.json({
    startTopicId,
    totalNodes: topics.length,
    ...result,
  });
});

// 5. 0/1 Knapsack Dynamic Programming
router.post('/algorithms/knapsack', (req: Request, res: Response) => {
  const { maxTimeMinutes = 120, topicId } = req.body;
  const allResources = db.getResources(topicId);
  const result = solveKnapsackDP(allResources, Number(maxTimeMinutes) || 120);
  return res.json(result);
});

// 6. Backtracking
router.post('/algorithms/backtracking', (req: Request, res: Response) => {
  const { sequenceLength = 4, maxSequences = 5 } = req.body;
  const topics = db.getTopics('subj-dsa');
  const relationships = db.getRelationships();

  const prereqs = relationships
    .filter(r => r.relationshipType === 'PREREQUISITE_OF')
    .map(r => ({ prereqId: r.sourceTopicId, topicId: r.targetTopicId }));

  const topicIds = topics.map(t => t.id);
  const result = generateBacktrackingSequences(
    topicIds,
    prereqs,
    Number(sequenceLength) || 4,
    Number(maxSequences) || 5
  );

  return res.json({
    ...result,
    totalTopicsExamined: topicIds.length,
  });
});

// 7. Branch and Bound
router.post('/algorithms/branch-and-bound', (req: Request, res: Response) => {
  const { maxHours = 10 } = req.body;
  const topics = db.getTopics('subj-dsa');
  const relationships = db.getRelationships();

  // Assign learning value proportional to topic difficulty and resources
  const enrichedTopics = topics.map(t => ({
    id: t.id,
    name: t.name,
    estHours: t.estHours,
    learningValue: t.difficulty === 'Advanced' ? 85 : t.difficulty === 'Intermediate' ? 60 : 35,
  }));

  const edges = relationships.map(r => ({ source: r.sourceTopicId, target: r.targetTopicId }));
  const result = solveBranchAndBoundPath(enrichedTopics, edges, Number(maxHours) || 10);

  return res.json(result);
});

// 8. Trees Hierarchical Structure & Traversals
router.get('/algorithms/tree-hierarchy', (req: Request, res: Response) => {
  const order = (req.query.order as 'preorder' | 'postorder' | 'levelorder') || 'preorder';
  const subjects = db.getSubjects();
  const units = db.getUnits();
  const topics = db.getTopics();
  const subtopics = db.getSubtopics();

  const tree = buildAcademicHierarchyTree(subjects, units, topics, subtopics);
  const traversal = traverseAcademicTree(tree, order);

  return res.json({
    tree,
    traversalOrder: traversal,
  });
});

// 9. Adjacency Matrix
router.get('/algorithms/adjacency-matrix', (req: Request, res: Response) => {
  const subjectId = (req.query.subjectId as string) || 'subj-dsa';
  const topics = db.getTopics(subjectId);
  const relationships = db.getRelationships();

  const n = topics.length;
  const matrix: { weight: number; connected: boolean; type?: string }[][] = Array.from(
    { length: n },
    () => Array.from({ length: n }, () => ({ weight: 0, connected: false }))
  );

  const topicIndexMap = new Map(topics.map((t, idx) => [t.id, idx]));

  for (const rel of relationships) {
    const u = topicIndexMap.get(rel.sourceTopicId);
    const v = topicIndexMap.get(rel.targetTopicId);
    if (u !== undefined && v !== undefined) {
      matrix[u][v] = { weight: rel.weight, connected: true, type: rel.relationshipType };
    }
  }

  return res.json({
    topics: topics.map(t => ({ id: t.id, name: t.name, code: t.code })),
    matrix,
  });
});

// -------------------------------------------------------------
// Learning Path Recommendations
// -------------------------------------------------------------
router.get('/learning-paths/recommend', (req: Request, res: Response) => {
  const { targetTopicId } = req.query;
  if (!targetTopicId) {
    return res.status(400).json({ error: 'targetTopicId is required' });
  }

  const topics = db.getTopics();
  const relationships = db.getRelationships();
  const target = topics.find(t => t.id === targetTopicId);

  if (!target) {
    return res.status(404).json({ error: 'Target topic not found' });
  }

  // Find all recursive prerequisites
  const ancestorIds = findPrerequisiteChain(String(targetTopicId), relationships);
  const relevantTopicIds = [...ancestorIds, String(targetTopicId)];
  const relevantTopics = topics.filter(t => relevantTopicIds.includes(t.id));

  // Topologically sort these topics so prerequisite order is followed
  const relevantEdges: SimpleEdge[] = relationships
    .filter(
      r =>
        (r.relationshipType === 'PREREQUISITE_OF' || r.relationshipType === 'DEPENDS_ON') &&
        relevantTopicIds.includes(r.sourceTopicId) &&
        relevantTopicIds.includes(r.targetTopicId)
    )
    .map(r => ({
      id: r.id,
      source: r.sourceTopicId,
      target: r.targetTopicId,
      weight: r.weight,
    }));

  const topo = topologicalSort(relevantTopics.map(t => ({ id: t.id })), relevantEdges);

  // Map to full topic details
  const topicMap = new Map(topics.map(t => [t.id, t]));
  const orderedPath = topo.sortedOrder.map(id => topicMap.get(id)!).filter(Boolean);

  const userId = getUserIdFromRequest(req);
  const userProgress = db.getUserProgress(userId);
  const completedIds = new Set(userProgress.filter(p => p.isCompleted).map(p => p.topicId));

  const pathWithProgress = orderedPath.map((topic, index) => ({
    step: index + 1,
    topic,
    isCompleted: completedIds.has(topic.id),
  }));

  return res.json({
    targetTopic: target,
    totalSteps: pathWithProgress.length,
    completedSteps: pathWithProgress.filter(p => p.isCompleted).length,
    remainingHours: pathWithProgress
      .filter(p => !p.isCompleted)
      .reduce((sum, p) => sum + p.topic.estHours, 0),
    path: pathWithProgress,
  });
});

router.get('/learning-paths', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const paths = db.getLearningPaths(userId);
  return res.json({ paths });
});

router.post('/learning-paths', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const { title, subjectId, targetTopicId, sequenceTopicIds } = req.body;
  if (!title || !subjectId || !targetTopicId || !sequenceTopicIds) {
    return res.status(400).json({ error: 'Missing required path properties' });
  }

  const newPath = db.createLearningPath({
    userId,
    title,
    subjectId,
    targetTopicId,
    sequenceTopicIds,
    status: 'in_progress',
  });

  return res.status(201).json({ path: newPath });
});

// -------------------------------------------------------------
// Learning Resources Endpoints
// -------------------------------------------------------------
router.get('/resources', (req: Request, res: Response) => {
  const topicId = req.query.topicId as string | undefined;
  const resources = db.getResources(topicId);
  return res.json({ resources });
});

router.post('/resources', (req: Request, res: Response) => {
  const { topicId, title, type, url, durationMinutes, learningValue, description, author } = req.body;
  if (!topicId || !title || !type) {
    return res.status(400).json({ error: 'topicId, title, and type are required' });
  }

  const newRes = db.createResource({
    topicId,
    title,
    type,
    url: url || '#',
    durationMinutes: Number(durationMinutes) || 30,
    learningValue: Number(learningValue) || 50,
    description: description || '',
    author: author || 'Academic Faculty',
  });

  return res.status(201).json({ resource: newRes });
});

router.delete('/resources/:id', (req: Request, res: Response) => {
  const success = db.deleteResource(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  return res.json({ success: true });
});

// -------------------------------------------------------------
// Student Progress Endpoints
// -------------------------------------------------------------
router.get('/progress', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const progress = db.getUserProgress(userId);
  return res.json({ progress });
});

router.post('/progress/toggle', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const { topicId } = req.body;
  if (!topicId) {
    return res.status(400).json({ error: 'topicId is required' });
  }
  const updated = db.toggleTopicCompletion(userId, topicId);
  return res.json({ progress: updated });
});

router.post('/progress/notes', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const { topicId, notes, bookmarked } = req.body;
  if (!topicId) {
    return res.status(400).json({ error: 'topicId is required' });
  }
  const updated = db.updateProgressNotes(userId, topicId, notes || '', bookmarked);
  return res.json({ progress: updated });
});

// Reset database to initial accredited seed state
router.post('/seed/reset', (_req: Request, res: Response) => {
  const freshData = db.resetToSeed();
  return res.json({ success: true, message: 'Database reset to initial accredited seed curriculum.' });
});

export default router;
