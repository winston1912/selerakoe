"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Define the validation schema for a form that submits multiple ingredients at once.
const IngredientsForRecipeSchema = z.object({
  recipeId: z.string().min(1, { message: "Recipe ID is missing." }),
  // Expect an array of ingredient objects.
  ingredients: z
    .array(
      z.object({
        ingredientId: z
          .string()
          .min(1, { message: "An ingredient must be selected." }),
        amount: z
          .coerce // Coerce converts the string from the form to a number
          .number()
          .positive({ message: "Amount must be a positive number." }),
      })
    )
    .min(1, { message: "At least one ingredient is required." }), // The array cannot be empty
});

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

/**
 * Server Action to save multiple ingredients to a recipe in a single transaction.
 */
export const saveRecipeWithIngredients = async (
  prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  // --- 1. Manually parse the FormData into a nested object ---
  const ingredients: { ingredientId: string; amount: string }[] = [];
  // Loop through all entries in the FormData
  for (const [key, value] of formData.entries()) {
    // Use a regex to find keys matching the pattern "ingredients[index].fieldName"
    const match = key.match(/ingredients\[(\d+)\]\.(ingredientId|amount)/);
    if (match) {
      const index = parseInt(match[1], 10);
      const field = match[2] as "ingredientId" | "amount";
      
      // Ensure the array is large enough to hold the object at the found index
      ingredients[index] = ingredients[index] || { ingredientId: "", amount: "" };
      ingredients[index][field] = value as string;
    }
  }

  const rawData = {
    recipeId: formData.get("recipeId"),
    // Filter out any empty rows that might have been created
    ingredients: ingredients.filter(ing => ing && (ing.ingredientId || ing.amount)),
  };

  // --- 2. Validate the parsed data using Zod ---
  const validatedFields = IngredientsForRecipeSchema.safeParse(rawData);

  if (!validatedFields.success) {
    // If validation fails, return the flattened errors to the form.
    return {
      message: "Validation failed. Please check the fields.",
      errors: validatedFields.error.flatten().fieldErrors as FormState["errors"],
    };
  }

  const { recipeId, ingredients: ingredientData } = validatedFields.data;

  // --- 3. Perform pre-database business logic checks ---
  const ingredientIds = new Set();
  for (const ingredient of ingredientData) {
    if (ingredientIds.has(ingredient.ingredientId)) {
      // Return an error if the user tries to add the same ingredient twice in one form.
      return { message: "Cannot add the same ingredient multiple times." };
    }
    ingredientIds.add(ingredient.ingredientId);
  }

  // --- 4. Interact with the database ---
  try {
    // Use `createMany` to insert all records in a single, efficient database call.
    await prisma.recipeIngredient.createMany({
      data: ingredientData.map((ingredient) => ({
        recipeId: recipeId,
        ingredientId: ingredient.ingredientId,
        amount: ingredient.amount,
      })),
    });
  } catch (error: any) {
    // Handle specific Prisma error for unique constraint violation (error code P2002)
    if (error.code === 'P2002') {
      return { message: "Error: One or more of these ingredients are already in the recipe." };
    }
    // Handle other potential database errors
    return { message: "Database Error: Failed to add ingredients." };
  }

  // --- 5. Revalidate cache and redirect on success ---
  revalidatePath(`/recipes/${recipeId}`); // Invalidate the cache for the recipe page
  revalidatePath("/recipes"); // Invalidate the cache for the recipes list page
  redirect(`/recipes/${recipeId}`); // Redirect the user to the recipe page
};