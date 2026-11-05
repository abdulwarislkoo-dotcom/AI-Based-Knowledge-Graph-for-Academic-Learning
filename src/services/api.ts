import {
  Subject,
  Unit,
  Topic,
  Subtopic,
  TopicRelationship,
  LearningResource,
  UserProgress,
  LearningPath,
  KnowledgeGraphData,
  BFSStep,
  DFSStep,
  KruskalStep,
  PrimStep,
  KnapsackDPResult,
  BacktrackingStep,
  BranchAndBoundStep,
} from '../types/index.ts';
import { AcademicTreeNode } from '../lib/algorithms/treeHierarchy.ts';

const API_BASE = '/api';

export const api = {
  // Graph Data
  async getKnowledgeGraph(): Promise<KnowledgeGraphData> {
    const res = await fetch(`${API_BASE}/graph`);
    if (!res.ok) throw new Error('Failed to fetch knowledge graph');
    return res.json();
  },

  async getShortestPath(sourceId: string, targetId: string) {
    const res = await fetch(`${API_BASE}/graph/shortest-path?sourceId=${sourceId}&targetId=${targetId}`);
    if (!res.ok) throw new Error('Failed to compute shortest path');
    return res.json();
  },

  // Subjects & Topics
  async getSubjects(): Promise<{ subjects: Subject[] }> {
    const res = await fetch(`${API_BASE}/subjects`);
    if (!res.ok) throw new Error('Failed to fetch subjects');
    return res.json();
  },

  async createSubject(subject: Omit<Subject, 'id'>) {
    const res = await fetch(`${API_BASE}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subject),
    });
    if (!res.ok) throw new Error('Failed to create subject');
    return res.json();
  },

  async getUnits(subjectId?: string): Promise<{ units: Unit[] }> {
    const url = subjectId ? `${API_BASE}/units?subjectId=${subjectId}` : `${API_BASE}/units`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch units');
    return res.json();
  },

  async createUnit(unit: Omit<Unit, 'id'>) {
    const res = await fetch(`${API_BASE}/units`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(unit),
    });
    if (!res.ok) throw new Error('Failed to create unit');
    return res.json();
  },

  async getTopics(subjectId?: string, unitId?: string): Promise<{ topics: (Topic & { subtopics: Subtopic[] })[] }> {
    const params = new URLSearchParams();
    if (subjectId) params.append('subjectId', subjectId);
    if (unitId) params.append('unitId', unitId);
    const res = await fetch(`${API_BASE}/topics?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch topics');
    return res.json();
  },

  async getTopicById(id: string): Promise<{ topic: Topic & { subtopics: Subtopic[] } }> {
    const res = await fetch(`${API_BASE}/topics/${id}`);
    if (!res.ok) throw new Error('Failed to fetch topic details');
    return res.json();
  },

  async createTopic(topic: Omit<Topic, 'id'>) {
    const res = await fetch(`${API_BASE}/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topic),
    });
    if (!res.ok) throw new Error('Failed to create topic');
    return res.json();
  },

  async updateTopic(id: string, updates: Partial<Topic>) {
    const res = await fetch(`${API_BASE}/topics/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update topic');
    return res.json();
  },

  async deleteTopic(id: string) {
    const res = await fetch(`${API_BASE}/topics/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete topic');
    return res.json();
  },

  // Subtopics
  async createSubtopic(subtopic: Omit<Subtopic, 'id'>) {
    const res = await fetch(`${API_BASE}/subtopics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subtopic),
    });
    if (!res.ok) throw new Error('Failed to create subtopic');
    return res.json();
  },

  // Relationships
  async getRelationships(): Promise<{ relationships: TopicRelationship[] }> {
    const res = await fetch(`${API_BASE}/relationships`);
    if (!res.ok) throw new Error('Failed to fetch relationships');
    return res.json();
  },

  async createRelationship(relationship: Omit<TopicRelationship, 'id'>) {
    const res = await fetch(`${API_BASE}/relationships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(relationship),
    });
    if (!res.ok) throw new Error('Failed to create relationship');
    return res.json();
  },

  async deleteRelationship(id: string) {
    const res = await fetch(`${API_BASE}/relationships/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete relationship');
    return res.json();
  },

  // Resources
  async getResources(topicId?: string): Promise<{ resources: LearningResource[] }> {
    const url = topicId ? `${API_BASE}/resources?topicId=${topicId}` : `${API_BASE}/resources`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch resources');
    return res.json();
  },

  async createResource(resource: Omit<LearningResource, 'id'>) {
    const res = await fetch(`${API_BASE}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resource),
    });
    if (!res.ok) throw new Error('Failed to create resource');
    return res.json();
  },

  async deleteResource(id: string) {
    const res = await fetch(`${API_BASE}/resources/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete resource');
    return res.json();
  },

  // Student Progress
  async getProgress(): Promise<{ progress: UserProgress[] }> {
    const res = await fetch(`${API_BASE}/progress`);
    if (!res.ok) throw new Error('Failed to fetch progress');
    return res.json();
  },

  async toggleTopicCompletion(topicId: string): Promise<{ progress: UserProgress }> {
    const res = await fetch(`${API_BASE}/progress/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId }),
    });
    if (!res.ok) throw new Error('Failed to toggle completion');
    return res.json();
  },

  async updateNotes(topicId: string, notes: string, bookmarked?: boolean) {
    const res = await fetch(`${API_BASE}/progress/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId, notes, bookmarked }),
    });
    if (!res.ok) throw new Error('Failed to save study notes');
    return res.json();
  },

  // Learning Paths
  async getRecommendedPath(targetTopicId: string) {
    const res = await fetch(`${API_BASE}/learning-paths/recommend?targetTopicId=${targetTopicId}`);
    if (!res.ok) throw new Error('Failed to calculate learning path');
    return res.json();
  },

  async getLearningPaths(): Promise<{ paths: LearningPath[] }> {
    const res = await fetch(`${API_BASE}/learning-paths`);
    if (!res.ok) throw new Error('Failed to fetch learning paths');
    return res.json();
  },

  async saveLearningPath(data: {
    title: string;
    subjectId: string;
    targetTopicId: string;
    sequenceTopicIds: string[];
  }) {
    const res = await fetch(`${API_BASE}/learning-paths`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save learning path');
    return res.json();
  },

  // Algorithm APIs
  async runBFS(startTopicId: string, isDirected = false): Promise<{
    traversalOrder: string[];
    visitedNodesCount: number;
    steps: BFSStep[];
  }> {
    const res = await fetch(`${API_BASE}/algorithms/bfs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startTopicId, isDirected }),
    });
    if (!res.ok) throw new Error('Failed to run BFS');
    return res.json();
  },

  async runDFS(startTopicId: string, isDirected = false): Promise<{
    traversalOrder: string[];
    visitedNodesCount: number;
    steps: DFSStep[];
  }> {
    const res = await fetch(`${API_BASE}/algorithms/dfs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startTopicId, isDirected }),
    });
    if (!res.ok) throw new Error('Failed to run DFS');
    return res.json();
  },

  async runKruskal(): Promise<{
    mstEdges: { id: string; source: string; target: string; weight: number }[];
    totalWeight: number;
    steps: KruskalStep[];
    totalNodes: number;
  }> {
    const res = await fetch(`${API_BASE}/algorithms/kruskal`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to run Kruskal algorithm');
    return res.json();
  },

  async runPrim(startTopicId = 'top-trees'): Promise<{
    mstEdges: { id: string; source: string; target: string; weight: number }[];
    totalWeight: number;
    visitedNodes: string[];
    steps: PrimStep[];
    totalNodes: number;
  }> {
    const res = await fetch(`${API_BASE}/algorithms/prim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startTopicId }),
    });
    if (!res.ok) throw new Error('Failed to run Prim algorithm');
    return res.json();
  },

  async runKnapsack(maxTimeMinutes: number, topicId?: string): Promise<KnapsackDPResult> {
    const res = await fetch(`${API_BASE}/algorithms/knapsack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxTimeMinutes, topicId }),
    });
    if (!res.ok) throw new Error('Failed to run Knapsack optimization');
    return res.json();
  },

  async runBacktracking(sequenceLength = 4, maxSequences = 5): Promise<{
    validSequences: string[][];
    steps: BacktrackingStep[];
    totalTopicsExamined: number;
  }> {
    const res = await fetch(`${API_BASE}/algorithms/backtracking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sequenceLength, maxSequences }),
    });
    if (!res.ok) throw new Error('Failed to run Backtracking');
    return res.json();
  },

  async runBranchAndBound(maxHours = 10): Promise<{
    bestPath: string[];
    bestValue: number;
    bestTimeHours: number;
    steps: BranchAndBoundStep[];
  }> {
    const res = await fetch(`${API_BASE}/algorithms/branch-and-bound`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxHours }),
    });
    if (!res.ok) throw new Error('Failed to run Branch and Bound');
    return res.json();
  },

  async getTreeHierarchy(order: 'preorder' | 'postorder' | 'levelorder' = 'preorder'): Promise<{
    tree: AcademicTreeNode;
    traversalOrder: { id: string; name: string; level: string }[];
  }> {
    const res = await fetch(`${API_BASE}/algorithms/tree-hierarchy?order=${order}`);
    if (!res.ok) throw new Error('Failed to fetch tree hierarchy');
    return res.json();
  },

  async getAdjacencyMatrix(subjectId = 'subj-dsa'): Promise<{
    topics: { id: string; name: string; code: string }[];
    matrix: { weight: number; connected: boolean; type?: string }[][];
  }> {
    const res = await fetch(`${API_BASE}/algorithms/adjacency-matrix?subjectId=${subjectId}`);
    if (!res.ok) throw new Error('Failed to fetch adjacency matrix');
    return res.json();
  },

  // Reset database to initial seed
  async resetSeed() {
    const res = await fetch(`${API_BASE}/seed/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset curriculum');
    return res.json();
  },
};
