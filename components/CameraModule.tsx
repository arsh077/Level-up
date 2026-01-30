import React, { useState, useRef } from 'react';
import { Camera, Loader2, X, AlertCircle, Utensils } from 'lucide-react';
import { GradientButton } from './ui/gradient-button';

export const CameraModule: React.FC = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    foodName: string;
    calories: number;
    macros: { protein: number; carbs: number; fats: number };
    measures: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCamera = () => {
    fileInputRef.current?.click();
  };

  const onSelectImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const url = URL.createObjectURL(file);
    setPreview(url);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Analyzing image with Clarifai Food Model...');

      // Create FormData to send image to backend
      const formData = new FormData();
      formData.append('image', file);

      // Call local backend server (which will proxy to Clarifai)
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend API error:', response.status, errorData);
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Clarifai response:', data);

      // Extract predictions from response
      const concepts = data.predictions;

      if (!concepts || concepts.length === 0) {
        throw new Error('No food detected in image');
      }

      // Get top prediction
      const topPrediction = concepts[0];
      const foodLabel = topPrediction.name;
      const confidence = (topPrediction.value * 100).toFixed(1);

      // Nutrition database - mapping food categories to nutritional info (per 100g)
      const nutritionDatabase: { [key: string]: { calories: number; protein: number; carbs: number; fats: number } } = {
        // Meats & Proteins
        'meat': { calories: 250, protein: 26, carbs: 0, fats: 15 },
        'chicken': { calories: 239, protein: 27, carbs: 0, fats: 14 },
        'fish': { calories: 206, protein: 22, carbs: 0, fats: 12 },
        'steak': { calories: 271, protein: 25, carbs: 0, fats: 19 },
        'pork': { calories: 242, protein: 27, carbs: 0, fats: 14 },
        'beef': { calories: 250, protein: 26, carbs: 0, fats: 15 },

        // Fast Food
        'pizza': { calories: 266, protein: 11, carbs: 33, fats: 10 },
        'burger': { calories: 295, protein: 17, carbs: 24, fats: 14 },
        'hamburger': { calories: 295, protein: 17, carbs: 24, fats: 14 },
        'sandwich': { calories: 250, protein: 12, carbs: 30, fats: 8 },
        'hot dog': { calories: 290, protein: 10, carbs: 23, fats: 18 },
        'hotdog': { calories: 290, protein: 10, carbs: 23, fats: 18 },
        'taco': { calories: 226, protein: 9, carbs: 21, fats: 12 },
        'burrito': { calories: 206, protein: 10, carbs: 32, fats: 4 },
        'fries': { calories: 312, protein: 4, carbs: 41, fats: 15 },
        'french fries': { calories: 312, protein: 4, carbs: 41, fats: 15 },

        // Pasta & Rice
        'pasta': { calories: 158, protein: 6, carbs: 31, fats: 1 },
        'spaghetti': { calories: 158, protein: 6, carbs: 31, fats: 1 },
        'noodle': { calories: 138, protein: 5, carbs: 26, fats: 2 },
        'ramen': { calories: 436, protein: 19, carbs: 66, fats: 15 },
        'rice': { calories: 130, protein: 3, carbs: 28, fats: 0 },

        // Indian Food
        'curry': { calories: 180, protein: 8, carbs: 20, fats: 8 },
        'biryani': { calories: 450, protein: 25, carbs: 55, fats: 12 },
        'naan': { calories: 262, protein: 8, carbs: 45, fats: 5 },
        'roti': { calories: 106, protein: 3, carbs: 21, fats: 2 },
        'bread': { calories: 265, protein: 9, carbs: 49, fats: 3 },
        'dal': { calories: 116, protein: 9, carbs: 20, fats: 0 },
        'samosa': { calories: 308, protein: 6, carbs: 32, fats: 17 },

        // Asian Food
        'sushi': { calories: 140, protein: 6, carbs: 28, fats: 1 },
        'dumpling': { calories: 200, protein: 8, carbs: 25, fats: 7 },

        // Healthy Options
        'salad': { calories: 50, protein: 3, carbs: 8, fats: 2 },
        'soup': { calories: 90, protein: 5, carbs: 12, fats: 3 },
        'vegetables': { calories: 40, protein: 2, carbs: 8, fats: 0 },
        'vegetable': { calories: 40, protein: 2, carbs: 8, fats: 0 },

        // Fruits
        'fruit': { calories: 60, protein: 1, carbs: 15, fats: 0 },
        'apple': { calories: 52, protein: 0, carbs: 14, fats: 0 },
        'banana': { calories: 89, protein: 1, carbs: 23, fats: 0 },
        'orange': { calories: 47, protein: 1, carbs: 12, fats: 0 },

        // Desserts
        'dessert': { calories: 350, protein: 4, carbs: 45, fats: 18 },
        'cake': { calories: 350, protein: 5, carbs: 50, fats: 15 },
        'ice cream': { calories: 207, protein: 4, carbs: 24, fats: 11 },
        'cookie': { calories: 480, protein: 6, carbs: 65, fats: 22 },
        'cookies': { calories: 480, protein: 6, carbs: 65, fats: 22 },
        'chocolate': { calories: 535, protein: 5, carbs: 60, fats: 30 },
        'donut': { calories: 452, protein: 5, carbs: 51, fats: 25 },
        'trifle': { calories: 180, protein: 3, carbs: 28, fats: 6 },

        // Snacks
        'chips': { calories: 536, protein: 6, carbs: 53, fats: 34 },
        'popcorn': { calories: 387, protein: 13, carbs: 78, fats: 5 },

        // Breakfast
        'egg': { calories: 155, protein: 13, carbs: 1, fats: 11 },
        'eggs': { calories: 155, protein: 13, carbs: 1, fats: 11 },
        'toast': { calories: 265, protein: 9, carbs: 49, fats: 3 },
        'pancake': { calories: 227, protein: 6, carbs: 28, fats: 10 },
        'waffle': { calories: 291, protein: 8, carbs: 38, fats: 12 },

        // Beverages (if detected)
        'coffee': { calories: 2, protein: 0, carbs: 0, fats: 0 },
        'tea': { calories: 1, protein: 0, carbs: 0, fats: 0 },

        // Default
        'default': { calories: 200, protein: 10, carbs: 25, fats: 8 }
      };

      // Find matching nutrition data
      let nutrition = nutritionDatabase['default'];
      const lowerLabel = foodLabel.toLowerCase();

      // Try to match with keywords
      for (const [key, value] of Object.entries(nutritionDatabase)) {
        if (lowerLabel.includes(key) || key.includes(lowerLabel)) {
          nutrition = value;
          break;
        }
      }

      // Clean up food name
      const cleanFoodName = foodLabel.charAt(0).toUpperCase() + foodLabel.slice(1);

      setResult({
        foodName: cleanFoodName,
        calories: nutrition.calories,
        macros: {
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fats: nutrition.fats
        },
        measures: `AI detected with ${confidence}% confidence (Clarifai Food Model)`
      });

    } catch (err) {
      console.error('Analysis error:', err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Analysis failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-brand-navy border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-brand-cyan/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-cyan/10 transition-colors"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">

        {/* Left Side: Call to Action */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-dark border border-gray-700 rounded-full">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
            <span className="text-xs font-mono text-gray-300 uppercase tracking-wide">
              Clarifai Food AI Active
            </span>
          </div>

          <h3 className="text-3xl font-heading font-bold text-white">
            What's on your plate?
          </h3>
          <p className="text-gray-400 max-w-md">
            Stop guessing calories. Just snap a photo, and our AI will identify the food, portion size, and macros instantly. Powered by Clarifai's food-specific AI!
          </p>

          {!preview ? (
            <div className="pt-2">
              <GradientButton
                onClick={openCamera}
                variant="variant"
                className="flex items-center gap-2"
              >
                <Camera className="w-5 h-5" /> Scan My Meal
              </GradientButton>
            </div>
          ) : (
            <button
              onClick={handleReset}
              className="text-gray-400 hover:text-white text-sm underline flex items-center gap-2 mx-auto md:mx-0"
            >
              <X className="w-4 h-4" /> Scan new meal
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onSelectImage}
          />
        </div>

        {/* Right Side: Preview & Result Card */}
        <div className="flex-1 w-full max-w-sm">
          {preview ? (
            <div className="bg-brand-dark rounded-2xl border border-gray-700 overflow-hidden relative min-h-[300px] flex flex-col">
              <div className="relative h-48 w-full bg-black">
                <img src={preview} alt="Meal preview" className="w-full h-full object-cover opacity-80" />
                {loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                    <Loader2 className="w-10 h-10 text-brand-cyan animate-spin mb-2" />
                    <span className="text-brand-cyan font-mono text-sm animate-pulse">ANALYZING...</span>
                  </div>
                )}
                {error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4 text-center z-10">
                    <AlertCircle className="w-8 h-8 text-brand-red mb-2" />
                    <span className="text-brand-red text-sm">{error}</span>
                  </div>
                )}
              </div>

              {result && !loading && (
                <div className="p-5 animate-fade-in flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-white text-lg leading-tight">{result.foodName}</h4>
                      <span className="text-xs text-gray-500 font-mono line-clamp-2">{result.measures}</span>
                    </div>
                    <div className="bg-brand-green/20 text-brand-green px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                      {result.calories} kcal
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-auto">
                    <div className="bg-brand-navy p-2 rounded border border-gray-800 text-center">
                      <div className="text-[10px] text-gray-400 uppercase">Prot</div>
                      <div className="font-bold text-brand-cyan">{result.macros.protein}g</div>
                    </div>
                    <div className="bg-brand-navy p-2 rounded border border-gray-800 text-center">
                      <div className="text-[10px] text-gray-400 uppercase">Carb</div>
                      <div className="font-bold text-brand-orange">{result.macros.carbs}g</div>
                    </div>
                    <div className="bg-brand-navy p-2 rounded border border-gray-800 text-center">
                      <div className="text-[10px] text-gray-400 uppercase">Fat</div>
                      <div className="font-bold text-brand-green">{result.macros.fats}g</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={openCamera}
              className="h-64 border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:border-brand-cyan hover:text-brand-cyan transition-colors cursor-pointer bg-brand-dark/50"
            >
              <div className="w-16 h-16 rounded-full bg-brand-navy flex items-center justify-center mb-4">
                <Utensils className="w-8 h-8 opacity-50" />
              </div>
              <span className="font-medium">Tap to scan</span>
              <span className="text-xs opacity-60 mt-1">Supports JPG, PNG</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};