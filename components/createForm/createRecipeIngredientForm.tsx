"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveRecipeWithIngredients } from "@/lib/actions/recipeIngredient";

// A simple submit button component that shows a pending state while the action is running.
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400"
    >
      {pending ? "Saving Ingredients..." : "Save All Ingredients"}
    </button>
  );
}

// Define the shape of the props the form will receive.
interface AddIngredientsFormProps {
  recipeId: string;
  // This would be fetched from your database to populate the dropdown.
  allIngredients: {
    id: string;
    name: string;
  }[];
}

// Define the shape of a single ingredient field in our form's state.
interface FormIngredientField {
  key: number; // A unique key for React's list rendering
}

// Define the shape of the state object that will be passed between the server and client
type FormState = {
  message?: string | null;
  errors?: {
    recipeId?: string[];
    ingredients?: string[]; // For array-level errors
    // For errors on specific fields within the array
    [key: `ingredients.${number}.${string}`]: string[] | undefined;
  };
};

const initialState: FormState = {
  message: null,
  errors: {},
};

export const AddIngredientsForm = ({ recipeId, allIngredients }: AddIngredientsFormProps) => {
  const [state, formAction] = useActionState(saveRecipeWithIngredients, initialState);
  const [ingredientFields, setIngredientFields] = useState<FormIngredientField[]>([
    { key: Date.now() },
  ]);

  const addIngredientField = () => {
    setIngredientFields([...ingredientFields, { key: Date.now() }]);
  };

  const removeIngredientField = (keyToRemove: number) => {
    if (ingredientFields.length > 1) {
      setIngredientFields(ingredientFields.filter((field) => field.key !== keyToRemove));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Ingredients to Recipe</h2>
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="recipeId" value={recipeId} />

        {ingredientFields.map((field, index) => {
          // --- FIX STARTS HERE ---
          // Safely access potential errors and store them in variables.
          const ingredientIdError = state.errors?.[`ingredients.${index}.ingredientId`];
          const amountError = state.errors?.[`ingredients.${index}.amount`];
          // --- FIX ENDS HERE ---

          return (
            <div key={field.key} className="p-4 border rounded-md bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 space-y-4 sm:space-y-0">
                {/* Ingredient Selection */}
                <div className="flex-grow">
                  <label htmlFor={`ingredientId-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Ingredient
                  </label>
                  <select
                    id={`ingredientId-${index}`}
                    name={`ingredients[${index}].ingredientId`}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select an ingredient --</option>
                    {allIngredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>{ing.name}</option>
                    ))}
                  </select>
                  {/* Now we use the safe variable */}
                  {ingredientIdError && (
                    <p className="mt-1 text-sm text-red-600">{ingredientIdError[0]}</p>
                  )}
                </div>

                {/* Amount Input */}
                <div className="w-full sm:w-1/3">
                  <label htmlFor={`amount-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    id={`amount-${index}`}
                    name={`ingredients[${index}].amount`}
                    placeholder="e.g., 100"
                    step="0.01"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {/* And here as well */}
                  {amountError && (
                    <p className="mt-1 text-sm text-red-600">{amountError[0]}</p>
                  )}
                </div>

                {ingredientFields.length > 1 && (
                  <div className="flex-shrink-0 pt-0 sm:pt-6">
                    <button
                      type="button"
                      onClick={() => removeIngredientField(field.key)}
                      className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {state.errors?.ingredients && (
            <p className="mt-1 text-sm text-red-600">{state.errors.ingredients[0]}</p>
        )}
        {state.message && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
            {state.message}
          </p>
        )}

        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={addIngredientField}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none"
          >
            + Add Another Ingredient
          </button>
          <div className="w-1/3">
            <SubmitButton />
          </div>
        </div>
      </form>
    </div>
  );
};