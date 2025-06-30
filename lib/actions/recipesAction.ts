"use server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const RecipeSchema = z.object({
  name: z.string().min(1, "Recipe name is required"),
});

export const saveRecipe = async (prevState: any, formData: FormData) => {
  const validatedFields = RecipeSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      Error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.recipe.create({
      data: {
        name: validatedFields.data.name,
      },
    });
  } catch (error) {
    return { message: "Failed to create recipe" };
  }

  revalidatePath("/recipes");
  redirect("/recipes");
};

export const updateRecipe = async (
  id: string,
  prevState: any,
  formData: FormData
) => {
  const validatedFields = RecipeSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      Error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.recipe.update({
      data: {
        name: validatedFields.data.name,
      },
      where: { id },
    });
  } catch (error) {
    return { message: "Failed to update recipe" };
  }

  revalidatePath("/recipes");
  redirect("/recipes");
};

export const deleteRecipe = async (id: string) => {
  try {
    await prisma.recipe.delete({
      where: { id },
    });
  } catch (error) {
    return { message: "Failed to delete recipe" };
  }

  revalidatePath("/recipes");
};