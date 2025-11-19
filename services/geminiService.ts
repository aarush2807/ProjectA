
import { GoogleGenAI, Type } from "@google/genai";
import { FoodItem, UserProfile, UserGoals } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_FLASH = 'gemini-2.5-flash';

/**
 * Generates personalized macro goals based on profile data.
 */
export const generatePlanFromProfile = async (profile: Omit<UserProfile, 'goals'>): Promise<UserGoals> => {
    try {
        const isGaining = profile.goalWeight > profile.currentWeight;
        const goalType = isGaining ? "Weight Gain / Muscle Build" : "Weight Loss";
        const direction = isGaining ? "Surplus" : "Deficit";

        const response = await ai.models.generateContent({
            model: MODEL_FLASH,
            contents: `Create a daily nutrition plan for:
            Age: ${profile.age}, Gender: ${profile.gender}, Height: ${profile.heightFt}ft ${profile.heightIn}in, Weight: ${profile.currentWeight}lbs, Goal Weight: ${profile.goalWeight}lbs, Activity: ${profile.activityLevel}.
            Regimen: ${profile.regimen}. Goal: ${goalType} (Target: ${profile.weightLossRate}lbs/week ${direction}).
            Return JSON: {calories, protein (g), carbs (g), fat (g)}. Ensure specific numbers suitable for ${goalType}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        calories: { type: Type.NUMBER },
                        protein: { type: Type.NUMBER },
                        carbs: { type: Type.NUMBER },
                        fat: { type: Type.NUMBER }
                    },
                    required: ["calories", "protein", "carbs", "fat"]
                }
            }
        });

        const jsonText = response.text;
        if (!jsonText) throw new Error("No response");
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating plan:", error);
        return {
            calories: 2000,
            protein: 150,
            carbs: 200,
            fat: 65
        };
    }
};

/**
 * AI-Powered Autocomplete
 */
export const getFoodSuggestions = async (query: string): Promise<string[]> => {
    if (!query || query.length < 2) return [];
    try {
        const response = await ai.models.generateContent({
            model: MODEL_FLASH,
            contents: `Suggest 5 common foods or exercises matching "${query}". Concise JSON array only.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        const jsonText = response.text;
        return jsonText ? JSON.parse(jsonText) : [];
    } catch (e) {
        return [];
    }
};

/**
 * Parses natural language text into structured food OR exercise data.
 */
export const parseFoodFromText = async (text: string): Promise<Omit<FoodItem, 'id' | 'timestamp' | 'source'>[]> => {
  if (!text.trim()) return [];

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Parse entry: "${text}". 
      If food: type="food", est. calories (TOTAL for quantity), macros.
      If exercise: type="exercise", est. calories burned (positive number), macros=0.
      Return JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              portion: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              type: { type: Type.STRING, enum: ["food", "exercise"] },
              macros: {
                type: Type.OBJECT,
                properties: {
                  protein: { type: Type.NUMBER },
                  carbs: { type: Type.NUMBER },
                  fat: { type: Type.NUMBER }
                },
                required: ["protein", "carbs", "fat"]
              }
            },
            required: ["name", "portion", "calories", "macros", "type"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    return JSON.parse(jsonText);
  } catch (error) {
    throw new Error("Failed to analyze.");
  }
};

/**
 * Analyzes an image.
 */
export const analyzeFoodFromImage = async (base64Image: string): Promise<Omit<FoodItem, 'id' | 'timestamp' | 'source'>[]> => {
  try {
    const cleanBase64 = base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image;
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: "Identify food items. Return JSON array: name, portion, total calories, macros. type='food'." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              portion: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              type: { type: Type.STRING, enum: ["food"] },
              macros: {
                type: Type.OBJECT,
                properties: {
                  protein: { type: Type.NUMBER },
                  carbs: { type: Type.NUMBER },
                  fat: { type: Type.NUMBER }
                },
                required: ["protein", "carbs", "fat"]
              }
            },
            required: ["name", "portion", "calories", "macros", "type"]
          }
        }
      }
    });
    const jsonText = response.text;
    return jsonText ? JSON.parse(jsonText) : [];
  } catch (error) {
    throw new Error("Failed to analyze image.");
  }
};

/**
 * Chat with the AI Nutritionist.
 */
export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], newMessage: string, profile: UserProfile | null): Promise<string> => {
  try {
    const contextString = profile 
        ? `User: ${profile.age}y, ${profile.gender}, ${profile.currentWeight}lbs (Goal: ${profile.goalWeight}). Regimen: ${profile.regimen}.`
        : "User profile not set.";

    const chat = ai.chats.create({
      model: MODEL_FLASH,
      history: history,
      config: {
        systemInstruction: `You are NutriAI. Context: ${contextString}
        Role: Short, punchy, motivating coach.
        Rules: 
        1. Keep answers under 40 words unless explaining a complex topic.
        2. Use **bold** for key terms.
        3. Be positive but direct.
        4. Use Imperial units.`
      }
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "Sorry, try again.";
  } catch (error) {
    return "Connection error.";
  }
};
