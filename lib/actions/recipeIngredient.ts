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
    await prisma.recipeIngredient.create({
      data: {
        recipeId: validatedFields.data.recipeId,
        ingredientId: validatedFields.data.ingredientId,
        amount: validatedFields.data.amount,
      },
    });
  } catch (error) {
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { message: "This ingredient is already added to the recipe" };
    }
    return { message: "Failed to add ingredient to recipe" };
  }

  revalidatePath("/recipes");
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
    await prisma.recipeIngredient.update({
      data: {
        recipeId: validatedFields.data.recipeId,
        ingredientId: validatedFields.data.ingredientId,
        amount: validatedFields.data.amount,
      },
      where: { id },
    });
  } catch (error) {
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { message: "This ingredient is already added to the recipe" };
    }
    return { message: "Failed to update recipe ingredient" };
  }

  revalidatePath("/recipes");
  redirect("/recipes");
};

export const deleteRecipeIngredient = async (id: string) => {
  try {
    await prisma.recipeIngredient.delete({
      where: { id },
    });
  } catch (error) {
    return { message: "Failed to remove ingredient from recipe" };
  }

  revalidatePath("/recipes");
};

// Additional utility function to remove ingredient from recipe by recipeId and ingredientId
export const removeIngredientFromRecipe = async (
  recipeId: string,
  ingredientId: string
) => {
  try {
    await prisma.recipeIngredient.delete({
      where: {
        recipeId_ingredientId: {
          recipeId,
          ingredientId,
        },
      },
    });
  } catch (error) {
    return { message: "Failed to remove ingredient from recipe" };
  }

  revalidatePath("/recipes");
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

  try {
    await prisma.recipeIngredient.update({
      data: { amount },
      where: {
        recipeId_ingredientId: {
          recipeId,
          ingredientId,
        },
      },
    });
  } catch (error) {
    return { message: "Failed to update ingredient amount" };
  }

  revalidatePath("/recipes");
};