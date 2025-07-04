"use server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const RecipeIngredientSchema = z.object({
  recipeId: z.string().min(1, "Recipe ID is required"),
  ingredientId: z.string().min(1, "Ingredient ID is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
});

const MultipleRecipeIngredientsSchema = z.object({
  recipeId: z.string().min(1, "Recipe ID is required"),
  ingredients: z.array(z.object({
    ingredientId: z.string().min(1, "Ingredient ID is required"),
    amount: z.coerce.number().positive("Amount must be positive"),
  })).min(1, "At least one ingredient is required"),
});

// Keep the original function for backward compatibility
export const saveRecipeIngredient = async (prevState: any, formData: FormData) => {
  const validatedFields = RecipeIngredientSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      Error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await prisma.recipeIngredient.create({
      data: {
        recipeId: validatedFields.data.recipeId,
        ingredientId: validatedFields.data.ingredientId,
        amount: validatedFields.data.amount,
      },
    });
    console.log('Recipe ingredient created successfully:', result);
  } catch (error) {
    console.error('Error creating recipe ingredient:', error);
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { message: "This ingredient is already added to the recipe" };
    }
    return { message: "Failed to add ingredient to recipe" };
  }

  // Revalidate all relevant paths
  revalidatePath("/recipes");
  revalidatePath("/recipe-ingredients");
  revalidatePath("/");
  redirect("/recipes");
};

// New function to handle multiple ingredients
export const saveMultipleRecipeIngredients = async (prevState: any, formData: FormData) => {
  const recipeId = formData.get("recipeId") as string;
  
  // Extract ingredients from form data
  const ingredients = [];
  let index = 0;
  
  while (formData.has(`ingredients[${index}].ingredientId`)) {
    const ingredientId = formData.get(`ingredients[${index}].ingredientId`) as string;
    const amount = formData.get(`ingredients[${index}].amount`) as string;
    
    if (ingredientId && amount) {
      ingredients.push({
        ingredientId,
        amount: parseFloat(amount),
      });
    }
    index++;
  }

  const validatedFields = MultipleRecipeIngredientsSchema.safeParse({
    recipeId,
    ingredients,
  });

  if (!validatedFields.success) {
    return {
      Error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // Use a transaction to ensure all ingredients are saved together
    const result = await prisma.$transaction(async (prisma) => {
      const createdIngredients = [];
      for (const ingredient of validatedFields.data.ingredients) {
        const created = await prisma.recipeIngredient.create({
          data: {
            recipeId: validatedFields.data.recipeId,
            ingredientId: ingredient.ingredientId,
            amount: ingredient.amount,
          },
        });
        createdIngredients.push(created);
      }
      return createdIngredients;
    });
    console.log('Multiple recipe ingredients created successfully:', result);
  } catch (error) {
    console.error('Error creating multiple recipe ingredients:', error);
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { message: "One or more ingredients are already added to this recipe" };
    }
    return { message: "Failed to add ingredients to recipe" };
  }

  // Revalidate all relevant paths
  revalidatePath("/recipes");
  revalidatePath("/recipe-ingredients");
  revalidatePath("/");
  redirect("/recipes");
};

export const updateRecipeIngredient = async (
  id: string,
  prevState: any,
  formData: FormData
) => {
  const validatedFields = RecipeIngredientSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      Error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await prisma.recipeIngredient.update({
      data: {
        recipeId: validatedFields.data.recipeId,
        ingredientId: validatedFields.data.ingredientId,
        amount: validatedFields.data.amount,
      },
      where: { id },
    });
    console.log('Recipe ingredient updated successfully:', result);
  } catch (error) {
    console.error('Error updating recipe ingredient:', error);
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { message: "This ingredient is already added to the recipe" };
    }
    return { message: "Failed to update recipe ingredient" };
  }

  // Revalidate all relevant paths
  revalidatePath("/recipes");
  revalidatePath("/recipe-ingredients");
  revalidatePath("/");
  redirect("/recipes");
};

export const deleteRecipeIngredient = async (id: string): Promise<{ message: string; } | undefined> => {
  console.log('Attempting to delete recipe ingredient with ID:', id);
  
  try {
    const result = await prisma.recipeIngredient.delete({
      where: { id },
    });
    console.log('Recipe ingredient deleted successfully:', result);
    
    // Revalidate all relevant paths
    revalidatePath("/recipes");
    revalidatePath("/recipe-ingredients");
    revalidatePath("/");
    
    return undefined; // Success case - return undefined
  } catch (error) {
    console.error('Error deleting recipe ingredient:', error);
    return { message: "Failed to remove ingredient from recipe" };
  }
};

// Additional utility function to remove ingredient from recipe by recipeId and ingredientId
export const removeIngredientFromRecipe = async (
  recipeId: string,
  ingredientId: string
) => {
  console.log('Attempting to remove ingredient from recipe:', { recipeId, ingredientId });
  
  try {
    const result = await prisma.recipeIngredient.delete({
      where: {
        recipeId_ingredientId: {
          recipeId,
          ingredientId,
        },
      },
    });
    console.log('Ingredient removed from recipe successfully:', result);
    
    // Revalidate all relevant paths
    revalidatePath("/recipes");
    revalidatePath("/recipe-ingredients");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error('Error removing ingredient from recipe:', error);
    return { message: "Failed to remove ingredient from recipe" };
  }
};

// Utility function to update just the amount for an existing recipe ingredient
export const updateRecipeIngredientAmount = async (
  recipeId: string,
  ingredientId: string,
  amount: number
) => {
  if (amount <= 0) {
    return { message: "Amount must be positive" };
  }

  console.log('Attempting to update recipe ingredient amount:', { recipeId, ingredientId, amount });

  try {
    const result = await prisma.recipeIngredient.update({
      data: { amount },
      where: {
        recipeId_ingredientId: {
          recipeId,
          ingredientId,
        },
      },
    });
    console.log('Recipe ingredient amount updated successfully:', result);
    
    // Revalidate all relevant paths
    revalidatePath("/recipes");
    revalidatePath("/recipe-ingredients");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error('Error updating ingredient amount:', error);
    return { message: "Failed to update ingredient amount" };
  }
};