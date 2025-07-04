import { prisma } from '@/lib/prisma';
import { Prisma } from '@/app/generated/prisma';
import { unstable_noStore as noStore } from 'next/cache';

export const getRecipeIngredients = async (query?: string, offset?: number, limit?: number) => {
  // Prevent caching to ensure fresh data
  noStore();
  
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

    const queryOptions: any = {
      where,
      orderBy: { recipe: { name: 'asc' } },
      include: {
        recipe: true,
        ingredient: true,
      },
    };

    // Only add skip/take if they are defined and valid
    if (offset !== undefined && offset >= 0) {
      queryOptions.skip = offset;
    }
    if (limit !== undefined && limit > 0) {
      queryOptions.take = limit;
    }

    const recipeIngredients = await prisma.recipeIngredient.findMany(queryOptions);

    console.log('Database query result:', recipeIngredients.length, 'recipe ingredients found');
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

// Alternative function to get all recipe ingredients without parameters
export const getAllRecipeIngredients = async () => {
  // Prevent caching to ensure fresh data
  noStore();
  
  try {
    const recipeIngredients = await prisma.recipeIngredient.findMany({
      orderBy: { recipe: { name: 'asc' } },
      include: {
        recipe: true,
        ingredient: true,
      },
    });

    console.log('All recipe ingredients fetched:', recipeIngredients.length);
    return recipeIngredients;
  } catch (error) {
    console.error('Error fetching all recipe ingredients:', error);
    throw new Error('Failed to fetch recipe ingredients');
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