import { BacktrackingStep, BranchAndBoundStep, KnapsackDPResult, LearningResource } from '../../types/index.ts';

/**
 * 0/1 Knapsack Dynamic Programming for study time allocation.
 * Given a study time budget (e.g. 120 minutes), maximizes learning value
 * by selecting optimal non-fractional resources.
 */
export function solveKnapsackDP(
  resources: LearningResource[],
  maxTimeMinutes: number,
  timeStep: number = 15
): KnapsackDPResult {
  const n = resources.length;
  // Discretize time into steps to keep table clean and fast
  const capacitySteps = Math.floor(maxTimeMinutes / timeStep);
  const timeSteps: number[] = [];
  for (let s = 0; s <= capacitySteps; s++) {
    timeSteps.push(s * timeStep);
  }

  // dp[i][w] = max learning value considering first i items with time budget w
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(capacitySteps + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    const res = resources[i - 1];
    // item time in step units (rounded up to step)
    const itemSteps = Math.max(1, Math.ceil(res.durationMinutes / timeStep));
    const value = res.learningValue;

    for (let w = 0; w <= capacitySteps; w++) {
      if (itemSteps <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - itemSteps] + value);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  // Backtrack to find selected resources
  const selectedResources: LearningResource[] = [];
  let remainingSteps = capacitySteps;
  for (let i = n; i > 0; i--) {
    if (dp[i][remainingSteps] !== dp[i - 1][remainingSteps]) {
      const res = resources[i - 1];
      selectedResources.push(res);
      const itemSteps = Math.max(1, Math.ceil(res.durationMinutes / timeStep));
      remainingSteps -= itemSteps;
    }
  }

  selectedResources.reverse();
  const totalTimeMinutes = selectedResources.reduce((sum, r) => sum + r.durationMinutes, 0);
  const maxLearningValue = dp[n][capacitySteps];

  return {
    maxLearningValue,
    totalTimeMinutes,
    selectedResources,
    dpTable: dp,
    timeSteps,
    explanation: `Optimal subset of ${selectedResources.length} resources selected yielding ${maxLearningValue} learning points within ${totalTimeMinutes}m of budgeted ${maxTimeMinutes}m.`,
  };
}

/**
 * Backtracking: Explores candidate learning sequences while enforcing prerequisite constraints.
 * Detects prerequisite violations and backtracks immediately.
 */
export function generateBacktrackingSequences(
  topicIds: string[],
  prerequisites: { prereqId: string; topicId: string }[],
  maxSequenceLength: number = 4,
  maxValidSequences: number = 5
): {
  validSequences: string[][];
  steps: BacktrackingStep[];
} {
  const prereqMap = new Map<string, Set<string>>();
  for (const tid of topicIds) {
    prereqMap.set(tid, new Set());
  }
  for (const p of prerequisites) {
    if (prereqMap.has(p.topicId)) {
      prereqMap.get(p.topicId)!.add(p.prereqId);
    }
  }

  const validSequences: string[][] = [];
  const steps: BacktrackingStep[] = [];
  const currentSequence: string[] = [];
  let stepCount = 1;

  function backtrack() {
    if (validSequences.length >= maxValidSequences) return;

    if (currentSequence.length === maxSequenceLength) {
      validSequences.push([...currentSequence]);
      steps.push({
        stepNumber: stepCount++,
        currentSequence: [...currentSequence],
        candidateTopic: '',
        isPrerequisiteSatisfied: true,
        unmetPrerequisites: [],
        action: 'VALID_SEQUENCE_FOUND',
        description: `Found valid study sequence: [${currentSequence.join(' → ')}]. Recorded.`,
      });
      return;
    }

    for (const candidate of topicIds) {
      if (validSequences.length >= maxValidSequences) return;
      if (currentSequence.includes(candidate)) continue;

      // Check if all prerequisites of candidate are already in currentSequence
      const reqs = prereqMap.get(candidate) || new Set();
      const unmet = Array.from(reqs).filter(req => !currentSequence.includes(req));

      if (unmet.length === 0) {
        // Prerequisite satisfied -> PUSH and recurse
        currentSequence.push(candidate);
        steps.push({
          stepNumber: stepCount++,
          currentSequence: [...currentSequence],
          candidateTopic: candidate,
          isPrerequisiteSatisfied: true,
          unmetPrerequisites: [],
          action: 'PUSH',
          description: `Prerequisites for [${candidate}] satisfied. Added to sequence path.`,
        });

        backtrack();

        // BACKTRACK
        currentSequence.pop();
        steps.push({
          stepNumber: stepCount++,
          currentSequence: [...currentSequence],
          candidateTopic: candidate,
          isPrerequisiteSatisfied: true,
          unmetPrerequisites: [],
          action: 'BACKTRACK',
          description: `Backtracked from candidate [${candidate}] to explore alternate pathways.`,
        });
      } else {
        // Constraint violation: candidate cannot be taken yet!
        steps.push({
          stepNumber: stepCount++,
          currentSequence: [...currentSequence],
          candidateTopic: candidate,
          isPrerequisiteSatisfied: false,
          unmetPrerequisites: unmet,
          action: 'BACKTRACK',
          description: `Constraint violation! Candidate [${candidate}] requires unmet prerequisites [${unmet.join(', ')}]. Branch pruned.`,
        });
      }
    }
  }

  backtrack();

  return {
    validSequences,
    steps,
  };
}

/**
 * Branch and Bound: Optimizes a learning path by computing upper bounds on cognitive ROI
 * (Learning Value per Hour) and pruning branches that cannot beat current best solution.
 */
export interface PathNode {
  path: string[];
  currentValue: number;
  currentTimeHours: number;
  upperBound: number;
}

export function solveBranchAndBoundPath(
  topics: { id: string; name: string; estHours: number; learningValue: number }[],
  edges: { source: string; target: string }[],
  maxHoursAllowed: number = 8
): {
  bestPath: string[];
  bestValue: number;
  bestTimeHours: number;
  steps: BranchAndBoundStep[];
} {
  // Sort topics by efficiency (Value / Time) descending for greedy bounding
  const sortedTopics = [...topics].sort(
    (a, b) => b.learningValue / b.estHours - a.learningValue / a.estHours
  );

  // Compute upper bound relaxation: currentValue + fractional knapsack on remaining topics
  function calculateUpperBound(currentVal: number, currentHours: number, visitedIds: Set<string>): number {
    let bound = currentVal;
    let remainingTime = maxHoursAllowed - currentHours;

    for (const t of sortedTopics) {
      if (visitedIds.has(t.id)) continue;
      if (t.estHours <= remainingTime) {
        bound += t.learningValue;
        remainingTime -= t.estHours;
      } else {
        bound += (t.learningValue / t.estHours) * remainingTime;
        break;
      }
    }
    return bound;
  }

  const steps: BranchAndBoundStep[] = [];
  let stepNumber = 1;
  let bestScore = 0;
  let bestPath: string[] = [];
  let bestTime = 0;

  // Priority queue of nodes to explore (highest upper bound first)
  const queue: PathNode[] = [
    {
      path: [],
      currentValue: 0,
      currentTimeHours: 0,
      upperBound: calculateUpperBound(0, 0, new Set()),
    },
  ];

  while (queue.length > 0 && steps.length < 50) {
    // Pick node with best upper bound
    queue.sort((a, b) => b.upperBound - a.upperBound);
    const node = queue.shift()!;

    if (node.upperBound <= bestScore) {
      steps.push({
        stepNumber: stepNumber++,
        currentPath: node.path,
        boundScore: Math.round(node.upperBound * 10) / 10,
        bestScoreSoFar: bestScore,
        action: 'PRUNE',
        reason: `Upper bound (${node.upperBound.toFixed(1)}) cannot exceed current best (${bestScore}). Branch pruned.`,
        activeQueueLength: queue.length,
      });
      continue;
    }

    // Expand next candidate topics
    const visitedSet = new Set(node.path);
    let expandedAny = false;

    for (const candidate of topics) {
      if (visitedSet.has(candidate.id)) continue;
      const newTime = node.currentTimeHours + candidate.estHours;

      if (newTime <= maxHoursAllowed) {
        expandedAny = true;
        const newVal = node.currentValue + candidate.learningValue;
        const newPath = [...node.path, candidate.id];
        const newVisited = new Set(newPath);
        const newBound = calculateUpperBound(newVal, newTime, newVisited);

        if (newVal > bestScore) {
          bestScore = newVal;
          bestPath = newPath;
          bestTime = newTime;
          steps.push({
            stepNumber: stepNumber++,
            currentPath: newPath,
            boundScore: Math.round(newBound * 10) / 10,
            bestScoreSoFar: bestScore,
            action: 'UPDATE_BEST',
            reason: `Discovered superior learning path with value ${newVal}pts (Time: ${newTime}h). Updated incumbent!`,
            activeQueueLength: queue.length,
          });
        }

        if (newBound > bestScore) {
          queue.push({
            path: newPath,
            currentValue: newVal,
            currentTimeHours: newTime,
            upperBound: newBound,
          });
          steps.push({
            stepNumber: stepNumber++,
            currentPath: newPath,
            boundScore: Math.round(newBound * 10) / 10,
            bestScoreSoFar: bestScore,
            action: 'EXPAND',
            reason: `Promising path branch (Bound: ${newBound.toFixed(1)} > Best: ${bestScore}). Added to priority branch queue.`,
            activeQueueLength: queue.length,
          });
        } else {
          steps.push({
            stepNumber: stepNumber++,
            currentPath: newPath,
            boundScore: Math.round(newBound * 10) / 10,
            bestScoreSoFar: bestScore,
            action: 'PRUNE',
            reason: `Pruned candidate [${candidate.id}] because prospective bound ${newBound.toFixed(1)} <= ${bestScore}.`,
            activeQueueLength: queue.length,
          });
        }
      }
    }
  }

  return {
    bestPath,
    bestValue: bestScore,
    bestTimeHours: bestTime,
    steps,
  };
}
