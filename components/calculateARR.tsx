'use client'

import React, { useState, useEffect } from 'react';
import { calculateARR, getAllRecipes, type ARRCalculationResult } from '@/lib/actions/arr';

// Type definitions to match your Prisma schema
type Ingredient = {
  id: string;
  name: string;
  measureUnit: string;
  price: number;
  baseAmount: number;
};

type RecipeIngredient = {
  id: string;
  recipeId: string;
  ingredientId: string;
  amount: number;
  ingredient: Ingredient;
};

type Recipe = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  recipeIngredients: RecipeIngredient[];
};

// Enhanced result type with price calculations
type EnhancedARRResult = ARRCalculationResult & {
  priceCalculations: {
    originalTotalCost: number;
    adjustedTotalCost: number;
    ingredientCosts: Array<{
      id: string;
      name: string;
      originalCost: number;
      adjustedCost: number;
      pricePerUnit: number;
    }>;
  };
};

// Helper function to round to 5 decimal places
const roundTo5Decimals = (value: number): number => {
  return Math.round(value * 100000) / 100000;
};

// Currency formatter for IDR
const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Number formatter for IDR without currency symbol
const formatIDRNumber = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ARRCalculator() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [baseIngredient, setBaseIngredient] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [result, setResult] = useState<EnhancedARRResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const fetchedRecipes = await getAllRecipes();
        setRecipes(fetchedRecipes);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchRecipes();
  }, []);

const calculatePrices = (arrResult: ARRCalculationResult, selectedRecipeData: Recipe) => {
  const ingredientCosts = arrResult.adjustedIngredients.map(adjustedIngredient => {
    const recipeIngredient = selectedRecipeData.recipeIngredients.find(
      ri => ri.ingredient.id === adjustedIngredient.id
    );
    
    if (!recipeIngredient) {
      return {
        id: adjustedIngredient.id,
        name: adjustedIngredient.name,
        originalCost: 0,
        adjustedCost: 0,
        pricePerUnit: 0
      };
    }

    const ingredient = recipeIngredient.ingredient;
    // Calculate price per unit (price / baseAmount) - rounded to 5 decimals
    const pricePerUnit = roundTo5Decimals(ingredient.price / ingredient.baseAmount);
    
    // FIXED: Use consistent original amounts from ARR result - rounded to 5 decimals
    const originalCost = roundTo5Decimals(pricePerUnit * adjustedIngredient.originalAmount);
    const adjustedCost = roundTo5Decimals(pricePerUnit * adjustedIngredient.adjustedAmount);

    return {
      id: adjustedIngredient.id,
      name: adjustedIngredient.name,
      originalCost,
      adjustedCost,
      pricePerUnit
    };
  });

  const originalTotalCost = roundTo5Decimals(ingredientCosts.reduce((sum, item) => sum + item.originalCost, 0));
  const adjustedTotalCost = roundTo5Decimals(ingredientCosts.reduce((sum, item) => sum + item.adjustedCost, 0));

  return {
    originalTotalCost,
    adjustedTotalCost,
    ingredientCosts
  };
};

  const handleCalculate = async () => {
    if (!selectedRecipe || !baseIngredient || !newAmount) {
      alert('Mohon lengkapi semua kolom');
      return;
    }

    setLoading(true);
    try {
      const arrResult = await calculateARR(selectedRecipe, baseIngredient, parseFloat(newAmount));
      
      if (arrResult) {
        const selectedRecipeData = recipes.find(r => r.id === selectedRecipe);
        if (selectedRecipeData) {
          const priceCalculations = calculatePrices(arrResult, selectedRecipeData);
          
          const enhancedResult: EnhancedARRResult = {
            ...arrResult,
            priceCalculations
          };
          
          setResult(enhancedResult);
        } else {
          setResult(null);
        }
      } else {
        alert('Terjadi kesalahan saat menghitung. Silakan periksa input Anda.');
      }
    } catch (error) {
      console.error('Error calculating ARR:', error);
      alert('Terjadi kesalahan saat menghitung');
    } finally {
      setLoading(false);
    }
  };

  const selectedRecipeData = recipes.find(r => r.id === selectedRecipe);

  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat resep...</p>
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <p className="text-gray-600">Tidak ada resep yang ditemukan. Silakan tambahkan resep dengan bahan-bahan terlebih dahulu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Kalkulator Perhitungan Resep Otomatis
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Pilih Resep</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Pilih Resep Masakan
            </label>
            <select 
              value={selectedRecipe} 
              onChange={(e) => {
                setSelectedRecipe(e.target.value);
                setBaseIngredient('');
                setResult(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih resep masakan...</option>
              {recipes.map(recipe => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name} ({recipe.recipeIngredients.length} bahan)
                </option>
              ))}
            </select>
          </div>

          {selectedRecipeData && selectedRecipeData.recipeIngredients.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Pilih Bahan Utama (Sebagai Patokan)
              </label>
              <select 
                value={baseIngredient} 
                onChange={(e) => {
                  setBaseIngredient(e.target.value);
                  setResult(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih bahan utama...</option>
                {selectedRecipeData.recipeIngredients.map(ri => (
                  <option key={ri.id} value={ri.ingredient.id}>
                    {ri.ingredient.name} (Asli: {ri.amount} {ri.ingredient.measureUnit})
                  </option>
                ))}
              </select>
            </div>
          )}

          {baseIngredient && selectedRecipeData && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Jumlah Baru yang Diinginkan
                {(() => {
                  const baseRI = selectedRecipeData.recipeIngredients.find(ri => ri.ingredient.id === baseIngredient);
                  return baseRI ? ` (${baseRI.ingredient.measureUnit})` : '';
                })()}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newAmount}
                onChange={(e) => {
                  setNewAmount(e.target.value);
                  setResult(null);
                }}
                placeholder="Masukkan jumlah baru..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <button
            onClick={handleCalculate}
            disabled={loading || !selectedRecipe || !baseIngredient || !newAmount}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Menghitung...' : 'Hitung Takaran & Biaya'}
          </button>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Hasil Perhitungan</h2>
          
          {result ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">{result.recipeName}</h3>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-800">Bahan Utama:</h4>
                <p className="text-blue-700">
                  {result.baseIngredient.name}: {roundTo5Decimals(result.baseIngredient.newAmount)} {result.baseIngredient.measureUnit}
                  <span className="text-sm text-gray-600 ml-2">
                    (sebelumnya {result.baseIngredient.originalAmount} {result.baseIngredient.measureUnit})
                  </span>
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Faktor perkalian: {roundTo5Decimals(result.scalingFactor)}x
                </p>
              </div>

              {/* Cost Summary */}
              <div className="mb-4 p-3 bg-green-50 rounded-md">
                <h4 className="font-medium text-green-800 mb-2">Ringkasan Biaya:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Biaya Asli:</span>
                    <div className="font-semibold text-gray-800">
                      {formatIDR(result.priceCalculations.originalTotalCost)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Biaya Setelah Disesuaikan:</span>
                    <div className="font-semibold text-green-600">
                      {formatIDR(result.priceCalculations.adjustedTotalCost)}
                    </div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-green-200">
                  <span className="text-sm text-gray-600">Selisih biaya:</span>
                  <div className={`font-semibold ${
                    result.priceCalculations.adjustedTotalCost > result.priceCalculations.originalTotalCost 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {formatIDR(roundTo5Decimals(result.priceCalculations.adjustedTotalCost - result.priceCalculations.originalTotalCost))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">Takaran Bahan Setelah Disesuaikan & Biaya:</h4>
                <div className="space-y-2">
                  {result.adjustedIngredients.map((ingredient, index) => {
                    const costInfo = result.priceCalculations.ingredientCosts.find(c => c.id === ingredient.id);
                    return (
                      <div key={ingredient.id} className="p-3 bg-white rounded border">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <span className="font-medium">{ingredient.name}</span>
                            <div className="text-sm text-gray-500 mt-1">
                              {formatIDR(costInfo?.pricePerUnit || 0)}/{ingredient.measureUnit}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-semibold text-blue-600">
                              {roundTo5Decimals(ingredient.adjustedAmount)} {ingredient.measureUnit}
                            </div>
                            <div className="text-sm font-medium text-green-600">
                              {formatIDR(costInfo?.adjustedCost || 0)}
                            </div>
                            <div className="text-xs text-gray-500">
                              sebelumnya {ingredient.originalAmount} {ingredient.measureUnit} ({formatIDR(costInfo?.originalCost || 0)})
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
              Pilih resep, bahan utama, dan masukkan jumlah baru untuk melihat hasil perhitungan takaran dan biaya.
            </div>
          )}
        </div>
      </div>

      {/* Original Recipe Display */}
      {selectedRecipeData && selectedRecipeData.recipeIngredients.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-3">Resep Asli: {selectedRecipeData.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedRecipeData.recipeIngredients.map(ri => {
              const pricePerUnit = roundTo5Decimals(ri.ingredient.price / ri.ingredient.baseAmount);
              const ingredientCost = roundTo5Decimals(pricePerUnit * ri.amount);
              
              return (
                <div key={ri.id} className="p-3 bg-white rounded border">
                  <div className="font-medium">{ri.ingredient.name}</div>
                  <div className="text-sm text-gray-600">
                    {ri.amount} {ri.ingredient.measureUnit}
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    {formatIDR(ingredientCost)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatIDR(pricePerUnit)}/{ri.ingredient.measureUnit}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-right font-semibold text-lg">
              Total Biaya Asli: {formatIDR(roundTo5Decimals(selectedRecipeData.recipeIngredients.reduce((sum, ri) => {
                const pricePerUnit = roundTo5Decimals(ri.ingredient.price / ri.ingredient.baseAmount);
                return sum + roundTo5Decimals(pricePerUnit * ri.amount);
              }, 0)))}
            </div>
          </div>
        </div>
      )}

      {selectedRecipeData && selectedRecipeData.recipeIngredients.length === 0 && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-800">
            Resep ini belum memiliki bahan-bahan. Silakan tambahkan bahan-bahan ke resep ini terlebih dahulu.
          </p>
        </div>
      )}
    </div>
  );
}