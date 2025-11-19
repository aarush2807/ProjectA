
import React, { useState, useEffect } from 'react';
import { AppView, DailyLog, UserProfile } from './types';
import { Dashboard } from './components/Dashboard';
import { Logger } from './components/Logger';
import { ChatInterface } from './components/ChatInterface';
import { Onboarding } from './components/Onboarding';
import { Community } from './components/Community';
import { Profile } from './components/Profile';
import { FastingTimer } from './components/FastingTimer';
import { LayoutGrid, MessageCircle, Users, PlusCircle, User as UserIcon, Timer } from 'lucide-react';
import { getLogForDate, getProfile, saveProfile } from './services/storageService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [showLogger, setShowLogger] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentLog, setCurrentLog] = useState<DailyLog>({ date: '', items: [] });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isDark, setIsDark] = useState(true); // Default to dark
  
  const refreshData = () => {
    setCurrentLog(getLogForDate(selectedDate));
    const p = getProfile();
    setProfile(p);
    if (p) {
        setIsOnboarding(false);
        setIsDark(p.theme === 'dark');
    }
  };

  useEffect(() => {
      setCurrentLog(getLogForDate(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    refreshData();
  }, []);

  // Handle Theme Class
  useEffect(() => {
      if (isDark) {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
  }, [isDark]);

  const toggleTheme = () => {
      const newTheme = !isDark;
      setIsDark(newTheme);
      if (profile) {
          const updated = { ...profile, theme: newTheme ? 'dark' : 'light' } as UserProfile;
          saveProfile(updated);
          setProfile(updated);
      }
  };

  const handleOnboardingComplete = () => {
      refreshData();
      setIsOnboarding(false);
  };

  const renderView = () => {
    if (!profile) return null; 

    switch (currentView) {
      case AppView.DASHBOARD:
        return (
            <Dashboard 
                dailyLog={currentLog} 
                userGoals={profile.goals} 
                selectedDate={selectedDate}
                onAddFood={() => setShowLogger(true)}
                onRefresh={refreshData}
                onDateChange={setSelectedDate}
            />
        );
      case AppView.FASTING:
        return <FastingTimer />;
      case AppView.AI_CHAT:
        return <ChatInterface />;
      case AppView.COMMUNITY:
        return <Community />;
      case AppView.PROFILE:
        return <Profile onThemeToggle={toggleTheme} isDark={isDark} />;
      default:
        return null;
    }
  };

  if (isOnboarding) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans overflow-hidden transition-colors duration-300">
      
      {/* Header - Minimalist */}
      <div className="flex-none bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 z-10 pt-safe-top transition-colors duration-300">
         <div className="max-w-md mx-auto px-4 h-14 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">N</div>
                <span className="font-bold text-lg tracking-tight text-gray-800 dark:text-white">Nutri<span className="text-primary-600 dark:text-primary-400">AI</span></span>
            </div>
            <div 
                onClick={() => setCurrentView(AppView.PROFILE)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden border border-white dark:border-gray-600 shadow-sm cursor-pointer"
            >
                <img src={profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name || 'User'}`} alt="User" />
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-gray-50 dark:bg-gray-900 scroll-smooth">
        <div className="max-w-md mx-auto px-4 py-4 min-h-full">
            {renderView()}
        </div>
      </main>

      {/* Logger Modal Overlay */}
      {showLogger && (
        <Logger 
            onComplete={() => { setShowLogger(false); refreshData(); }} 
            onCancel={() => setShowLogger(false)} 
            userWeight={profile?.currentWeight}
        />
      )}

      {/* Bottom Navigation Bar */}
      <nav className="flex-none bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 pb-safe-bottom pt-1 px-2 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] transition-colors duration-300">
        <div className="max-w-md mx-auto flex justify-around items-center h-16">
            <button 
                onClick={() => { setCurrentView(AppView.DASHBOARD); setSelectedDate(new Date().toISOString().split('T')[0]); }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentView === AppView.DASHBOARD ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
                <LayoutGrid size={22} strokeWidth={currentView === AppView.DASHBOARD ? 2.5 : 2} />
                <span className="text-[10px] font-semibold">Home</span>
            </button>

            <button 
                onClick={() => setCurrentView(AppView.FASTING)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentView === AppView.FASTING ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
                <Timer size={22} strokeWidth={currentView === AppView.FASTING ? 2.5 : 2} />
                <span className="text-[10px] font-semibold">Fast</span>
            </button>
            
            <div className="relative -top-6">
                <button 
                    onClick={() => setShowLogger(true)}
                    className="w-14 h-14 bg-primary-600 hover:bg-primary-500 rounded-full shadow-lg shadow-primary-500/40 text-white flex items-center justify-center transform transition-all active:scale-95 ring-4 ring-white dark:ring-gray-800"
                >
                    <PlusCircle size={28} />
                </button>
            </div>

            <button 
                onClick={() => setCurrentView(AppView.AI_CHAT)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentView === AppView.AI_CHAT ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
                <MessageCircle size={22} strokeWidth={currentView === AppView.AI_CHAT ? 2.5 : 2} />
                <span className="text-[10px] font-semibold">Coach</span>
            </button>

             <button 
                onClick={() => setCurrentView(AppView.PROFILE)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentView === AppView.PROFILE ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
                <UserIcon size={22} strokeWidth={currentView === AppView.PROFILE ? 2.5 : 2} />
                <span className="text-[10px] font-semibold">Me</span>
            </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
