import React from 'react';
import { cn } from './Button';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-neutral-300", className)}
      {...props}
    />
  );
}
