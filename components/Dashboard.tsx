
import React, { useMemo, useRef, useEffect } from 'react';
import { DailyLog, UserGoals } from '../types';
import { Card, Button, CircularProgress } from './UIComponents';
import { Plus, Trash2, Utensils, Flame, Dumbbell } from 'lucide-react';
import { deleteLogItem } from '../services/storageService';

interface DashboardProps {
  dailyLog: DailyLog;
  userGoals: UserGoals;
  selectedDate: string;
  onAddFood: () => void;
  onRefresh: () => void;
  onDateChange: (date: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ dailyLog, userGoals, selectedDate, onAddFood, onRefresh, onDateChange }) => {
  
  const totals = useMemo(() => {
    return dailyLog.items.reduce((acc, item) => {
        if (item.type === 'exercise') {
            return { ...acc, exercise: acc.exercise + item.calories };
        }
        return {
            ...acc,
            calories: acc.calories + item.calories,
            protein: acc.protein + item.macros.protein,
            carbs: acc.carbs + item.macros.carbs,
            fat: acc.fat + item.macros.fat,
        };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, exercise: 0 });
  }, [dailyLog]);

  const handleDelete = (id: string) => {
    if (confirm('Delete this entry?')) {
        deleteLogItem(id, dailyLog.date);
        onRefresh();
    }
  };

  // Updated Math: Goal - Food + Exercise
  const caloriesRemaining = (userGoals.calories + totals.exercise) - totals.calories;
  const isOver = caloriesRemaining < 0;
  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  
  // Base percentage strictly on food vs goal (ignoring exercise bonus for visual limit)
  const caloriePct = Math.min(100, (totals.calories / userGoals.calories) * 100);
  
  const dateWheelRef = useRef<HTMLDivElement>(null);
  const dates = useMemo(() => {
      const arr = [];
      for (let i = -14; i <= 2; i++) {
          const d = new Date();
          d.setDate(d.getDate() + i);
          arr.push({
              dateObj: d,
              iso: d.toISOString().split('T')[0],
              day: d.getDate(),
              weekday: d.toLocaleDateString('en-US', { weekday: 'short' })
          });
      }
      return arr;
  }, []);

  useEffect(() => {
      if (dateWheelRef.current) {
          const selectedEl = dateWheelRef.current.querySelector(`[data-date="${selectedDate}"]`);
          if (selectedEl) {
              selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
      }
  }, [selectedDate]);

  const MacroRing = ({ label, left, pct, color }: { label: string, left: number, pct: number, color: string }) => (
    <div className="flex flex-col items-center">
        <CircularProgress size={60} strokeWidth={6} percentage={pct} color={color}>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{Math.round(Math.max(0, left))}g</span>
        </CircularProgress>
        <span className="text-[10px] font-bold text-gray-400 uppercase mt-2 tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 flex flex-col h-full">
      <header className="pt-2 -mx-4">
         <div 
            ref={dateWheelRef}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar px-[50vw] pb-2"
         >
             {dates.map((d) => {
                 const isSelected = d.iso === selectedDate;
                 return (
                     <div 
                        key={d.iso} 
                        data-date={d.iso}
                        onClick={() => onDateChange(d.iso)}
                        className={`snap-center flex-shrink-0 w-14 mx-1 flex flex-col items-center justify-center py-2 rounded-xl transition-all cursor-pointer ${
                            isSelected 
                            ? 'bg-primary-500 text-white shadow-lg scale-105' 
                            : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700'
                        }`}
                     >
                         <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{d.weekday}</span>
                         <span className="text-lg font-bold">{d.day}</span>
                     </div>
                 )
             })}
         </div>
      </header>

      <div className="flex flex-col items-center justify-center py-4">
          <div className="relative mb-8">
            <CircularProgress 
                size={220} 
                strokeWidth={18} 
                percentage={caloriePct} 
                color={isOver ? "text-red-500" : "text-primary-500"}
            >
                <div className="flex flex-col items-center text-center">
                    <Flame size={24} className={`${isOver ? 'text-red-500' : 'text-primary-500'} mb-1`} />
                    <span className={`text-5xl font-black tracking-tighter ${isOver ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>
                        {Math.abs(Math.round(caloriesRemaining))}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                        {isOver ? 'Over Limit' : 'Remaining'}
                    </span>
                    {totals.exercise > 0 && (
                        <div className="mt-2 text-xs font-semibold text-green-500 flex items-center gap-1 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                            <Dumbbell size={10} /> +{Math.round(totals.exercise)} burned
                        </div>
                    )}
                </div>
            </CircularProgress>
          </div>

          <div className="flex w-full justify-between px-8">
                <MacroRing label="Protein" left={userGoals.protein - totals.protein} pct={(totals.protein / userGoals.protein) * 100} color="text-blue-400" />
                <MacroRing label="Carbs" left={userGoals.carbs - totals.carbs} pct={(totals.carbs / userGoals.carbs) * 100} color="text-green-400" />
                <MacroRing label="Fat" left={userGoals.fat - totals.fat} pct={(totals.fat / userGoals.fat) * 100} color="text-amber-400" />
          </div>
      </div>

      <section className="flex-1 animate-in slide-in-from-bottom duration-500 delay-100">
        <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Today's Logs</h2>
            {isToday && (
                <Button onClick={onAddFood} size="sm" variant="ghost" className="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-gray-800">
                    <Plus size={16} className="mr-1" /> Add
                </Button>
            )}
        </div>
        
        <div className="space-y-3">
            {dailyLog.items.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-full inline-block mb-4">
                        <Utensils className="text-gray-400 dark:text-gray-500" size={24} />
                    </div>
                    <p className="text-gray-400 dark:text-gray-500 font-medium">No meals logged today.</p>
                </div>
            ) : (
                dailyLog.items.map((item) => (
                    <div key={item.id} className="group bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center space-x-4">
                            {item.type === 'exercise' ? (
                                <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                                    <Dumbbell size={20} />
                                </div>
                            ) : item.image ? (
                                <img src={item.image.startsWith('data') ? item.image : `data:image/jpeg;base64,${item.image}`} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100 dark:bg-gray-700" />
                            ) : (
                                <div className="w-12 h-12 rounded-lg bg-primary-50 dark:bg-gray-700 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0">
                                    <span className="font-bold text-lg">{item.name.charAt(0).toUpperCase()}</span>
                                </div>
                            )}
                            <div className="min-w-0">
                                <h3 className="font-bold text-gray-800 dark:text-gray-100 capitalize text-base truncate">{item.name}</h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    {item.portion && (
                                        <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">{item.portion}</span>
                                    )}
                                    <span className={item.type === 'exercise' ? 'text-green-500' : ''}>
                                        {item.type === 'exercise' ? '-' : ''}{Math.round(item.calories)} kcal
                                    </span>
                                </div>
                            </div>
                        </div>
                        {isToday && (
                            <button onClick={() => handleDelete(item.id)} className="text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2">
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                ))
            )}
        </div>
      </section>
    </div>
  );
};
