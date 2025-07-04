import RecipeIngredientTable from '@/components/table/recipeIngredientsTable'
import React from 'react'

export const dynamic = 'force-dynamic';

const page = () => {
  return (
    <div>
      <RecipeIngredientTable />
    </div>
  )
}

export default page
