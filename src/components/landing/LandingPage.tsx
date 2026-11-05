import React, { useState } from 'react';
import { 
  Network, 
  ArrowRight, 
  Cpu, 
  GitFork, 
  BookOpen, 
  CheckCircle2, 
  Search, 
  Layers, 
  Share2, 
  Anchor, 
  Shuffle, 
  Briefcase, 
  Undo2, 
  Scissors,
  Sparkles,
  GraduationCap,
  ChevronRight,
  Zap,
  BarChart2,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const LandingPage: React.FC = () => {
  const { setCurrentView, setSelectedAlgorithm } = useApp();
  const [activeInteractiveNode, setActiveInteractiveNode] = useState<string>('graphs');

  const teaserNodes = [
    { id: 'trees', label: 'Trees', x: 80, y: 70, color: '#3b82f6', category: 'Hierarchy' },
    { id: 'bst', label: 'Binary Search Trees', x: 220, y: 50, color: '#3b82f6', category: 'Ordering' },
    { id: 'graphs', label: 'Graphs', x: 140, y: 150, color: '#8b5cf6', category: 'Topology' },
    { id: 'bfs', label: 'BFS & DFS', x: 60, y: 240, color: '#8b5cf6', category: 'Traversals' },
    { id: 'mst', label: "Kruskal's & Prim", x: 230, y: 220, color: '#ec4899', category: 'Greedy MST' },
    { id: 'dp', label: '0/1 Knapsack DP', x: 310, y: 140, color: '#10b981', category: 'Dynamic Prog' },
    { id: 'bb', label: 'Branch & Bound', x: 340, y: 250, color: '#f59e0b', category: 'Optimization' },
  ];

  const teaserEdges = [
    { from: 'trees', to: 'bst' },
    { from: 'trees', to: 'graphs' },
    { from: 'graphs', to: 'bfs' },
    { from: 'graphs', to: 'mst' },
    { from: 'bst', to: 'dp' },
    { from: 'mst', to: 'bb' },
    { from: 'dp', to: 'bb' },
  ];

  const algorithms = [
    {
      id: 'trees',
      name: '1. Trees Hierarchy',
      desc: 'Hierarchically organises accredited curriculum from Course to Subject, Unit, Topic, and Subtopics with full traversals.',
      icon: <GitFork className="w-5 h-5 text-blue-500" />,
      tag: 'O(N) Traversal',
    },
    {
      id: 'matrix',
      name: '2. Adjacency Matrix',
      desc: 'Dense matrix mapping pairwise academic prerequisites and concept relationships with instant lookup.',
      icon: <Layers className="w-5 h-5 text-indigo-500" />,
      tag: 'O(1) Edge Query',
    },
    {
      id: 'bfs',
      name: '3. Breadth-First Search',
      desc: 'Explores prerequisite dependencies wave by wave using FIFO queues, finding the shortest conceptual path.',
      icon: <Network className="w-5 h-5 text-sky-500" />,
      tag: 'O(V + E)',
    },
    {
      id: 'dfs',
      name: '4. Depth-First Search',
      desc: 'Recursively explores prerequisite chains to foundational fundamentals before advancing forward.',
      icon: <Share2 className="w-5 h-5 text-purple-500" />,
      tag: 'O(V + E)',
    },
    {
      id: 'kruskal',
      name: "5. Kruskal's MST",
      desc: 'Builds Minimum Spanning Trees across weighted concept networks using Disjoint Set Union (Union-Find).',
      icon: <Shuffle className="w-5 h-5 text-pink-500" />,
      tag: 'O(E log E)',
    },
    {
      id: 'prim',
      name: "6. Prim's MST",
      desc: 'Grows a minimal cognitive load tree from any seed concept using cut property relaxations.',
      icon: <Anchor className="w-5 h-5 text-violet-500" />,
      tag: 'O(E + V log V)',
    },
    {
      id: 'knapsack',
      name: '7. 0/1 Knapsack DP',
      desc: 'Solves time-budgeted study allocation, maximizing learning value points within fixed study hours.',
      icon: <Briefcase className="w-5 h-5 text-emerald-500" />,
      tag: 'O(N · W) Pseudo-poly',
    },
    {
      id: 'backtracking',
      name: '8. Backtracking Search',
      desc: 'Generates valid semester study orders and immediately prunes sequences that violate prerequisites.',
      icon: <Undo2 className="w-5 h-5 text-amber-500" />,
      tag: 'Constraint Pruning',
    },
    {
      id: 'branch-bound',
      name: '9. Branch and Bound',
      desc: 'Optimizes learning path selection using bounding relaxations, pruning unpromising branches.',
      icon: <Scissors className="w-5 h-5 text-rose-500" />,
      tag: 'Bounded Optimization',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500/20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/60 via-transparent to-transparent dark:from-indigo-950/20 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Academic EdTech & Graph Theory Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Learn Smarter Through{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Connected Knowledge.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                An intelligent academic knowledge platform that connects subjects, topics and learning resources into an interactive knowledge graph.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => setCurrentView('graph')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Network className="w-4 h-4" />
                  <span>Explore Knowledge Graph</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-slate-800 shadow-xs transition-all"
                >
                  Get Started (Dashboard)
                </button>
              </div>

              {/* Quick stats pills */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">4+</div>
                  <div className="text-xs text-slate-500 font-medium">Core Subjects</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">9</div>
                  <div className="text-xs text-slate-500 font-medium">DSA Algorithms</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
                  <div className="text-xs text-slate-500 font-medium">Prerequisite Clarity</div>
                </div>
              </div>
            </div>

            {/* Right Interactive Hero Preview */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 p-6 shadow-2xl border border-indigo-500/20 text-white overflow-hidden">
                <div className="flex items-center justify-between mb-4 border-b border-indigo-800/40 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono text-indigo-300 ml-2">Interactive Concept Topology</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-400/30">
                    Live Demo
                  </span>
                </div>

                {/* SVG Graph Teaser Canvas */}
                <div className="relative w-full h-[320px] bg-slate-950/70 rounded-xl p-2 border border-indigo-900/40">
                  <svg className="w-full h-full" viewBox="0 0 420 310">
                    <defs>
                      <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                      </linearGradient>
                      <marker id="arrow" viewBox="0 0 10 10" refX="16" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#818cf8" />
                      </marker>
                    </defs>

                    {/* Edges */}
                    {teaserEdges.map((e, idx) => {
                      const fromNode = teaserNodes.find(n => n.id === e.from)!;
                      const toNode = teaserNodes.find(n => n.id === e.to)!;
                      const isActive = activeInteractiveNode === e.from || activeInteractiveNode === e.to;
                      return (
                        <line
                          key={idx}
                          x1={fromNode.x}
                          y1={fromNode.y}
                          x2={toNode.x}
                          y2={toNode.y}
                          stroke={isActive ? '#38bdf8' : '#4f46e5'}
                          strokeWidth={isActive ? 2.5 : 1.5}
                          strokeDasharray={isActive ? '4 2' : 'none'}
                          markerEnd="url(#arrow)"
                          className="transition-all duration-300"
                        />
                      );
                    })}

                    {/* Nodes */}
                    {teaserNodes.map(node => {
                      const isSelected = activeInteractiveNode === node.id;
                      return (
                        <g
                          key={node.id}
                          className="cursor-pointer transition-transform duration-200"
                          onClick={() => setActiveInteractiveNode(node.id)}
                        >
                          {isSelected && (
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={22}
                              fill="none"
                              stroke={node.color}
                              strokeWidth={2}
                              className="animate-ping opacity-30"
                            />
                          )}
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={isSelected ? 16 : 13}
                            fill={node.color}
                            stroke="#ffffff"
                            strokeWidth={2}
                            className="shadow-md"
                          />
                          <text
                            x={node.x}
                            y={node.y + 22}
                            textAnchor="middle"
                            fill="#f1f5f9"
                            fontSize="9"
                            fontWeight="600"
                            className="pointer-events-none drop-shadow"
                          >
                            {node.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Active node detail pill */}
                  <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 backdrop-blur-md p-2.5 rounded-lg border border-indigo-500/30 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-400 block">
                        Selected Concept
                      </span>
                      <span className="font-bold text-white">
                        {teaserNodes.find(n => n.id === activeInteractiveNode)?.label}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentView('graph');
                      }}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-[11px] font-semibold text-white flex items-center gap-1"
                    >
                      <span>Explore In Full Graph</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <p className="text-[11px] text-indigo-300/80 font-medium">
                    Click any concept node to visualize connected prerequisite pathways.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 1. About the Platform */}
      <section className="py-16 bg-white dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Academic Mission
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Transforming Fragmented Syllabi into Structured Knowledge
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Traditional college curricula present topics linearly through disjointed slides and textbooks. 
              GraphAcademia reconstructs academic subjects as an interconnected semantic knowledge graph, 
              revealing prerequisite chains and optimal cognitive pathways.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Network className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Hierarchical Academic Graph
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Represents courses, subjects, units, topics, and subtopics as nodes, with prerequisite and correlation edges capturing true learning dependencies.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                DSA Theory in Practice
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Rather than treating Data Structures and Algorithms as abstract theory, students observe BFS, DFS, Kruskal, Prim, and Knapsack solving real curriculum challenges.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Adaptive Study Budgeting
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Dynamic programming knapsack optimizes study schedules, recommending high-yield academic resources that fit exact exam preparation timeframes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              How the Knowledge Graph Works
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-2">
              Four structured phases from initial concept exploration to full algorithmic mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Select Academic Subject',
                desc: 'Explore computer science subjects like DSA, DBMS, Operating Systems, and Computer Networks.',
                icon: <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
              },
              {
                step: '02',
                title: 'Resolve Prerequisites',
                desc: 'Trace upstream dependencies with topological sorting so you never start an advanced topic unprepared.',
                icon: <GitFork className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
              },
              {
                step: '03',
                title: 'Run Algorithm Lab',
                desc: 'Inspect step-by-step visualizations of BFS, DFS, MSTs, and Knapsack on real concept graphs.',
                icon: <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
              },
              {
                step: '04',
                title: 'Track & Master Progress',
                desc: 'Mark completed concepts, take curated quizzes, and track subject-level syllabus coverage.',
                icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
              },
            ].map((st, i) => (
              <div
                key={i}
                className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-300 dark:text-slate-700 font-mono">
                      {st.step}
                    </span>
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60">
                      {st.icon}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Core Features */}
      <section className="py-16 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Platform Features
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Engineered for Academic Excellence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Interactive Knowledge Graph',
                desc: 'Dynamic node drag, zoom, pan, subject filtering, difficulty toggles, and shortest path discovery.',
                icon: <Network className="w-5 h-5 text-blue-500" />,
                action: () => setCurrentView('graph'),
              },
              {
                title: 'DSA Algorithm Laboratory',
                desc: 'Dedicated interactive simulators for 9 college algorithms with real-time queues, stacks, and DP tables.',
                icon: <Cpu className="w-5 h-5 text-indigo-500" />,
                action: () => setCurrentView('dsa-lab'),
              },
              {
                title: 'Learning Path Generator',
                desc: 'Generates topological prerequisite learning flows with step-by-step progress tracking.',
                icon: <GitFork className="w-5 h-5 text-purple-500" />,
                action: () => setCurrentView('learning-paths'),
              },
              {
                title: 'Student Analytics Dashboard',
                desc: 'Track completed topics, subject-wise percentage coverage, estimated remaining hours, and recent activity.',
                icon: <BarChart2 className="w-5 h-5 text-pink-500" />,
                action: () => setCurrentView('dashboard'),
              },
              {
                title: 'Academic Resource Library',
                desc: 'Curated university lecture notes, video links, benchmark PDFs, and practice problems per concept.',
                icon: <BookOpen className="w-5 h-5 text-emerald-500" />,
                action: () => setCurrentView('resources'),
              },
              {
                title: 'Curriculum & Faculty Admin',
                desc: 'Faculty tools to add new subjects, units, topics, subtopics, and custom directed relationships.',
                icon: <ShieldCheck className="w-5 h-5 text-amber-500" />,
                action: () => setCurrentView('management'),
              },
            ].map((feat, i) => (
              <div
                key={i}
                onClick={feat.action}
                className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit mb-4 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
                  <span>{feat.title}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DSA Algorithms Used Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Core Curriculum Algorithms
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                DSA Algorithms Demonstrated
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 max-w-xl">
                Nine fundamental college-level algorithms applied directly to academic concept graph exploration.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('dsa-lab')}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>Launch Full Algorithm Lab</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {algorithms.map(algo => (
              <div
                key={algo.id}
                onClick={() => {
                  setSelectedAlgorithm(algo.id);
                  setCurrentView('dsa-lab');
                }}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      {algo.icon}
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                      {algo.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                    {algo.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {algo.desc}
                  </p>
                </div>
                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  <span>Interactive Simulator</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Benefits for Students */}
      <section className="py-16 bg-white dark:bg-slate-900/50 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Academic Advantages
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Built specifically for Computer Science & Engineering Students
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Overcome curriculum blind spots. Never wonder why a topic is being taught or struggle through advanced graph theory without understanding foundational trees.
              </p>
              
              <div className="space-y-3 pt-2">
                {[
                  'Eliminates confusion by guaranteeing prerequisite compliance.',
                  'Visualizes abstract algorithmic state transitions (queues, stacks, cut sets, DP matrices).',
                  'Optimizes revision time before university examinations with Knapsack DP.',
                  'Provides faculty with clear course dependency auditing.',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/70 border border-blue-200/60 dark:border-slate-700">
                  <div className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono mb-1">
                    01
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    Prerequisite Clarity
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Know exact upstream concepts needed before tackling complex topics like Kruskal or DP.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/70 border border-indigo-200/60 dark:border-slate-700">
                  <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono mb-1">
                    02
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    Algorithm Mastery
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Witness live execution traces of BFS, DFS, MSTs, and Backtracking on real data.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-800/70 border border-purple-200/60 dark:border-slate-700">
                  <div className="text-3xl font-black text-purple-600 dark:text-purple-400 font-mono mb-1">
                    03
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    Structured Paths
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Follow tailored curriculum roadmaps that adapt dynamically as you mark topics completed.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/70 border border-emerald-200/60 dark:border-slate-700">
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mb-1">
                    04
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    Time Optimization
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Use dynamic programming knapsack to curate the highest-scoring study sets within available hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Navigate Academic Knowledge Through Graphs?
          </h2>
          <p className="text-indigo-200 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Experience the interactive knowledge graph and explore real-time demonstrations of college-level data structures and algorithms.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setCurrentView('graph')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-indigo-900 font-bold text-sm shadow-xl hover:bg-indigo-50 transition-all hover:scale-105"
            >
              Open Knowledge Graph Explorer
            </button>
            <button
              onClick={() => setCurrentView('dsa-lab')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-800/80 hover:bg-indigo-700 text-white font-bold text-sm border border-indigo-600/50 transition-all"
            >
              Launch DSA Algorithm Lab
            </button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-12 bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Network className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-white">
                GraphAcademia &bull; AI-Based Academic Knowledge Graph
              </span>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => setCurrentView('graph')} className="hover:text-white transition-colors">
                Knowledge Graph
              </button>
              <button onClick={() => setCurrentView('dsa-lab')} className="hover:text-white transition-colors">
                Algorithm Lab
              </button>
              <button onClick={() => setCurrentView('learning-paths')} className="hover:text-white transition-colors">
                Learning Paths
              </button>
              <button onClick={() => setCurrentView('management')} className="hover:text-white transition-colors">
                Faculty Admin
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              College-Grade Data Structures & Algorithms Demonstration Platform &copy; 2026.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};
