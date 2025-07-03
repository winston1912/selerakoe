"use server";

import { prisma } from "@/lib/prisma"; // Adjust the import path according to your setup

export type ARRCalculationResult = {
  recipeId: string;
  recipeName: string;
  baseIngredient: {
    id: string;
    name: string;
    originalAmount: number;
    newAmount: number;
    measureUnit: string;
  };
  adjustedIngredients: Array<{
    id: string;
    name: string;
    originalAmount: number;
    adjustedAmount: number;
    measureUnit: string;
  }>;
  scalingFactor: number;
};

export async function calculateARR(
  recipeId: string,
  baseIngredientId: string,
  newAmount: number
): Promise<ARRCalculationResult | null> {
  try {
    // Get the recipe with all its ingredients via the junction table
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        recipeIngredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!recipe) {
      throw new Error("Recipe not found");
    }

    if (recipe.recipeIngredients.length === 0) {
      throw new Error("Recipe has no ingredients");
    }

    // Find the base ingredient in the recipe (from junction table)
    const baseRecipeIngredient = recipe.recipeIngredients.find(
      (ri) => ri.ingredientId === baseIngredientId
    );

    if (!baseRecipeIngredient) {
      throw new Error("Base ingredient not found in recipe");
    }

    // Calculate the scaling factor based on the amount stored in junction table
    const originalAmount = baseRecipeIngredient.amount; // This comes from RecipeIngredient.amount
    const scalingFactor = newAmount / originalAmount;

    // Calculate adjusted amounts for all other ingredients
    const adjustedIngredients = recipe.recipeIngredients
      .filter((ri) => ri.ingredientId !== baseIngredientId)
      .map((ri) => ({
        id: ri.ingredient.id,
        name: ri.ingredient.name,
        originalAmount: ri.amount, // From RecipeIngredient.amount
        adjustedAmount: ri.amount * scalingFactor, // Scale the junction table amount
        measureUnit: ri.ingredient.measureUnit, // From Ingredient.measureUnit
      }));

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      baseIngredient: {
        id: baseRecipeIngredient.ingredient.id,
        name: baseRecipeIngredient.ingredient.name,
        originalAmount: originalAmount, // From RecipeIngredient.amount
        newAmount: newAmount,
        measureUnit: baseRecipeIngredient.ingredient.measureUnit, // From Ingredient.measureUnit
      },
      adjustedIngredients,
      scalingFactor,
    };
  } catch (error) {
    console.error("Error calculating ARR:", error);
    return null;
  }
}

export async function getRecipeWithIngredients(recipeId: string) {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        recipeIngredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    return recipe;
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return null;
  }
}

export async function getAllRecipes() {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        recipeIngredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    return recipes;
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
}