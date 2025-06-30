"use client";

import { useActionState } from "react";
import { updateIngredient } from "@/lib/actions/ingredientsAction";
import { SubmitButton } from "@/components/button";

// It's good practice to define the shape of the initial state.
interface FormState {
  Error?: {
    name?: string[];
    price?: string[];
    measureUnit?: string[];
    baseAmount?: string[];
  };
  message?: string;
}

const initialState: FormState = {
  Error: {},
};

// Define the shape of the Ingredient prop
interface Ingredient {
  id: string;
  name: string;
  price: number;
  measureUnit: string;
  baseAmount: number;
}

interface EditIngredientFormProps {
  ingredient: Ingredient;
}

export const EditIngredientForm = ({ ingredient }: EditIngredientFormProps) => {
  // Bind the ingredient id to the updateIngredient action
  const updateIngredientWithId = updateIngredient.bind(null, ingredient.id);
  const [state, formAction] = useActionState(updateIngredientWithId, initialState);

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Ingredient</h2>

      <form action={formAction} className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={ingredient.name}
            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter ingredient name"
          />
          {state?.Error?.name && (
            <p className="mt-1 text-sm text-red-600">{state.Error.name[0]}</p>
          )}
        </div>

        {/* Price Field */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            step="0.01"
            defaultValue={ingredient.price}
            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter price"
          />
          {state?.Error?.price && (
            <p className="mt-1 text-sm text-red-600">{state.Error.price[0]}</p>
          )}
        </div>

        {/* Measure Unit Field */}
        <div>
          <label htmlFor="measureUnit" className="block text-sm font-medium text-gray-700 mb-1">
            Measure Unit
          </label>
          <input
            type="text"
            id="measureUnit"
            name="measureUnit"
            defaultValue={ingredient.measureUnit}
            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., kg, lbs, cups"
          />
          {state?.Error?.measureUnit && (
            <p className="mt-1 text-sm text-red-600">{state.Error.measureUnit[0]}</p>
          )}
        </div>

        {/* Base Amount Field */}
        <div>
          <label htmlFor="baseAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Base Amount
          </label>
          <input
            type="number"
            id="baseAmount"
            name="baseAmount"
            step="0.01"
            defaultValue={ingredient.baseAmount}
            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter base amount"
          />
          {state?.Error?.baseAmount && (
            <p className="mt-1 text-sm text-red-600">{state.Error.baseAmount[0]}</p>
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
          <SubmitButton label="Update Ingredient" />
        </div>
      </form>
    </div>
  );
};