export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type RelationshipType = 
  | 'PREREQUISITE_OF' 
  | 'RELATED_TO' 
  | 'PART_OF' 
  | 'DEPENDS_ON';

export type ResourceType = 'note' | 'pdf' | 'video' | 'link' | 'practice';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  avatar?: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  description: string;
  color: string;
  iconName: string;
  orderIndex: number;
}

export interface Unit {
  id: string;
  subjectId: string;
  unitNumber: number;
  name: string;
  description: string;
}

export interface Subtopic {
  id: string;
  topicId: string;
  name: string;
  description: string;
  durationMinutes: number;
  isCompleted?: boolean;
}

export interface Topic {
  id: string;
  subjectId: string;
  unitId: string;
  code: string;
  name: string;
  description: string;
  difficulty: DifficultyLevel;
  estHours: number;
  iconName: string;
  orderIndex: number;
  subtopics?: Subtopic[];
}

export interface TopicRelationship {
  id: string;
  sourceTopicId: string;
  targetTopicId: string;
  relationshipType: RelationshipType;
  weight: number; // e.g. cognitive difficulty, prerequisite strength, or time
  description?: string;
}

export interface LearningResource {
  id: string;
  topicId: string;
  title: string;
  type: ResourceType;
  url: string;
  durationMinutes: number;
  learningValue: number; // for Knapsack DP demo
  description: string;
  author: string;
  isCompleted?: boolean;
}

export interface UserProgress {
  id: string;
  userId: string;
  topicId: string;
  isCompleted: boolean;
  completionDate?: string;
  notes?: string;
  bookmarked?: boolean;
  quizScore?: number;
}

export interface LearningPath {
  id: string;
  userId: string;
  title: string;
  subjectId: string;
  targetTopicId: string;
  sequenceTopicIds: string[];
  status: 'in_progress' | 'completed';
  createdAt: string;
}

// Graph Visualization Types
export interface GraphNode {
  id: string;
  label: string;
  type: 'subject' | 'unit' | 'topic' | 'subtopic';
  subjectId: string;
  unitId?: string;
  difficulty?: DifficultyLevel;
  estHours?: number;
  color?: string;
  isCompleted?: boolean;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  degree?: number;
  inDegree?: number;
  outDegree?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  weight: number;
  label?: string;
  animated?: boolean;
  highlighted?: boolean;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Algorithm Demonstration Result Types
export interface BFSStep {
  stepNumber: number;
  currentNode: string;
  queue: string[];
  visited: string[];
  traversalOrder: string[];
  description: string;
}

export interface DFSStep {
  stepNumber: number;
  currentNode: string;
  stack: string[];
  visited: string[];
  traversalOrder: string[];
  description: string;
}

export interface KruskalStep {
  stepNumber: number;
  edge: { source: string; target: string; weight: number; id: string };
  action: 'ACCEPTED' | 'REJECTED_CYCLE';
  disjointSets: Record<string, string>;
  mstEdges: { source: string; target: string; weight: number; id: string }[];
  currentTotalWeight: number;
  description: string;
}

export interface PrimStep {
  stepNumber: number;
  visitedNodes: string[];
  candidateEdges: { source: string; target: string; weight: number; id: string }[];
  selectedEdge?: { source: string; target: string; weight: number; id: string };
  mstEdges: { source: string; target: string; weight: number; id: string }[];
  currentTotalWeight: number;
  description: string;
}

export interface KnapsackDPResult {
  maxLearningValue: number;
  totalTimeMinutes: number;
  selectedResources: LearningResource[];
  dpTable: number[][]; // [resourceIndex][timeMinutes]
  timeSteps: number[]; // e.g. intervals of 15 or 30 mins
  explanation: string;
}

export interface BacktrackingStep {
  stepNumber: number;
  currentSequence: string[];
  candidateTopic: string;
  isPrerequisiteSatisfied: boolean;
  unmetPrerequisites: string[];
  action: 'PUSH' | 'BACKTRACK' | 'VALID_SEQUENCE_FOUND';
  description: string;
}

export interface BranchAndBoundStep {
  stepNumber: number;
  currentPath: string[];
  boundScore: number;
  bestScoreSoFar: number;
  action: 'EXPAND' | 'PRUNE' | 'UPDATE_BEST';
  reason: string;
  activeQueueLength: number;
}
