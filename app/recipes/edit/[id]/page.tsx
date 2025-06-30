import { EditRecipeForm } from "@/components/editForm/editRecipeForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

// Define the interface for the resolved params
interface Params {
  id: string;
}

// Update the props interface to handle Promise
interface EditRecipePageProps {
  params: Promise<Params>;
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  // Await the params to resolve the Promise
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
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