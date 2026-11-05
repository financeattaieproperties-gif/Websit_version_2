import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SeoSettingsProvider } from './components/seo/SeoHead';
import { CustomerChatWidget } from './components/chat/CustomerChatWidget';
import HomePage from './pages/HomePage';

const PropertiesPage = lazy(() => import('./pages/PropertiesPage'));
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const AgentsPage = lazy(() => import('./pages/AgentsPage'));
const AgentDetailPage = lazy(() => import('./pages/AgentDetailPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const CareerDetailPage = lazy(() => import('./pages/CareerDetailPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-brand-cream text-brand-navy">
    <div className="w-8 h-8 rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
  </div>
);

const withSuspense = (node: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{node}</Suspense>
);

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/properties', element: withSuspense(<PropertiesPage />) },
  { path: '/properties/:id', element: withSuspense(<PropertyDetailPage />) },
  { path: '/projects', element: withSuspense(<ProjectsPage />) },
  { path: '/projects/:id', element: withSuspense(<ProjectDetailPage />) },
  { path: '/contact', element: withSuspense(<ContactPage />) },
  { path: '/about', element: withSuspense(<AboutPage />) },
  { path: '/agents', element: withSuspense(<AgentsPage />) },
  { path: '/agents/:id', element: withSuspense(<AgentDetailPage />) },
  { path: '/careers', element: withSuspense(<CareersPage />) },
  { path: '/careers/:id', element: withSuspense(<CareerDetailPage />) },
  { path: '*', element: withSuspense(<NotFoundPage />) },
]);

export default function App() {
  return (
    <HelmetProvider>
      <SeoSettingsProvider>
        <RouterProvider router={router} />
        <CustomerChatWidget />
      </SeoSettingsProvider>
    </HelmetProvider>
  );
}
