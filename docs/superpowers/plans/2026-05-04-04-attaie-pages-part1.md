# Attaie Properties - Core Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the Properties List and Property Detail pages, pulling in the previously built components and wiring them up.
**Architecture:** Next.js App Router dynamic routes with server-side rendering or static generation where appropriate.
**Tech Stack:** Next.js 15, React 19, Tailwind v4.

---

### Task 1: Properties List Page

**Files:**
- Create: `src/app/[locale]/properties/page.tsx`

- [ ] **Step 1: Create directory and page**
```tsx
import React from 'react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { SearchBar } from '../../../components/forms/SearchBar';
import { FilterSidebar, FilterState } from '../../../components/property/FilterSidebar';
import { PropertyCard } from '../../../components/ui/PropertyCard';
import { PropertyCardSkeleton } from '../../../components/ui/PropertyCardSkeleton';
import { getProperties } from '../../../lib/dbService';

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  // This is a simplified server component that fetches all properties.
  // In a real app with next-intl, we'd use useTranslations here as well.
  
  // Create a mock filter state from URL params
  const initialFilters: FilterState = {
    purpose: (params.purpose as any) || 'buy',
    type: params.type ? (Array.isArray(params.type) ? params.type : [params.type]) : [],
    minPrice: Number(params.minPrice) || 0,
    maxPrice: Number(params.maxPrice) || 50000000,
    minArea: Number(params.minArea) || 0,
    maxArea: Number(params.maxArea) || 1000,
    beds: params.beds ? (Array.isArray(params.beds) ? params.beds : [params.beds]) : [],
    baths: params.baths ? (Array.isArray(params.baths) ? params.baths : [params.baths]) : [],
    status: params.status ? (Array.isArray(params.status) ? params.status : [params.status]) : []
  };

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-brand-navy pt-32 pb-12">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Browse Properties</h1>
          <SearchBar />
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-12 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            {/* Client-side filter wrapper would normally go here */}
            <FilterSidebar filters={initialFilters} onChange={() => {}} className="sticky top-24" />
          </aside>

          {/* Results */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-brand-navy">12 Properties Found</h2>
              <select className="px-4 py-2 border border-neutral-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-gold">
                <option>Newest First</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Area: Largest First</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Dummy data for display */}
              <PropertyCard 
                id="1" title="Luxury Villa in Palm Jumeirah" price={12500000} location="Palm Jumeirah, Dubai" 
                beds={5} baths={6} area={450} status="available" type="Villa" 
                image="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80" 
              />
              <PropertyCard 
                id="2" title="Modern Apartment in Downtown" price={3200000} location="Downtown Dubai" 
                beds={2} baths={2} area={120} status="available" type="Apartment" 
                image="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80" 
              />
              <PropertyCard 
                id="3" title="Penthouse with Burj Khalifa View" price={8900000} location="Business Bay, Dubai" 
                beds={3} baths={4} area={280} status="pending" type="Penthouse" 
                image="https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80" 
              />
            </div>
            
            <div className="mt-12 text-center">
              <button className="px-8 py-3 border border-brand-gold text-brand-gold font-bold rounded-lg hover:bg-brand-gold hover:text-white transition-colors">
                Load More Properties
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
```

### Task 2: Property Detail Page

**Files:**
- Create: `src/app/[locale]/properties/[id]/page.tsx`

- [ ] **Step 1: Create directory and page**
```tsx
import React from 'react';
import Image from 'next/image';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { InquiryForm } from '../../../../components/forms/InquiryForm';
import { Badge } from '../../../../components/ui/Badge';
import { MapPin, Bed, Bath, Maximize2, Building } from 'lucide-react';

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  
  // Dummy property data
  const property = {
    id,
    title: 'Luxury Villa in Palm Jumeirah',
    price: 12500000,
    location: 'Palm Jumeirah, Dubai',
    beds: 5,
    baths: 6,
    area: 450,
    floor: 2,
    status: 'available' as const,
    type: 'Villa',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1920&q=80',
    description: 'Experience unparalleled luxury in this exquisite 5-bedroom villa located on the prestigious Palm Jumeirah. Boasting panoramic sea views, private beach access, and state-of-the-art amenities, this property represents the pinnacle of Dubai living.'
  };

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      
      {/* Gallery Placeholder */}
      <div className="w-full h-[50vh] md:h-[70vh] relative bg-neutral-900 mt-20">
        <Image src={property.image} alt={property.title} fill className="object-cover opacity-80" />
      </div>

      <div className="container-custom py-12 flex-grow">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex gap-2 mb-4">
              <Badge status={property.status} />
              <Badge type={property.type} />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-navy mb-4">
              {property.title}
            </h1>
            
            <p className="text-4xl font-bold text-brand-gold mb-6">
              AED {property.price.toLocaleString()}
            </p>
            
            <div className="flex flex-wrap gap-6 py-6 border-y border-neutral-200 mb-8">
              <div className="flex items-center gap-2 text-neutral-700">
                <Bed size={24} className="text-brand-gold" />
                <span className="font-bold">{property.beds}</span> Beds
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <Bath size={24} className="text-brand-gold" />
                <span className="font-bold">{property.baths}</span> Baths
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <Maximize2 size={24} className="text-brand-gold" />
                <span className="font-bold">{property.area}</span> m²
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <Building size={24} className="text-brand-gold" />
                <span>Floor <span className="font-bold">{property.floor}</span></span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <MapPin size={24} className="text-brand-gold" />
                <span className="font-bold">{property.location}</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
              <h2 className="text-2xl font-bold text-brand-navy mb-4 border-b border-neutral-100 pb-4">Description</h2>
              <p className="text-neutral-600 leading-relaxed text-lg">
                {property.description}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-96 shrink-0">
            <div className="sticky top-28 space-y-6">
              {/* Agent Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 flex items-center gap-4">
                <div className="w-16 h-16 bg-neutral-200 rounded-full shrink-0"></div>
                <div>
                  <p className="text-sm text-neutral-500">Listed by</p>
                  <p className="font-bold text-brand-navy text-lg">Sarah Jenkins</p>
                  <p className="text-sm text-brand-gold">+971 50 123 4567</p>
                </div>
              </div>
              
              <InquiryForm propertyId={property.id} propertyName={property.title} />
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}
```
