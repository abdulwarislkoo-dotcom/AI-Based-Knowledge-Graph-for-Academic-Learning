import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/common/Navbar.tsx';
import { ToastContainer } from './components/common/ToastContainer.tsx';
import { LandingPage } from './components/landing/LandingPage.tsx';
import { StudentDashboard } from './components/dashboard/StudentDashboard.tsx';
import { KnowledgeGraphExplorer } from './components/graph/KnowledgeGraphExplorer.tsx';
import { DsaAlgorithmLab } from './components/algorithms/DsaAlgorithmLab.tsx';
import { LearningPathView } from './components/paths/LearningPathView.tsx';
import { ResourceLibrary } from './components/resources/ResourceLibrary.tsx';
import { CurriculumManagement } from './components/management/CurriculumManagement.tsx';

const AppContent: React.FC = () => {
  const { currentView } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-indigo-500/20 selection:text-indigo-600">
      <Navbar />

      <main className="flex-1">
        {currentView === 'landing' && <LandingPage />}
        {currentView === 'dashboard' && <StudentDashboard />}
        {currentView === 'graph' && <KnowledgeGraphExplorer />}
        {currentView === 'dsa-lab' && <DsaAlgorithmLab />}
        {currentView === 'learning-paths' && <LearningPathView />}
        {currentView === 'resources' && <ResourceLibrary />}
        {currentView === 'management' && <CurriculumManagement />}
      </main>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
