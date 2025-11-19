
import React, { useEffect, useState, useRef } from 'react';
import { UserProfile } from '../types';
import { getProfile, saveProfile } from '../services/storageService';
import { Card, Button, Input, Select } from './UIComponents';
import { Settings, TrendingDown, Activity, X, Moon, Sun, Award, ChevronRight, Calendar, User, Upload, TrendingUp } from 'lucide-react';
import { generatePlanFromProfile } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';

export const Profile: React.FC<{ onThemeToggle: () => void, isDark: boolean }> = ({ onThemeToggle, isDark }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<UserProfile>>({});
    const [isUpdating, setIsUpdating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setProfile(getProfile());
    }, []);

    const handleEdit = () => {
        if(profile) {
            setEditFormData(profile);
            setShowSettings(true);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let safeValue = value;

        // Input validation
        if (name === 'currentWeight' || name === 'goalWeight') {
             const numVal = Number(value);
             if (numVal < 0) {
                 alert("You can't be negative weight!");
                 return;
             }
             safeValue = String(numVal);
        }

        setEditFormData(prev => ({ ...prev, [name]: safeValue }));
    };
    
    const handleAvatarSelect = (seed: string) => {
        setEditFormData(prev => ({ ...prev, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}` }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditFormData(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const saveChanges = async () => {
        setIsUpdating(true);
        try {
            const newProfileData: any = { ...profile, ...editFormData };
            newProfileData.currentWeight = Number(newProfileData.currentWeight);
            newProfileData.goalWeight = Number(newProfileData.goalWeight);
            newProfileData.weightLossRate = Number(newProfileData.weightLossRate);
            
            // Regenerate goals if weight/rate changed
            const goals = await generatePlanFromProfile(newProfileData);
            const updatedProfile = { ...newProfileData, goals };
            
            saveProfile(updatedProfile);
            setProfile(updatedProfile);
            setShowSettings(false);
        } catch (e) {
            alert("Failed to update profile.");
        } finally {
            setIsUpdating(false);
        }
    };

    const getProjectedDate = () => {
        if (!profile) return '';
        const diff = Math.abs(profile.currentWeight - profile.goalWeight);
        if (diff <= 0.1) return 'Goal Reached!';
        const weeks = diff / (profile.weightLossRate || 1);
        const d = new Date();
        d.setDate(d.getDate() + (weeks * 7));
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    if (!profile) return null;

    const isGaining = profile.goalWeight > profile.currentWeight;

    // Prepare Chart Data
    let chartData = (profile.weightHistory || []).map(entry => ({
        day: entry.date,
        weight: entry.weight
    }));

    // Handle empty or single data point for chart aesthetics
    if (chartData.length === 0) {
        chartData = [{ day: 'Start', weight: profile.currentWeight }];
    } 
    // If only one point, add a fake previous point for a flat line visual
    if (chartData.length === 1) {
        chartData.unshift({ day: 'Start', weight: chartData[0].weight });
    }

    return (
        <div className="space-y-6 pb-24 animate-fade-in relative">
             <header className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
                <div className="flex gap-2">
                    <button 
                        onClick={onThemeToggle}
                        className="p-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-300 shadow-sm"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button 
                        onClick={handleEdit}
                        className="p-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-300 shadow-sm"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            {/* Main Stats Card */}
            <Card className="bg-primary-600 text-white border-none shadow-chakra-lg dark:shadow-none overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl"></div>

                <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30 text-3xl font-bold shadow-inner overflow-hidden">
                        {profile.avatar ? (
                            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                             profile.name ? profile.name.charAt(0) : 'U'
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{profile.name || 'Member'}</h2>
                        <p className="text-primary-100 text-sm capitalize opacity-80 flex items-center gap-1">
                            <Award size={14} />
                            {profile.regimen.replace('-', ' ')} Warrior
                        </p>
                    </div>
                </div>
                <div className="flex divide-x divide-white/20 relative z-10">
                    <div className="flex-1 text-center pr-2">
                        <span className="block text-3xl font-bold">{profile.currentWeight}</span>
                        <span className="text-[10px] text-primary-100 uppercase tracking-widest font-semibold">Current</span>
                    </div>
                    <div className="flex-1 text-center px-2">
                        <span className="block text-3xl font-bold">{profile.goalWeight}</span>
                        <span className="text-[10px] text-primary-100 uppercase tracking-widest font-semibold">Goal</span>
                    </div>
                    <div className="flex-1 text-center pl-2">
                        <span className="block text-3xl font-bold">{profile.goals.calories}</span>
                        <span className="text-[10px] text-primary-100 uppercase tracking-widest font-semibold">Cal Goal</span>
                    </div>
                </div>
            </Card>
            
            {/* Projection Card */}
            <div className={`bg-gradient-to-r ${isGaining ? 'from-emerald-500 to-teal-600' : 'from-indigo-500 to-purple-600'} rounded-xl p-4 text-white shadow-md flex items-center justify-between`}>
                <div>
                    <p className={`${isGaining ? 'text-emerald-100' : 'text-indigo-100'} text-xs font-bold uppercase mb-1`}>Estimated Goal Date</p>
                    <p className="text-xl font-bold flex items-center gap-2">
                        <Calendar size={18} /> {getProjectedDate()}
                    </p>
                </div>
                <div className="text-right">
                     <p className={`${isGaining ? 'text-emerald-100' : 'text-indigo-100'} text-xs font-bold uppercase mb-1`}>Rate</p>
                     <p className="text-lg font-semibold">{isGaining ? '+' : '-'}{profile.weightLossRate} lb/wk</p>
                </div>
            </div>

            {/* Weight Chart */}
            <Card className="pb-2" title="Weight History">
                <div className="h-48 w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <defs>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#805AD5" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#805AD5" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis 
                                dataKey="day" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 12, fill: isDark ? '#A0AEC0' : '#718096'}} 
                                dy={10}
                            />
                            <YAxis 
                                hide 
                                domain={['dataMin - 5', 'dataMax + 5']}
                            />
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: isDark ? '#2D3748' : '#fff',
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                labelStyle={{ color: isDark ? '#CBD5E0' : '#718096' }}
                            />
                             {/* Goal Line */}
                            <ReferenceLine y={profile.goalWeight} stroke={isGaining ? '#10B981' : '#805AD5'} strokeDasharray="3 3" />
                            
                            <Line 
                                type="monotone" 
                                dataKey="weight" 
                                stroke={isGaining ? '#10B981' : '#805AD5'} 
                                strokeWidth={3} 
                                dot={{r: 4, fill: isGaining ? '#10B981' : '#805AD5', strokeWidth: 2, stroke: '#fff'}}
                                activeDot={{r: 6}} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <Card className="flex flex-col items-center justify-center py-6">
                     <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-500 mb-3">
                        <Activity size={24} />
                     </div>
                     <span className="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">Activity Level</span>
                     <span className="font-bold text-gray-800 dark:text-white capitalize text-lg">{profile.activityLevel}</span>
                </Card>
                <Card className="flex flex-col items-center justify-center py-6">
                     <div className={`w-12 h-12 ${isGaining ? 'bg-green-50 dark:bg-green-900/20 text-green-500' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-500'} rounded-2xl flex items-center justify-center mb-3`}>
                        {isGaining ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                     </div>
                     <span className="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">Plan Type</span>
                     <span className="font-bold text-gray-800 dark:text-white capitalize text-center text-lg">{profile.regimen.split('-')[0]}</span>
                </Card>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Edit Details</h3>
                            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            <Input label="Your Name" name="name" value={editFormData.name} onChange={handleChange} />

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Choose Avatar</label>
                                
                                <div className="grid grid-cols-4 gap-3 mb-3">
                                     {/* Custom Upload Button */}
                                     <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <Upload size={20} className="text-gray-400" />
                                        <span className="text-[10px] font-bold text-gray-500 mt-1">Upload</span>
                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                    </div>

                                    {['Felix', 'Aneka', 'Zoe', 'Marc', 'Bailey', 'Willow'].map((seed) => (
                                        <div 
                                            key={seed}
                                            onClick={() => handleAvatarSelect(seed)}
                                            className={`aspect-square rounded-full border-2 overflow-hidden cursor-pointer transition-all ${editFormData.avatar?.includes(seed) ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 dark:border-gray-700'}`}
                                        >
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={seed} className="w-full h-full" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Input label="Current Weight (lbs)" name="currentWeight" type="number" min="0" value={editFormData.currentWeight} onChange={handleChange} />
                            <Input label="Goal Weight (lbs)" name="goalWeight" type="number" min="0" value={editFormData.goalWeight} onChange={handleChange} />
                            
                            <Select label="Weekly Goal Rate" name="weightLossRate" onChange={handleChange} value={editFormData.weightLossRate || 1}>
                                <option value="0.5">Slow & Steady (0.5 lbs)</option>
                                <option value="1">Standard (1.0 lbs)</option>
                                <option value="1.5">Aggressive (1.5 lbs)</option>
                                <option value="2">Maximum (2.0 lbs)</option>
                            </Select>

                            <Select label="Activity Level" name="activityLevel" onChange={handleChange} value={editFormData.activityLevel}>
                                <option value="sedentary">Sedentary</option>
                                <option value="light">Lightly Active</option>
                                <option value="moderate">Moderately Active</option>
                                <option value="active">Very Active</option>
                                <option value="athlete">Athlete</option>
                            </Select>

                            <Select label="Diet Plan" name="regimen" onChange={handleChange} value={editFormData.regimen}>
                                <option value="balanced">Balanced</option>
                                <option value="low-carb">Low Carb</option>
                                <option value="keto">Keto</option>
                                <option value="high-protein">High Protein</option>
                                <option value="vegan">Vegan</option>
                                <option value="intermittent-fasting">Fasting</option>
                            </Select>

                            <Button onClick={saveChanges} isLoading={isUpdating} className="w-full mt-4 shadow-md">Save Changes</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
