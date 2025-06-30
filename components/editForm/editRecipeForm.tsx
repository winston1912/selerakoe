"use client";
import { useActionState } from "react";
import { updateRecipe } from "@/lib/actions/recipesAction";
import { SubmitButton } from "@/components/button";

const initialState = {
  Error: {},
};

interface Recipe {
  id: string;
  name: string;
}

interface EditRecipeFormProps {
  recipe: Recipe;
}

export const EditRecipeForm = ({ recipe }: EditRecipeFormProps) => {
  // Bind the recipe id to the updateRecipe action
  const updateRecipeWithId = updateRecipe.bind(null, recipe.id);
  const [state, formAction] = useActionState(updateRecipeWithId, initialState);

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Recipe</h2>
      
      <form action={formAction} className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Recipe Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={recipe.name}
            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter recipe name"
          />
          {state?.Error?.name && (
            <p className="mt-1 text-sm text-red-600">{state.Error.name[0]}</p>
          )}
        </div>

        {/* General Error Message */}
        {state?.message && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-sm border border-red-200">
            {state.message}
          </p>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <SubmitButton label="Update Recipe" />
        </div>
      </form>
    </div>
  );
};