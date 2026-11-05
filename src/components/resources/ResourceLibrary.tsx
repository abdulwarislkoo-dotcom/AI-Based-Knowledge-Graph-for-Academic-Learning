import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Video, 
  FileText, 
  ExternalLink, 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Clock, 
  CheckCircle2,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { LearningResource, Topic, ResourceType } from '../../types/index.ts';

export const ResourceLibrary: React.FC = () => {
  const { userRole, addToast, refreshKey, triggerRefresh } = useApp();

  const [resources, setResources] = useState<LearningResource[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filters
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add Resource Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newTopicId, setNewTopicId] = useState<string>('');
  const [newType, setNewType] = useState<ResourceType>('video');
  const [newUrl, setNewUrl] = useState<string>('');
  const [newDuration, setNewDuration] = useState<number>(30);
  const [newLearningValue, setNewLearningValue] = useState<number>(50);
  const [newDescription, setNewDescription] = useState<string>('');
  const [newAuthor, setNewAuthor] = useState<string>('Prof. Department of CSE');

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [resRes, topicsRes] = await Promise.all([
          api.getResources(),
          api.getTopics(),
        ]);

        if (!mounted) return;
        setResources(resRes.resources);
        setTopics(topicsRes.topics);
        if (topicsRes.topics.length > 0) {
          setNewTopicId(topicsRes.topics[0].id);
        }
      } catch (err) {
        console.error('Failed to load resources:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  const filteredResources = resources.filter(res => {
    if (selectedType !== 'all' && res.type !== selectedType) return false;
    if (selectedTopicId !== 'all' && res.topicId !== selectedTopicId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        res.title.toLowerCase().includes(q) ||
        res.description.toLowerCase().includes(q) ||
        res.author.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTopicId) {
      addToast({
        type: 'warning',
        title: 'Missing Required Fields',
        message: 'Resource title and topic are mandatory.',
      });
      return;
    }

    try {
      await api.createResource({
        topicId: newTopicId,
        title: newTitle,
        type: newType,
        url: newUrl || '#',
        durationMinutes: Number(newDuration) || 30,
        learningValue: Number(newLearningValue) || 50,
        description: newDescription,
        author: newAuthor,
      });

      addToast({
        type: 'success',
        title: 'Resource Added',
        message: `Successfully published '${newTitle}'.`,
      });

      setIsModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      triggerRefresh();
    } catch {
      addToast({
        type: 'error',
        title: 'Publish Failed',
        message: 'Could not create new learning resource.',
      });
    }
  };

  const handleDeleteResource = async (id: string, title: string) => {
    if (!window.confirm(`Delete resource '${title}'?`)) return;
    try {
      await api.deleteResource(id);
      addToast({
        type: 'info',
        title: 'Resource Removed',
        message: `${title} was removed.`,
      });
      triggerRefresh();
    } catch {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Could not delete resource.',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold font-mono uppercase mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curated Academic Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Academic Learning Resources
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Explore topic notes, university video lectures, practice questions, and research benchmarks.
          </p>
        </div>

        {userRole === 'faculty' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Resource</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources, authors..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Types' },
            { id: 'video', label: 'Videos' },
            { id: 'pdf', label: 'PDFs' },
            { id: 'note', label: 'Notes' },
            { id: 'practice', label: 'Practice Sets' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedType === t.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Topic Filter */}
        <div className="w-full sm:w-56">
          <select
            value={selectedTopicId}
            onChange={e => setSelectedTopicId(e.target.value)}
            className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium"
          >
            <option value="all">All Topics ({topics.length})</option>
            {topics.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resources Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(res => {
          const topic = topics.find(t => t.id === res.topicId);
          let typeIcon = <FileText className="w-4 h-4 text-blue-500" />;
          let typeBadge = 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300';

          if (res.type === 'video') {
            typeIcon = <Video className="w-4 h-4 text-rose-500" />;
            typeBadge = 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300';
          } else if (res.type === 'practice') {
            typeIcon = <Sparkles className="w-4 h-4 text-emerald-500" />;
            typeBadge = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300';
          } else if (res.type === 'pdf') {
            typeIcon = <BookOpen className="w-4 h-4 text-purple-500" />;
            typeBadge = 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300';
          }

          return (
            <div
              key={res.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${typeBadge}`}>
                    {typeIcon}
                    <span>{res.type}</span>
                  </span>

                  <span className="text-[11px] font-mono font-bold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{res.durationMinutes}m &bull; {res.learningValue} pts</span>
                  </span>
                </div>

                {topic && (
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                    {topic.name} ({topic.code})
                  </span>
                )}

                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-2 line-clamp-2">
                  {res.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4 line-clamp-3">
                  {res.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  By {res.author}
                </span>

                <div className="flex items-center gap-2">
                  {userRole === 'faculty' && (
                    <button
                      onClick={() => handleDeleteResource(res.id, res.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete resource"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No matching learning resources found
          </h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search query or type filters.
          </p>
        </div>
      )}

      {/* Add Resource Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Add Academic Resource
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stanford CS106B Trees Lecture Video"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Related Topic *
                  </label>
                  <select
                    value={newTopicId}
                    onChange={e => setNewTopicId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    {topics.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Resource Type *
                  </label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 capitalize"
                  >
                    <option value="video">Video Lecture</option>
                    <option value="pdf">PDF Handbook / Paper</option>
                    <option value="note">Lecture Notes</option>
                    <option value="practice">Practice Questions</option>
                    <option value="link">External Documentation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={newDuration}
                    onChange={e => setNewDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Learning Value (Pts for Knapsack)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={newLearningValue}
                    onChange={e => setNewLearningValue(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Resource Link / URL
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of syllabus covered..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  Publish Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
