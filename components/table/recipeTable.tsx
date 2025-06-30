import React from 'react';
import { getRecipe } from '@/lib/data/getRecipes';
import { CreateButton, DeleteButton, EditButton } from '../button';
import { deleteRecipe } from '@/lib/actions/recipesAction';

// Type definitions
interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredientId: string;
  amount: number;
  // Add other properties as needed
}

interface Recipe {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  recipeIngredients: RecipeIngredient[];
}

const RecipeTable: React.FC = async () => {
  // Call getRecipe without parameters to get all recipes
  const recipes: Recipe[] = await getRecipe();
  
  // Debug: Log the recipes data
  console.log('=== RECIPE DEBUG INFO ===');
  console.log('Fetched recipes:', recipes);
  console.log('Number of recipes:', recipes.length);
  
  // Debug: Check each recipe in detail
  recipes.forEach((recipe, index) => {
    console.log(`\nRecipe ${index + 1}:`);
    console.log(`  ID: "${recipe.id}"`);
    console.log(`  Name: "${recipe.name}"`);
    console.log(`  Name Length: ${recipe.name.length}`);
    console.log(`  Created: ${recipe.createdAt}`);
    console.log(`  Updated: ${recipe.updatedAt}`);
    console.log(`  Ingredients Count: ${recipe.recipeIngredients.length}`);
    console.log(`  Characters:`, recipe.name.split('').map(c => `'${c}' (${c.charCodeAt(0)})`));
  });
  console.log('=== END DEBUG INFO ===');

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getIngredientCount = (recipeIngredients: RecipeIngredient[]): number => {
    return recipeIngredients.length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recipes</h2>
          <p className="text-gray-600 mt-1">Manage your recipe collection</p>
        </div>
        <CreateButton targetEntity="recipes" />
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
                  Name
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ingredients
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Created At
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Updated At
                </th>
                <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recipes.map((recipe, index) => (
                <tr
                  key={recipe.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-gray-900">
                      {recipe.name}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {getIngredientCount(recipe.recipeIngredients)} ingredients
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">
                      {formatDate(recipe.createdAt)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">
                      {formatDate(recipe.updatedAt)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center gap-2">
                      <EditButton id={recipe.id} entityType="recipes" />
                      <DeleteButton
                        id={recipe.id}
                        onDelete={deleteRecipe}
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
        {recipes.map((recipe, index) => (
          <div
            key={recipe.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {recipe.name}
                  </h3>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <EditButton id={recipe.id} entityType="recipes" />
                <DeleteButton
                  id={recipe.id}
                  onDelete={deleteRecipe}
                />
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingredients
                </dt>
                <dd>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {getIngredientCount(recipe.recipeIngredients)} ingredients
                  </span>
                </dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {formatDate(recipe.createdAt)}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated At
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {formatDate(recipe.updatedAt)}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {recipes.length === 0 && (
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No recipes found
          </h3>
          <p className="text-gray-500">
            Get started by creating your first recipe.
          </p>
        </div>
      )}
    </div>
  );
};

export default RecipeTable;