import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ProjectCard } from '../components/ui/ProjectCard';
import { getProjects, type Project } from '../lib/dbService';
import { SeoHead } from '../components/seo/SeoHead';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';

const FILTER_STATUSES = ['All', 'Coming Soon', 'In Progress', 'Sold Out'] as const;

export default function ProjectsPage() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTER_STATUSES)[number]>('All');

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  const visible =
    filter === 'All'
      ? projects
      : projects.filter(
          (project) => (project.status === 'Under Construction' ? 'In Progress' : project.status) === filter
        );

  return (
    <main className="min-h-screen bg-brand-cream flex flex-col">
      <SeoHead context={{ filterStatus: filter }} />
      <Navbar />
      <section className="bg-brand-navy pt-36 pb-16 islamic-pattern">
        <div className="container-custom">
          <Breadcrumbs
            variant="light"
            items={[{ label: t('nav.projects', 'Projects') }]}
            className="mb-4"
          />
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[.25em]">
            {t('projectsPage.eyebrow')}
          </p>
          <h1 className="mt-3 text-4xl font-bold text-white">{t('projectsPage.title')}</h1>
          <p className="mt-3 max-w-xl text-white/65">{t('projectsPage.subtitle')}</p>
        </div>
      </section>
      <section className="container-custom py-14 flex-grow">
        <div className="mb-8 flex flex-wrap gap-2">
          {FILTER_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                filter === status
                  ? 'bg-brand-navy text-white'
                  : 'bg-white text-neutral-600 hover:text-brand-navy'
              }`}
            >
              {t(`projectsPage.filters.${status}`)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-neutral-500">{t('projectsPage.loading')}</p>
          ) : visible.length ? (
            visible.map((project) => (
              <ProjectCard
                key={project.id}
                id={String(project.id)}
                name={project.name}
                location={project.location}
                deliveryDate={project.delivery_date ?? undefined}
                status={project.status}
                availableUnits={project.available_units}
                image={project.image_url || '/logo.png'}
              />
            ))
          ) : (
            <p className="text-neutral-500">{t('projectsPage.empty')}</p>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}


