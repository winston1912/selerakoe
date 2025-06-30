"use server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const IngredientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().positive("Price must be positive"),
  measureUnit: z.string().min(1, "Measure unit is required"),
  baseAmount: z.coerce.number().positive("Base amount must be positive"),
});

export const saveIngredient = async (prevState: any, formData: FormData) => {
  const validatedFields = IngredientSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      Error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.ingredient.create({
      data: {
        name: validatedFields.data.name,
        price: validatedFields.data.price,
        measureUnit: validatedFields.data.measureUnit,
        baseAmount: validatedFields.data.baseAmount,
      },
    });
  } catch (error) {
    return { message: "Failed to create ingredient" };
  }

  revalidatePath("/ingredients");
  redirect("/ingredients");
};

export const updateIngredient = async (
  id: string,
  prevState: any,
  formData: FormData
) => {
  const validatedFields = IngredientSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      Error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.ingredient.update({
      data: {
        name: validatedFields.data.name,
        price: validatedFields.data.price,
        measureUnit: validatedFields.data.measureUnit,
        baseAmount: validatedFields.data.baseAmount,
      },
      where: { id },
    });
  } catch (error) {
    return { message: "Failed to update ingredient" };
  }

  revalidatePath("/ingredients");
  redirect("/ingredients");
};

export const deleteIngredient = async (id: string) => {
  try {
    // Optional: Check if ingredient is used in any recipes
    const usageCount = await prisma.recipeIngredient.count({
      where: { ingredientId: id }
    });
    
    if (usageCount > 0) {
      return { 
        message: `Cannot delete ingredient. It is used in ${usageCount} recipe(s).` 
      };
    }

    await prisma.ingredient.delete({
      where: { id },
    });
  } catch (error) {
    return { message: "Failed to delete ingredient" };
  }

  revalidatePath("/ingredients");
};