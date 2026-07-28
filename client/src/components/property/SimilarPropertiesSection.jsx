import React from 'react';
import { useSimilarProperties } from '../../hooks/useApi';
import { PropertyGridCard } from './PropertyGridCard';
import { Sparkles } from 'lucide-react';

export const SimilarPropertiesSection = ({ propertyId }) => {
  const { data: similarRes, isLoading } = useSimilarProperties(propertyId);
  const similarList = similarRes?.data || similarRes || [];

  if (isLoading || !similarList || similarList.length === 0) return null;

  return (
    <div className="space-y-4 my-8">
      <div className="flex items-center space-x-2">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h2 className="text-xl font-heading font-bold">Similar Properties You Might Like</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {similarList.map((item, idx) => (
          <PropertyGridCard key={item.id || idx} item={item} />
        ))}
      </div>
    </div>
  );
};
