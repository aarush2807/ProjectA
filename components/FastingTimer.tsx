
import React, { useState, useEffect } from 'react';
import { CircularProgress, Button, Card } from './UIComponents';
import { UserProfile } from '../types';
import { getProfile, saveProfile } from '../services/storageService';
import { Play, Square, Edit3, Zap, Droplet, Flame, ArrowRight } from 'lucide-react';

export const FastingTimer: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [editTimeVal, setEditTimeVal] = useState('');
  
  useEffect(() => {
    const p = getProfile();
    if (p) {
        if (!p.fasting) {
            p.fasting = { isFasting: false, startTime: null, endTime: null, goalHours: 16 };
            saveProfile(p);
        }
        setProfile(p);
    }
  }, []);

  useEffect(() => {
    if (!profile?.fasting?.isFasting || !profile.fasting.startTime) return;

    const interval = setInterval(() => {
        const now = Date.now();
        setElapsed(now - profile.fasting.startTime!);
    }, 1000);

    return () => clearInterval(interval);
  }, [profile]);

  const handleStartFast = () => {
      if (!profile) return;
      const newProfile = { ...profile };
      const now = Date.now();
      newProfile.fasting.isFasting = true;
      newProfile.fasting.startTime = now;
      newProfile.fasting.endTime = now + (newProfile.fasting.goalHours * 60 * 60 * 1000);
      setElapsed(0);
      saveProfile(newProfile);
      setProfile(newProfile);
  };

  const handleEndFast = () => {
      if (!profile) return;
      const newProfile = { ...profile };
      newProfile.fasting.isFasting = false;
      newProfile.fasting.endTime = Date.now(); // Mark end
      saveProfile(newProfile);
      setProfile(newProfile);
  };

  const saveStartTime = () => {
      if(!profile || !editTimeVal) return;
      const [hours, mins] = editTimeVal.split(':').map(Number);
      const d = new Date();
      d.setHours(hours, mins, 0, 0);
      
      // If time is in future, assume yesterday
      if (d.getTime() > Date.now()) {
          d.setDate(d.getDate() - 1);
      }

      const newProfile = { ...profile };
      newProfile.fasting.startTime = d.getTime();
      newProfile.fasting.endTime = d.getTime() + (newProfile.fasting.goalHours * 60 * 60 * 1000);
      saveProfile(newProfile);
      setProfile(newProfile);
      setShowEdit(false);
  };

  const formatTime = (ms: number) => {
      const seconds = Math.floor((ms / 1000) % 60);
      const minutes = Math.floor((ms / (1000 * 60)) % 60);
      const hours = Math.floor(ms / (1000 * 60 * 60));
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getFastingStage = (hours: number) => {
      if (hours < 4) return { label: 'Blood Sugar Rising', icon: <Zap size={18} />, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' };
      if (hours < 8) return { label: 'Blood Sugar Falling', icon: <ArrowRight size={18} className="rotate-45" />, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' };
      if (hours < 12) return { label: 'Normalization', icon: <Droplet size={18} />, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' };
      return { label: 'Ketosis (Fat Burning)', icon: <Flame size={18} />, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' };
  };

  if (!profile) return null;

  const goalMs = profile.fasting.goalHours * 60 * 60 * 1000;
  const percentage = Math.min(100, (elapsed / goalMs) * 100);
  const isFasting = profile.fasting.isFasting;
  const elapsedHours = elapsed / (1000 * 60 * 60);
  const stage = getFastingStage(elapsedHours);

  const startTimeStr = profile.fasting.startTime ? new Date(profile.fasting.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--';
  const endTimeStr = profile.fasting.endTime ? new Date(profile.fasting.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--';

  return (
    <div className="h-full flex flex-col items-center space-y-6 animate-fade-in relative pt-4">
        
        {/* Top Info */}
        <div className="flex justify-between w-full px-6 text-sm font-semibold text-gray-500 dark:text-gray-400">
            <div className="flex flex-col items-center">
                <span className="text-xs uppercase tracking-wide mb-1">Start</span>
                <span className="text-gray-800 dark:text-white text-lg">{isFasting ? startTimeStr : '--:--'}</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-xs uppercase tracking-wide mb-1">Goal</span>
                <span className="text-gray-800 dark:text-white text-lg">{isFasting ? endTimeStr : `${profile.fasting.goalHours}h`}</span>
            </div>
        </div>

        <div className="relative py-6">
             {isFasting && (
                 <div className="absolute inset-0 bg-primary-500 blur-3xl opacity-10 rounded-full animate-pulse transform scale-75"></div>
             )}
             
             <CircularProgress 
                size={260} 
                strokeWidth={24} 
                percentage={isFasting ? percentage : 0}
                color="text-primary-500"
            >
                <div className="flex flex-col items-center text-center z-10">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                        {isFasting ? 'Elapsed Time' : 'Target'}
                    </span>
                    <span className="text-5xl font-black tracking-tighter text-gray-800 dark:text-white tabular-nums">
                        {isFasting ? formatTime(elapsed) : `${profile.fasting.goalHours}h`}
                    </span>
                    
                    <div className="mt-3 flex items-center gap-2">
                        {isFasting && (
                            <button 
                                onClick={() => setShowEdit(true)}
                                className="flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-gray-800 px-3 py-1 rounded-full hover:bg-primary-100 transition-colors"
                            >
                                <Edit3 size={10} /> Adjust Start
                            </button>
                        )}
                    </div>
                </div>
            </CircularProgress>
        </div>

        {/* Fasting Stage Card */}
        {isFasting ? (
            <Card className="w-full py-4 px-5 border-none shadow-sm bg-white dark:bg-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stage.bg} ${stage.color}`}>
                        {stage.icon}
                    </div>
                    <div className="text-left">
                        <span className="block text-xs font-bold text-gray-400 uppercase">Current Stage</span>
                        <span className="block font-bold text-gray-800 dark:text-white">{stage.label}</span>
                    </div>
                </div>
                <div className="h-8 w-[1px] bg-gray-100 dark:bg-gray-700 mx-2"></div>
                 <div className="text-center">
                    <span className="block text-xs font-bold text-gray-400 uppercase">Left</span>
                    <span className="block font-bold text-gray-800 dark:text-white text-sm">
                        {Math.max(0, (goalMs - elapsed) / (1000 * 60 * 60)).toFixed(1)}h
                    </span>
                </div>
            </Card>
        ) : (
            <div className="w-full py-4">
                 <div className="grid grid-cols-4 gap-2">
                    {[14, 16, 18, 20].map(h => (
                        <button
                            key={h}
                            onClick={() => {
                                const newP = {...profile};
                                newP.fasting.goalHours = h;
                                saveProfile(newP);
                                setProfile(newP);
                            }}
                            className={`py-3 rounded-xl text-sm font-bold border transition-all flex flex-col items-center justify-center ${
                                profile.fasting.goalHours === h 
                                ? 'bg-primary-600 text-white border-primary-600 shadow-lg transform scale-105' 
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            <span>{h}h</span>
                            <span className="text-[10px] opacity-70">Fast</span>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Control Button */}
        <div className="w-full pt-2">
             {isFasting ? (
                <Button 
                    onClick={handleEndFast} 
                    variant="danger" 
                    size="lg" 
                    className="w-full py-5 rounded-2xl text-lg font-bold shadow-xl hover:scale-[1.02] transition-transform"
                >
                    <span className="flex items-center"><Square fill="currentColor" size={20} className="mr-2"/> Stop Fasting</span>
                </Button>
            ) : (
                <Button 
                    onClick={handleStartFast} 
                    variant="primary" 
                    size="lg" 
                    className="w-full py-5 rounded-2xl text-lg font-bold shadow-xl shadow-primary-500/30 hover:scale-[1.02] transition-transform"
                >
                    <span className="flex items-center"><Play fill="currentColor" size={20} className="mr-2"/> Start Fasting</span>
                </Button>
            )}
        </div>

        {/* Edit Time Modal */}
        {showEdit && (
             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl w-72 border border-gray-200 dark:border-gray-700 scale-100 transform transition-all">
                     <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1 text-center">Adjust Start Time</h3>
                     <p className="text-xs text-gray-500 text-center mb-6">Did you start earlier?</p>
                     
                     <div className="relative mb-6">
                        <input 
                            type="time" 
                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 text-center text-2xl font-bold text-gray-800 dark:text-white focus:border-primary-500 outline-none"
                            onChange={(e) => setEditTimeVal(e.target.value)}
                        />
                     </div>
                     
                     <div className="flex gap-3">
                         <Button variant="secondary" onClick={() => setShowEdit(false)} className="flex-1 rounded-xl">Cancel</Button>
                         <Button onClick={saveStartTime} className="flex-1 rounded-xl">Save</Button>
                     </div>
                 </div>
             </div>
        )}
    </div>
  );
};
