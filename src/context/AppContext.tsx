import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Topic, Subtopic, Subject } from '../types/index.ts';

export type AppView = 
  | 'landing' 
  | 'dashboard' 
  | 'graph' 
  | 'dsa-lab' 
  | 'learning-paths' 
  | 'resources' 
  | 'management';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

export interface AppContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  userRole: 'student' | 'faculty';
  setUserRole: (role: 'student' | 'faculty') => void;
  selectedTopicId: string | null;
  setSelectedTopicId: (id: string | null) => void;
  selectedAlgorithm: string;
  setSelectedAlgorithm: (algo: string) => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  triggerConfetti: () => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [userRole, setUserRole] = useState<'student' | 'faculty'>('student');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('bfs');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'],
      });
    } catch {
      // safe fallback
    }
  };

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        isDarkMode,
        toggleDarkMode,
        userRole,
        setUserRole,
        selectedTopicId,
        setSelectedTopicId,
        selectedAlgorithm,
        setSelectedAlgorithm,
        toasts,
        addToast,
        removeToast,
        triggerConfetti,
        refreshKey,
        triggerRefresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
