import { EditIngredientForm } from "@/components/editForm/editIngredientForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

// Define the interface for the resolved params
interface Params {
  id: string;
}

// Update the props interface to handle Promise
interface EditIngredientPageProps {
  params: Promise<Params>;
}

export default async function EditIngredientPage({ params }: EditIngredientPageProps) {
  // Await the params to resolve the Promise
  const { id } = await params;

  const ingredient = await prisma.ingredient.findUnique({
    where: { id },
  });

  if (!ingredient) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EditIngredientForm ingredient={ingredient} />
    </div>
  );
}