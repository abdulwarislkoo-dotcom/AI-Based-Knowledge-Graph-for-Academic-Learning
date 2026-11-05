import test from 'node:test';
import assert from 'node:assert/strict';
import {
  executeBFS,
  executeDFS,
  executeKruskal,
  executePrim,
  findShortestPath,
  topologicalSort,
  findPrerequisiteChain,
  SimpleEdge,
} from './graphAlgorithms.ts';
import {
  solveKnapsackDP,
  generateBacktrackingSequences,
  solveBranchAndBoundPath,
} from './optimizationAlgorithms.ts';
import {
  buildAcademicHierarchyTree,
  traverseAcademicTree,
} from './treeHierarchy.ts';
import { LearningResource } from '../../types/index.ts';

// Test Graph Setup: A connected weighted graph
const sampleNodes = [
  { id: 'trees', label: 'Trees' },
  { id: 'bst', label: 'Binary Search Trees' },
  { id: 'graphs', label: 'Graphs' },
  { id: 'bfs', label: 'BFS' },
  { id: 'dfs', label: 'DFS' },
  { id: 'mst', label: 'Kruskal & Prim' },
];

const sampleEdges: SimpleEdge[] = [
  { id: 'e1', source: 'trees', target: 'bst', weight: 2 },
  { id: 'e2', source: 'trees', target: 'graphs', weight: 5 },
  { id: 'e3', source: 'graphs', target: 'bfs', weight: 3 },
  { id: 'e4', source: 'graphs', target: 'dfs', weight: 3 },
  { id: 'e5', source: 'bfs', target: 'mst', weight: 4 },
  { id: 'e6', source: 'dfs', target: 'mst', weight: 4 },
  { id: 'e7', source: 'bst', target: 'dfs', weight: 6 },
];

test('BFS traverses nodes level-by-level starting from root', () => {
  const result = executeBFS(sampleNodes, sampleEdges, 'trees', false);
  assert.equal(result.traversalOrder[0], 'trees');
  assert.equal(result.visitedNodesCount, 6);
  // Level 1 neighbors of trees are bst and graphs
  const level1 = [result.traversalOrder[1], result.traversalOrder[2]];
  assert.ok(level1.includes('bst'));
  assert.ok(level1.includes('graphs'));
  assert.ok(result.steps.length > 0);
});

test('DFS traverses deeply before backtracking', () => {
  const result = executeDFS(sampleNodes, sampleEdges, 'trees', false);
  assert.equal(result.traversalOrder[0], 'trees');
  assert.equal(result.visitedNodesCount, 6);
  assert.ok(result.steps.length > 0);
  assert.ok(result.steps.some(s => s.description.includes('Exploring deeper')));
});

test('Kruskal algorithm produces valid Minimum Spanning Tree without cycles', () => {
  const result = executeKruskal(sampleNodes, sampleEdges);
  // For 6 nodes, a spanning tree has exactly 5 edges
  assert.equal(result.mstEdges.length, 5);
  // Expected MST edges:
  // e1 (wt 2): trees - bst
  // e3 (wt 3): graphs - bfs
  // e4 (wt 3): graphs - dfs
  // e5 (wt 4): bfs - mst
  // e2 (wt 5): trees - graphs
  // Total weight: 2 + 3 + 3 + 4 + 5 = 17
  assert.equal(result.totalWeight, 17);
  // Must reject cycle edges (e6 with wt 4 causes cycle between dfs and mst)
  assert.ok(result.steps.some(s => s.action === 'REJECTED_CYCLE'));
});

test('Prim algorithm computes same MST weight as Kruskal', () => {
  const primResult = executePrim(sampleNodes, sampleEdges, 'trees');
  assert.equal(primResult.mstEdges.length, 5);
  assert.equal(primResult.totalWeight, 17);
  assert.equal(primResult.visitedNodes.length, 6);
});

test('Shortest path finds optimal distance between concepts', () => {
  const result = findShortestPath(sampleNodes, sampleEdges, 'trees', 'mst', false);
  // Path: trees -> graphs (5) -> bfs (3) -> mst (4) = 12
  // Or: trees -> graphs (5) -> dfs (3) -> mst (4) = 12
  assert.equal(result.distance, 12);
  assert.equal(result.path[0], 'trees');
  assert.equal(result.path[result.path.length - 1], 'mst');
});

test('Topological sort resolves valid prerequisite order', () => {
  const directedPrereqEdges: SimpleEdge[] = [
    { id: 'p1', source: 'trees', target: 'bst', weight: 1 },
    { id: 'p2', source: 'trees', target: 'graphs', weight: 1 },
    { id: 'p3', source: 'graphs', target: 'bfs', weight: 1 },
    { id: 'p4', source: 'bfs', target: 'mst', weight: 1 },
  ];
  const topo = topologicalSort(sampleNodes, directedPrereqEdges);
  assert.equal(topo.hasCycle, false);
  const treesIdx = topo.sortedOrder.indexOf('trees');
  const bstIdx = topo.sortedOrder.indexOf('bst');
  const graphsIdx = topo.sortedOrder.indexOf('graphs');
  const mstIdx = topo.sortedOrder.indexOf('mst');

  assert.ok(treesIdx < bstIdx, 'trees must precede bst');
  assert.ok(treesIdx < graphsIdx, 'trees must precede graphs');
  assert.ok(graphsIdx < mstIdx, 'graphs must precede mst');
});

test('Prerequisite chain recursion finds all ancestor prerequisites', () => {
  const relations = [
    { sourceTopicId: 'trees', targetTopicId: 'bst', relationshipType: 'PREREQUISITE_OF' },
    { sourceTopicId: 'bst', targetTopicId: 'avl', relationshipType: 'PREREQUISITE_OF' },
    { sourceTopicId: 'avl', targetTopicId: 'redblack', relationshipType: 'PREREQUISITE_OF' },
  ];
  const ancestors = findPrerequisiteChain('redblack', relations);
  assert.deepEqual(ancestors.sort(), ['avl', 'bst', 'trees'].sort());
});

test('0/1 Knapsack DP selects optimal resources within time budget', () => {
  const resources: LearningResource[] = [
    {
      id: 'r1',
      topicId: 't1',
      title: 'Intro Video',
      type: 'video',
      url: '#',
      durationMinutes: 30,
      learningValue: 40,
      description: 'Intro',
      author: 'Prof',
    },
    {
      id: 'r2',
      topicId: 't1',
      title: 'Comprehensive Guide',
      type: 'pdf',
      url: '#',
      durationMinutes: 60,
      learningValue: 70,
      description: 'Guide',
      author: 'Prof',
    },
    {
      id: 'r3',
      topicId: 't1',
      title: 'Practice Problems',
      type: 'practice',
      url: '#',
      durationMinutes: 45,
      learningValue: 60,
      description: 'Practice',
      author: 'Prof',
    },
    {
      id: 'r4',
      topicId: 't1',
      title: 'Quick Cheatsheet',
      type: 'note',
      url: '#',
      durationMinutes: 15,
      learningValue: 25,
      description: 'Notes',
      author: 'Prof',
    },
  ];

  // With 60 minutes budget:
  // r4 (15m, 25v) + r3 (45m, 60v) = 60m, 85v!
  // Compare with r2 (60m, 70v) -> 85v is strictly better!
  const result = solveKnapsackDP(resources, 60, 15);
  assert.equal(result.maxLearningValue, 85);
  assert.equal(result.selectedResources.length, 2);
  const titles = result.selectedResources.map(r => r.title);
  assert.ok(titles.includes('Quick Cheatsheet'));
  assert.ok(titles.includes('Practice Problems'));
});

test('Backtracking produces prerequisite-compliant sequences and prunes violations', () => {
  const topicIds = ['graphs', 'stacks', 'queues', 'intro'];
  const prereqs = [
    { prereqId: 'intro', topicId: 'stacks' },
    { prereqId: 'intro', topicId: 'queues' },
    { prereqId: 'stacks', topicId: 'graphs' },
  ];

  const result = generateBacktrackingSequences(topicIds, prereqs, 3, 3);
  assert.ok(result.validSequences.length > 0);
  for (const seq of result.validSequences) {
    const introIdx = seq.indexOf('intro');
    const stackIdx = seq.indexOf('stacks');
    if (stackIdx !== -1) {
      assert.ok(introIdx < stackIdx, 'intro must precede stacks');
    }
  }
  // Verify that invalid moves trigger prune/backtrack steps
  assert.ok(result.steps.some(s => s.action === 'BACKTRACK' && !s.isPrerequisiteSatisfied));
});

test('Branch and bound optimizes path within cognitive time constraint', () => {
  const topics = [
    { id: 't1', name: 'Topic 1', estHours: 2, learningValue: 50 },
    { id: 't2', name: 'Topic 2', estHours: 3, learningValue: 80 },
    { id: 't3', name: 'Topic 3', estHours: 4, learningValue: 90 },
    { id: 't4', name: 'Topic 4', estHours: 1, learningValue: 20 },
  ];
  const result = solveBranchAndBoundPath(topics, [], 5);
  assert.ok(result.bestValue > 0);
  assert.ok(result.bestTimeHours <= 5);
  assert.ok(result.steps.some(s => s.action === 'EXPAND' || s.action === 'UPDATE_BEST'));
});

test('Academic Tree Hierarchy constructs proper N-ary levels', () => {
  const tree = buildAcademicHierarchyTree(
    [{ id: 'dsa', code: 'CS201', name: 'DSA', description: 'Algorithms', color: '#3b82f6', iconName: 'Network', orderIndex: 1 }],
    [{ id: 'u1', subjectId: 'dsa', unitNumber: 1, name: 'Trees', description: 'Tree structures' }],
    [{ id: 'top1', subjectId: 'dsa', unitId: 'u1', code: 'T1', name: 'Binary Trees', description: 'BT', difficulty: 'Beginner', estHours: 3, iconName: 'GitFork', orderIndex: 1 }],
    [{ id: 'st1', topicId: 'top1', name: 'Properties', description: 'Height, depth', durationMinutes: 30 }]
  );

  assert.equal(tree.level, 'course');
  assert.equal(tree.children.length, 1);
  assert.equal(tree.children[0].children[0].name, 'Unit 1: Trees');

  const preorder = traverseAcademicTree(tree, 'preorder');
  assert.ok(preorder.length >= 4);
});
