import { prisma } from '@/lib/prisma';
import { Prisma } from '@/app/generated/prisma';

export const getRecipeIngredients = async (query?: string, offset?: number, limit?: number) => {
  try {
    const where: Prisma.RecipeIngredientWhereInput = query
      ? {
          OR: [
            { id: { contains: query, mode: 'insensitive' } },
            { recipeId: { contains: query, mode: 'insensitive' } },
            { ingredientId: { contains: query, mode: 'insensitive' } },
            { recipe: { name: { contains: query, mode: 'insensitive' } } },
            { ingredient: { name: { contains: query, mode: 'insensitive' } } },
          ],
        }
      : {};

    const recipeIngredients = await prisma.recipeIngredient.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { recipe: { name: 'asc' } },
      include: {
        recipe: true,
        ingredient: true,
      },
    });

    return recipeIngredients;
  } catch (error) {
    console.error('Error fetching recipe ingredients:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch recipe ingredients: ${error.message}`);
    } else {
      throw new Error('Failed to fetch recipe ingredients: Unknown error');
    }
  }
};

export async function getRecipeIngredientById(id: string) {
  try {
    const recipeIngredient = await prisma.recipeIngredient.findUnique({
      where: { id },
      include: {
        recipe: true,
        ingredient: true,
      },
    });
    return recipeIngredient;
  } catch (error) {
    console.error(`Error fetching RecipeIngredient with ID ${id}:`, error);
    throw error;
  }
}

export async function getRecipeIngredientsByRecipeId(recipeId: string) {
  try {
    const recipeIngredients = await prisma.recipeIngredient.findMany({
      where: { recipeId },
      include: {
        ingredient: true,
      },
      orderBy: { ingredient: { name: 'asc' } },
    });
    return recipeIngredients;
  } catch (error) {
    console.error(`Error fetching RecipeIngredients for Recipe ID ${recipeId}:`, error);
    throw error;
  }
}

export async function getRecipeIngredientsByIngredientId(ingredientId: string) {
  try {
    const recipeIngredients = await prisma.recipeIngredient.findMany({
      where: { ingredientId },
      include: {
        recipe: true,
      },
      orderBy: { recipe: { name: 'asc' } },
    });
    return recipeIngredients;
  } catch (error) {
    console.error(`Error fetching RecipeIngredients for Ingredient ID ${ingredientId}:`, error);
    throw error;
  }
}