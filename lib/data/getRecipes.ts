import { prisma } from '@/lib/prisma';
import { Prisma } from '@/app/generated/prisma';

export const getRecipe = async (query?: string, offset?: number, limit?: number) => {
  try {
    const where: Prisma.RecipeWhereInput = query
      ? {
          OR: [
            { id: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {};

    const recipes = await prisma.recipe.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        recipeIngredients: true, // Include related recipe ingredients
      },
    });

    return recipes;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch recipes: ${error.message}`);
    } else {
      throw new Error('Failed to fetch recipes: Unknown error');
    }
  }
};

export async function getRecipeById(id: string) {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        recipeIngredients: true, // Include related recipe ingredients
      },
    });
    return recipe;
  } catch (error) {
    console.error(`Error fetching Recipe with ID ${id}:`, error);
    throw error;
  }
}