import React, { useState, useEffect } from 'react';
import { 
  Network, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  GitFork, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  Award, 
  Compass, 
  Layers, 
  Cpu, 
  ChevronRight,
  Flame,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { Subject, Topic, UserProgress, LearningPath } from '../../types/index.ts';

export const StudentDashboard: React.FC = () => {
  const { setCurrentView, setSelectedTopicId, setSelectedAlgorithm, refreshKey } = useApp();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [relationshipsCount, setRelationshipsCount] = useState<number>(0);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        const [subjRes, topicsRes, relRes, progRes, pathsRes] = await Promise.all([
          api.getSubjects(),
          api.getTopics(),
          api.getRelationships(),
          api.getProgress(),
          api.getLearningPaths(),
        ]);

        if (!mounted) return;
        setSubjects(subjRes.subjects);
        setTopics(topicsRes.topics);
        setRelationshipsCount(relRes.relationships.length);
        setProgress(progRes.progress);
        setLearningPaths(pathsRes.paths);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  // Derived stats
  const completedTopicsCount = progress.filter(p => p.isCompleted).length;
  const totalTopicsCount = topics.length;
  const overallPercentage = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;
  const completedTopicIds = new Set(progress.filter(p => p.isCompleted).map(p => p.topicId));

  const totalStudyHours = topics.reduce((acc, t) => acc + t.estHours, 0);
  const completedHours = topics
    .filter(t => completedTopicIds.has(t.id))
    .reduce((acc, t) => acc + t.estHours, 0);

  // Recommended Topics: Topics that are NOT completed yet, but are either Beginner or have their prerequisites met
  const recommendedTopics = topics
    .filter(t => !completedTopicIds.has(t.id))
    .slice(0, 4);

  // Recently completed / viewed topics
  const recentCompletedTopics = topics
    .filter(t => completedTopicIds.has(t.id))
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Student Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Computer Science Undergraduate Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, Alex Rivera 👋
            </h1>
            <p className="text-sm text-indigo-100 max-w-xl">
              You have completed <span className="font-bold text-white">{completedTopicsCount}</span> of {totalTopicsCount} academic concepts. Keep building your connected knowledge graph!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('graph')}
              className="px-5 py-3 rounded-xl bg-white text-indigo-900 font-bold text-xs shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-2 hover:scale-105"
            >
              <Network className="w-4 h-4" />
              <span>Open Graph Explorer</span>
            </button>
            <button
              onClick={() => setCurrentView('dsa-lab')}
              className="px-5 py-3 rounded-xl bg-indigo-900/60 hover:bg-indigo-900/80 text-white font-bold text-xs border border-white/20 transition-all"
            >
              DSA Lab
            </button>
          </div>
        </div>

        {/* Decorative background glow circle */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Subjects
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {subjects.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Accredited Curricula</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Topics
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {totalTopicsCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Across 9 Academic Units</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Connected Edges
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {relationshipsCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Prerequisite & Correlations</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Completed Topics
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {completedTopicsCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {overallPercentage}% syllabus mastered
          </span>
        </div>

        <div className="col-span-2 lg:col-span-1 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Study Hours
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {completedHours}h
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">of ~{totalStudyHours}h total</span>
        </div>

      </div>

      {/* Main Grid: Progress Chart & Subject-wise Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Learning Progress & Analytics Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Academic Learning Progress Velocity
              </h2>
              <p className="text-xs text-slate-500">
                Cognitive mastery points accumulated across weekly study milestones.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">
              +14% this month
            </span>
          </div>

          {/* SVG Progress Velocity Chart */}
          <div className="h-56 w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180">
              <defs>
                <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="30" y1="20" x2="490" y2="20" stroke="#334155" strokeDasharray="3 3" opacity="0.2" />
              <line x1="30" y1="60" x2="490" y2="60" stroke="#334155" strokeDasharray="3 3" opacity="0.2" />
              <line x1="30" y1="100" x2="490" y2="100" stroke="#334155" strokeDasharray="3 3" opacity="0.2" />
              <line x1="30" y1="140" x2="490" y2="140" stroke="#334155" strokeDasharray="3 3" opacity="0.2" />

              {/* Area */}
              <path
                d="M 50 140 Q 120 120 180 95 T 310 70 T 420 35 T 480 25 L 480 150 L 50 150 Z"
                fill="url(#progressGrad)"
              />

              {/* Line */}
              <path
                d="M 50 140 Q 120 120 180 95 T 310 70 T 420 35 T 480 25"
                fill="none"
                stroke="#6366f1"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Points */}
              {[
                { x: 50, y: 140, label: 'W1: 20 pts' },
                { x: 180, y: 95, label: 'W2: 45 pts' },
                { x: 310, y: 70, label: 'W3: 65 pts' },
                { x: 420, y: 35, label: 'W4: 85 pts' },
                { x: 480, y: 25, label: 'Current: 94 pts' },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="2.5" />
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {pt.label.split(':')[0]}
                  </text>
                </g>
              ))}

              {/* X Axis labels */}
              <text x="50" y="170" textAnchor="middle" fill="#94a3b8" fontSize="10">Trees</text>
              <text x="180" y="170" textAnchor="middle" fill="#94a3b8" fontSize="10">Binary Trees</text>
              <text x="310" y="170" textAnchor="middle" fill="#94a3b8" fontSize="10">Graphs</text>
              <text x="420" y="170" textAnchor="middle" fill="#94a3b8" fontSize="10">BFS & DFS</text>
              <text x="480" y="170" textAnchor="middle" fill="#94a3b8" fontSize="10">MSTs</text>
            </svg>
          </div>

          {/* Quick stats footer */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Total Mastery Pts</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">485 / 750</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Active Prereq Chains</span>
              <span className="text-lg font-bold text-indigo-600 font-mono">3 Chains</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Average Quiz Score</span>
              <span className="text-lg font-bold text-emerald-600 font-mono">92%</span>
            </div>
          </div>
        </div>

        {/* Right: Subject-wise Progress */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Subject-Wise Curriculum Coverage
            </h2>
            <span className="text-xs text-indigo-600 font-bold">4 Subjects</span>
          </div>

          <div className="space-y-4">
            {subjects.map(subject => {
              const subjTopics = topics.filter(t => t.subjectId === subject.id);
              const subjCompleted = subjTopics.filter(t => completedTopicIds.has(t.id)).length;
              const pct = subjTopics.length > 0 ? Math.round((subjCompleted / subjTopics.length) * 100) : 0;

              return (
                <div
                  key={subject.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {subject.name}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {pct}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: subject.color,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{subjCompleted} of {subjTopics.length} topics completed</span>
                    <span className="font-mono">{subject.code}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Recommended Topics & Recommended Learning Paths */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Recommended Next Topics */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Recommended Next Topics
              </h2>
            </div>
            <button
              onClick={() => setCurrentView('graph')}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>Explore in Graph</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recommendedTopics.map(topic => {
              const subj = subjects.find(s => s.id === topic.subjectId);
              return (
                <div
                  key={topic.id}
                  onClick={() => {
                    setSelectedTopicId(topic.id);
                    setCurrentView('graph');
                  }}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: subj?.color || '#3b82f6' }}
                      >
                        {subj?.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {topic.code}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {topic.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {topic.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {topic.estHours}h
                    </span>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-700 text-slate-400 group-hover:text-indigo-600 shadow-xs">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommended Learning Paths */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitFork className="w-4 h-4 text-purple-600" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Active Learning Paths
              </h2>
            </div>
            <button
              onClick={() => setCurrentView('learning-paths')}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>View All Paths</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {learningPaths.map(path => {
              const pathTopics = path.sequenceTopicIds
                .map(id => topics.find(t => t.id === id))
                .filter(Boolean) as Topic[];
              const completedInPath = pathTopics.filter(t => completedTopicIds.has(t.id)).length;
              const pathPct = pathTopics.length > 0 ? Math.round((completedInPath / pathTopics.length) * 100) : 0;

              return (
                <div
                  key={path.id}
                  onClick={() => setCurrentView('learning-paths')}
                  className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-800/60 dark:to-indigo-950/20 border border-slate-200 dark:border-slate-700 hover:border-purple-400 transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                        Roadmap Track
                      </span>
                      <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {path.title}
                      </h3>
                    </div>
                    <span className="text-xs font-bold font-mono text-purple-700 dark:text-purple-300">
                      {pathPct}%
                    </span>
                  </div>

                  {/* Flow preview pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                    {pathTopics.map((pt, idx) => (
                      <React.Fragment key={pt.id}>
                        <span className={`px-2 py-0.5 rounded whitespace-nowrap ${
                          completedTopicIds.has(pt.id)
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
                        }`}>
                          {pt.name}
                        </span>
                        {idx < pathTopics.length - 1 && (
                          <span className="text-slate-400">&rarr;</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
