import { EditRecipeForm } from "@/components/editForm/editRecipeForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface EditRecipePageProps {
  params: {
    id: string;
  };
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: params.id },
  });

  if (!recipe) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EditRecipeForm recipe={recipe} />
    </div>
  );
}