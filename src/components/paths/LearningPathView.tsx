import React, { useState, useEffect } from 'react';
import { 
  GitFork, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ArrowDown, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  ChevronRight, 
  Layers,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { Subject, Topic } from '../../types/index.ts';

export const LearningPathView: React.FC = () => {
  const { setSelectedTopicId, setCurrentView, addToast, triggerRefresh, refreshKey } = useApp();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('subj-dsa');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [targetTopicId, setTargetTopicId] = useState<string>('top-kruskal');

  const [pathResult, setPathResult] = useState<{
    targetTopic: Topic;
    totalSteps: number;
    completedSteps: number;
    remainingHours: number;
    path: { step: number; topic: Topic; isCompleted: boolean }[];
  } | null>(null);

  const [savingPath, setSavingPath] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Load subjects
  useEffect(() => {
    api.getSubjects().then(res => setSubjects(res.subjects));
  }, []);

  // Load topics when subject changes
  useEffect(() => {
    api.getTopics(selectedSubjectId).then(res => {
      setTopics(res.topics);
      if (res.topics.length > 0) {
        // default to an advanced topic if available
        const advanced = res.topics.find(t => t.difficulty === 'Advanced') || res.topics[res.topics.length - 1];
        setTargetTopicId(advanced.id);
      }
    });
  }, [selectedSubjectId]);

  // Compute recommended path whenever targetTopicId changes
  useEffect(() => {
    if (!targetTopicId) return;

    api.getRecommendedPath(targetTopicId)
      .then(res => {
        setPathResult(res);
        setSavedSuccess(false);
      })
      .catch(err => {
        console.error('Failed to compute path:', err);
      });
  }, [targetTopicId, refreshKey]);

  const handleToggleCompletion = async (topicId: string) => {
    try {
      await api.toggleTopicCompletion(topicId);
      triggerRefresh();
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Could not toggle topic completion.',
      });
    }
  };

  const handleSavePath = async () => {
    if (!pathResult) return;
    try {
      setSavingPath(true);
      await api.saveLearningPath({
        title: `Path to ${pathResult.targetTopic.name}`,
        subjectId: selectedSubjectId,
        targetTopicId: pathResult.targetTopic.id,
        sequenceTopicIds: pathResult.path.map(p => p.topic.id),
      });
      setSavedSuccess(true);
      addToast({
        type: 'success',
        title: 'Path Saved',
        message: `Saved '${pathResult.targetTopic.name}' roadmap to your active study paths.`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not save learning path.',
      });
    } finally {
      setSavingPath(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-xs font-bold font-mono uppercase mb-1">
            <GitFork className="w-3.5 h-3.5" />
            <span>Topological Prerequisite Resolution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Learning Path Recommendations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Target any advanced concept to automatically generate a step-by-step roadmap respecting all prerequisite dependencies.
          </p>
        </div>

        {pathResult && (
          <button
            onClick={handleSavePath}
            disabled={savingPath || savedSuccess}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            }`}
          >
            {savedSuccess ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            <span>{savedSuccess ? 'Saved to Active Tracks' : 'Save This Learning Path'}</span>
          </button>
        )}
      </div>

      {/* Target Selector Toolbar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
            1. Select Academic Subject
          </label>
          <div className="grid grid-cols-2 gap-2">
            {subjects.map(subj => {
              const isSelected = selectedSubjectId === subj.id;
              return (
                <button
                  key={subj.id}
                  onClick={() => setSelectedSubjectId(subj.id)}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: subj.color }} />
                  <span className="truncate">{subj.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
            2. Choose Goal / Target Concept to Master
          </label>
          <select
            value={targetTopicId}
            onChange={e => setTargetTopicId(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {topics.map(topic => (
              <option key={topic.id} value={topic.id}>
                {topic.name} ({topic.difficulty} &bull; {topic.estHours}h)
              </option>
            ))}
          </select>

          {pathResult && (
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
              <span>Steps: <strong className="text-slate-800 dark:text-slate-200">{pathResult.totalSteps}</strong></span>
              <span>Completed: <strong className="text-emerald-600">{pathResult.completedSteps}</strong></span>
              <span>Remaining Study: <strong className="text-indigo-600 font-mono">~{pathResult.remainingHours}h</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Flowchart Roadmap */}
      {pathResult ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Recommended Prerequisite-First Flowchart</span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ml-2" /> Pending Step
            </div>
          </div>

          <div className="relative max-w-2xl mx-auto space-y-4">
            {pathResult.path.map((item, idx) => {
              const isLast = idx === pathResult.path.length - 1;
              return (
                <React.Fragment key={item.topic.id}>
                  
                  {/* Step Card */}
                  <div className={`relative p-5 rounded-3xl border transition-all ${
                    item.isCompleted
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-xs'
                      : isLast
                      ? 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-400 dark:border-purple-800 shadow-md ring-2 ring-purple-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                  }`}>
                    
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Step Number Badge */}
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold font-mono text-sm shrink-0 ${
                          item.isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isLast
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {item.step}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {item.topic.name}
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {item.topic.code}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                              {item.topic.difficulty}
                            </span>
                            {isLast && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-600 text-white">
                                Target Goal
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {item.topic.description}
                          </p>
                        </div>
                      </div>

                      {/* Complete Checkbox Toggle & Jump to Graph */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleCompletion(item.topic.id)}
                          className={`p-2 rounded-xl transition-all ${
                            item.isCompleted
                              ? 'text-emerald-600 hover:text-emerald-700'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title={item.isCompleted ? 'Marked as completed' : 'Click to complete'}
                        >
                          {item.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTopicId(item.topic.id);
                            setCurrentView('graph');
                          }}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-indigo-600 transition-colors"
                          title="View in Knowledge Graph"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Estimated Study: {item.topic.estHours} hours</span>
                      </span>
                      <span className="font-semibold text-slate-400">
                        {item.isCompleted ? 'Step Completed' : 'Prerequisite Requirement'}
                      </span>
                    </div>

                  </div>

                  {/* Flow Arrow Connector */}
                  {!isLast && (
                    <div className="flex justify-center py-0.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
                        <ArrowDown className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                </React.Fragment>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400 text-xs">
          Computing recommended topological study path...
        </div>
      )}

    </div>
  );
};
