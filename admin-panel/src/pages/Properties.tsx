import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type Property } from '../api';

type Status = Property['status'];

const statusColor = (s: Status): React.CSSProperties => ({
  padding: '0.2rem 0.7rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
  border: 'none', outline: 'none',
  background: s === 'available' ? '#d1fae5' : s === 'pending' ? '#fef9c3' : s === 'rented' ? '#dbeafe' : '#fee2e2',
  color:      s === 'available' ? '#065f46' : s === 'pending' ? '#92400e' : s === 'rented' ? '#1e40af' : '#991b1b',
});

const STATUSES: Status[] = ['available', 'pending', 'sold', 'rented'];
const nextStatus = (s: Status): Status => STATUSES[(STATUSES.indexOf(s) + 1) % STATUSES.length];

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

export default function Properties() {
  const navigate = useNavigate();
  const [items, setItems]         = useState<Property[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading]     = useState(true);
  const [toggling, setToggling]   = useState<number | null>(null);

  useEffect(() => {
    api.getProperties().then(setItems).finally(() => setLoading(false));
  }, []);

  const remove = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    await api.deleteProperty(id);
    setItems(prev => prev.filter(p => p.id !== id));
  };

  const cycleStatus = async (p: Property) => {
    const next = nextStatus(p.status);
    setToggling(p.id);
    try {
      const { id: _id, created_at: _ca, ...rest } = p;
      await api.updateProperty({ ...rest, id: p.id, status: next });
      setItems(prev => prev.map(x => x.id === p.id ? { ...x, status: next } : x));
    } finally {
      setToggling(null);
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading…</p>;

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>Properties ({items.length})</h1>
        <button style={S.btn} onClick={() => navigate('/properties/new')}>+ Add Property</button>
      </div>

      <div style={{ marginBottom: '1rem' }}><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by serial number, title, or location" style={{ padding: '.65rem .8rem', border: '1px solid #cbd5e1', borderRadius: 8, width: 'min(100%, 420px)' }} /></div>
      <div style={{ overflowX: 'auto' }}>
      <table style={S.table}>
        <thead>
          <tr>
            {['', 'Title', 'Price', 'Type', 'Status', 'Actions'].map(h => (
              <th key={h} style={S.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.filter(p => !search || p.serial_number.toLowerCase().includes(search.toLowerCase()) || p.title.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase())).map(p => (
            <tr key={p.id} style={{ transition: 'background .15s' }}>
              <td style={{ ...S.td, width: 68, paddingRight: 0 }}>
                {p.image_url
                  ? <img src={p.image_url} alt="" style={S.thumb} />
                  : <div style={S.noThumb}>🏠</div>}
              </td>
              <td style={S.td}>
                <div style={{ color: '#0145F2', fontWeight: 700, fontSize: '.78rem', marginBottom: '.2rem' }}>{p.serial_number}</div>
                <div style={{ fontWeight: 600, marginBottom: '0.1rem' }}>{p.title}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{p.location}</div>
              </td>
              <td style={S.td}>
                <div style={{ fontWeight: 600 }}>${Number(p.price).toLocaleString()}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                  {p.listing_type === 'rent' ? '/mo' : 'sale'}
                </div>
              </td>
              <td style={S.td}>{p.type}</td>
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
                <div style={S.actions}>
                  <button style={S.editBtn} onClick={() => navigate(`/properties/${p.id}/edit`)}>✏ Edit</button>
                  <button style={S.delBtn}  onClick={() => remove(p.id, p.title)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={6} style={{ ...S.td, textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
                No properties yet. Add your first one →
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
