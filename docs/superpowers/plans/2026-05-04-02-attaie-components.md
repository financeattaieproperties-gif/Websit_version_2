# Attaie Properties - Core Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Core UI components required for the Attaie Properties website, including base elements (Button, Badge), Domain specific cards (PropertyCard, ProjectCard), and Forms.
**Architecture:** React Server Components by default, with `"use client"` where interactivity (useState, event listeners) is required. Styling via Tailwind CSS v4. Lucide-React for icons.
**Tech Stack:** Next.js 15, React 19, Tailwind v4, lucide-react.

---

### Task 1: Base UI Components (Button, Badge, Skeleton)

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/Skeleton.tsx`

- [ ] **Step 1: Write Button component**
`src/components/ui/Button.tsx`:
```tsx
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-brand-gold text-white hover:scale-[1.02] hover:shadow-[0_4px_14px_rgba(184,148,74,0.4)]",
      secondary: "bg-brand-navy text-white hover:scale-[1.02]",
      outline: "border-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white",
      ghost: "bg-transparent text-brand-gold hover:bg-brand-gold/10"
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-base",
      lg: "h-14 px-8 text-lg"
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
```

- [ ] **Step 2: Write Badge component**
`src/components/ui/Badge.tsx`:
```tsx
import React from 'react';
import { cn } from './Button';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: 'available' | 'pending' | 'sold' | 'rented';
  type?: string;
}

export const Badge = ({ status, type, className, children, ...props }: BadgeProps) => {
  const statusColors = {
    available: "bg-status-available/10 text-status-available border-status-available/20",
    pending: "bg-status-pending/10 text-status-pending border-status-pending/20",
    sold: "bg-status-sold/10 text-status-sold border-status-sold/20",
    rented: "bg-status-rented/10 text-status-rented border-status-rented/20"
  };

  const baseStyle = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider";

  if (status) {
    return (
      <div className={cn(baseStyle, statusColors[status], className)} {...props}>
        {status}
      </div>
    );
  }

  // Type badge (neutral)
  return (
    <div className={cn(baseStyle, "bg-neutral-100 text-neutral-900 border-neutral-300", className)} {...props}>
      {type || children}
    </div>
  );
};
```

- [ ] **Step 3: Write Skeleton component**
`src/components/ui/Skeleton.tsx`:
```tsx
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
```

### Task 2: Domain Components (PropertyCard, ProjectCard)

**Files:**
- Create: `src/components/ui/PropertyCard.tsx`
- Create: `src/components/ui/ProjectCard.tsx`
- Create: `src/components/ui/PropertyCardSkeleton.tsx`

- [ ] **Step 1: Write PropertyCard**
`src/components/ui/PropertyCard.tsx`:
```tsx
import React from 'react';
import Image from 'next/image';
import { MapPin, Bed, Bath, Maximize2 } from 'lucide-react';
import { Badge } from './Badge';

export interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  beds?: number;
  baths?: number;
  area?: number;
  status: 'available' | 'pending' | 'sold' | 'rented';
  type: string;
  image: string;
}

export const PropertyCard = ({ id, title, price, location, beds, baths, area, status, type, image }: PropertyCardProps) => {
  return (
    <a href={`/properties/${id}`} className="group block bg-white rounded-xl shadow-sm border border-neutral-300 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:bg-brand-gold-lt/10">
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
        <Image src={image} alt={title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
        <div className="absolute top-4 right-4 z-10">
          <Badge status={status} className="bg-white/90 backdrop-blur-sm" />
        </div>
      </div>
      <div className="p-5">
        <Badge type={type} className="mb-3" />
        <h3 className="font-heading text-xl font-bold text-brand-navy mb-2 line-clamp-1">{title}</h3>
        <p className="text-2xl font-bold text-brand-gold mb-3">AED {price.toLocaleString()}</p>
        <div className="flex items-center text-neutral-500 mb-4 text-sm">
          <MapPin size={16} className="mr-1" />
          <span className="line-clamp-1">{location}</span>
        </div>
        <div className="flex items-center gap-4 pt-4 border-t border-neutral-100 text-neutral-700 text-sm">
          {beds !== undefined && (
            <div className="flex items-center gap-1"><Bed size={18} className="text-brand-gold" /> {beds} Beds</div>
          )}
          {baths !== undefined && (
            <div className="flex items-center gap-1"><Bath size={18} className="text-brand-gold" /> {baths} Baths</div>
          )}
          {area !== undefined && (
            <div className="flex items-center gap-1"><Maximize2 size={18} className="text-brand-gold" /> {area} m²</div>
          )}
        </div>
      </div>
    </a>
  );
};
```

- [ ] **Step 2: Write PropertyCardSkeleton**
`src/components/ui/PropertyCardSkeleton.tsx`:
```tsx
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
```

- [ ] **Step 3: Write ProjectCard**
`src/components/ui/ProjectCard.tsx`:
```tsx
import React from 'react';
import Image from 'next/image';
import { MapPin, Calendar, Home } from 'lucide-react';
import { Badge } from './Badge';

export interface ProjectCardProps {
  id: string;
  name: string;
  location: string;
  deliveryDate?: string;
  status: 'Under Construction' | 'Ready' | 'Sold Out';
  availableUnits?: number;
  image: string;
}

export const ProjectCard = ({ id, name, location, deliveryDate, status, availableUnits, image }: ProjectCardProps) => {
  const statusColor = status === 'Ready' ? 'available' : status === 'Sold Out' ? 'sold' : 'pending';

  return (
    <a href={`/projects/${id}`} className="group block bg-white rounded-xl shadow-sm border border-neutral-300 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
        <Image src={image} alt={name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
        <div className="absolute top-4 left-4 z-10">
          <Badge status={statusColor as any} className="bg-white/90 backdrop-blur-sm">
            {status}
          </Badge>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-heading text-xl font-bold text-brand-navy mb-2">{name}</h3>
        <div className="flex items-center text-neutral-500 mb-4 text-sm">
          <MapPin size={16} className="mr-1" />
          <span className="line-clamp-1">{location}</span>
        </div>
        <div className="flex flex-col gap-2 pt-4 border-t border-neutral-100">
          {deliveryDate && (
            <div className="flex items-center gap-2 text-neutral-700 text-sm">
              <Calendar size={16} className="text-brand-gold" />
              <span>Delivery: <span className="font-medium">{deliveryDate}</span></span>
            </div>
          )}
          {availableUnits !== undefined && (
            <div className="flex items-center gap-2 text-neutral-700 text-sm">
              <Home size={16} className="text-brand-gold" />
              <span><span className="font-bold text-brand-gold">{availableUnits}</span> Units Available</span>
            </div>
          )}
        </div>
      </div>
    </a>
  );
};
```

### Task 3: Form Components (SearchBar)

**Files:**
- Create: `src/components/forms/SearchBar.tsx`

- [ ] **Step 1: Write SearchBar component**
`src/components/forms/SearchBar.tsx`:
```tsx
"use client";

import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';

export const SearchBar = () => {
  const [purpose, setPurpose] = useState<'buy' | 'rent' | 'commercial'>('buy');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/properties?purpose=${purpose}&location=${encodeURIComponent(location)}`;
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-2">
      <div className="flex flex-col md:flex-row gap-2">
        {/* Purpose Toggle */}
        <div className="flex bg-neutral-100 rounded-xl p-1 md:w-auto w-full shrink-0">
          {(['buy', 'rent', 'commercial'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPurpose(p)}
              className={`flex-1 md:flex-none px-6 py-3 text-sm font-bold rounded-lg transition-colors capitalize ${
                purpose === p ? 'bg-white text-brand-gold shadow-sm' : 'text-neutral-500 hover:text-brand-navy'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Location Input */}
        <div className="flex-1 relative flex items-center bg-neutral-50 rounded-xl px-4">
          <MapPin size={20} className="text-neutral-400 absolute left-4" />
          <input
            type="text"
            placeholder="Search by location or project..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-transparent border-none py-3 pl-8 pr-4 text-brand-navy focus:outline-none focus:ring-0 placeholder:text-neutral-400"
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" size="lg" className="w-full md:w-auto px-8 shrink-0 gap-2 rounded-xl">
          <Search size={20} />
          <span>Search</span>
        </Button>
      </div>
    </form>
  );
};
```
