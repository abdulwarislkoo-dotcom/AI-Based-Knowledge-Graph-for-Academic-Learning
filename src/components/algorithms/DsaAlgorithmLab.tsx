import React, { useState, useEffect } from 'react';
import { 
  GitFork, 
  Layers, 
  Network, 
  Share2, 
  Shuffle, 
  Anchor, 
  Briefcase, 
  Undo2, 
  Scissors, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  SkipBack, 
  ChevronRight, 
  ChevronDown, 
  Info,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { 
  BFSStep, 
  DFSStep, 
  KruskalStep, 
  PrimStep, 
  KnapsackDPResult, 
  BacktrackingStep, 
  BranchAndBoundStep,
  Topic 
} from '../../types/index.ts';
import { AcademicTreeNode } from '../../lib/algorithms/treeHierarchy.ts';

export const DsaAlgorithmLab: React.FC = () => {
  const { selectedAlgorithm, setSelectedAlgorithm, addToast } = useApp();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Common Simulator State
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeedMs, setPlaySpeedMs] = useState<number>(1200);

  // 1. Trees State
  const [treeData, setTreeData] = useState<AcademicTreeNode | null>(null);
  const [treeTraversalOrder, setTreeTraversalOrder] = useState<{ id: string; name: string; level: string }[]>([]);
  const [treeOrderMode, setTreeOrderMode] = useState<'preorder' | 'postorder' | 'levelorder'>('preorder');
  const [expandedTreeNodes, setExpandedTreeNodes] = useState<Set<string>>(new Set(['course-root', 'subj-subj-dsa', 'unit-unit-dsa-1', 'unit-unit-dsa-2']));

  // 2. Adjacency Matrix State
  const [adjTopics, setAdjTopics] = useState<{ id: string; name: string; code: string }[]>([]);
  const [adjMatrix, setAdjMatrix] = useState<{ weight: number; connected: boolean; type?: string }[][]>([]);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  // 3. BFS State
  const [bfsStartTopic, setBfsStartTopic] = useState<string>('top-trees');
  const [bfsSteps, setBfsSteps] = useState<BFSStep[]>([]);
  const [bfsTraversalOrder, setBfsTraversalOrder] = useState<string[]>([]);
  const [bfsVisitedCount, setBfsVisitedCount] = useState<number>(0);

  // 4. DFS State
  const [dfsStartTopic, setDfsStartTopic] = useState<string>('top-trees');
  const [dfsSteps, setDfsSteps] = useState<DFSStep[]>([]);
  const [dfsTraversalOrder, setDfsTraversalOrder] = useState<string[]>([]);

  // 5. Kruskal State
  const [kruskalSteps, setKruskalSteps] = useState<KruskalStep[]>([]);
  const [kruskalMstEdges, setKruskalMstEdges] = useState<any[]>([]);
  const [kruskalTotalWeight, setKruskalTotalWeight] = useState<number>(0);

  // 6. Prim State
  const [primStartTopic, setPrimStartTopic] = useState<string>('top-trees');
  const [primSteps, setPrimSteps] = useState<PrimStep[]>([]);
  const [primMstEdges, setPrimMstEdges] = useState<any[]>([]);
  const [primTotalWeight, setPrimTotalWeight] = useState<number>(0);

  // 7. Knapsack DP State
  const [knapsackStudyMinutes, setKnapsackStudyMinutes] = useState<number>(120);
  const [knapsackResult, setKnapsackResult] = useState<KnapsackDPResult | null>(null);

  // 8. Backtracking State
  const [backtrackingLength, setBacktrackingLength] = useState<number>(4);
  const [backtrackingSteps, setBacktrackingSteps] = useState<BacktrackingStep[]>([]);
  const [validSequences, setValidSequences] = useState<string[][]>([]);

  // 9. Branch and Bound State
  const [bbMaxHours, setBbMaxHours] = useState<number>(10);
  const [bbSteps, setBbSteps] = useState<BranchAndBoundStep[]>([]);
  const [bbBestPath, setBbBestPath] = useState<string[]>([]);
  const [bbBestValue, setBbBestValue] = useState<number>(0);

  // Auto-play interval effect
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex(prev => {
          let maxLen = 0;
          if (selectedAlgorithm === 'bfs') maxLen = bfsSteps.length;
          else if (selectedAlgorithm === 'dfs') maxLen = dfsSteps.length;
          else if (selectedAlgorithm === 'kruskal') maxLen = kruskalSteps.length;
          else if (selectedAlgorithm === 'prim') maxLen = primSteps.length;
          else if (selectedAlgorithm === 'backtracking') maxLen = backtrackingSteps.length;
          else if (selectedAlgorithm === 'branch-bound') maxLen = bbSteps.length;

          if (prev >= maxLen - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playSpeedMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playSpeedMs, selectedAlgorithm, bfsSteps, dfsSteps, kruskalSteps, primSteps, backtrackingSteps, bbSteps]);

  // Load initial topic metadata
  useEffect(() => {
    api.getTopics('subj-dsa').then(res => setTopics(res.topics));
  }, []);

  // Algorithm tabs definition
  const algorithmTabs = [
    { id: 'trees', name: '1. Trees', icon: <GitFork className="w-4 h-4" /> },
    { id: 'matrix', name: '2. Adjacency Matrix', icon: <Layers className="w-4 h-4" /> },
    { id: 'bfs', name: '3. BFS Traversal', icon: <Network className="w-4 h-4" /> },
    { id: 'dfs', name: '4. DFS Traversal', icon: <Share2 className="w-4 h-4" /> },
    { id: 'kruskal', name: "5. Kruskal's MST", icon: <Shuffle className="w-4 h-4" /> },
    { id: 'prim', name: "6. Prim's MST", icon: <Anchor className="w-4 h-4" /> },
    { id: 'knapsack', name: '7. 0/1 Knapsack DP', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'backtracking', name: '8. Backtracking', icon: <Undo2 className="w-4 h-4" /> },
    { id: 'branch-bound', name: '9. Branch and Bound', icon: <Scissors className="w-4 h-4" /> },
  ];

  // Load selected algorithm data
  useEffect(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);

    async function loadAlgoData() {
      setLoading(true);
      try {
        if (selectedAlgorithm === 'trees') {
          const res = await api.getTreeHierarchy(treeOrderMode);
          setTreeData(res.tree);
          setTreeTraversalOrder(res.traversalOrder);
        } else if (selectedAlgorithm === 'matrix') {
          const res = await api.getAdjacencyMatrix('subj-dsa');
          setAdjTopics(res.topics);
          setAdjMatrix(res.matrix);
        } else if (selectedAlgorithm === 'bfs') {
          const res = await api.runBFS(bfsStartTopic);
          setBfsSteps(res.steps);
          setBfsTraversalOrder(res.traversalOrder);
          setBfsVisitedCount(res.visitedNodesCount);
        } else if (selectedAlgorithm === 'dfs') {
          const res = await api.runDFS(dfsStartTopic);
          setDfsSteps(res.steps);
          setDfsTraversalOrder(res.traversalOrder);
        } else if (selectedAlgorithm === 'kruskal') {
          const res = await api.runKruskal();
          setKruskalSteps(res.steps);
          setKruskalMstEdges(res.mstEdges);
          setKruskalTotalWeight(res.totalWeight);
        } else if (selectedAlgorithm === 'prim') {
          const res = await api.runPrim(primStartTopic);
          setPrimSteps(res.steps);
          setPrimMstEdges(res.mstEdges);
          setPrimTotalWeight(res.totalWeight);
        } else if (selectedAlgorithm === 'knapsack') {
          const res = await api.runKnapsack(knapsackStudyMinutes);
          setKnapsackResult(res);
        } else if (selectedAlgorithm === 'backtracking') {
          const res = await api.runBacktracking(backtrackingLength, 5);
          setBacktrackingSteps(res.steps);
          setValidSequences(res.validSequences);
        } else if (selectedAlgorithm === 'branch-bound') {
          const res = await api.runBranchAndBound(bbMaxHours);
          setBbSteps(res.steps);
          setBbBestPath(res.bestPath);
          setBbBestValue(res.bestValue);
        }
      } catch (err) {
        console.error('Error loading algorithm demo:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAlgoData();
  }, [selectedAlgorithm, treeOrderMode, bfsStartTopic, dfsStartTopic, primStartTopic, knapsackStudyMinutes, backtrackingLength, bbMaxHours]);

  // Helper for Tree node expansion
  const toggleTreeNode = (nodeId: string) => {
    setExpandedTreeNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const renderAcademicTree = (node: AcademicTreeNode, depth = 0) => {
    const isExpanded = expandedTreeNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    let badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    if (node.level === 'course') badgeColor = 'bg-indigo-600 text-white font-bold';
    else if (node.level === 'subject') badgeColor = 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold';
    else if (node.level === 'unit') badgeColor = 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold';
    else if (node.level === 'topic') badgeColor = 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold';
    else if (node.level === 'subtopic') badgeColor = 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-medium';

    return (
      <div key={node.id} className="text-xs">
        <div 
          onClick={() => hasChildren && toggleTreeNode(node.id)}
          className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors ${
            hasChildren ? 'cursor-pointer' : ''
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            </div>
          )}

          <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${badgeColor}`}>
            {node.level}
          </span>

          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {node.name}
          </span>

          {node.totalSubnodes !== undefined && node.totalSubnodes > 0 && (
            <span className="text-[10px] text-slate-400 font-mono">
              ({node.totalSubnodes} subnodes)
            </span>
          )}
        </div>

        {isExpanded && hasChildren && (
          <div className="border-l border-slate-200 dark:border-slate-800 ml-4 pl-1">
            {node.children.map(child => renderAcademicTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold font-mono uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Practical DSA Applications</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            DSA Algorithm Laboratory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Demonstrating how college-taught Data Structures and Algorithms operate on the Academic Knowledge Graph.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500">Speed:</span>
          <select
            value={playSpeedMs}
            onChange={e => setPlaySpeedMs(Number(e.target.value))}
            className="text-xs p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            <option value={2000}>0.5x (Slow)</option>
            <option value={1200}>1.0x (Normal)</option>
            <option value={600}>2.0x (Fast)</option>
          </select>
        </div>
      </div>

      {/* Algorithm Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {algorithmTabs.map(tab => {
          const isActive = selectedAlgorithm === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedAlgorithm(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Algorithm Demonstration Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Interactive Stage */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          
          {/* 1. TREES HIERARCHY DEMO */}
          {selectedAlgorithm === 'trees' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Curriculum N-ary Tree Hierarchy
                  </h3>
                  <p className="text-xs text-slate-500">
                    Course &rarr; Subject &rarr; Unit &rarr; Topic &rarr; Subtopic
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Traversal:</span>
                  <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
                    {(['preorder', 'postorder', 'levelorder'] as const).map(order => (
                      <button
                        key={order}
                        onClick={() => setTreeOrderMode(order)}
                        className={`px-2.5 py-1 rounded-md capitalize transition-all ${
                          treeOrderMode === order
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        {order}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tree View Canvas */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 max-h-[420px] overflow-y-auto">
                {treeData ? renderAcademicTree(treeData) : <div className="text-xs text-slate-400">Loading tree...</div>}
              </div>

              {/* Traversal Output Sequence */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {treeOrderMode.toUpperCase()} Traversal Sequence ({treeTraversalOrder.length} nodes):
                </h4>
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl max-h-36 overflow-y-auto">
                  {treeTraversalOrder.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <span className="text-slate-400 font-bold">{idx + 1}.</span>
                      <span>{item.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. ADJACENCY MATRIX DEMO */}
          {selectedAlgorithm === 'matrix' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Academic Concept Adjacency Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Binary and weighted relational matrix showing directed prerequisites and correlations.
                </p>
              </div>

              {/* Interactive Matrix Grid */}
              <div className="overflow-x-auto p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-slate-800">
                        Concept
                      </th>
                      {adjTopics.map((t, idx) => (
                        <th
                          key={t.id}
                          className="p-1.5 text-[10px] font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 max-w-[60px] truncate"
                          title={t.name}
                        >
                          {t.code || `C${idx + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {adjMatrix.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td className="p-2 text-[11px] font-mono font-bold text-left text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/60 max-w-[120px] truncate">
                          {adjTopics[rIdx]?.name}
                        </td>
                        {row.map((cell, cIdx) => {
                          const isHovered = hoveredCell?.row === rIdx && hoveredCell?.col === cIdx;
                          return (
                            <td
                              key={cIdx}
                              onMouseEnter={() => setHoveredCell({ row: rIdx, col: cIdx })}
                              onMouseLeave={() => setHoveredCell(null)}
                              className={`p-2 text-xs font-mono font-bold border transition-colors cursor-pointer ${
                                cell.connected
                                  ? 'bg-indigo-600 text-white border-indigo-500'
                                  : 'text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
                              } ${isHovered ? 'ring-2 ring-amber-400 z-10' : ''}`}
                            >
                              {cell.connected ? cell.weight : '0'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Hover Cell Inspector */}
              {hoveredCell && adjTopics[hoveredCell.row] && adjTopics[hoveredCell.col] && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-indigo-700 dark:text-indigo-300">
                      [{adjTopics[hoveredCell.row].name}] &rarr; [{adjTopics[hoveredCell.col].name}]
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      {adjMatrix[hoveredCell.row][hoveredCell.col].connected
                        ? `Connected via ${adjMatrix[hoveredCell.row][hoveredCell.col].type} (Edge Weight: ${adjMatrix[hoveredCell.row][hoveredCell.col].weight})`
                        : 'No direct relationship edge present.'}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    adjMatrix[hoveredCell.row][hoveredCell.col].connected
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {adjMatrix[hoveredCell.row][hoveredCell.col].connected ? 'Connected (1)' : 'Disconnected (0)'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 3. BFS TRAVERSAL DEMO */}
          {selectedAlgorithm === 'bfs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Breadth-First Search (FIFO Queue)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Visits connected academic concepts layer by layer; finds unweighted shortest hops.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Start Concept:</span>
                  <select
                    value={bfsStartTopic}
                    onChange={e => setBfsStartTopic(e.target.value)}
                    className="text-xs p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    {topics.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                    disabled={currentStepIndex === 0}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs hover:bg-indigo-700 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
                  </button>
                  <button
                    onClick={() => setCurrentStepIndex(Math.min(bfsSteps.length - 1, currentStepIndex + 1))}
                    disabled={currentStepIndex >= bfsSteps.length - 1}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStepIndex(0);
                    }}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800"
                    title="Reset simulation"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                  Step {currentStepIndex + 1} of {bfsSteps.length}
                </div>
              </div>

              {/* Step Description */}
              {bfsSteps[currentStepIndex] && (
                <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-xs text-blue-950 dark:text-blue-200 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Execution Step: </span>
                    {bfsSteps[currentStepIndex].description}
                  </div>
                </div>
              )}

              {/* Visual FIFO Queue */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Active FIFO Queue (Head &rarr; Tail)
                </span>
                <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl min-h-[52px] overflow-x-auto">
                  {bfsSteps[currentStepIndex]?.queue.length > 0 ? (
                    bfsSteps[currentStepIndex].queue.map((nodeId, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-xs shrink-0 flex items-center gap-1.5"
                      >
                        <span className="text-[10px] text-slate-400 font-mono">#{idx + 1}</span>
                        <span>{topics.find(t => t.id === nodeId)?.name || nodeId}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">Queue is currently empty.</span>
                  )}
                </div>
              </div>

              {/* Visited Concepts Sequence */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Visited Concepts Order ({bfsSteps[currentStepIndex]?.visited.length || 0} nodes visited)
                </span>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  {bfsSteps[currentStepIndex]?.traversalOrder.map((nodeId, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                    >
                      {idx + 1}. {topics.find(t => t.id === nodeId)?.name || nodeId}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. DFS TRAVERSAL DEMO */}
          {selectedAlgorithm === 'dfs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Depth-First Search (Call Stack / Recursion)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recursively explores prerequisite chains deeply before backtracking.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Start Concept:</span>
                  <select
                    value={dfsStartTopic}
                    onChange={e => setDfsStartTopic(e.target.value)}
                    className="text-xs p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    {topics.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                    disabled={currentStepIndex === 0}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs hover:bg-purple-700 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
                  </button>
                  <button
                    onClick={() => setCurrentStepIndex(Math.min(dfsSteps.length - 1, currentStepIndex + 1))}
                    disabled={currentStepIndex >= dfsSteps.length - 1}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStepIndex(0);
                    }}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800"
                    title="Reset simulation"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                  Step {currentStepIndex + 1} of {dfsSteps.length}
                </div>
              </div>

              {/* Step Description */}
              {dfsSteps[currentStepIndex] && (
                <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-900 text-xs text-purple-950 dark:text-purple-200 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Execution Step: </span>
                    {dfsSteps[currentStepIndex].description}
                  </div>
                </div>
              )}

              {/* Call Stack Visualization */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Active Call Stack (LIFO - Top of Stack on Right)
                </span>
                <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl min-h-[52px] overflow-x-auto">
                  {dfsSteps[currentStepIndex]?.stack.map((nodeId, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-400 dark:border-purple-700 text-xs font-bold text-purple-700 dark:text-purple-300 shadow-xs shrink-0 flex items-center gap-1.5"
                    >
                      <span className="text-[10px] text-slate-400 font-mono">Depth {idx}</span>
                      <span>{topics.find(t => t.id === nodeId)?.name || nodeId}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traversal sequence */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Traversal Sequence
                </span>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  {dfsSteps[currentStepIndex]?.traversalOrder.map((nodeId, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800"
                    >
                      {idx + 1}. {topics.find(t => t.id === nodeId)?.name || nodeId}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. KRUSKAL'S MST DEMO */}
          {selectedAlgorithm === 'kruskal' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Kruskal's Algorithm (Greedy Minimum Spanning Tree)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sorts edges by weight and unites components using Disjoint Set Union (Union-Find).
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-800 text-right">
                  <span className="text-[10px] uppercase font-bold text-pink-600 block">MST Total Weight</span>
                  <span className="text-lg font-black font-mono text-pink-700 dark:text-pink-300">
                    {kruskalSteps[currentStepIndex]?.currentTotalWeight || 0}
                  </span>
                </div>
              </div>

              {/* Step Controls */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                    disabled={currentStepIndex === 0}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-4 py-2 rounded-lg bg-pink-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs hover:bg-pink-700 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : 'Auto Step'}</span>
                  </button>
                  <button
                    onClick={() => setCurrentStepIndex(Math.min(kruskalSteps.length - 1, currentStepIndex + 1))}
                    disabled={currentStepIndex >= kruskalSteps.length - 1}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                  Step {currentStepIndex + 1} of {kruskalSteps.length}
                </div>
              </div>

              {/* Step log */}
              {kruskalSteps[currentStepIndex] && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  kruskalSteps[currentStepIndex].action === 'ACCEPTED'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-900 dark:text-rose-200'
                }`}>
                  {kruskalSteps[currentStepIndex].action === 'ACCEPTED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold">
                      {kruskalSteps[currentStepIndex].action === 'ACCEPTED' ? 'Edge Accepted into MST: ' : 'Cycle Detected & Edge Rejected: '}
                    </span>
                    {kruskalSteps[currentStepIndex].description}
                  </div>
                </div>
              )}

              {/* Accepted MST Edges Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Current MST Edges ({kruskalSteps[currentStepIndex]?.mstEdges.length || 0} edges)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {kruskalSteps[currentStepIndex]?.mstEdges.map((e, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {topics.find(t => t.id === e.source)?.name || e.source} &harr; {topics.find(t => t.id === e.target)?.name || e.target}
                      </span>
                      <span className="font-mono text-pink-600 font-bold px-2 py-0.5 rounded bg-pink-100 dark:bg-pink-950">
                        wt: {e.weight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. PRIM'S MST DEMO */}
          {selectedAlgorithm === 'prim' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Prim's Algorithm (Growing Cut Tree)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Constructs an MST starting from a seed vertex by always picking the minimum weight cut edge.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800 text-right">
                  <span className="text-[10px] uppercase font-bold text-violet-600 block">Prim MST Weight</span>
                  <span className="text-lg font-black font-mono text-violet-700 dark:text-violet-300">
                    {primSteps[currentStepIndex]?.currentTotalWeight || 0}
                  </span>
                </div>
              </div>

              {/* Step Controls */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                    disabled={currentStepIndex === 0}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-4 py-2 rounded-lg bg-violet-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs hover:bg-violet-700 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : 'Auto Step'}</span>
                  </button>
                  <button
                    onClick={() => setCurrentStepIndex(Math.min(primSteps.length - 1, currentStepIndex + 1))}
                    disabled={currentStepIndex >= primSteps.length - 1}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                  Step {currentStepIndex + 1} of {primSteps.length}
                </div>
              </div>

              {/* Step details */}
              {primSteps[currentStepIndex] && (
                <div className="p-3.5 bg-violet-50 dark:bg-violet-950/40 rounded-xl border border-violet-200 dark:border-violet-900 text-xs text-violet-950 dark:text-violet-200 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Greedy Cut Expansion: </span>
                    {primSteps[currentStepIndex].description}
                  </div>
                </div>
              )}

              {/* Visited Vertices in Growing Tree */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Vertices in Tree Cut Set S ({primSteps[currentStepIndex]?.visitedNodes.length || 0} nodes)
                </span>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                  {primSteps[currentStepIndex]?.visitedNodes.map((id, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 text-violet-700 dark:text-violet-300 font-bold text-xs border border-violet-300 dark:border-violet-800"
                    >
                      {topics.find(t => t.id === id)?.name || id}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. DYNAMIC PROGRAMMING 0/1 KNAPSACK DEMO */}
          {selectedAlgorithm === 'knapsack' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    0/1 Knapsack Study Time Optimization
                  </h3>
                  <p className="text-xs text-slate-500">
                    Maximizes total knowledge point score within available study hours budget.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Budget: <span className="font-mono text-indigo-600 font-bold">{knapsackStudyMinutes} mins</span> ({Math.round(knapsackStudyMinutes / 60 * 10) / 10}h)
                  </span>
                  <input
                    type="range"
                    min="30"
                    max="240"
                    step="15"
                    value={knapsackStudyMinutes}
                    onChange={e => setKnapsackStudyMinutes(Number(e.target.value))}
                    className="w-32 accent-indigo-600"
                  />
                </div>
              </div>

              {/* Results Summary Cards */}
              {knapsackResult && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 block">
                      Max Learning Value
                    </span>
                    <span className="text-2xl font-black font-mono text-indigo-700 dark:text-indigo-300">
                      {knapsackResult.maxLearningValue} pts
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                      Total Allocated Time
                    </span>
                    <span className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300">
                      {knapsackResult.totalTimeMinutes}m / {knapsackStudyMinutes}m
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800">
                    <span className="text-[10px] uppercase font-bold text-purple-600 block">
                      Optimal Resources
                    </span>
                    <span className="text-2xl font-black font-mono text-purple-700 dark:text-purple-300">
                      {knapsackResult.selectedResources.length} items
                    </span>
                  </div>
                </div>
              )}

              {/* Selected Optimal Resources */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Optimal Resource Selection (Selected by DP Backtrack)
                </span>
                <div className="space-y-2">
                  {knapsackResult?.selectedResources.map((res, idx) => (
                    <div
                      key={res.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {res.title}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase font-mono">
                            {res.type} &bull; By {res.author}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                          +{res.learningValue} pts
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {res.durationMinutes} mins
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DP 2D Table Snippet */}
              {knapsackResult && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Dynamic Programming Recurrence State Table dp[i][w]
                  </span>
                  <div className="p-2 bg-slate-950 text-slate-200 rounded-xl overflow-x-auto text-[10px] font-mono border border-slate-800">
                    <div className="mb-2 text-indigo-400 font-bold">
                      Recurrence: dp[i][w] = max(dp[i-1][w], dp[i-1][w - w_i] + val_i)
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Computed 2D Matrix across {knapsackResult.dpTable.length} items &times; {knapsackResult.timeSteps.length} discrete time steps.
                      Optimal state value reached at dp[{knapsackResult.dpTable.length - 1}][{knapsackResult.timeSteps.length - 1}] = <span className="text-emerald-400 font-bold">{knapsackResult.maxLearningValue}</span>.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 8. BACKTRACKING DEMO */}
          {selectedAlgorithm === 'backtracking' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Backtracking: Prerequisite-Constrained Sequencing
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recursively generates study sequences; immediately backtracks when prerequisite constraints are violated.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Target Sequence Length:</span>
                  <select
                    value={backtrackingLength}
                    onChange={e => setBacktrackingLength(Number(e.target.value))}
                    className="text-xs p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    <option value={3}>3 Topics</option>
                    <option value={4}>4 Topics</option>
                    <option value={5}>5 Topics</option>
                  </select>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                    disabled={currentStepIndex === 0}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-4 py-2 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs hover:bg-amber-700 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : 'Auto Search'}</span>
                  </button>
                  <button
                    onClick={() => setCurrentStepIndex(Math.min(backtrackingSteps.length - 1, currentStepIndex + 1))}
                    disabled={currentStepIndex >= backtrackingSteps.length - 1}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                  Step {currentStepIndex + 1} of {backtrackingSteps.length}
                </div>
              </div>

              {/* Step info */}
              {backtrackingSteps[currentStepIndex] && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  backtrackingSteps[currentStepIndex].action === 'VALID_SEQUENCE_FOUND'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                    : backtrackingSteps[currentStepIndex].isPrerequisiteSatisfied
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 text-blue-900 dark:text-blue-200'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-200'
                }`}>
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">
                      [{backtrackingSteps[currentStepIndex].action}]: 
                    </span>{' '}
                    {backtrackingSteps[currentStepIndex].description}
                  </div>
                </div>
              )}

              {/* Current Candidate Sequence Path */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Active Sequence Search Branch
                </span>
                <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl min-h-[50px] overflow-x-auto">
                  {backtrackingSteps[currentStepIndex]?.currentSequence.map((tid, idx) => (
                    <React.Fragment key={idx}>
                      <span className="px-3 py-1 rounded bg-white dark:bg-slate-900 border border-amber-300 text-amber-800 dark:text-amber-300 text-xs font-bold">
                        {topics.find(t => t.id === tid)?.name || tid}
                      </span>
                      {idx < backtrackingSteps[currentStepIndex].currentSequence.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Valid Sequences Discovered */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Valid Study Sequences Discovered ({validSequences.length})
                </span>
                <div className="space-y-2">
                  {validSequences.map((seq, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs font-mono text-emerald-900 dark:text-emerald-200 flex items-center gap-2"
                    >
                      <span className="font-bold text-emerald-600">Sequence #{sIdx + 1}:</span>
                      <span>
                        {seq.map(id => topics.find(t => t.id === id)?.name || id).join(' → ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 9. BRANCH AND BOUND DEMO */}
          {selectedAlgorithm === 'branch-bound' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Branch and Bound Learning Path Optimization
                  </h3>
                  <p className="text-xs text-slate-500">
                    Prunes non-optimal candidate paths whose upper bound on cognitive efficiency cannot beat the current best solution.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-right">
                  <span className="text-[10px] uppercase font-bold text-rose-600 block">Best Incumbent Score</span>
                  <span className="text-lg font-black font-mono text-rose-700 dark:text-rose-300">
                    {bbSteps[currentStepIndex]?.bestScoreSoFar || bbBestValue} pts
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                    disabled={currentStepIndex === 0}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-4 py-2 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs hover:bg-rose-700 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : 'Auto Search'}</span>
                  </button>
                  <button
                    onClick={() => setCurrentStepIndex(Math.min(bbSteps.length - 1, currentStepIndex + 1))}
                    disabled={currentStepIndex >= bbSteps.length - 1}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                  Step {currentStepIndex + 1} of {bbSteps.length}
                </div>
              </div>

              {/* Step info */}
              {bbSteps[currentStepIndex] && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  bbSteps[currentStepIndex].action === 'UPDATE_BEST'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                    : bbSteps[currentStepIndex].action === 'EXPAND'
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 text-blue-900 dark:text-blue-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-900 dark:text-rose-200'
                }`}>
                  <Scissors className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">
                      [{bbSteps[currentStepIndex].action}]: Upper Bound: {bbSteps[currentStepIndex].boundScore} &bull;{' '}
                    </span>
                    {bbSteps[currentStepIndex].reason}
                  </div>
                </div>
              )}

              {/* Optimal Path Result */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Best Learning Path Established by Branch and Bound
                </span>
                <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                  {bbBestPath.map((id, idx) => (
                    <React.Fragment key={idx}>
                      <span className="px-3 py-1 rounded-md bg-white dark:bg-slate-900 border border-rose-300 text-rose-700 dark:text-rose-300 text-xs font-bold">
                        {topics.find(t => t.id === id)?.name || id}
                      </span>
                      {idx < bbBestPath.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Academic Specification & Complexity Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Academic Theory & Complexity
              </h3>
            </div>

            {selectedAlgorithm === 'trees' && (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <strong className="text-slate-900 dark:text-white">Application:</strong> Organises educational content into an accredited tree hierarchy: Course &rarr; Subject &rarr; Unit &rarr; Topic &rarr; Subtopic.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-[11px] space-y-1">
                  <div>Time: O(N) traversal</div>
                  <div>Space: O(H) recursion stack</div>
                  <div>Height (H): ~4 levels</div>
                </div>
              </div>
            )}

            {selectedAlgorithm === 'matrix' && (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <strong className="text-slate-900 dark:text-white">Application:</strong> Provides O(1) instantaneous lookup to query whether two academic concepts share a prerequisite or correlation edge.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-[11px] space-y-1">
                  <div>Lookup: O(1) instantaneous</div>
                  <div>Storage: O(V²) space complexity</div>
                  <div>Symmetry: Asymmetric (Directed)</div>
                </div>
              </div>
            )}

            {selectedAlgorithm === 'bfs' && (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <strong className="text-slate-900 dark:text-white">Application:</strong> Discovers concepts layer by layer using a FIFO queue, guaranteeing the minimum number of conceptual jumps from a starting topic.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-[11px] space-y-1">
                  <div>Time Complexity: O(V + E)</div>
                  <div>Auxiliary Space: O(V) queue</div>
                  <div>Data Structure: FIFO Queue</div>
                </div>
              </div>
            )}

            {selectedAlgorithm === 'dfs' && (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <strong className="text-slate-900 dark:text-white">Application:</strong> Plunges deep into foundational prerequisite chains, ensuring base building blocks are satisfied before moving laterally.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-[11px] space-y-1">
                  <div>Time Complexity: O(V + E)</div>
                  <div>Auxiliary Space: O(V) call stack</div>
                  <div>Data Structure: Call Stack (LIFO)</div>
                </div>
              </div>
            )}

            {selectedAlgorithm === 'kruskal' && (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <strong className="text-slate-900 dark:text-white">Application:</strong> Connects all academic concepts with the minimum total cognitive difficulty using Disjoint Set Union (Union-Find).
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-[11px] space-y-1">
                  <div>Time: O(E log E) edge sorting</div>
                  <div>Union-Find: O(α(V)) amortized</div>
                  <div>Cycles: Prevented via DSU root check</div>
                </div>
              </div>
            )}

            {selectedAlgorithm === 'prim' && (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <strong className="text-slate-900 dark:text-white">Application:</strong> Constructs a Minimum Spanning Tree from a chosen starting concept by continually expanding the minimum weight cut edge.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-[11px] space-y-1">
                  <div>Time: O(E log V) with Priority Queue</div>
                  <div>Paradigm: Greedy Cut Property</div>
                  <div>Result: Identical weight to Kruskal</div>
                </div>
              </div>
            )}

            {selectedAlgorithm === 'knapsack' && (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <strong className="text-slate-900 dark:text-white">Application:</strong> Dynamic Programming allocates study time across learning resources, maximizing knowledge gain points under time limits.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-[11px] space-y-1">
                  <div>Time: O(N · W) pseudo-polynomial</div>
                  <div>Space: O(N · W) 2D state matrix</div>
                  <div>Subproblem: Overlapping & optimal</div>
                </div>
              </div>
            )}

            {selectedAlgorithm === 'backtracking' && (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <strong className="text-slate-900 dark:text-white">Application:</strong> Systematically searches valid semester study sequences, rolling back immediately when prerequisite constraints fail.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-[11px] space-y-1">
                  <div>Paradigm: Depth-First State Space Search</div>
                  <div>Pruning: Constraint validation checks</div>
                  <div>Worst Case: O(b^d) without pruning</div>
                </div>
              </div>
            )}

            {selectedAlgorithm === 'branch-bound' && (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <strong className="text-slate-900 dark:text-white">Application:</strong> Uses upper bound relaxations (Fractional Knapsack) to prune subtrees that cannot surpass the best known learning ROI.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-[11px] space-y-1">
                  <div>Paradigm: Best-First Search with Bounds</div>
                  <div>Bounding Function: Greedy efficiency upper bound</div>
                  <div>Pruning: Drops bounds ≤ incumbent</div>
                </div>
              </div>
            )}

            {/* Note on Functional Implementations */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                <Info className="w-3.5 h-3.5" />
                <span>Evaluation Note</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                All 9 algorithms are fully functional implementations running on real graph topology and testable via Node.js unit tests.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
