import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type Agent } from '../api';

const S = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' as const },
  title: { fontSize: '1.5rem', fontWeight: 700, margin: 0 },
  btn: { padding: '0.6rem 1.2rem', background: '#B8944A', color: '#fff', border: 0, borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' as const, background: '#fff', borderRadius: 10, overflow: 'hidden' as const, boxShadow: '0 1px 4px rgba(0,0,0,.08)' },
  th: { padding: '0.75rem 1rem', background: '#f8fafc', textAlign: 'left' as const, fontSize: '0.75rem', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', verticalAlign: 'middle' as const },
  action: { padding: '0.35rem 0.75rem', background: '#0f172a', color: '#fff', border: 0, borderRadius: 6, cursor: 'pointer', marginRight: 6 },
  delete: { padding: '0.35rem 0.75rem', background: 'transparent', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 6, cursor: 'pointer' },
};

export default function Agents() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = () => api.getAgents().then(setItems).catch(e => setError(e.message || 'Could not load agents.')).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const remove = async (agent: Agent) => {
    if (!confirm(`Delete ${agent.name}'s profile?`)) return;
    try { await api.deleteAgent(agent.id); setItems(current => current.filter(x => x.id !== agent.id)); }
    catch (e) { setError((e as Error).message || 'Delete failed.'); }
  };

  if (loading) return <p>Loading agents…</p>;
  return <div>
    <div style={S.header}><h1 style={S.title}>Agents & Employees ({items.length})</h1><button style={S.btn} onClick={() => navigate('/agents/new')}>+ Add Agent</button></div>
    {error && <p role="alert" style={{ color: '#b91c1c', background: '#fef2f2', padding: '0.75rem', borderRadius: 8 }}>{error}<button onClick={() => { setError(''); setLoading(true); load(); }} style={{ marginLeft: 12 }}>Retry</button></p>}
    <div style={{ overflowX: 'auto' }}><table style={S.table}><thead><tr>{['Portrait', 'Name', 'Role', 'Contact', 'Visibility', 'Actions'].map(x => <th key={x} style={S.th}>{x}</th>)}</tr></thead>
      <tbody>{items.map(agent => <tr key={agent.id}>
        <td style={S.td}>{agent.portrait_url ? <img src={agent.portrait_url} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '50%' }} /> : '—'}</td>
        <td style={S.td}>{agent.name}</td><td style={S.td}>{agent.role}</td><td style={S.td}>{agent.phone}<br />{agent.email}</td>
        <td style={S.td}><span style={{ color: agent.published ? '#047857' : '#64748b', fontWeight: 600 }}>{agent.published ? 'Published' : 'Draft'}</span></td>
        <td style={S.td}><button style={S.action} onClick={() => navigate(`/agents/${agent.id}/edit`)}>Edit</button><button style={S.delete} onClick={() => remove(agent)}>Delete</button></td>
      </tr>)}{items.length === 0 && <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>No profiles yet. Add an agent or employee to get started.</td></tr>}</tbody>
    </table></div>
  </div>;
}
