import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Search, 
  Filter, 
  Navigation, 
  Sparkles, 
  Layers, 
  Info,
  CheckCircle2,
  X,
  Compass,
  ArrowRight
} from 'lucide-react';
import { KnowledgeGraphData, GraphNode, GraphEdge, Subject, DifficultyLevel } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { TopicDetailsPanel } from './TopicDetailsPanel.tsx';
import { useApp } from '../../context/AppContext.tsx';
import { findPrerequisiteChain, findShortestPath } from '../../lib/algorithms/graphAlgorithms.ts';

interface LayoutNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const KnowledgeGraphExplorer: React.FC = () => {
  const { selectedTopicId, setSelectedTopicId, refreshKey, addToast } = useApp();

  const [graphData, setGraphData] = useState<KnowledgeGraphData>({ nodes: [], edges: [] });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Transform & Viewport
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging Node
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // Filters
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<string>('all');
  const [selectedCompletionFilter, setSelectedCompletionFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Special Modes
  const [tracePrereqsActive, setTracePrereqsActive] = useState<boolean>(false);
  const [ancestorPrereqIds, setAncestorPrereqIds] = useState<Set<string>>(new Set());

  // Shortest Path Tool
  const [shortestPathToolOpen, setShortestPathToolOpen] = useState<boolean>(false);
  const [pathSourceId, setPathSourceId] = useState<string>('');
  const [pathTargetId, setPathTargetId] = useState<string>('');
  const [highlightedPathEdges, setHighlightedPathEdges] = useState<Set<string>>(new Set());
  const [highlightedPathNodes, setHighlightedPathNodes] = useState<Set<string>>(new Set());
  const [pathDistance, setPathDistance] = useState<number | null>(null);

  // Node Positions state
  const [nodesPosition, setNodesPosition] = useState<Map<string, { x: number; y: number }>>(new Map());
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Load Graph Data
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [graph, subjRes] = await Promise.all([
          api.getKnowledgeGraph(),
          api.getSubjects(),
        ]);

        if (!mounted) return;
        setGraphData(graph);
        setSubjects(subjRes.subjects);

        // Compute clean, spacious layout grouped by Subject and Unit
        const initialPos = new Map<string, { x: number; y: number }>();
        const width = 1200;
        const height = 800;
        const center = { x: width / 2, y: height / 2 };

        // Group topics by subject
        const subjectsList = subjRes.subjects;
        subjectsList.forEach((subj, sIdx) => {
          const subjTopics = graph.nodes.filter(n => n.subjectId === subj.id);
          const subjAngle = (sIdx / subjectsList.length) * 2 * Math.PI - Math.PI / 2;
          const subjCenterX = center.x + Math.cos(subjAngle) * 320;
          const subjCenterY = center.y + Math.sin(subjAngle) * 240;

          subjTopics.forEach((node, tIdx) => {
            // Distribute topics in a spacious ellipse around subject center
            const tAngle = (tIdx / Math.max(1, subjTopics.length)) * 2 * Math.PI;
            const radiusX = 130 + (tIdx % 2) * 50;
            const radiusY = 90 + ((tIdx + 1) % 2) * 40;
            const x = subjCenterX + Math.cos(tAngle) * radiusX;
            const y = subjCenterY + Math.sin(tAngle) * radiusY;
            initialPos.set(node.id, { x, y });
          });
        });

        setNodesPosition(initialPos);
        setLoading(false);
      } catch (err) {
        console.error('Error loading graph:', err);
        setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  // When selected topic changes and "trace prerequisites" is enabled:
  useEffect(() => {
    if (!selectedTopicId || !tracePrereqsActive) {
      setAncestorPrereqIds(new Set());
      return;
    }

    const rels = graphData.edges.map(e => ({
      sourceTopicId: e.source,
      targetTopicId: e.target,
      relationshipType: e.type,
    }));

    const ancestors = findPrerequisiteChain(selectedTopicId, rels);
    setAncestorPrereqIds(new Set(ancestors));
  }, [selectedTopicId, tracePrereqsActive, graphData]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return graphData.nodes.filter(node => {
      if (selectedSubjectFilter !== 'all' && node.subjectId !== selectedSubjectFilter) {
        return false;
      }
      if (selectedDifficultyFilter !== 'all' && node.difficulty !== selectedDifficultyFilter) {
        return false;
      }
      if (selectedCompletionFilter === 'completed' && !node.isCompleted) {
        return false;
      }
      if (selectedCompletionFilter === 'pending' && node.isCompleted) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          node.label.toLowerCase().includes(query) ||
          node.id.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [graphData.nodes, selectedSubjectFilter, selectedDifficultyFilter, selectedCompletionFilter, searchQuery]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  // Filtered edges
  const filteredEdges = useMemo(() => {
    return graphData.edges.filter(
      edge => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)
    );
  }, [graphData.edges, filteredNodeIds]);

  // Zoom controls
  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(0.3, prev + delta), 2.8));
  };

  const handleResetGraph = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedTopicId(null);
    setHighlightedPathEdges(new Set());
    setHighlightedPathNodes(new Set());
    setPathDistance(null);
    setTracePrereqsActive(false);
    addToast({
      type: 'info',
      title: 'Graph Reset',
      message: 'Viewport and highlights restored.',
    });
  };

  // Pan interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking canvas directly
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'graph-canvas-bg') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    } else if (draggedNodeId && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;
      setNodesPosition(prev => {
        const next = new Map(prev);
        next.set(draggedNodeId, { x: mouseX, y: mouseY });
        return next;
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  // Shortest Path Finder
  const handleComputeShortestPath = () => {
    if (!pathSourceId || !pathTargetId) {
      addToast({
        type: 'warning',
        title: 'Selection Required',
        message: 'Please choose both source and target concepts.',
      });
      return;
    }

    const simpleEdges = graphData.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      weight: e.weight,
    }));

    const result = findShortestPath(
      graphData.nodes.map(n => ({ id: n.id })),
      simpleEdges,
      pathSourceId,
      pathTargetId,
      false
    );

    if (result.path.length === 0 || result.distance === Infinity) {
      addToast({
        type: 'error',
        title: 'No Path Found',
        message: 'These two academic concepts reside in disconnected subgraphs.',
      });
      setHighlightedPathEdges(new Set());
      setHighlightedPathNodes(new Set());
      setPathDistance(null);
      return;
    }

    setHighlightedPathEdges(new Set(result.edgesInPath));
    setHighlightedPathNodes(new Set(result.path));
    setPathDistance(result.distance);

    addToast({
      type: 'success',
      title: 'Shortest Path Discovered',
      message: `Optimal route: ${result.path.length} concepts (Cognitive Distance: ${result.distance} weight).`,
    });
  };

  // Center on node
  const handleSelectNodeFromSearch = (nodeId: string) => {
    setSelectedTopicId(nodeId);
    const pos = nodesPosition.get(nodeId);
    if (pos && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setPan({
        x: rect.width / 2 - pos.x * zoom,
        y: rect.height / 2 - pos.y * zoom,
      });
    }
    setSearchQuery('');
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col bg-slate-900 overflow-hidden select-none">
      
      {/* Top Filter and Search Bar */}
      <div className="relative z-20 px-4 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        
        {/* Left: Search input */}
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search academic concept..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Autocomplete Dropdown */}
          {searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-1">
              {filteredNodes.slice(0, 6).map(node => (
                <button
                  key={node.id}
                  onClick={() => handleSelectNodeFromSearch(node.id)}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between text-slate-800 dark:text-slate-200"
                >
                  <span className="font-semibold">{node.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                    {node.difficulty}
                  </span>
                </button>
              ))}
              {filteredNodes.length === 0 && (
                <div className="px-3 py-2 text-xs text-slate-400">No matching concepts found.</div>
              )}
            </div>
          )}
        </div>

        {/* Center: Subject Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedSubjectFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSubjectFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Subjects ({graphData.nodes.length})
          </button>
          {subjects.map(s => {
            const isSelected = selectedSubjectFilter === s.id;
            const count = graphData.nodes.filter(n => n.subjectId === s.id).length;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSubjectFilter(s.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'text-white shadow-xs font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                style={isSelected ? { backgroundColor: s.color } : {}}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span>{s.name.split(' ')[0]}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Right: Difficulty Filter & Shortest Path Toggle */}
        <div className="flex items-center gap-2">
          <select
            value={selectedDifficultyFilter}
            onChange={e => setSelectedDifficultyFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <button
            onClick={() => setShortestPathToolOpen(!shortestPathToolOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              shortestPathToolOpen || highlightedPathNodes.size > 0
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Shortest Route</span>
          </button>
        </div>
      </div>

      {/* Floating Shortest Path Tool Drawer */}
      {shortestPathToolOpen && (
        <div className="absolute top-16 left-4 z-30 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
              <Compass className="w-4 h-4 text-emerald-500" />
              <span>Dijkstra / Shortest Concept Path</span>
            </div>
            <button onClick={() => setShortestPathToolOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                Source Concept:
              </label>
              <select
                value={pathSourceId}
                onChange={e => setPathSourceId(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="">Select Starting Concept...</option>
                {graphData.nodes.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                Target Concept:
              </label>
              <select
                value={pathTargetId}
                onChange={e => setPathTargetId(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="">Select Destination Concept...</option>
                {graphData.nodes.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleComputeShortestPath}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
              >
                Compute Shortest Route
              </button>
              {highlightedPathNodes.size > 0 && (
                <button
                  onClick={() => {
                    setHighlightedPathEdges(new Set());
                    setHighlightedPathNodes(new Set());
                    setPathDistance(null);
                  }}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 rounded-lg font-semibold text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {pathDistance !== null && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs">
                <div className="font-bold text-emerald-800 dark:text-emerald-300">
                  Route Found ({highlightedPathNodes.size} concepts)
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Total Cognitive Weight: <span className="font-mono font-bold">{pathDistance}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main SVG Graph Canvas */}
      <div 
        className="relative flex-1 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing bg-slate-950"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          id="graph-canvas-bg"
        >
          <defs>
            {/* Standard Directed Edge Marker */}
            <marker
              id="graph-arrow"
              viewBox="0 0 10 10"
              refX="26"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
            </marker>

            {/* Prerequisite Highlight Arrow Marker */}
            <marker
              id="prereq-arrow"
              viewBox="0 0 10 10"
              refX="26"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
            </marker>

            {/* Shortest Path Arrow Marker */}
            <marker
              id="path-arrow"
              viewBox="0 0 10 10"
              refX="26"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>

            {/* Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Subtle Grid Pattern */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            
            {/* Edges */}
            {filteredEdges.map(edge => {
              const srcPos = nodesPosition.get(edge.source);
              const tgtPos = nodesPosition.get(edge.target);
              if (!srcPos || !tgtPos) return null;

              const isPrereqHighlighted =
                tracePrereqsActive &&
                ancestorPrereqIds.has(edge.source) &&
                (ancestorPrereqIds.has(edge.target) || edge.target === selectedTopicId);

              const isPathHighlighted = highlightedPathEdges.has(edge.id);
              const isSelectedEdge = selectedTopicId === edge.source || selectedTopicId === edge.target;

              let stroke = '#334155';
              let strokeWidth = 1.5;
              let markerEnd = 'url(#graph-arrow)';
              let strokeDasharray = 'none';

              if (isPathHighlighted) {
                stroke = '#10b981';
                strokeWidth = 3.5;
                markerEnd = 'url(#path-arrow)';
                strokeDasharray = '5 3';
              } else if (isPrereqHighlighted) {
                stroke = '#fbbf24';
                strokeWidth = 3;
                markerEnd = 'url(#prereq-arrow)';
                strokeDasharray = '4 2';
              } else if (isSelectedEdge) {
                stroke = '#818cf8';
                strokeWidth = 2.5;
              } else if (edge.type === 'PREREQUISITE_OF') {
                stroke = '#475569';
                strokeWidth = 2;
              }

              // Compute mid point for edge weight badge
              const midX = (srcPos.x + tgtPos.x) / 2;
              const midY = (srcPos.y + tgtPos.y) / 2;

              return (
                <g key={edge.id} className="transition-all duration-200">
                  <line
                    x1={srcPos.x}
                    y1={srcPos.y}
                    x2={tgtPos.x}
                    y2={tgtPos.y}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    markerEnd={markerEnd}
                  />
                  {/* Edge weight badge if highlighted */}
                  {(isPathHighlighted || isPrereqHighlighted || isSelectedEdge) && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-10"
                        y="-8"
                        width="20"
                        height="16"
                        rx="4"
                        fill="#0f172a"
                        stroke={stroke}
                        strokeWidth="1"
                      />
                      <text
                        textAnchor="middle"
                        dy="3.5"
                        fill="#f8fafc"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {edge.weight}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {filteredNodes.map(node => {
              const pos = nodesPosition.get(node.id) || { x: 400, y: 300 };
              const isSelected = selectedTopicId === node.id;
              const isPrereqAncestor = ancestorPrereqIds.has(node.id);
              const isPathNode = highlightedPathNodes.has(node.id);

              let nodeRadius = 18;
              let ringColor = 'transparent';
              let ringWidth = 0;

              if (isSelected) {
                ringColor = '#818cf8';
                ringWidth = 4;
              } else if (isPathNode) {
                ringColor = '#10b981';
                ringWidth = 4;
              } else if (isPrereqAncestor) {
                ringColor = '#fbbf24';
                ringWidth = 4;
              }

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer transition-transform group"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggedNodeId(node.id);
                  }}
                  onClick={() => setSelectedTopicId(node.id)}
                >
                  {/* Selection / Prerequisite Glow Ring */}
                  {ringWidth > 0 && (
                    <circle
                      r={nodeRadius + 6}
                      fill="none"
                      stroke={ringColor}
                      strokeWidth={ringWidth}
                      className="animate-pulse"
                    />
                  )}

                  {/* Completed Checkmark Ring */}
                  {node.isCompleted && (
                    <circle
                      r={nodeRadius + 2.5}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                    />
                  )}

                  {/* Base Node Circle */}
                  <circle
                    r={nodeRadius}
                    fill={node.color || '#3b82f6'}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 3 : 2}
                    className="shadow-lg transition-transform group-hover:scale-110"
                  />

                  {/* Icon or Difficulty Initial */}
                  <text
                    textAnchor="middle"
                    dy="4"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="800"
                    fontFamily="monospace"
                    className="pointer-events-none select-none"
                  >
                    {node.difficulty ? node.difficulty[0] : 'T'}
                  </text>

                  {/* Label Pill Below Node */}
                  <g transform={`translate(0, ${nodeRadius + 14})`}>
                    <rect
                      x={-(node.label.length * 3.5 + 8)}
                      y="-9"
                      width={node.label.length * 7 + 16}
                      height="18"
                      rx="9"
                      fill="#0f172a"
                      fillOpacity="0.85"
                      stroke={isSelected ? '#818cf8' : '#334155'}
                      strokeWidth="1"
                    />
                    <text
                      textAnchor="middle"
                      dy="3.5"
                      fill="#f8fafc"
                      fontSize="10"
                      fontWeight="600"
                      className="pointer-events-none select-none"
                    >
                      {node.label}
                    </text>
                  </g>
                </g>
              );
            })}

          </g>
        </svg>

        {/* Floating Canvas Controls */}
        <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <button
            onClick={() => handleZoom(0.2)}
            title="Zoom In"
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-0.2)}
            title="Zoom Out"
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetGraph}
            title="Reset View & Graph"
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Prerequisite Chain Trace Action Bar (Visible when node selected) */}
        {selectedTopicId && (
          <div className="absolute bottom-6 left-24 z-20 flex items-center gap-2 bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700 shadow-2xl text-xs text-white">
            <span className="font-semibold text-slate-300">
              Selected: <span className="text-white font-bold">{graphData.nodes.find(n => n.id === selectedTopicId)?.label}</span>
            </span>
            <div className="h-4 w-px bg-slate-700 mx-1" />
            <button
              onClick={() => setTracePrereqsActive(!tracePrereqsActive)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                tracePrereqsActive
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{tracePrereqsActive ? 'Prerequisite Trace Active' : 'Trace Prerequisites'}</span>
            </button>
          </div>
        )}

        {/* Legend Overlay */}
        <div className="absolute top-4 right-4 z-20 hidden md:flex items-center gap-4 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-300 shadow-lg">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Topic Node</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-amber-400" />
            <span>Prerequisite Edge</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-slate-500" />
            <span>Related</span>
          </div>
        </div>

      </div>

      {/* Slideout Topic Details Panel */}
      {selectedTopicId && (
        <TopicDetailsPanel
          topicId={selectedTopicId}
          onClose={() => setSelectedTopicId(null)}
          onSelectTopic={(id) => setSelectedTopicId(id)}
        />
      )}

    </div>
  );
};
