import React from 'react';
import { getRecipeIngredients } from '@/lib/data/getRecipeIngredient';
import { CreateButton, DeleteButton, EditButton } from '../button';
import { deleteRecipeIngredient } from '@/lib/actions/recipeIngredientsAction';

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

const RecipeIngredientTable: React.FC = async () => {
  const recipeIngredients: RecipeIngredient[] = await getRecipeIngredients();

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recipe Ingredients</h2>
          <p className="text-gray-600 mt-1">Manage ingredient quantities for each recipe</p>
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
                  Recipe
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ingredient
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount Needed
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total Cost
                </th>
                <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recipeIngredients.map((recipeIngredient, index) => (
                <tr
                  key={recipeIngredient.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-gray-900">
                      {recipeIngredient.recipe.name}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-gray-900">
                      {recipeIngredient.ingredient.name}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">
                      {formatAmount(recipeIngredient.amount, recipeIngredient.ingredient.measureUnit)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(recipeIngredient.ingredient.price / recipeIngredient.ingredient.baseAmount)}
                      <span className="text-xs text-gray-500 ml-1">
                        per {recipeIngredient.ingredient.measureUnit}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(calculateIngredientCost(recipeIngredient.ingredient, recipeIngredient.amount))}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center gap-2">
                      <EditButton id={recipeIngredient.id} entityType="recipe-ingredients" />
                      <DeleteButton
                        id={recipeIngredient.id}
                        onDelete={deleteRecipeIngredient}
                      />
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
        {recipeIngredients.map((recipeIngredient, index) => (
          <div
            key={recipeIngredient.id}
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
                      {recipeIngredient.recipe.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {recipeIngredient.ingredient.name}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <EditButton id={recipeIngredient.id} entityType="recipe-ingredients" />
                <DeleteButton
                  id={recipeIngredient.id}
                  onDelete={deleteRecipeIngredient}
                />
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Needed
                </dt>
                <dd className="text-sm text-gray-900">
                  {formatAmount(recipeIngredient.amount, recipeIngredient.ingredient.measureUnit)}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </dt>
                <dd className="text-sm text-gray-900">
                  {formatCurrency(recipeIngredient.ingredient.price / recipeIngredient.ingredient.baseAmount)}
                  <span className="text-xs text-gray-500 block">
                    per {recipeIngredient.ingredient.measureUnit}
                  </span>
                </dd>
              </div>
              <div className="col-span-2 space-y-1">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost
                </dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {formatCurrency(calculateIngredientCost(recipeIngredient.ingredient, recipeIngredient.amount))}
                </dd>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Card */}
      {recipeIngredients.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Recipe Cost Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {new Set(recipeIngredients.map(ri => ri.recipeId)).size}
              </div>
              <div className="text-sm text-blue-700">Total Recipes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {recipeIngredients.length}
              </div>
              <div className="text-sm text-blue-700">Ingredient Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(
                  recipeIngredients.reduce((total, ri) => 
                    total + calculateIngredientCost(ri.ingredient, ri.amount), 0
                  )
                )}
              </div>
              <div className="text-sm text-blue-700">Total Cost</div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {recipeIngredients.length === 0 && (
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
            No recipe ingredients found
          </h3>
          <p className="text-gray-500">
            Start by adding ingredients to your recipes.
          </p>
        </div>
      )}
    </div>
  );
};

export default RecipeIngredientTable;