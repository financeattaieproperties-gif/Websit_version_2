import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { InquiryForm } from '../components/forms/InquiryForm';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { MapPin, Calendar, Home, ArrowLeft } from 'lucide-react';
import { getProject, type Project } from '../lib/dbService';
import { ClickToCallButton } from '../components/ui/ClickToCallButton';
import { VisitRequestDialog } from '../components/forms/VisitRequestDialog';
import { ProjectUnitsSection } from '../components/project/ProjectUnitsSection';
import { ImageGallery } from '../components/property/ImageGallery';
import { VideoPlayer } from '../components/property/VideoPlayer';
import { SeoHead } from '../components/seo/SeoHead';
import { buildProjectSeo } from '../lib/seoConfig';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { useTranslation } from 'react-i18next';

export default function ProjectDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [visitOpen, setVisitOpen] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);

  useEffect(() => {
    if (!projectId) return;
    getProject(projectId)
      .then(setProject)
      .catch(() => setError('Project not found.'))
      .finally(() => setLoading(false));
  }, [projectId]);

  const seo = buildProjectSeo(project, id);
  const projectImages = project ? ((project.gallery_images?.length ? project.gallery_images : project.image_url ? [project.image_url] : [])) : [];

  const breadcrumbItems = [
    { label: t('nav.projects', 'Projects'), href: '/projects' },
    { label: project?.name || t('breadcrumbs.projectDetails', 'Project Details') },
  ];

  return (
    <main className="min-h-screen bg-brand-cream flex flex-col">
      <SeoHead seo={project ? seo : undefined} context={{ project }} />
      <Navbar />

      {/* Top hierarchy bar */}
      <header className="bg-brand-navy pt-24 pb-4 border-b border-white/10">
        <div className="container-custom">
          <Breadcrumbs variant="light" items={breadcrumbItems} />
        </div>
      </header>

      {/* Cinematic hero */}
      {loading ? (
        <div className="w-full h-[60vh] min-h-[420px] bg-neutral-200 animate-pulse" />
      ) : (
        <div ref={heroRef} className="relative w-full h-[60vh] min-h-[420px] overflow-hidden">
          {project?.image_url ? (
            <motion.img
              src={project.image_url}
              alt={project?.name ?? ''}
              className="w-full h-full object-cover"
              style={{ y: heroY, scale: 1.1 }}
            />
          ) : (
            <div className="w-full h-full bg-brand-navy" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-brand-navy/30 to-transparent" />
          <div className="absolute inset-0 islamic-pattern opacity-20" />
          {/* Breadcrumb overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="container-custom">
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-2"
              >
                <Breadcrumbs variant="light" items={breadcrumbItems} />
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 text-white/80 hover:text-brand-gold transition-colors text-xs font-medium w-fit"
                >
                  <ArrowLeft size={14} />
                  Back to Projects
                </Link>
              </motion.div>
              {project && (
                <h1 className="text-3xl md:text-5xl font-display font-bold text-white mt-3 drop-shadow-md">
                  {project.name}
                </h1>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="container-custom pt-8 pb-16 flex-grow">
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        {error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        )}

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {project && (
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <Badge type={project.status} />
                {project.available_units !== undefined && project.total_units !== undefined && (
                  <span className="text-sm text-neutral-600">
                    <span className="font-bold text-brand-navy">{project.available_units}</span> of {project.total_units} units available
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mb-8">
                <motion.div
                  whileHover={{ scale: 1.04, y: -2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className="flex items-center gap-2 text-neutral-700 bg-brand-ivory px-4 py-2 rounded-xl cursor-default"
                >
                  <MapPin size={20} className="text-brand-gold" />
                  <span className="font-bold">{project.location}</span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.04, y: -2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className="flex items-center gap-2 text-neutral-700 bg-brand-ivory px-4 py-2 rounded-xl cursor-default"
                >
                  <Home size={20} className="text-brand-gold" />
                  <span className="font-bold">{project.available_units}</span>
                  <span> / {project.total_units} units available</span>
                </motion.div>
                {project.delivery_date && (
                  <motion.div
                    whileHover={{ scale: 1.04, y: -2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    className="flex items-center gap-2 text-neutral-700 bg-brand-ivory px-4 py-2 rounded-xl cursor-default"
                  >
                    <Calendar size={20} className="text-brand-gold" />
                    <span>Delivery: <span className="font-bold">{project.delivery_date}</span></span>
                  </motion.div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                <ClickToCallButton />
                <button onClick={() => setVisitOpen(true)} className="rounded-xl bg-brand-navy px-5 py-3 text-sm font-bold text-white hover:bg-brand-navy-light">Request a Visit</button>
              </div>

              {projectImages.length > 0 && <div className="mb-8"><ImageGallery images={projectImages} alt={project.name} /></div>}
              {project.video_url && <div className="mb-8"><VideoPlayer url={project.video_url} title={`${project.name} project tour`} /></div>}

              {project.description && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white p-8 rounded-2xl border border-brand-gold/10"
                  style={{ boxShadow: 'var(--shadow-md)' }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-5 bg-brand-gold rounded-full" />
                    <h2 className="text-xl font-bold text-brand-navy">About This Project</h2>
                  </div>
                  <p className="text-neutral-600 leading-relaxed text-lg">{project.description}</p>
                </motion.div>
              )}
              <ProjectUnitsSection projectId={project.id} projectName={project.name} masterplanImage={project.masterplan_image} />
            </div>

            <aside className="w-full lg:w-96 shrink-0">
              <div className="sticky top-28">
                <InquiryForm propertyId={String(project.id)} propertyName={project.name} />
              </div>
            </aside>
          </div>
        )}
      </div>

      {project && visitOpen && <VisitRequestDialog target={{ label: project.name, projectId: project.id }} onClose={() => setVisitOpen(false)} />}

      <Footer />
    </main>
  );
}
