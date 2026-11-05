import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, type CareerJobInput } from '../api';

const S = {
  page:     { maxWidth: 820 } as const,
  topBar:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' } as const,
  title:    { fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#1A2335' } as const,
  card:     { background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,.08)', overflow: 'hidden' } as const,
  section:  { padding: '1.5rem 2rem' } as const,
  divider:  { borderTop: '1px solid #f1f5f9' } as const,
  secTitle: { fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: '1rem' } as const,
  grid:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' } as const,
  full:     { gridColumn: '1 / -1' } as const,
  label:    { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' } as const,
  input:    { width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' as const } as const,
  select:   { width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem', outline: 'none', background: '#fff', boxSizing: 'border-box' as const } as const,
  textarea: { width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem', minHeight: 130, resize: 'vertical' as const, outline: 'none', boxSizing: 'border-box' as const } as const,
  footer:   { padding: '1.25rem 2rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem', alignItems: 'center' } as const,
  save:     { padding: '0.7rem 1.8rem', background: '#B8944A', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' } as const,
  cancel:   { padding: '0.7rem 1.4rem', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' } as const,
  toast:    (ok: boolean) => ({
    padding: '0.65rem 1rem', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600,
    background: ok ? '#d1fae5' : '#fee2e2',
    color:      ok ? '#065f46' : '#dc2626',
  }),
};

const defaultDeadline = () => {
  const d = new Date(Date.now() + 14 * 86400 * 1000);
  return d.toISOString().slice(0, 10);
};

const blank: CareerJobInput = {
  title: '',
  location: 'Kabul, Afghanistan',
  employment_type: 'Full-Time',
  description: '',
  qualifications: '',
  deadline_at: defaultDeadline(),
  status: 'published',
};

export default function CareerForm() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);
  const jobId    = Number(id || 0);

  const [form, setForm]       = useState<CareerJobInput>(blank);
  const [loading, setLoading] = useState(isEdit);
  const [busy, setBusy]       = useState(false);
  const [toast, setToast]     = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    api.getCareers()
      .then(list => {
        const found = list.find(j => Number(j.id) === jobId);
        if (found) {
          setForm({
            title: found.title,
            location: found.location,
            employment_type: found.employment_type,
            description: found.description,
            qualifications: found.qualifications,
            deadline_at: found.deadline_at ? found.deadline_at.slice(0, 10) : defaultDeadline(),
            status: found.status,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [isEdit, jobId]);

  const set = (k: keyof CareerJobInput, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setToast(null);
    try {
      const payload: CareerJobInput = {
        ...form,
        deadline_at: form.deadline_at.length === 10 ? `${form.deadline_at} 23:59:59` : form.deadline_at,
      };
      if (isEdit) {
        await api.updateCareer({ ...payload, id: jobId });
        setToast({ ok: true, msg: 'Job announcement updated.' });
      } else {
        await api.createCareer(payload);
        setToast({ ok: true, msg: 'Job announcement created.' });
        setTimeout(() => navigate('/careers'), 700);
      }
    } catch (err) {
      setToast({ ok: false, msg: (err as Error).message || 'Save failed.' });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading…</p>;

  return (
    <div style={S.page}>
      <div style={S.topBar}>
        <h1 style={S.title}>{isEdit ? 'Edit Job Announcement' : 'New Job Announcement'}</h1>
        <button type="button" style={{ ...S.cancel, padding: '0.5rem 1rem' }} onClick={() => navigate('/careers')}>
          ← Back to Careers
        </button>
      </div>

      <form onSubmit={submit}>
        <div style={S.card}>
          <div style={S.section}>
            <p style={S.secTitle}>Position Overview</p>
            <div style={S.grid}>
              <div style={S.full}>
                <label style={S.label}>Job Title *</label>
                <input
                  style={S.input}
                  required
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Senior Real Estate Sales Advisor"
                />
              </div>
              <div>
                <label style={S.label}>Location *</label>
                <input
                  style={S.input}
                  required
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                  placeholder="e.g. Wazir Akbar Khan, Kabul"
                />
              </div>
              <div>
                <label style={S.label}>Employment Type *</label>
                <select
                  style={S.select}
                  value={form.employment_type}
                  onChange={e => set('employment_type', e.target.value)}
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Application Deadline Date (Asia/Kabul) *</label>
                <input
                  style={S.input}
                  type="date"
                  required
                  value={form.deadline_at.slice(0, 10)}
                  onChange={e => set('deadline_at', e.target.value)}
                />
              </div>
              <div>
                <label style={S.label}>Publication Status *</label>
                <select
                  style={S.select}
                  value={form.status}
                  onChange={e => set('status', e.target.value as CareerJobInput['status'])}
                >
                  <option value="published">Published (Visible & Open)</option>
                  <option value="draft">Draft (Hidden from public)</option>
                  <option value="closed">Closed (Applications disabled)</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ ...S.section, ...S.divider }}>
            <p style={S.secTitle}>Role Description & Qualifications</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={S.label}>Role Description & Responsibilities *</label>
                <textarea
                  style={S.textarea}
                  required
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Describe the responsibilities, day-to-day activities, and team environment…"
                />
              </div>
              <div>
                <label style={S.label}>Required Qualifications & Skills *</label>
                <textarea
                  style={S.textarea}
                  required
                  value={form.qualifications}
                  onChange={e => set('qualifications', e.target.value)}
                  placeholder="List required experience, languages (Dari, Pashto, English), education, and skills (one per line recommended)…"
                />
              </div>
            </div>
          </div>

          <div style={S.footer}>
            <button type="submit" style={S.save} disabled={busy}>
              {busy ? 'Saving…' : isEdit ? '✓ Save Changes' : '+ Publish Job Opening'}
            </button>
            <button type="button" style={S.cancel} onClick={() => navigate('/careers')}>
              Cancel
            </button>
            {toast && <span style={S.toast(toast.ok)}>{toast.msg}</span>}
          </div>
        </div>
      </form>
    </div>
  );
}
