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

export default function ARRCalculator() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [baseIngredient, setBaseIngredient] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [result, setResult] = useState<ARRCalculationResult | null>(null);
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

  const handleCalculate = async () => {
    if (!selectedRecipe || !baseIngredient || !newAmount) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await calculateARR(selectedRecipe, baseIngredient, parseFloat(newAmount));
      
      if (result) {
        setResult(result);
      } else {
        alert('Error calculating ratios. Please check your inputs.');
      }
    } catch (error) {
      console.error('Error calculating ARR:', error);
      alert('Error calculating ratios');
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
          <p className="mt-4 text-gray-600">Loading recipes...</p>
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <p className="text-gray-600">No recipes found. Please add some recipes with ingredients first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Automatic Ratio Result (ARR) Calculator
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Recipe Selection</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Select Recipe
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
              <option value="">Choose a recipe...</option>
              {recipes.map(recipe => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name} ({recipe.recipeIngredients.length} ingredients)
                </option>
              ))}
            </select>
          </div>

          {selectedRecipeData && selectedRecipeData.recipeIngredients.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Base Ingredient (Reference)
              </label>
              <select 
                value={baseIngredient} 
                onChange={(e) => {
                  setBaseIngredient(e.target.value);
                  setResult(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose base ingredient...</option>
                {selectedRecipeData.recipeIngredients.map(ri => (
                  <option key={ri.id} value={ri.ingredient.id}>
                    {ri.ingredient.name} (Original: {ri.amount} {ri.ingredient.measureUnit})
                  </option>
                ))}
              </select>
            </div>
          )}

          {baseIngredient && selectedRecipeData && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                New Amount
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
                placeholder="Enter new amount..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <button
            onClick={handleCalculate}
            disabled={loading || !selectedRecipe || !baseIngredient || !newAmount}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Calculating...' : 'Calculate Ratios'}
          </button>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Results</h2>
          
          {result ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">{result.recipeName}</h3>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-800">Base Ingredient:</h4>
                <p className="text-blue-700">
                  {result.baseIngredient.name}: {result.baseIngredient.newAmount} {result.baseIngredient.measureUnit}
                  <span className="text-sm text-gray-600 ml-2">
                    (was {result.baseIngredient.originalAmount} {result.baseIngredient.measureUnit})
                  </span>
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Scaling factor: {result.scalingFactor.toFixed(3)}x
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">Adjusted Ingredients:</h4>
                <div className="space-y-2">
                  {result.adjustedIngredients.map(ingredient => (
                    <div key={ingredient.id} className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="font-medium">{ingredient.name}</span>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">
                          {ingredient.adjustedAmount.toFixed(2)} {ingredient.measureUnit}
                        </div>
                        <div className="text-xs text-gray-500">
                          was {ingredient.originalAmount} {ingredient.measureUnit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
              Select a recipe, base ingredient, and enter a new amount to see the calculated ratios.
            </div>
          )}
        </div>
      </div>

      {/* Original Recipe Display */}
      {selectedRecipeData && selectedRecipeData.recipeIngredients.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-3">Original Recipe: {selectedRecipeData.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {selectedRecipeData.recipeIngredients.map(ri => (
              <div key={ri.id} className="p-2 bg-white rounded border text-center">
                <div className="font-medium">{ri.ingredient.name}</div>
                <div className="text-sm text-gray-600">{ri.amount} {ri.ingredient.measureUnit}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedRecipeData && selectedRecipeData.recipeIngredients.length === 0 && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-800">
            This recipe has no ingredients. Please add ingredients to this recipe first.
          </p>
        </div>
      )}
    </div>
  );
}