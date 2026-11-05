import React from 'react';
import { Skeleton } from './Skeleton';

export const PropertyCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-300 overflow-hidden">
      <Skeleton className="w-full aspect-video rounded-none" />
      <div className="p-5">
        <Skeleton className="h-5 w-20 mb-3" />
        <Skeleton className="h-7 w-3/4 mb-2" />
        <Skeleton className="h-8 w-1/2 mb-3" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <div className="flex items-center gap-4 pt-4 border-t border-neutral-100">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  );
};
