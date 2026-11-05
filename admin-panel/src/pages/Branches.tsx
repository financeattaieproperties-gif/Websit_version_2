import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type Branch } from '../api';

const S = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' as const },
  title: { fontSize: '1.5rem', fontWeight: 700, margin: 0 },
  btn: { padding: '0.6rem 1.2rem', background: '#B8944A', color: '#fff', border: 0, borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' as const, background: '#fff', borderRadius: 10, overflow: 'hidden' as const, boxShadow: '0 1px 4px rgba(0,0,0,.08)' },
  th: { padding: '0.75rem 1rem', background: '#f8fafc', textAlign: 'left' as const, fontSize: '0.75rem', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' },
};

export default function Branches() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = () => api.getBranches().then(setItems).catch(e => setError(e.message || 'Could not load branches.')).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const remove = async (branch: Branch) => {
    if (!confirm(`Delete the ${branch.name} branch?`)) return;
    try { await api.deleteBranch(branch.id); setItems(current => current.filter(x => x.id !== branch.id)); }
    catch (e) { setError((e as Error).message || 'Delete failed.'); }
  };
  if (loading) return <p>Loading branches…</p>;
  return <div>
    <div style={S.header}><h1 style={S.title}>Branches ({items.length})</h1><button style={S.btn} onClick={() => navigate('/branches/new')}>+ Add Branch</button></div>
    {error && <p role="alert" style={{ color: '#b91c1c', background: '#fef2f2', padding: '0.75rem', borderRadius: 8 }}>{error}<button onClick={() => { setError(''); setLoading(true); load(); }} style={{ marginLeft: 12 }}>Retry</button></p>}
    <div style={{ overflowX: 'auto' }}><table style={S.table}><thead><tr>{['Branch', 'Address', 'Phone', 'Email', 'Actions'].map(x => <th key={x} style={S.th}>{x}</th>)}</tr></thead><tbody>
      {items.map(branch => <tr key={branch.id}><td style={S.td}>{branch.name}</td><td style={S.td}>{branch.address}</td><td style={S.td}>{branch.phone || '—'}</td><td style={S.td}>{branch.email || '—'}</td><td style={S.td}><button onClick={() => navigate(`/branches/${branch.id}/edit`)} style={{ marginRight: 6 }}>Edit</button><button onClick={() => remove(branch)} style={{ color: '#b91c1c' }}>Delete</button></td></tr>)}
      {items.length === 0 && <tr><td colSpan={5} style={{ ...S.td, textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>No branches yet. Add your first branch to show it on the About page.</td></tr>}
    </tbody></table></div>
  </div>;
}
