import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Users } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { getAgents, type Agent } from '../lib/dbService';
import { SeoHead } from '../components/seo/SeoHead';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { useTranslation } from 'react-i18next';

export default function AgentsPage() {
  const { t } = useTranslation();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    getAgents().then(setAgents).catch(() => setError('We could not load the team right now. Please try again later.')).finally(() => setLoading(false));
  }, []);

  return <main className="min-h-screen bg-brand-ivory flex flex-col">
    <SeoHead />
    <Navbar />
    <header className="relative bg-brand-navy pt-36 pb-16 overflow-hidden">
      <div className="absolute inset-0 islamic-pattern opacity-20" />
      <div className="container-custom relative z-10">
        <Breadcrumbs
          variant="light"
          items={[{ label: t('nav.agents', 'Our Agents') }]}
          className="mb-4"
        />
        <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.25em] mb-3">Attaie Properties</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white">Our Agents</h1>
        <p className="mt-4 max-w-xl text-white/65 leading-relaxed">Meet the people ready to help with your property search.</p>
      </div>
    </header>
    <section className="container-custom py-14 md:py-20 flex-grow">
      {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7" aria-label="Loading agents">{Array.from({ length: 3 }, (_, i) => <div key={i} className="h-[360px] rounded-2xl bg-white animate-pulse" />)}</div>
        : error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>
        : agents.length === 0 ? <div className="rounded-2xl border border-brand-navy/10 bg-white px-6 py-16 text-center">
          <Users size={32} className="mx-auto mb-4 text-brand-gold" /><h2 className="text-xl font-bold text-brand-navy">Our team profiles are being prepared</h2>
          <p className="mt-2 text-neutral-500">Please check back soon.</p>
        </div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {agents.map(agent => <Link key={agent.id} to={`/agents/${agent.id}`} className="group overflow-hidden rounded-2xl bg-white border border-brand-navy/8 shadow-brand-sm transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
            <div className="relative aspect-[4/4.4] overflow-hidden bg-brand-navy/5">
              <img src={agent.portrait_url} alt={agent.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
              <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-navy shadow-md"><ArrowUpRight size={18} /></span>
            </div>
            <div className="px-6 py-5"><h2 className="text-xl font-bold text-brand-navy">{agent.name}</h2><p className="mt-1 text-sm font-medium text-brand-gold">{agent.role}</p></div>
          </Link>)}
        </div>}
    </section>
    <Footer />
  </main>;
}
