import { BFSStep, DFSStep, KruskalStep, PrimStep } from '../../types/index.ts';

export interface SimpleEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

/**
 * Builds adjacency list from edges
 */
export function buildAdjacencyList(
  nodes: { id: string }[],
  edges: SimpleEdge[],
  isDirected: boolean = false
): Map<string, { neighbor: string; weight: number; edgeId: string }[]> {
  const adj = new Map<string, { neighbor: string; weight: number; edgeId: string }[]>();
  for (const n of nodes) {
    adj.set(n.id, []);
  }

  for (const edge of edges) {
    if (!adj.has(edge.source)) adj.set(edge.source, []);
    if (!adj.has(edge.target)) adj.set(edge.target, []);

    adj.get(edge.source)!.push({ neighbor: edge.target, weight: edge.weight, edgeId: edge.id });
    if (!isDirected) {
      adj.get(edge.target)!.push({ neighbor: edge.source, weight: edge.weight, edgeId: edge.id });
    }
  }

  return adj;
}

/**
 * Breadth-First Search (BFS) with full step-by-step execution trace
 */
export function executeBFS(
  nodes: { id: string; label?: string }[],
  edges: SimpleEdge[],
  startNodeId: string,
  isDirected: boolean = false
): {
  traversalOrder: string[];
  visitedNodesCount: number;
  steps: BFSStep[];
} {
  const adj = buildAdjacencyList(nodes, edges, isDirected);
  const visited = new Set<string>();
  const queue: string[] = [startNodeId];
  const traversalOrder: string[] = [];
  const steps: BFSStep[] = [];

  visited.add(startNodeId);
  traversalOrder.push(startNodeId);

  let stepNumber = 1;
  steps.push({
    stepNumber: stepNumber++,
    currentNode: startNodeId,
    queue: [...queue],
    visited: Array.from(visited),
    traversalOrder: [...traversalOrder],
    description: `Initialized BFS at start concept [${startNodeId}]. Enqueued to frontier.`,
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = adj.get(current) || [];

    for (const { neighbor } of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        traversalOrder.push(neighbor);

        steps.push({
          stepNumber: stepNumber++,
          currentNode: neighbor,
          queue: [...queue],
          visited: Array.from(visited),
          traversalOrder: [...traversalOrder],
          description: `Discovered unvisited concept [${neighbor}] connected to [${current}]. Enqueued.`,
        });
      }
    }
  }

  return {
    traversalOrder,
    visitedNodesCount: visited.size,
    steps,
  };
}

/**
 * Depth-First Search (DFS) with full step-by-step execution trace
 */
export function executeDFS(
  nodes: { id: string; label?: string }[],
  edges: SimpleEdge[],
  startNodeId: string,
  isDirected: boolean = false
): {
  traversalOrder: string[];
  visitedNodesCount: number;
  steps: DFSStep[];
} {
  const adj = buildAdjacencyList(nodes, edges, isDirected);
  const visited = new Set<string>();
  const traversalOrder: string[] = [];
  const steps: DFSStep[] = [];
  const stack: string[] = [startNodeId];

  let stepNumber = 1;

  function dfsRecursive(curr: string) {
    visited.add(curr);
    traversalOrder.push(curr);

    steps.push({
      stepNumber: stepNumber++,
      currentNode: curr,
      stack: [...stack],
      visited: Array.from(visited),
      traversalOrder: [...traversalOrder],
      description: `Exploring deeper into prerequisite chain at [${curr}]. Added to active stack.`,
    });

    const neighbors = adj.get(curr) || [];
    for (const { neighbor } of neighbors) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
        dfsRecursive(neighbor);
        stack.pop();
        steps.push({
          stepNumber: stepNumber++,
          currentNode: curr,
          stack: [...stack],
          visited: Array.from(visited),
          traversalOrder: [...traversalOrder],
          description: `Backtracked to [${curr}] after exhausting branch through [${neighbor}].`,
        });
      }
    }
  }

  if (nodes.some(n => n.id === startNodeId)) {
    dfsRecursive(startNodeId);
  }

  return {
    traversalOrder,
    visitedNodesCount: visited.size,
    steps,
  };
}

/**
 * Disjoint Set Union (DSU / Union-Find) for Kruskal's MST
 */
export class DisjointSet {
  parent: Map<string, string>;
  rank: Map<string, number>;

  constructor(elements: string[]) {
    this.parent = new Map();
    this.rank = new Map();
    for (const el of elements) {
      this.parent.set(el, el);
      this.rank.set(el, 0);
    }
  }

  find(item: string): string {
    if (!this.parent.has(item)) {
      this.parent.set(item, item);
      this.rank.set(item, 0);
      return item;
    }
    if (this.parent.get(item) !== item) {
      this.parent.set(item, this.find(this.parent.get(item)!));
    }
    return this.parent.get(item)!;
  }

  union(a: string, b: string): boolean {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA === rootB) return false; // Cycle detected

    const rankA = this.rank.get(rootA) || 0;
    const rankB = this.rank.get(rootB) || 0;

    if (rankA < rankB) {
      this.parent.set(rootA, rootB);
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA);
    } else {
      this.parent.set(rootB, rootA);
      this.rank.set(rootA, rankA + 1);
    }
    return true;
  }

  getSnapshot(): Record<string, string> {
    const snapshot: Record<string, string> = {};
    for (const key of this.parent.keys()) {
      snapshot[key] = this.find(key);
    }
    return snapshot;
  }
}

/**
 * Kruskal's Minimum Spanning Tree Algorithm
 */
export function executeKruskal(
  nodes: { id: string }[],
  edges: SimpleEdge[]
): {
  mstEdges: SimpleEdge[];
  totalWeight: number;
  steps: KruskalStep[];
} {
  const nodeIds = nodes.map(n => n.id);
  const dsu = new DisjointSet(nodeIds);

  // Sort edges by non-decreasing weight
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
  const mstEdges: SimpleEdge[] = [];
  const steps: KruskalStep[] = [];
  let currentTotalWeight = 0;
  let stepNumber = 1;

  for (const edge of sortedEdges) {
    const rootU = dsu.find(edge.source);
    const rootV = dsu.find(edge.target);

    if (rootU !== rootV) {
      dsu.union(edge.source, edge.target);
      mstEdges.push(edge);
      currentTotalWeight += edge.weight;

      steps.push({
        stepNumber: stepNumber++,
        edge,
        action: 'ACCEPTED',
        disjointSets: dsu.getSnapshot(),
        mstEdges: [...mstEdges],
        currentTotalWeight,
        description: `Edge (${edge.source} - ${edge.target}, wt: ${edge.weight}) connects separate sets [${rootU}] and [${rootV}]. Accepted into MST.`,
      });
    } else {
      steps.push({
        stepNumber: stepNumber++,
        edge,
        action: 'REJECTED_CYCLE',
        disjointSets: dsu.getSnapshot(),
        mstEdges: [...mstEdges],
        currentTotalWeight,
        description: `Edge (${edge.source} - ${edge.target}, wt: ${edge.weight}) links nodes already in component [${rootU}]. Rejected (cycle avoided).`,
      });
    }
  }

  return {
    mstEdges,
    totalWeight: currentTotalWeight,
    steps,
  };
}

/**
 * Prim's Minimum Spanning Tree Algorithm
 */
export function executePrim(
  nodes: { id: string }[],
  edges: SimpleEdge[],
  startNodeId: string
): {
  mstEdges: SimpleEdge[];
  totalWeight: number;
  visitedNodes: string[];
  steps: PrimStep[];
} {
  const adj = buildAdjacencyList(nodes, edges, false);
  const visited = new Set<string>();
  const mstEdges: SimpleEdge[] = [];
  const steps: PrimStep[] = [];
  let currentTotalWeight = 0;
  let stepNumber = 1;

  visited.add(startNodeId);

  steps.push({
    stepNumber: stepNumber++,
    visitedNodes: Array.from(visited),
    candidateEdges: [],
    mstEdges: [],
    currentTotalWeight: 0,
    description: `Prim's algorithm initialized with seed node [${startNodeId}].`,
  });

  const totalConnectedNodes = nodes.length;

  while (visited.size < totalConnectedNodes) {
    // Find candidate cut edges crossing from visited to unvisited
    const candidates: { edge: SimpleEdge; nextNode: string }[] = [];

    for (const u of visited) {
      const neighbors = adj.get(u) || [];
      for (const { neighbor, weight, edgeId } of neighbors) {
        if (!visited.has(neighbor)) {
          candidates.push({
            edge: { id: edgeId, source: u, target: neighbor, weight },
            nextNode: neighbor,
          });
        }
      }
    }

    if (candidates.length === 0) {
      // Disconnected graph components
      break;
    }

    // Pick minimum weight candidate edge
    candidates.sort((a, b) => a.edge.weight - b.edge.weight);
    const chosen = candidates[0];

    visited.add(chosen.nextNode);
    mstEdges.push(chosen.edge);
    currentTotalWeight += chosen.edge.weight;

    steps.push({
      stepNumber: stepNumber++,
      visitedNodes: Array.from(visited),
      candidateEdges: candidates.map(c => c.edge),
      selectedEdge: chosen.edge,
      mstEdges: [...mstEdges],
      currentTotalWeight,
      description: `Selected minimum weight cut edge (${chosen.edge.source} - ${chosen.edge.target}, wt: ${chosen.edge.weight}). Expanded MST to [${chosen.nextNode}].`,
    });
  }

  return {
    mstEdges,
    totalWeight: currentTotalWeight,
    visitedNodes: Array.from(visited),
    steps,
  };
}

/**
 * Dijkstra / Shortest Path between two concepts
 */
export function findShortestPath(
  nodes: { id: string }[],
  edges: SimpleEdge[],
  startId: string,
  targetId: string,
  isDirected: boolean = false
): {
  path: string[];
  distance: number;
  edgesInPath: string[];
} {
  const adj = buildAdjacencyList(nodes, edges, isDirected);
  const distances = new Map<string, number>();
  const previous = new Map<string, { prev: string; edgeId: string } | null>();
  const unvisited = new Set<string>();

  for (const n of nodes) {
    distances.set(n.id, Infinity);
    previous.set(n.id, null);
    unvisited.add(n.id);
  }

  distances.set(startId, 0);

  while (unvisited.size > 0) {
    let closestNode: string | null = null;
    let minDistance = Infinity;

    for (const node of unvisited) {
      const dist = distances.get(node)!;
      if (dist < minDistance) {
        minDistance = dist;
        closestNode = node;
      }
    }

    if (!closestNode || minDistance === Infinity) break;
    if (closestNode === targetId) break;

    unvisited.delete(closestNode);
    const neighbors = adj.get(closestNode) || [];

    for (const { neighbor, weight, edgeId } of neighbors) {
      if (unvisited.has(neighbor)) {
        const alt = distances.get(closestNode)! + weight;
        if (alt < distances.get(neighbor)!) {
          distances.set(neighbor, alt);
          previous.set(neighbor, { prev: closestNode, edgeId });
        }
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  const edgesInPath: string[] = [];
  let curr: string | null = targetId;

  if (distances.get(targetId) === Infinity) {
    return { path: [], distance: Infinity, edgesInPath: [] };
  }

  while (curr) {
    path.unshift(curr);
    const prevInfo = previous.get(curr);
    if (prevInfo) {
      edgesInPath.unshift(prevInfo.edgeId);
      curr = prevInfo.prev;
    } else {
      curr = null;
    }
  }

  return {
    path,
    distance: distances.get(targetId) || 0,
    edgesInPath,
  };
}

/**
 * Topological Sort to find valid prerequisite sequence
 */
export function topologicalSort(
  nodes: { id: string }[],
  edges: SimpleEdge[]
): {
  sortedOrder: string[];
  hasCycle: boolean;
} {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const n of nodes) {
    inDegree.set(n.id, 0);
    adj.set(n.id, []);
  }

  for (const e of edges) {
    if (!adj.has(e.source)) adj.set(e.source, []);
    adj.get(e.source)!.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
  }

  const queue: string[] = [];
  for (const [nodeId, deg] of inDegree.entries()) {
    if (deg === 0) {
      queue.push(nodeId);
    }
  }

  const sortedOrder: string[] = [];
  while (queue.length > 0) {
    const u = queue.shift()!;
    sortedOrder.push(u);

    const neighbors = adj.get(u) || [];
    for (const v of neighbors) {
      inDegree.set(v, inDegree.get(v)! - 1);
      if (inDegree.get(v) === 0) {
        queue.push(v);
      }
    }
  }

  const hasCycle = sortedOrder.length !== nodes.length;
  return { sortedOrder, hasCycle };
}

/**
 * Find all recursive prerequisites (ancestors) for a given topic
 */
export function findPrerequisiteChain(
  targetTopicId: string,
  edges: { sourceTopicId: string; targetTopicId: string; relationshipType: string }[]
): string[] {
  const prerequisites = new Set<string>();
  const queue = [targetTopicId];
  const visited = new Set<string>([targetTopicId]);

  // Edges where source is PREREQUISITE_OF target:
  // source -> target means source must be learned before target.
  while (queue.length > 0) {
    const curr = queue.shift()!;
    for (const edge of edges) {
      if (
        (edge.relationshipType === 'PREREQUISITE_OF' || edge.relationshipType === 'DEPENDS_ON') &&
        edge.targetTopicId === curr
      ) {
        if (!visited.has(edge.sourceTopicId)) {
          visited.add(edge.sourceTopicId);
          prerequisites.add(edge.sourceTopicId);
          queue.push(edge.sourceTopicId);
        }
      }
    }
  }

  return Array.from(prerequisites);
}
