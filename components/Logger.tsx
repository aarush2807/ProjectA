
import React, { useState, useRef, useEffect } from 'react';
import { FoodItem } from '../types';
import { Button, Select, Input } from './UIComponents';
import { Camera, Type, Check, Search, X, Wand2, Sparkles, Dumbbell, Calculator } from 'lucide-react';
import { parseFoodFromText, analyzeFoodFromImage, getFoodSuggestions } from '../services/geminiService';
import { saveLogItem } from '../services/storageService';

interface LoggerProps {
  onComplete: () => void;
  onCancel: () => void;
  userWeight?: number; // lbs
}

// Common activities and their MET values
const ACTIVITIES = [
    { name: 'Walking (Moderate)', met: 3.5 },
    { name: 'Walking (Brisk)', met: 5.0 },
    { name: 'Running (5 mph)', met: 8.3 },
    { name: 'Running (6 mph)', met: 9.8 },
    { name: 'Cycling (Moderate)', met: 7.5 },
    { name: 'Swimming', met: 6.0 },
    { name: 'Weight Lifting', met: 3.5 },
    { name: 'HIIT Workout', met: 8.0 },
    { name: 'Yoga', met: 2.5 }
];

export const Logger: React.FC<LoggerProps> = ({ onComplete, onCancel, userWeight = 150 }) => {
  const [mode, setMode] = useState<'text' | 'image' | 'exercise'>('text');
  const [exerciseMode, setExerciseMode] = useState<'ai' | 'calc'>('calc');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [identifiedItems, setIdentifiedItems] = useState<Omit<FoodItem, 'id' | 'timestamp' | 'source'>[]>([]);
  
  // Calculator State
  const [calcActivity, setCalcActivity] = useState(ACTIVITIES[2].name);
  const [calcDuration, setCalcDuration] = useState('30');

  useEffect(() => {
    const timer = setTimeout(async () => {
        if (input.length > 2 && (mode === 'text' || (mode === 'exercise' && exerciseMode === 'ai'))) {
            const results = await getFoodSuggestions(input);
            setSuggestions(results);
        } else {
            setSuggestions([]);
        }
    }, 600); 
    return () => clearTimeout(timer);
  }, [input, mode, exerciseMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result as string);
        reader.readAsDataURL(file);
    }
  };

  const calculateExercise = () => {
      const activity = ACTIVITIES.find(a => a.name === calcActivity);
      if (activity) {
          const durationHrs = parseInt(calcDuration) / 60;
          const weightKg = userWeight / 2.20462;
          const burned = Math.round(activity.met * weightKg * durationHrs);
          
          setIdentifiedItems([{
              name: calcActivity,
              portion: `${calcDuration} mins`,
              calories: burned,
              type: 'exercise',
              macros: { protein: 0, carbs: 0, fat: 0 }
          }]);
      }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setIdentifiedItems([]);
    try {
        let items: any[] = [];
        if (mode === 'image' && previewImage) {
            items = await analyzeFoodFromImage(previewImage);
        } else {
            items = await parseFoodFromText(input);
        }
        setIdentifiedItems(items);
    } catch (error) {
        alert("Analysis failed. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleSave = () => {
    const timestamp = Date.now();
    identifiedItems.forEach(item => {
        const fullItem: FoodItem = {
            ...item,
            id: Math.random().toString(36).substring(2, 9),
            timestamp,
            source: mode === 'image' ? 'ai-image' : (mode === 'exercise' && exerciseMode === 'calc') ? 'calculator' : 'ai-text',
            image: mode === 'image' && previewImage ? previewImage : undefined,
            type: item.type || (mode === 'exercise' ? 'exercise' : 'food')
        };
        saveLogItem(fullItem);
    });
    onComplete();
  };

  const updateItem = (index: number, field: keyof FoodItem | 'protein' | 'carbs' | 'fat', value: string | number) => {
    const newItems = [...identifiedItems];
    const item = newItems[index];
    if (field === 'protein' || field === 'carbs' || field === 'fat') {
        item.macros = { ...item.macros, [field]: Number(value) };
    } else if (field === 'calories') {
        item.calories = Number(value);
    } else if (field === 'name' || field === 'portion') {
        (item as any)[field] = value;
    }
    setIdentifiedItems(newItems);
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 shadow-sm z-20">
        <button onClick={onCancel} className="text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md">
            <X size={24} />
        </button>
        <h2 className="font-bold text-lg text-gray-800 dark:text-white">Log Activity</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
        <div className="flex bg-white dark:bg-gray-800 p-1 rounded-md shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
            {(['text', 'image', 'exercise'] as const).map((m) => (
                <button 
                    key={m}
                    onClick={() => { setMode(m); setIdentifiedItems([]); }}
                    className={`flex-1 py-2.5 rounded text-sm font-semibold transition-all flex items-center justify-center gap-2 capitalize ${mode === m ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    {m === 'text' && <Type size={16} />}
                    {m === 'image' && <Camera size={16} />}
                    {m === 'exercise' && <Dumbbell size={16} />}
                    {m}
                </button>
            ))}
        </div>

        {identifiedItems.length === 0 ? (
            <div className="space-y-6">
                {mode === 'exercise' && (
                     <div className="flex justify-center gap-4 mb-4">
                         <button 
                            onClick={() => setExerciseMode('calc')}
                            className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${exerciseMode === 'calc' ? 'bg-primary-100 text-primary-700 border-primary-200 dark:bg-primary-900 dark:text-primary-300 dark:border-primary-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500'}`}
                         >
                             Quick Calculate
                         </button>
                         <button 
                            onClick={() => setExerciseMode('ai')}
                            className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${exerciseMode === 'ai' ? 'bg-primary-100 text-primary-700 border-primary-200 dark:bg-primary-900 dark:text-primary-300 dark:border-primary-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500'}`}
                         >
                             Ask AI
                         </button>
                     </div>
                )}

                {mode === 'exercise' && exerciseMode === 'calc' ? (
                    <div className="space-y-6 animate-in fade-in">
                         <div className="bg-primary-50 dark:bg-gray-800 p-4 rounded-xl border border-primary-100 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex items-center gap-2">
                                <Calculator size={16} />
                                Calculating for weight: <strong>{userWeight} lbs</strong>
                            </p>
                            
                            <Select label="Activity" value={calcActivity} onChange={(e) => setCalcActivity(e.target.value)}>
                                {ACTIVITIES.map(a => (
                                    <option key={a.name} value={a.name}>{a.name}</option>
                                ))}
                            </Select>

                            <Input 
                                label="Duration (minutes)" 
                                type="number" 
                                value={calcDuration}
                                onChange={(e) => setCalcDuration(e.target.value)}
                            />

                            <Button onClick={calculateExercise} className="w-full mt-2">
                                Calculate Burn
                            </Button>
                         </div>
                    </div>
                ) : mode !== 'image' ? (
                    <div className="relative animate-in fade-in">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {mode === 'text' ? 'What did you eat?' : 'Describe your workout'}
                        </label>
                        <div className="relative">
                            <input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={mode === 'text' ? "e.g. 2 slices of Pizza" : "e.g. 30 mins HIIT cardio"}
                                className="w-full pl-11 pr-10 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-primary-500 outline-none text-lg text-gray-900 dark:text-white shadow-sm"
                                autoFocus
                            />
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                        
                        {suggestions.length > 0 && (
                            <div className="mt-2 bg-white dark:bg-gray-800 rounded-md shadow-chakra-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                                {suggestions.map((s, i) => (
                                    <div 
                                        key={i}
                                        onClick={() => { setInput(s); setSuggestions([]); }}
                                        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200 border-b border-gray-50 dark:border-gray-700 last:border-0 flex items-center gap-2"
                                    >
                                        <span className="flex-1">{s}</span>
                                        <Wand2 size={14} className="text-gray-300" />
                                    </div>
                                ))}
                            </div>
                        )}
                         <Button 
                            onClick={handleAnalyze} 
                            disabled={isLoading || !input}
                            className="w-full py-4 text-lg shadow-md mt-8"
                            isLoading={isLoading}
                        >
                            {isLoading ? 'Analyzing...' : `Log ${mode === 'exercise' ? 'Exercise' : 'Food'}`}
                        </Button>
                    </div>
                ) : (
                    <div className="text-center animate-in fade-in">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md h-64 flex flex-col items-center justify-center bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative"
                        >
                            {previewImage ? (
                                <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-primary-50 dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm mb-4">
                                        <Camera className="text-primary-500" size={32} />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">Tap to take photo</p>
                                </>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </div>
                         <Button 
                            onClick={handleAnalyze} 
                            disabled={isLoading || !previewImage}
                            className="w-full py-4 text-lg shadow-md mt-8"
                            isLoading={isLoading}
                        >
                            {isLoading ? 'Analyzing...' : 'Log Food'}
                        </Button>
                    </div>
                )}
            </div>
        ) : (
            <div className="space-y-6 pb-10">
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-green-100 p-1 rounded-full">
                        <Check size={14} className="text-green-600" />
                    </div>
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">Review & Save</span>
                </div>
                
                <div className="space-y-4">
                    {identifiedItems.map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 border border-primary-100 dark:border-gray-700 rounded-md p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                                <div className="flex-1 mr-4">
                                    <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Name</label>
                                    <input 
                                        value={item.name}
                                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                                        className="font-bold text-lg text-gray-900 dark:text-white bg-transparent border-b border-transparent focus:border-primary-500 outline-none w-full"
                                    />
                                </div>
                                <div className="w-24 text-right">
                                    <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Calories</label>
                                    <input 
                                        type="number"
                                        value={item.calories}
                                        onChange={(e) => updateItem(idx, 'calories', e.target.value)}
                                        className="font-bold text-lg text-primary-600 dark:text-primary-400 bg-transparent border-b border-transparent focus:border-primary-500 outline-none w-full text-right"
                                    />
                                </div>
                            </div>

                            {item.type === 'food' && (
                                <div className="grid grid-cols-3 gap-2 text-center mt-2">
                                    {['protein', 'carbs', 'fat'].map((m) => (
                                        <div key={m} className="bg-gray-50 dark:bg-gray-700 rounded-md p-2">
                                            <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">{m}</span>
                                            <input 
                                                type="number"
                                                value={(item.macros as any)[m]}
                                                onChange={(e) => updateItem(idx, m as any, e.target.value)}
                                                className="font-semibold text-gray-800 dark:text-gray-200 bg-transparent text-center w-full outline-none"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="pt-4 space-y-3">
                    <Button onClick={handleSave} className="w-full py-4 text-lg shadow-md">
                        Save to Log
                    </Button>
                    <Button variant="ghost" onClick={() => setIdentifiedItems([])} className="w-full">
                        Cancel & Try Again
                    </Button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
