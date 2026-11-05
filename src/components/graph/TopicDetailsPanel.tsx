import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen, 
  Video, 
  FileText, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  ArrowRight, 
  Sparkles, 
  Bookmark, 
  Save,
  Share2
} from 'lucide-react';
import { Topic, Subtopic, LearningResource, Subject, Unit, TopicRelationship } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useApp } from '../../context/AppContext.tsx';

interface TopicDetailsPanelProps {
  topicId: string | null;
  onClose: () => void;
  onSelectTopic: (topicId: string) => void;
}

export const TopicDetailsPanel: React.FC<TopicDetailsPanelProps> = ({
  topicId,
  onClose,
  onSelectTopic,
}) => {
  const { addToast, triggerConfetti, triggerRefresh } = useApp();

  const [topic, setTopic] = useState<(Topic & { subtopics: Subtopic[] }) | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [relationships, setRelationships] = useState<TopicRelationship[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'subtopics'>('overview');
  const [completedSubtopics, setCompletedSubtopics] = useState<Set<string>>(new Set());
  const [savingNotes, setSavingNotes] = useState<boolean>(false);

  useEffect(() => {
    if (!topicId) return;

    let mounted = true;

    async function loadTopicData() {
      try {
        const [
          topicRes, 
          subjectsRes, 
          unitsRes, 
          resourcesRes, 
          allTopicsRes, 
          relRes, 
          progressRes
        ] = await Promise.all([
          api.getTopicById(topicId!),
          api.getSubjects(),
          api.getUnits(),
          api.getResources(topicId!),
          api.getTopics(),
          api.getRelationships(),
          api.getProgress(),
        ]);

        if (!mounted) return;

        const currentTopic = topicRes.topic;
        setTopic(currentTopic);

        const currentSubj = subjectsRes.subjects.find(s => s.id === currentTopic.subjectId) || null;
        setSubject(currentSubj);

        const currentUnit = unitsRes.units.find(u => u.id === currentTopic.unitId) || null;
        setUnit(currentUnit);

        setResources(resourcesRes.resources);
        setAllTopics(allTopicsRes.topics);
        setRelationships(relRes.relationships);

        const userProg = progressRes.progress.find(p => p.topicId === topicId);
        if (userProg) {
          setIsCompleted(userProg.isCompleted);
          setIsBookmarked(!!userProg.bookmarked);
          setNotes(userProg.notes || '');
        } else {
          setIsCompleted(false);
          setIsBookmarked(false);
          setNotes('');
        }
      } catch (err) {
        console.error('Failed to load topic details:', err);
      }
    }

    loadTopicData();

    return () => {
      mounted = false;
    };
  }, [topicId]);

  if (!topicId || !topic) return null;

  // Prerequisites: relations where targetTopicId === topic.id and type === 'PREREQUISITE_OF'
  const prerequisiteRelations = relationships.filter(
    r => r.targetTopicId === topic.id && (r.relationshipType === 'PREREQUISITE_OF' || r.relationshipType === 'DEPENDS_ON')
  );
  const prerequisiteTopics = prerequisiteRelations
    .map(r => allTopics.find(t => t.id === r.sourceTopicId))
    .filter(Boolean) as Topic[];

  // Related topics: relations where type === 'RELATED_TO'
  const relatedRelations = relationships.filter(
    r => (r.sourceTopicId === topic.id || r.targetTopicId === topic.id) && r.relationshipType === 'RELATED_TO'
  );
  const relatedTopicIds = relatedRelations.map(r => r.sourceTopicId === topic.id ? r.targetTopicId : r.sourceTopicId);
  const relatedTopics = allTopics.filter(t => relatedTopicIds.includes(t.id));

  // Dependent topics (unlocks after mastering this)
  const dependentRelations = relationships.filter(
    r => r.sourceTopicId === topic.id && (r.relationshipType === 'PREREQUISITE_OF' || r.relationshipType === 'DEPENDS_ON')
  );
  const dependentTopics = dependentRelations
    .map(r => allTopics.find(t => t.id === r.targetTopicId))
    .filter(Boolean) as Topic[];

  const handleToggleCompleted = async () => {
    try {
      const res = await api.toggleTopicCompletion(topic.id);
      const newStatus = res.progress.isCompleted;
      setIsCompleted(newStatus);
      if (newStatus) {
        triggerConfetti();
        addToast({
          type: 'success',
          title: 'Topic Completed! 🎉',
          message: `Great job mastering ${topic.name}!`,
        });
      } else {
        addToast({
          type: 'info',
          title: 'Topic Marked Incomplete',
          message: `${topic.name} status updated.`,
        });
      }
      triggerRefresh();
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Could not update topic completion status.',
      });
    }
  };

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      await api.updateNotes(topic.id, notes, isBookmarked);
      addToast({
        type: 'success',
        title: 'Notes Saved',
        message: 'Your personal notes have been stored securely.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not save notes.',
      });
    } finally {
      setSavingNotes(false);
    }
  };

  const handleToggleSubtopic = (subId: string) => {
    setCompletedSubtopics(prev => {
      const next = new Set(prev);
      if (next.has(subId)) next.delete(subId);
      else next.add(subId);
      return next;
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transition-transform animate-in slide-in-from-right duration-200">
      
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/80 dark:bg-slate-900/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span 
              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white uppercase tracking-wider"
              style={{ backgroundColor: subject?.color || '#6366f1' }}
            >
              {subject?.name || 'Academic Subject'}
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {topic.code}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              topic.difficulty === 'Beginner' 
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                : topic.difficulty === 'Intermediate' 
                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
            }`}>
              {topic.difficulty}
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {topic.name}
          </h2>

          {unit && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Unit {unit.unitNumber}: {unit.name}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Completion & Action Bar */}
      <div className="px-5 py-3 bg-indigo-50/60 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-950 flex items-center justify-between">
        <button
          onClick={handleToggleCompleted}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            isCompleted
              ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
          <span>{isCompleted ? 'Marked as Completed' : 'Mark as Completed'}</span>
        </button>

        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>~{topic.estHours}h Study</span>
          </div>
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors ${
              isBookmarked ? 'text-amber-500' : 'text-slate-400'
            }`}
            title="Bookmark topic"
          >
            <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Drawer Tabs */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-5 text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview & Dependencies' },
          { id: 'resources', label: `Resources (${resources.length})` },
          { id: 'subtopics', label: `Subtopics (${topic.subtopics?.length || 0})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-3 border-b-2 font-semibold transition-all ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
        {activeTab === 'overview' && (
          <>
            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Academic Description
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                {topic.description}
              </p>
            </div>

            {/* Prerequisites */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Prerequisites Required First
                </h3>
                <span className="text-[10px] text-indigo-600 font-bold">
                  {prerequisiteTopics.length} prerequisite{prerequisiteTopics.length === 1 ? '' : 's'}
                </span>
              </div>

              {prerequisiteTopics.length > 0 ? (
                <div className="space-y-2">
                  {prerequisiteTopics.map(prereq => (
                    <div
                      key={prereq.id}
                      onClick={() => onSelectTopic(prereq.id)}
                      className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900 hover:border-blue-400 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {prereq.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {prereq.code} &bull; {prereq.difficulty}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-200/50 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Foundational Concept — No prior prerequisites needed. Start learning directly!</span>
                </div>
              )}
            </div>

            {/* Unlocked Dependent Topics */}
            {dependentTopics.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Unlocks Next
                </h3>
                <div className="space-y-2">
                  {dependentTopics.map(dep => (
                    <div
                      key={dep.id}
                      onClick={() => onSelectTopic(dep.id)}
                      className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900 hover:border-purple-400 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {dep.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {dep.code} &bull; {dep.difficulty}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-purple-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Topics */}
            {relatedTopics.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Related Academic Concepts
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {relatedTopics.map(rel => (
                    <button
                      key={rel.id}
                      onClick={() => onSelectTopic(rel.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium transition-colors"
                    >
                      {rel.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Study Notes */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  My Study Notes
                </h3>
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Save className="w-3 h-3" />
                  <span>{savingNotes ? 'Saving...' : 'Save Notes'}</span>
                </button>
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Write your study notes, formulas, or key reminders here..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-3">
            {resources.length > 0 ? (
              resources.map(res => {
                let icon = <FileText className="w-4 h-4 text-blue-500" />;
                if (res.type === 'video') icon = <Video className="w-4 h-4 text-rose-500" />;
                if (res.type === 'practice') icon = <Sparkles className="w-4 h-4 text-emerald-500" />;

                return (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          {icon}
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {res.type}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {res.durationMinutes}m &bull; {res.learningValue} pts
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">
                        {res.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2">
                        {res.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-500">
                        By {res.author}
                      </span>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <span>Open Resource</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                No learning resources uploaded for this topic yet.
              </div>
            )}
          </div>
        )}

        {activeTab === 'subtopics' && (
          <div className="space-y-2">
            {topic.subtopics && topic.subtopics.length > 0 ? (
              topic.subtopics.map(st => {
                const isChecked = completedSubtopics.has(st.id);
                return (
                  <div
                    key={st.id}
                    onClick={() => handleToggleSubtopic(st.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isChecked
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <button className="mt-0.5 text-indigo-600 dark:text-indigo-400">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <div>
                      <h4 className={`font-bold text-xs ${isChecked ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                        {st.name}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        {st.description}
                      </p>
                      <span className="inline-block mt-1 text-[10px] text-slate-400 font-mono">
                        {st.durationMinutes} mins
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                No subtopics defined.
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
