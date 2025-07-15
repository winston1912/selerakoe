import React from 'react';
import { getAllRecipeIngredients } from '@/lib/data/getRecipeIngredient';
import { CreateButton, DeleteButton, EditButton } from '../button';
import { deleteRecipeIngredient } from '@/lib/actions/recipeIngredientsAction';
import { unstable_noStore as noStore } from 'next/cache';

// Type definitions based on your Prisma schema
interface Ingredient {
  id: string;
  name: string;
  price: number;
  baseAmount: number;
  measureUnit: string;
}

interface Recipe {
  id: string;
  name: string;
}

interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredientId: string;
  amount: number;
  recipe: Recipe;
  ingredient: Ingredient;
}

interface GroupedRecipe {
  recipe: Recipe;
  ingredients: RecipeIngredient[];
  totalCost: number;
}

const RecipeIngredientTable: React.FC = async () => {
  // Prevent caching to ensure fresh data
  noStore();
  
  // Use the new getAllRecipeIngredients function for better reliability
  const recipeIngredients: RecipeIngredient[] = await getAllRecipeIngredients();
  
  // Add debugging log
  console.log('RecipeIngredientTable - Fetched ingredients:', recipeIngredients.length);
  console.log('RecipeIngredientTable - Sample data:', recipeIngredients.slice(0, 2));

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate cost for specific amount of ingredient used in recipe
  const calculateIngredientCost = (ingredient: Ingredient, usedAmount: number): number => {
    const pricePerUnit = ingredient.price / ingredient.baseAmount;
    return pricePerUnit * usedAmount;
  };

  // Format amount with unit
  const formatAmount = (amount: number, unit: string): string => {
    return `${amount} ${unit}`;
  };



  // Group ingredients by recipe
  const groupedRecipes: GroupedRecipe[] = recipeIngredients.reduce((acc, recipeIngredient) => {
    const existingGroup = acc.find(group => group.recipe.id === recipeIngredient.recipeId);
    
    if (existingGroup) {
      existingGroup.ingredients.push(recipeIngredient);
      existingGroup.totalCost += calculateIngredientCost(recipeIngredient.ingredient, recipeIngredient.amount);
    } else {
      acc.push({
        recipe: recipeIngredient.recipe,
        ingredients: [recipeIngredient],
        totalCost: calculateIngredientCost(recipeIngredient.ingredient, recipeIngredient.amount)
      });
    }
    
    return acc;
  }, [] as GroupedRecipe[]);

  // Add debugging for grouped recipes
  console.log('RecipeIngredientTable - Grouped recipes:', groupedRecipes.length);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bahan Masak dan Resep</h2>
          <p className="text-gray-600 mt-1">Kelola jumlah bahan yang akan dipakai untuk setiap resep</p>
          {/* Add debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-blue-600 mt-1">
              Debug: {recipeIngredients.length} raw ingredients, {groupedRecipes.length} grouped recipes
            </p>
          )}
        </div>
        <CreateButton targetEntity="recipe-ingredient" />
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  #
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Resep
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Bahan
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total Biaya
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {groupedRecipes.map((group, index) => (
                <tr
                  key={group.recipe.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-gray-900">
                      {group.recipe.name}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-2">
                      {group.ingredients.map((recipeIngredient) => (
                        <div key={recipeIngredient.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {recipeIngredient.ingredient.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatAmount(recipeIngredient.amount, recipeIngredient.ingredient.measureUnit)} • 
                              {formatCurrency(recipeIngredient.ingredient.price / recipeIngredient.ingredient.baseAmount)} per {recipeIngredient.ingredient.measureUnit}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(calculateIngredientCost(recipeIngredient.ingredient, recipeIngredient.amount))}
                            </span>
                            <div className="flex gap-1">
                              <EditButton id={recipeIngredient.id} entityType="recipe-ingredients" />
                              <DeleteButton
                                id={recipeIngredient.id}
                                onDelete={deleteRecipeIngredient}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(group.totalCost)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {groupedRecipes.map((group, index) => (
          <div
            key={group.recipe.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {group.recipe.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {group.ingredients.length} Bahan{group.ingredients.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(group.totalCost)}
                </div>
                <div className="text-xs text-gray-500">Total Biaya</div>
              </div>
            </div>

            {/* Ingredients List */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Bahan:</h4>
              {group.ingredients.map((recipeIngredient) => (
                <div key={recipeIngredient.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {recipeIngredient.ingredient.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatAmount(recipeIngredient.amount, recipeIngredient.ingredient.measureUnit)} • 
                      {formatCurrency(recipeIngredient.ingredient.price / recipeIngredient.ingredient.baseAmount)} per {recipeIngredient.ingredient.measureUnit}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(calculateIngredientCost(recipeIngredient.ingredient, recipeIngredient.amount))}
                    </span>
                    <div className="flex gap-1">
                      <EditButton id={recipeIngredient.id} entityType="recipe-ingredients" />
                      <DeleteButton
                        id={recipeIngredient.id}
                        onDelete={deleteRecipeIngredient}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Card */}
      {groupedRecipes.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Ringkasan Biaya Resep</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {groupedRecipes.length}
              </div>
              <div className="text-sm text-blue-700">Total Resep</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {recipeIngredients.length}
              </div>
              <div className="text-sm text-blue-700">Entri Bahan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(
                  groupedRecipes.reduce((total, group) => total + group.totalCost, 0)
                )}
              </div>
              <div className="text-sm text-blue-700">Total Biaya</div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {groupedRecipes.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak menemukan bahan dan resep
          </h3>
          <p className="text-gray-500">
            Mulailah dengan menambahkan bahan-bahan ke resep Anda.
          </p>
        </div>
      )}
    </div>
  );
};

export default RecipeIngredientTable;