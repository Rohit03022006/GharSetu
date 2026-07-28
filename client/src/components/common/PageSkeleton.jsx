import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const PageSkeleton = () => {
  return (
    <div className="p-6 md:p-10 space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-72 rounded-xl bg-accent/40" />
        <Skeleton className="h-4 w-96 rounded-lg bg-accent/30" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-28 rounded-2xl bg-accent/30" />
        <Skeleton className="h-28 rounded-2xl bg-accent/30" />
        <Skeleton className="h-28 rounded-2xl bg-accent/30" />
        <Skeleton className="h-28 rounded-2xl bg-accent/30" />
      </div>

      {/* Main Content Card Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-96 lg:col-span-2 rounded-2xl bg-accent/30" />
        <Skeleton className="h-96 lg:col-span-1 rounded-2xl bg-accent/30" />
      </div>
    </div>
  );
};
