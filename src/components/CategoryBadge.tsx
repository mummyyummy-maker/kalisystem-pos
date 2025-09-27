import React from 'react';
import { categories } from '../data/categories';

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className = '' }) => {
  const categoryData = categories.find(cat => cat.name === category);
  
  if (!categoryData) {
    return (
      <span className={`px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-700 ${className}`}>
        {category}
      </span>
    );
  }

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs text-white font-medium flex items-center gap-1 ${className}`}
      style={{ backgroundColor: categoryData.color }}
    >
      <span>{categoryData.icon}</span>
      <span>{categoryData.name}</span>
    </span>
  );
};

export default CategoryBadge;