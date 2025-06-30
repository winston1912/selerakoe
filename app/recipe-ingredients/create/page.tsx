import React from 'react';
import CreateRecipeIngredientForm from '@/components/createForm/createRecipeIngredientForm';
import { getRecipe } from '@/lib/data/getRecipes';
import { getIngredient } from '@/lib/data/getIngredients';

const CreateRecipeIngredientPage = async () => {
  // Fetch both recipes and ingredients for the form dropdowns
  const [recipes, ingredients] = await Promise.all([
    getRecipe(),
    getIngredient()
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <CreateRecipeIngredientForm 
        recipes={recipes} 
        ingredients={ingredients} 
      />
    </div>
  );
};

export default CreateRecipeIngredientPage;