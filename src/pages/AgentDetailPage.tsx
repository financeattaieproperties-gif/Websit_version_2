import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, Phone } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { getAgent, type Agent } from '../lib/dbService';
import { SeoHead } from '../components/seo/SeoHead';
import { buildAgentSeo } from '../lib/seoConfig';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { useTranslation } from 'react-i18next';

function whatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, '');
  const international = digits.startsWith('00') ? digits.slice(2) : digits.startsWith('0') ? `93${digits.slice(1)}` : digits;
  return `https://wa.me/${international}`;
}

export default function AgentDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const agentId = Number(id);
    if (!Number.isInteger(agentId) || agentId < 1) { setError('Agent profile not found.'); setLoading(false); return; }
    getAgent(agentId).then(setAgent).catch(() => setError('Agent profile not found.')).finally(() => setLoading(false));
  }, [id]);

  const seo = buildAgentSeo(agent, id);
  const breadcrumbItems = [
    { label: t('nav.agents', 'Our Agents'), href: '/agents' },
    { label: agent?.name || t('breadcrumbs.agentDetails', 'Agent Details') },
  ];

  return <main className="min-h-screen bg-brand-ivory flex flex-col">
    <SeoHead seo={agent ? seo : undefined} context={{ agent }} />
    <Navbar />
    <header className="bg-brand-navy pt-32 pb-6">
      <div className="container-custom flex flex-col gap-3">
        <Breadcrumbs variant="light" items={breadcrumbItems} />
        <Link to="/agents" className="inline-flex items-center gap-2 text-xs font-semibold text-white/75 hover:text-brand-gold w-fit"><ArrowLeft size={14} /> Our Agents</Link>
      </div>
    </header>
    <div className="container-custom flex-grow pt-8 pb-16">
      {loading ? <div className="mt-8 grid md:grid-cols-[minmax(260px,380px)_1fr] gap-10"><div className="aspect-[4/5] rounded-2xl bg-white animate-pulse" /><div className="h-64 rounded-2xl bg-white animate-pulse" /></div>
        : error || !agent ? <div role="alert" className="mt-8 rounded-xl border border-neutral-200 bg-white p-8 text-center text-neutral-600">{error || 'Agent profile not found.'}</div>
        : <article className="mt-8 grid md:grid-cols-[minmax(260px,380px)_1fr] gap-8 lg:gap-14 items-start">
          <img src={agent.portrait_url} alt={agent.name} className="w-full max-h-[560px] aspect-[4/5] rounded-2xl object-cover shadow-brand-md bg-white" />
          <div className="rounded-2xl bg-white p-7 md:p-10 border border-brand-navy/8 shadow-brand-sm">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">Attaie Properties</p>
            <h1 className="mt-3 text-3xl md:text-4xl font-display font-bold text-brand-navy">{agent.name}</h1>
            <p className="mt-2 text-lg font-semibold text-brand-gold">{agent.role}</p>
            <div className="mt-8 border-t border-neutral-100 pt-7"><h2 className="text-lg font-bold text-brand-navy">Background</h2><p className="mt-3 text-neutral-600 leading-8 whitespace-pre-line">{agent.background}</p></div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`tel:${agent.phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-3 text-sm font-bold text-white hover:bg-brand-navy-light"><Phone size={17} /> Call</a>
              <a href={`mailto:${agent.email}`} className="inline-flex items-center gap-2 rounded-xl border border-brand-navy/15 px-4 py-3 text-sm font-bold text-brand-navy hover:bg-brand-ivory"><Mail size={17} /> Email</a>
              {agent.whatsapp && <a href={whatsappHref(agent.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white"><MessageCircle size={17} /> WhatsApp</a>}
            </div>
          </div>
        </article>}
    </div>
    <Footer />
  </main>;
}
