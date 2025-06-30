'use client';

import Link from 'next/link';
import { FaEdit, FaTrash, FaPlus, FaSpinner } from 'react-icons/fa';
import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';

interface ButtonProps {
  id: string;
}

interface CreateButtonProps {
  targetEntity: string; // Prop to specify the entity (e.g., "recipes", "ingredients", "recipe-ingredients")
}

interface EditButtonProps {
  id: string;
  entityType: string; // e.g., 'recipes', 'ingredients', 'recipe-ingredients'
}

interface DeleteButtonProps {
  id: string;
  onDelete: (id: string) => Promise<{ message: string; } | undefined | void>;
}

export const EditButton: React.FC<EditButtonProps> = ({ id, entityType }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await router.push(`/${entityType}/edit/${id}`);
    setIsLoading(false);
  };

  return (
    <Link
      href={`/${entityType}/edit/${id}`}
      onClick={handleClick}
      className={`bg-white hover:bg-grey text-black font-bold py-1 px-2 md:py-2 md:px-4 rounded inline-flex items-center text-sm ${
        isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isLoading ? (
        <span className="animate-spin mr-1 md:mr-2">↻</span>
      ) : (
        <FaEdit className="mr-1 md:mr-2" />
      )}
      <span className="hidden md:inline">{isLoading ? 'Loading...' : 'Edit'}</span>
    </Link>
  );
};

export const DeleteButton: React.FC<DeleteButtonProps> = ({ id, onDelete }) => {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      startTransition(async () => {
        try {
          const result = await onDelete(id);
          // Handle the result if needed
          if (result && result.message) {
            console.log(result.message);
            // You could show a toast notification here
          }
        } catch (error) {
          console.error('Error deleting item:', error);
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className={`bg-white hover:bg-grey text-black font-bold py-1 px-2 md:py-2 md:px-4 rounded inline-flex items-center text-sm ${
        isPending ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <FaTrash className="mr-1 md:mr-2" />
      <span className="hidden md:inline">{isPending ? 'Deleting...' : 'Delete'}</span>
    </button>
  );
};

export const CreateButton: React.FC<CreateButtonProps> = ({ targetEntity }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Map entity names to display names
  const getDisplayName = (entity: string) => {
    switch (entity) {
      case 'recipes':
        return 'Recipe';
      case 'ingredients':
        return 'Ingredient';
      case 'recipe-ingredients':
        return 'Recipe Ingredient';
      default:
        return entity.charAt(0).toUpperCase() + entity.slice(1);
    }
  };

  const handleClick = async () => {
    setIsLoading(true);
    await router.push(`/${targetEntity}/create`); 
    // In a real scenario, you might want to handle potential navigation errors here
    setIsLoading(false); 
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center text-sm mb-4"
    >
      {isLoading ? (
        <FaSpinner className="animate-spin mr-2" /> // Loading spinner
      ) : (
        <FaPlus className="mr-2" /> // Plus icon
      )}
      <span>{isLoading ? "Creating..." : `Create new ${getDisplayName(targetEntity)}`}</span>
    </button>
  );
};

export const SubmitButton = ({ label }: { label: string }) => {
  const { pending } = useFormStatus();

  const className = "text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-sm text-sm w-full px-5 py-3 text-center" + 
    (pending ? " opacity-50 cursor-progress" : "");

  return (
    <button type="submit" className={className} disabled={pending}>
      <span>
        {pending ? `${label}ing...` : label}
      </span>
    </button>
  );
};

export default SubmitButton;