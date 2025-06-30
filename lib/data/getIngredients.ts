import { prisma } from '@/lib/prisma';
import { Prisma } from '@/app/generated/prisma';

export const getIngredient = async (query?: string, offset?: number, limit?: number) => {
  try {
    const where: Prisma.IngredientWhereInput = query
      ? {
          OR: [
            { id: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
            { measureUnit: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {};

    const ingredients = await prisma.ingredient.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        recipeIngredients: true, // Include related recipe ingredients
      },
    });

    return ingredients;
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch ingredients: ${error.message}`);
    } else {
      throw new Error('Failed to fetch ingredients: Unknown error');
    }
  }
};

export async function getIngredientById(id: string) {
  try {
    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
      include: {
        recipeIngredients: true, // Include related recipe ingredients
      },
    });
    return ingredient;
  } catch (error) {
    console.error(`Error fetching Ingredient with ID ${id}:`, error);
    throw error;
  }
}