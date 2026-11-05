import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { SeoHead } from '../components/seo/SeoHead';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <SeoHead />
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-8xl font-display font-bold text-brand-gold mb-4">404</h1>
        <h2 className="text-2xl font-bold text-brand-navy mb-4">Page Not Found</h2>
        <p className="text-neutral-500 mb-8">The page you are looking for does not exist.</p>
        <Link
          to="/"
          className="px-8 py-3 bg-brand-navy text-white rounded-btn font-bold hover:bg-brand-navy/90 transition-colors"
        >
          Back to Home
        </Link>
      </div>
      <Footer />
    </main>
  );
}
