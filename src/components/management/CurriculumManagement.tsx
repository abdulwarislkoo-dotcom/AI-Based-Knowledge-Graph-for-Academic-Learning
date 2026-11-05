import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Network, 
  Layers, 
  BookOpen, 
  GitFork, 
  RotateCcw, 
  CheckCircle2, 
  X,
  Share2
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { Subject, Unit, Topic, Subtopic, TopicRelationship, RelationshipType, DifficultyLevel } from '../../types/index.ts';

export const CurriculumManagement: React.FC = () => {
  const { addToast, refreshKey, triggerRefresh } = useApp();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [topics, setTopics] = useState<(Topic & { subtopics: Subtopic[] })[]>([]);
  const [relationships, setRelationships] = useState<TopicRelationship[]>([]);
  const [activeTab, setActiveTab] = useState<'topics' | 'relationships' | 'subjects'>('topics');

  // Modals
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [topicName, setTopicName] = useState('');
  const [topicCode, setTopicCode] = useState('');
  const [topicSubjId, setTopicSubjId] = useState('');
  const [topicUnitId, setTopicUnitId] = useState('');
  const [topicDifficulty, setTopicDifficulty] = useState<DifficultyLevel>('Intermediate');
  const [topicHours, setTopicHours] = useState<number>(4);
  const [topicDesc, setTopicDesc] = useState('');

  // Relationship Modal
  const [relModalOpen, setRelModalOpen] = useState(false);
  const [relSourceId, setRelSourceId] = useState('');
  const [relTargetId, setRelTargetId] = useState('');
  const [relType, setRelType] = useState<RelationshipType>('PREREQUISITE_OF');
  const [relWeight, setRelWeight] = useState<number>(3);
  const [relDesc, setRelDesc] = useState('');

  // Subject Modal
  const [subjModalOpen, setSubjModalOpen] = useState(false);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjCode, setNewSubjCode] = useState('');
  const [newSubjDesc, setNewSubjDesc] = useState('');
  const [newSubjColor, setNewSubjColor] = useState('#3b82f6');

  // Unit Modal
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitNum, setNewUnitNum] = useState(1);
  const [newUnitSubjId, setNewUnitSubjId] = useState('');
  const [newUnitDesc, setNewUnitDesc] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [subjRes, unitsRes, topicsRes, relRes] = await Promise.all([
          api.getSubjects(),
          api.getUnits(),
          api.getTopics(),
          api.getRelationships(),
        ]);

        if (!mounted) return;
        setSubjects(subjRes.subjects);
        setUnits(unitsRes.units);
        setTopics(topicsRes.topics);
        setRelationships(relRes.relationships);

        if (subjRes.subjects.length > 0) {
          setTopicSubjId(subjRes.subjects[0].id);
          setNewUnitSubjId(subjRes.subjects[0].id);
        }
        if (unitsRes.units.length > 0) {
          setTopicUnitId(unitsRes.units[0].id);
        }
        if (topicsRes.topics.length >= 2) {
          setRelSourceId(topicsRes.topics[0].id);
          setRelTargetId(topicsRes.topics[1].id);
        }
      } catch (err) {
        console.error('Failed to load management data:', err);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  // Topic CRUD
  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName || !topicSubjId || !topicUnitId) {
      addToast({
        type: 'warning',
        title: 'Validation Failed',
        message: 'Name, Subject, and Unit are required.',
      });
      return;
    }

    try {
      if (editingTopicId) {
        await api.updateTopic(editingTopicId, {
          name: topicName,
          code: topicCode,
          subjectId: topicSubjId,
          unitId: topicUnitId,
          difficulty: topicDifficulty,
          estHours: Number(topicHours),
          description: topicDesc,
        });
        addToast({
          type: 'success',
          title: 'Topic Updated',
          message: `Successfully edited ${topicName}.`,
        });
      } else {
        await api.createTopic({
          name: topicName,
          code: topicCode || `T-${topics.length + 1}`,
          subjectId: topicSubjId,
          unitId: topicUnitId,
          difficulty: topicDifficulty,
          estHours: Number(topicHours),
          description: topicDesc,
          iconName: 'FileText',
          orderIndex: topics.length + 1,
        });
        addToast({
          type: 'success',
          title: 'Topic Created',
          message: `Added new topic ${topicName}.`,
        });
      }

      setTopicModalOpen(false);
      setEditingTopicId(null);
      setTopicName('');
      setTopicDesc('');
      triggerRefresh();
    } catch {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not save topic.',
      });
    }
  };

  const handleEditTopic = (t: Topic) => {
    setEditingTopicId(t.id);
    setTopicName(t.name);
    setTopicCode(t.code);
    setTopicSubjId(t.subjectId);
    setTopicUnitId(t.unitId);
    setTopicDifficulty(t.difficulty);
    setTopicHours(t.estHours);
    setTopicDesc(t.description);
    setTopicModalOpen(true);
  };

  const handleDeleteTopic = async (id: string, name: string) => {
    if (!window.confirm(`Delete topic '${name}' and its cascade relationships?`)) return;
    try {
      await api.deleteTopic(id);
      addToast({
        type: 'info',
        title: 'Topic Deleted',
        message: `${name} was deleted.`,
      });
      triggerRefresh();
    } catch {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Could not delete topic.',
      });
    }
  };

  // Relationship CRUD
  const handleCreateRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!relSourceId || !relTargetId) return;
    if (relSourceId === relTargetId) {
      addToast({
        type: 'warning',
        title: 'Self-Loop Not Permitted',
        message: 'Source and target concepts must be distinct.',
      });
      return;
    }

    try {
      await api.createRelationship({
        sourceTopicId: relSourceId,
        targetTopicId: relTargetId,
        relationshipType: relType,
        weight: Number(relWeight),
        description: relDesc,
      });

      addToast({
        type: 'success',
        title: 'Relationship Added',
        message: 'New directed graph edge recorded.',
      });

      setRelModalOpen(false);
      setRelDesc('');
      triggerRefresh();
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Could not create graph relationship.',
      });
    }
  };

  const handleDeleteRelationship = async (id: string) => {
    try {
      await api.deleteRelationship(id);
      addToast({
        type: 'info',
        title: 'Relationship Deleted',
        message: 'Edge removed from knowledge graph.',
      });
      triggerRefresh();
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Could not delete relationship.',
      });
    }
  };

  // Subject CRUD
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName || !newSubjCode) return;
    try {
      await api.createSubject({
        code: newSubjCode,
        name: newSubjName,
        description: newSubjDesc,
        color: newSubjColor,
        iconName: 'BookOpen',
        orderIndex: subjects.length + 1,
      });

      addToast({
        type: 'success',
        title: 'Subject Created',
        message: `Added curriculum subject ${newSubjName}.`,
      });

      setSubjModalOpen(false);
      setNewSubjName('');
      setNewSubjCode('');
      setNewSubjDesc('');
      triggerRefresh();
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Could not create subject.',
      });
    }
  };

  // Unit CRUD
  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName || !newUnitSubjId) return;
    try {
      await api.createUnit({
        subjectId: newUnitSubjId,
        unitNumber: Number(newUnitNum),
        name: newUnitName,
        description: newUnitDesc,
      });

      addToast({
        type: 'success',
        title: 'Unit Created',
        message: `Added Unit ${newUnitNum}: ${newUnitName}.`,
      });

      setUnitModalOpen(false);
      setNewUnitName('');
      setNewUnitDesc('');
      triggerRefresh();
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Could not create academic unit.',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-xs font-bold font-mono uppercase mb-1">
            <Settings className="w-3.5 h-3.5" />
            <span>Faculty & Curriculum Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Curriculum & Knowledge Graph Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maintain the Course &rarr; Subject &rarr; Unit &rarr; Topic &rarr; Subtopic hierarchy and directed prerequisite edges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'topics' && (
            <button
              onClick={() => {
                setEditingTopicId(null);
                setTopicName('');
                setTopicCode('');
                setTopicDesc('');
                setTopicModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Topic</span>
            </button>
          )}

          {activeTab === 'relationships' && (
            <button
              onClick={() => setRelModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Relationship</span>
            </button>
          )}

          {activeTab === 'subjects' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSubjModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Subject</span>
              </button>
              <button
                onClick={() => setUnitModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Unit</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Management Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        {[
          { id: 'topics', label: `Topics (${topics.length})`, icon: <Layers className="w-4 h-4" /> },
          { id: 'relationships', label: `Relationships (${relationships.length})`, icon: <Share2 className="w-4 h-4" /> },
          { id: 'subjects', label: `Subjects (${subjects.length}) & Units (${units.length})`, icon: <BookOpen className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TOPICS TABLE */}
      {activeTab === 'topics' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Topic Name</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Unit</th>
                  <th className="p-4">Difficulty</th>
                  <th className="p-4">Est. Hours</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {topics.map(t => {
                  const subj = subjects.find(s => s.id === t.subjectId);
                  const unit = units.find(u => u.id === t.unitId);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-mono font-bold text-slate-500">
                        {t.code}
                      </td>
                      <td className="p-4">
                        <span className="font-extrabold text-slate-900 dark:text-white block">
                          {t.name}
                        </span>
                        <span className="text-[11px] text-slate-400 line-clamp-1">
                          {t.description}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap"
                          style={{ backgroundColor: subj?.color || '#3b82f6' }}
                        >
                          {subj?.name.split(' ')[0]}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {unit ? `Unit ${unit.unitNumber}` : '-'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.difficulty === 'Beginner'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : t.difficulty === 'Intermediate'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        }`}>
                          {t.difficulty}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {t.estHours}h
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEditTopic(t)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600"
                            title="Edit topic"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTopic(t.id, t.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                            title="Delete topic"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RELATIONSHIPS TABLE */}
      {activeTab === 'relationships' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Source Concept (Prerequisite)</th>
                  <th className="p-4">Relationship Type</th>
                  <th className="p-4">Target Concept (Dependent)</th>
                  <th className="p-4">Cognitive Weight</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {relationships.map(rel => {
                  const src = topics.find(t => t.id === rel.sourceTopicId);
                  const tgt = topics.find(t => t.id === rel.targetTopicId);
                  return (
                    <tr key={rel.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {src?.name || rel.sourceTopicId}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rel.relationshipType === 'PREREQUISITE_OF'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}>
                          {rel.relationshipType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {tgt?.name || rel.targetTopicId}
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-600 dark:text-slate-300">
                        {rel.weight}
                      </td>
                      <td className="p-4 text-slate-500 text-[11px]">
                        {rel.description || '-'}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteRelationship(rel.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBJECTS & UNITS GRID */}
      {activeTab === 'subjects' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjects.map(subj => {
              const subjUnits = units.filter(u => u.subjectId === subj.id);
              const subjTopics = topics.filter(t => t.subjectId === subj.id);
              return (
                <div
                  key={subj.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: subj.color }}
                    >
                      {subj.code}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {subjTopics.length} topics
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {subj.name}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {subj.description}
                  </p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Curriculum Units ({subjUnits.length})
                    </span>
                    {subjUnits.map(u => (
                      <div key={u.id} className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                        <span>Unit {u.unitNumber}: {u.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TOPIC MODAL */}
      {topicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {editingTopicId ? 'Edit Academic Topic' : 'Add New Academic Topic'}
              </h3>
              <button onClick={() => setTopicModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTopic} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Topic Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Red-Black Trees"
                    value={topicName}
                    onChange={e => setTopicName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Topic Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DSA-T05"
                    value={topicCode}
                    onChange={e => setTopicCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Subject *
                  </label>
                  <select
                    value={topicSubjId}
                    onChange={e => setTopicSubjId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Unit *
                  </label>
                  <select
                    value={topicUnitId}
                    onChange={e => setTopicUnitId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    {units.filter(u => u.subjectId === topicSubjId).map(u => (
                      <option key={u.id} value={u.id}>Unit {u.unitNumber}: {u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={topicDifficulty}
                    onChange={e => setTopicDifficulty(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Est. Study Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={topicHours}
                    onChange={e => setTopicHours(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Key concepts, algorithms, and applications..."
                  value={topicDesc}
                  onChange={e => setTopicDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTopicModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  {editingTopicId ? 'Update Topic' : 'Create Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RELATIONSHIP MODAL */}
      {relModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Create Directed Knowledge Graph Edge
              </h3>
              <button onClick={() => setRelModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRelationship} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Source Concept (Prerequisite) *
                  </label>
                  <select
                    value={relSourceId}
                    onChange={e => setRelSourceId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    {topics.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Target Concept (Dependent) *
                  </label>
                  <select
                    value={relTargetId}
                    onChange={e => setRelTargetId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    {topics.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Relationship Type *
                  </label>
                  <select
                    value={relType}
                    onChange={e => setRelType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="PREREQUISITE_OF">Prerequisite Of</option>
                    <option value="RELATED_TO">Related To</option>
                    <option value="DEPENDS_ON">Depends On</option>
                    <option value="PART_OF">Part Of</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Cognitive Distance Weight (1 - 10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={relWeight}
                    onChange={e => setRelWeight(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Pedagogical Justification
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why source concept is prerequisite for target..."
                  value={relDesc}
                  onChange={e => setRelDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRelModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  Create Edge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBJECT MODAL */}
      {subjModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Add Academic Subject
              </h3>
              <button onClick={() => setSubjModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence"
                  value={newSubjName}
                  onChange={e => setNewSubjName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS-301"
                    value={newSubjCode}
                    onChange={e => setNewSubjCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Color Accent
                  </label>
                  <input
                    type="color"
                    value={newSubjColor}
                    onChange={e => setNewSubjColor(e.target.value)}
                    className="w-full h-10 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newSubjDesc}
                  onChange={e => setNewSubjDesc(e.target.value)}
                  placeholder="Scope of subject curriculum..."
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubjModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UNIT MODAL */}
      {unitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Add Academic Unit
              </h3>
              <button onClick={() => setUnitModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUnit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Parent Subject *
                </label>
                <select
                  value={newUnitSubjId}
                  onChange={e => setNewUnitSubjId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Unit #
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newUnitNum}
                    onChange={e => setNewUnitNum(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Unit Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Heaps & Priority Queues"
                    value={newUnitName}
                    onChange={e => setNewUnitName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Unit Syllabus Description
                </label>
                <textarea
                  rows={2}
                  value={newUnitDesc}
                  onChange={e => setNewUnitDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUnitModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
