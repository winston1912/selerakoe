"use client";

import { useState, useTransition } from "react";
import { saveMultipleRecipeIngredients } from "@/lib/actions/recipeIngredientsAction";

interface Ingredient {
  id: string;
  name: string;
  price: number;
  measureUnit: string;
  baseAmount: number;
}

interface Recipe {
  id: string;
  name: string;
}

interface CreateRecipeIngredientFormProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
}

interface IngredientEntry {
  ingredientId: string;
  amount: number;
}

export default function CreateRecipeIngredientForm({
  recipes,
  ingredients,
}: CreateRecipeIngredientFormProps) {
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [ingredientEntries, setIngredientEntries] = useState<IngredientEntry[]>([
    { ingredientId: "", amount: 0 },
  ]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const addIngredientEntry = () => {
    setIngredientEntries([
      ...ingredientEntries,
      { ingredientId: "", amount: 0 },
    ]);
  };

  const removeIngredientEntry = (index: number) => {
    if (ingredientEntries.length > 1) {
      setIngredientEntries(ingredientEntries.filter((_, i) => i !== index));
    }
  };

  const updateIngredientEntry = (
    index: number,
    field: keyof IngredientEntry,
    value: string | number
  ) => {
    const updatedEntries = ingredientEntries.map((entry, i) =>
      i === index ? { ...entry, [field]: value } : entry
    );
    setIngredientEntries(updatedEntries);
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!selectedRecipeId) {
      newErrors.push("Please select a recipe");
    }

    ingredientEntries.forEach((entry, index) => {
      if (!entry.ingredientId) {
        newErrors.push(`Please select an ingredient for entry ${index + 1}`);
      }
      if (entry.amount <= 0) {
        newErrors.push(`Amount must be positive for entry ${index + 1}`);
      }
    });

    // Check for duplicate ingredients
    const ingredientIds = ingredientEntries
      .map((entry) => entry.ingredientId)
      .filter((id) => id !== "");
    const uniqueIds = new Set(ingredientIds);
    if (ingredientIds.length !== uniqueIds.size) {
      newErrors.push("Duplicate ingredients are not allowed");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("recipeId", selectedRecipeId);
      
      // Add ingredients to form data
      ingredientEntries.forEach((entry, index) => {
        if (entry.ingredientId && entry.amount > 0) {
          formData.append(`ingredients[${index}].ingredientId`, entry.ingredientId);
          formData.append(`ingredients[${index}].amount`, entry.amount.toString());
        }
      });

      const result = await saveMultipleRecipeIngredients(null, formData);
      
      if (result?.message || result?.Error) {
        if (result.Error) {
          // Handle validation errors
          const errorMessages = Object.values(result.Error).flat();
          setErrors(errorMessages);
        } else {
          setErrors([result.message]);
        }
      } else {
        // Success - form will redirect via the action
        setErrors([]);
      }
    });
  };

  const getSelectedIngredient = (ingredientId: string) => {
    return ingredients.find((ing) => ing.id === ingredientId);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Tambahkan bahan ke dalam resep
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipe Selection */}
        <div>
          <label htmlFor="recipe" className="block text-sm font-medium text-gray-700 mb-2">
            Pilih resep
          </label>
          <select
            id="recipe"
            value={selectedRecipeId}
            onChange={(e) => setSelectedRecipeId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Pilih resep...</option>
            {recipes.map((recipe) => (
              <option key={recipe.id} value={recipe.id}>
                {recipe.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ingredients Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Bahan
            </label>
            <button
              type="button"
              onClick={addIngredientEntry}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              + Tambahkan bahan
            </button>
          </div>

          <div className="space-y-4">
            {ingredientEntries.map((entry, index) => {
              const selectedIngredient = getSelectedIngredient(entry.ingredientId);
              
              return (
                <div key={index} className="flex gap-3 items-end p-4 border border-gray-200 rounded-md">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Ingredient
                    </label>
                    <select
                      value={entry.ingredientId}
                      onChange={(e) =>
                        updateIngredientEntry(index, "ingredientId", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Pilih bahan...</option>
                      {ingredients.map((ingredient) => (
                        <option key={ingredient.id} value={ingredient.id}>
                          {ingredient.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-32">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Jumlah {selectedIngredient ? `(${selectedIngredient.measureUnit})` : ''}
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      min="0.000001"
                      value={entry.amount || ""}
                      onChange={(e) =>
                        updateIngredientEntry(index, "amount", parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      required
                    />
                  </div>

                  {ingredientEntries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredientEntry(index)}
                      className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800 font-medium mb-2">Harap perbaiki kesalahan berikut:</div>
            <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className={`w-full px-5 py-3 bg-blue-700 text-white font-medium rounded-sm text-sm text-center hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isPending ? "opacity-50 cursor-progress" : ""
          }`}
        >
          {isPending ? "Adding Ingredients..." : "Add Ingredients to Recipe"}
        </button>
      </form>
    </div>
  );
}