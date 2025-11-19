
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Button, Select, Input } from './UIComponents';
import { generatePlanFromProfile } from '../services/geminiService';
import { saveProfile } from '../services/storageService';
import { ArrowRight, Check, User, Ruler, Weight, Target } from 'lucide-react';

interface OnboardingProps {
    onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<any>>({
        name: '',
        gender: 'female',
        activityLevel: 'moderate',
        regimen: 'balanced',
        age: 25,
        heightFt: 5,
        heightIn: 6,
        currentWeight: 150,
        goalWeight: 130,
        weightLossRate: 1
    });

    const updateField = (field: string, value: any) => {
        let safeValue = value;
        
        // Validation Logic
        if (field === 'age') safeValue = Math.max(10, Math.min(100, Number(value)));
        if (field === 'heightFt') safeValue = Math.max(3, Math.min(8, Number(value))); // 3ft to 8ft
        if (field === 'heightIn') safeValue = Math.max(0, Math.min(11, Number(value))); // 0 to 11 inches
        
        // Specific check for weights to prevent negatives
        if (field === 'currentWeight' || field === 'goalWeight') {
            if (Number(value) < 0) {
                alert("You can't be negative weight!");
                return;
            }
            safeValue = Math.max(0, Math.min(600, Number(value)));
        }

        // Allow string input while typing, sanitize on blur/submit if needed, 
        // but for controlled inputs with min/max constraints we apply logic immediately if it's a number type
        if (field === 'name') safeValue = value; // Text is fine
        
        setFormData(prev => ({ ...prev, [field]: safeValue }));
    };

    const handleFinish = async () => {
        setIsLoading(true);
        try {
            const profile: any = {
                ...formData,
                age: Number(formData.age),
                heightFt: Number(formData.heightFt),
                heightIn: Number(formData.heightIn),
                currentWeight: Number(formData.currentWeight),
                goalWeight: Number(formData.goalWeight),
                weightLossRate: Number(formData.weightLossRate)
            };

            const goals = await generatePlanFromProfile(profile);
            const fullProfile: UserProfile = {
                ...profile,
                goals,
                theme: 'dark', // Default to dark based on requirements
                weightHistory: [{ date: new Date().toLocaleDateString('en-US', { weekday: 'short' }), weight: profile.currentWeight }]
            };

            saveProfile(fullProfile);
            onComplete();
        } catch (e) {
            console.error(e);
            alert("Something went wrong generating your plan.");
        } finally {
            setIsLoading(false);
        }
    };

    const isGaining = Number(formData.goalWeight) > Number(formData.currentWeight);

    const StepIndicator = () => (
        <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary-500' : 'w-2 bg-gray-200 dark:bg-gray-700'}`} />
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col items-center px-6 pt-safe-top pb-safe overflow-y-auto transition-colors duration-300">
            <div className="w-full max-w-md flex-1 flex flex-col py-6">
                <StepIndicator />

                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {step === 1 ? "Who are you?" : step === 2 ? "Your Stats" : step === 3 ? "The Goal" : "Your Plan"}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-base">
                        {step === 1 ? "Let's setup your profile." : step === 2 ? "Accurate numbers help us calculate better." : isGaining ? "Let's build some muscle!" : "Where do you want to be?"}
                    </p>
                </div>

                <div className="flex-1 animate-in slide-in-from-right duration-300 flex flex-col">
                    {step === 1 && (
                        <div className="space-y-4">
                             <Input 
                                label="Your Name" 
                                placeholder="e.g. Sarah"
                                value={formData.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                autoFocus
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <Input 
                                    label="Age" 
                                    type="number"
                                    min="10"
                                    max="100"
                                    value={formData.age}
                                    onChange={(e) => updateField('age', e.target.value)}
                                />
                                <Select label="Gender" name="gender" onChange={(e) => updateField('gender', e.target.value)} value={formData.gender} className="mt-0">
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </Select>
                            </div>
                            
                            <Select label="Activity Level" name="activityLevel" onChange={(e) => updateField('activityLevel', e.target.value)} value={formData.activityLevel}>
                                <option value="sedentary">Sedentary (Office job)</option>
                                <option value="light">Lightly Active (1-3 days/week)</option>
                                <option value="moderate">Moderately Active (3-5 days/week)</option>
                                <option value="active">Very Active (6-7 days/week)</option>
                                <option value="athlete">Athlete (2x per day)</option>
                            </Select>

                            <div className="flex-1"></div>
                            <Button className="w-full py-4 shadow-md text-lg mt-4" onClick={() => setStep(2)} disabled={!formData.name}>Next <ArrowRight size={20} className="ml-2" /></Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                                    <Ruler size={16} className="text-primary-500" /> Height
                                </label>
                                <div className="flex gap-4">
                                    <div className="flex-1 relative">
                                        <input 
                                            type="number"
                                            min="3"
                                            max="8"
                                            className="w-full text-center text-2xl font-bold p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary-500 outline-none"
                                            value={formData.heightFt}
                                            onChange={(e) => updateField('heightFt', e.target.value)}
                                        />
                                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 font-medium">ft</span>
                                    </div>
                                    <div className="flex-1 relative">
                                        <input 
                                            type="number"
                                            min="0"
                                            max="11"
                                            className="w-full text-center text-2xl font-bold p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary-500 outline-none"
                                            value={formData.heightIn}
                                            onChange={(e) => updateField('heightIn', e.target.value)}
                                        />
                                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 font-medium">in</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                                    <Weight size={16} className="text-primary-500" /> Current Weight
                                </label>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        min="0"
                                        max="600"
                                        className="w-full text-center text-3xl font-bold p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary-500 outline-none"
                                        value={formData.currentWeight}
                                        onChange={(e) => updateField('currentWeight', e.target.value)}
                                    />
                                    <span className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 font-medium">lbs</span>
                                </div>
                            </div>
                            
                            <div className="flex-1"></div>
                            <div className="flex gap-3 mt-4">
                                <Button variant="secondary" onClick={() => setStep(1)} className="px-6">Back</Button>
                                <Button className="flex-1 py-4 shadow-md text-lg" onClick={() => setStep(3)}>Next</Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                             <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                                    <Target size={16} className="text-primary-500" /> Target Weight
                                </label>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        min="0"
                                        max="600"
                                        className="w-full text-center text-3xl font-bold p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary-500 outline-none"
                                        value={formData.goalWeight}
                                        onChange={(e) => updateField('goalWeight', e.target.value)}
                                    />
                                    <span className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 font-medium">lbs</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-2">
                                    Weekly {isGaining ? 'Gain' : 'Loss'} Rate
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[0.5, 1, 1.5, 2].map(r => (
                                        <button
                                            key={r}
                                            onClick={() => updateField('weightLossRate', r)}
                                            className={`py-4 rounded-xl text-base font-bold transition-all border ${formData.weightLossRate === r ? 'bg-primary-600 text-white border-primary-600 shadow-lg transform scale-[1.02]' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}
                                        >
                                            {isGaining ? '+' : '-'}{r} lb <span className="text-xs font-normal opacity-80">/ week</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                             <div className="flex-1"></div>
                             <div className="flex gap-3 mt-4">
                                <Button variant="secondary" onClick={() => setStep(2)} className="px-6">Back</Button>
                                <Button className="flex-1 py-4 shadow-md text-lg" onClick={() => setStep(4)}>Next</Button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6">
                            <Select label="Preferred Diet Style" name="regimen" onChange={(e) => updateField('regimen', e.target.value)} value={formData.regimen}>
                                <option value="balanced">Balanced (Recommended)</option>
                                <option value="low-carb">Low Carb</option>
                                <option value="keto">Keto</option>
                                <option value="high-protein">High Protein</option>
                                <option value="vegan">Vegan</option>
                                <option value="intermittent-fasting">Fasting</option>
                            </Select>

                            <div className="bg-primary-50 dark:bg-gray-800 p-6 rounded-2xl border border-primary-100 dark:border-gray-700 text-center">
                                <p className="text-primary-800 dark:text-primary-200 text-lg font-medium leading-relaxed">
                                    Ready, <strong>{formData.name}</strong>? <br/>
                                    We're generating a plan to help you <br/>
                                    <strong className={isGaining ? 'text-green-500' : 'text-primary-600'}>{isGaining ? 'GAIN' : 'LOSE'}</strong> weight to reach <strong>{formData.goalWeight} lbs</strong>.
                                </p>
                            </div>

                            <div className="flex-1"></div>
                            <div className="space-y-3 mt-4">
                                <Button className="w-full py-4 shadow-lg bg-primary-600 text-lg" onClick={handleFinish} isLoading={isLoading}>
                                    Generate My Plan
                                </Button>
                                <Button variant="ghost" onClick={() => setStep(3)} className="w-full">Back</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
