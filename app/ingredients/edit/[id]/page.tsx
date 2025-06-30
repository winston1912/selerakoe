import { EditIngredientForm } from "@/components/editForm/editIngredientForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface EditIngredientPageProps {
  params: {
    id: string;
  };
}

export default async function EditIngredientPage({ params }: EditIngredientPageProps) {
  const ingredient = await prisma.ingredient.findUnique({
    where: { id: params.id },
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