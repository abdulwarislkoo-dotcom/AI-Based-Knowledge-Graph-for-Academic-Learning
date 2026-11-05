import React, { useState } from 'react';
import { 
  Network, 
  LayoutDashboard, 
  Compass, 
  Cpu, 
  GitFork, 
  BookOpen, 
  Settings, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  RotateCcw,
  User,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { useApp, AppView } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';

export const Navbar: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    isDarkMode, 
    toggleDarkMode, 
    userRole, 
    setUserRole,
    addToast,
    triggerRefresh
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const navItems: { id: AppView; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'landing', label: 'Home', icon: <Compass className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'graph', label: 'Graph Explorer', icon: <Network className="w-4 h-4" />, badge: 'Core' },
    { id: 'dsa-lab', label: 'DSA Lab', icon: <Cpu className="w-4 h-4" />, badge: '9 Algos' },
    { id: 'learning-paths', label: 'Learning Paths', icon: <GitFork className="w-4 h-4" /> },
    { id: 'resources', label: 'Resources', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'management', label: 'Curriculum Admin', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleResetData = async () => {
    if (!window.confirm('Reset academic curriculum to initial accredited seed data?')) return;
    try {
      setResetting(true);
      await api.resetSeed();
      addToast({
        type: 'success',
        title: 'Curriculum Reset',
        message: 'Knowledge graph restored to default academic curriculum.',
      });
      triggerRefresh();
    } catch {
      addToast({
        type: 'error',
        title: 'Reset Failed',
        message: 'Could not restore seed data.',
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button 
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-3 text-left focus:outline-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              <span>Graph</span><span className="text-indigo-600 dark:text-indigo-400">Academia</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                AI Knowledge
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
              Academic Knowledge Graph & DSA Lab
            </p>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map(item => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 shadow-xs border border-indigo-200/70 dark:border-indigo-800'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive 
                      ? 'bg-indigo-200/60 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200' 
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-2">
          {/* Quick Curriculum Reset Button */}
          <button
            onClick={handleResetData}
            disabled={resetting}
            title="Reset curriculum seed data"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Reset Seed</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Role Switcher Pill */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium">
            <button
              onClick={() => setUserRole('student')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                userRole === 'student'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
            <button
              onClick={() => setUserRole('faculty')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                userRole === 'faculty'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Faculty</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-1">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500">Academic Role</span>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setUserRole('student')}
                className={`px-3 py-1 rounded-md font-medium ${
                  userRole === 'student' ? 'bg-white dark:bg-slate-900 text-indigo-600 font-bold' : 'text-slate-500'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => setUserRole('faculty')}
                className={`px-3 py-1 rounded-md font-medium ${
                  userRole === 'faculty' ? 'bg-white dark:bg-slate-900 text-purple-600 font-bold' : 'text-slate-500'
                }`}
              >
                Faculty
              </button>
            </div>
          </div>

          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentView === item.id
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="pt-2">
            <button
              onClick={() => {
                handleResetData();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-lg"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Curriculum Data to Defaults</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
