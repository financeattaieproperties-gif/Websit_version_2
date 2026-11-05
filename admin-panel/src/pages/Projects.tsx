import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type Project } from '../api';

type Status = Project['status'];

const STATUSES: Status[] = ['Coming Soon', 'In Progress', 'Sold Out', 'Under Construction', 'Ready'];
const nextStatus = (s: Status): Status => STATUSES[(STATUSES.indexOf(s) + 1) % STATUSES.length];

const statusColor = (s: Status): React.CSSProperties => ({
  padding: '0.2rem 0.7rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
  cursor: 'pointer', border: 'none', outline: 'none',
  background: s === 'Ready' || s === 'In Progress' ? '#d1fae5' : s === 'Sold Out' ? '#fee2e2' : '#fef9c3',
  color:      s === 'Ready' || s === 'In Progress' ? '#065f46' : s === 'Sold Out' ? '#991b1b' : '#92400e',
});

const S = {
  header:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' } as const,
  title:   { fontSize: '1.5rem', fontWeight: 700, margin: 0 } as const,
  btn:     { padding: '0.6rem 1.4rem', background: '#b8960c', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' } as const,
  table:   { width: '100%', borderCollapse: 'collapse' as const, background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.08)' },
  th:      { padding: '0.75rem 1rem', background: '#f8fafc', textAlign: 'left' as const, fontSize: '0.75rem', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  td:      { padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', verticalAlign: 'middle' as const },
  thumb:   { width: 52, height: 40, objectFit: 'cover' as const, borderRadius: 6, display: 'block' },
  noThumb: { width: 52, height: 40, background: '#e2e8f0', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' } as const,
  actions: { display: 'flex', gap: '0.4rem' } as const,
  editBtn: { padding: '0.3rem 0.8rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 } as const,
  delBtn:  { padding: '0.3rem 0.8rem', background: 'transparent', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 } as const,
};

export default function Projects() {
  const navigate = useNavigate();
  const [items, setItems]       = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    api.getProjects().then(setItems).finally(() => setLoading(false));
  }, []);

  const remove = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await api.deleteProject(id);
    setItems(prev => prev.filter(p => p.id !== id));
  };

  const cycleStatus = async (p: Project) => {
    const next = nextStatus(p.status);
    setToggling(p.id);
    try {
      const { id: _id, created_at: _ca, ...rest } = p;
      await api.updateProject({ ...rest, id: p.id, status: next });
      setItems(prev => prev.map(x => x.id === p.id ? { ...x, status: next } : x));
    } finally {
      setToggling(null);
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading…</p>;

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>Projects ({items.length})</h1>
        <button style={S.btn} onClick={() => navigate('/projects/new')}>+ Add Project</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
      <table style={S.table}>
        <thead>
          <tr>
            {['', 'Name', 'Status', 'Units', 'Delivery', 'Actions'].map(h => (
              <th key={h} style={S.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p.id}>
              <td style={{ ...S.td, width: 68, paddingRight: 0 }}>
                {p.image_url
                  ? <img src={p.image_url} alt="" style={S.thumb} />
                  : <div style={S.noThumb}>🏗</div>}
              </td>
              <td style={S.td}>
                <div style={{ fontWeight: 600, marginBottom: '0.1rem' }}>{p.name}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{p.location}</div>
              </td>
              <td style={S.td}>
                <button
                  style={{ ...statusColor(p.status), opacity: toggling === p.id ? 0.5 : 1 }}
                  onClick={() => cycleStatus(p)}
                  title="Click to cycle status"
                  disabled={toggling === p.id}
                >
                  {p.status}
                </button>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>click to change</div>
              </td>
              <td style={S.td}>
                <span style={{ fontWeight: 600, color: '#b8960c' }}>{p.available_units}</span>
                <span style={{ color: '#94a3b8' }}> / {p.total_units}</span>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>available</div>
              </td>
              <td style={S.td}>
                {p.delivery_date
                  ? <span style={{ fontWeight: 600 }}>{p.delivery_date}</span>
                  : <span style={{ color: '#cbd5e1' }}>—</span>}
              </td>
              <td style={S.td}>
                <div style={S.actions}>
                  <button style={S.editBtn} onClick={() => navigate(`/projects/${p.id}/edit`)}>✏ Edit</button>
                  <button style={S.delBtn}  onClick={() => remove(p.id, p.name)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={6} style={{ ...S.td, textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
                No projects yet. Add your first one →
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
