import React from 'react';
import { getIngredient } from '@/lib/data/getIngredients';
import { CreateButton, DeleteButton, EditButton } from '../button';
import { deleteIngredient } from '@/lib/actions/ingredientsAction';

// Type definitions
interface Ingredient {
  id: string;
  name: string;
  price: number;
  baseAmount: number;
  measureUnit: string;
}

const IngredientTable: React.FC = async () => {
  const ingredients: Ingredient[] = await getIngredient();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculatePricePerUnit = (price: number, baseAmount: number): string => {
    return formatCurrency(price / baseAmount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ingredients</h2>
          <p className="text-gray-600 mt-1">Manage your ingredient inventory</p>
        </div>
        <CreateButton targetEntity="ingredients" />
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  #
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Base Amount
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Unit
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Price per Unit
                </th>
                <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ingredients.map((ingredient, index) => (
                <tr
                  key={ingredient.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-gray-900">
                      {ingredient.name}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900 font-medium">
                      {formatCurrency(ingredient.price)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">
                      {ingredient.baseAmount}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {ingredient.measureUnit}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900 font-medium">
                      {calculatePricePerUnit(ingredient.price, ingredient.baseAmount)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center gap-2">
                      <EditButton id={ingredient.id} entityType="ingredients" />
                      <DeleteButton
                        id={ingredient.id}
                        onDelete={deleteIngredient}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {ingredients.map((ingredient, index) => (
          <div
            key={ingredient.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {ingredient.name}
                  </h3>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <EditButton id={ingredient.id} entityType="ingredients" />
                <DeleteButton
                  id={ingredient.id}
                  onDelete={deleteIngredient}
                />
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </dt>
                <dd className="text-sm font-semibold text-gray-900">
                  {formatCurrency(ingredient.price)}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Amount
                </dt>
                <dd className="text-sm text-gray-900">
                  {ingredient.baseAmount}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </dt>
                <dd>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {ingredient.measureUnit}
                  </span>
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price per Unit
                </dt>
                <dd className="text-sm font-semibold text-gray-900">
                  {calculatePricePerUnit(ingredient.price, ingredient.baseAmount)}
                </dd>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {ingredients.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No ingredients found
          </h3>
        </div>
      )}
    </div>
  );
};

export default IngredientTable;