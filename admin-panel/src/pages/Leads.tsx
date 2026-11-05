import { useEffect, useState } from 'react';
import { api, type Lead } from '../api';

const S = {
  title: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' } as const,
  table: { width: '100%', borderCollapse: 'collapse' as const, background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.08)' },
  th:    { padding: '0.75rem 1rem', background: '#f8fafc', textAlign: 'left' as const, fontSize: '0.8rem', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' },
  td:    { padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' },
};

export default function Leads() {
  const [items, setItems]     = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeads().then(setItems).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h1 style={S.title}>Leads ({items.length})</h1>
      <div style={{ overflowX: 'auto' }}>
      <table style={S.table}>
        <thead>
          <tr>{['Name', 'Email', 'Phone', 'Property', 'Stage', 'Date'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {items.map(l => (
            <tr key={l.id}>
              <td style={S.td}>{l.name}</td>
              <td style={S.td}>{l.email}</td>
              <td style={S.td}>{l.phone}</td>
              <td style={S.td}>{l.property_name ?? '—'}</td>
              <td style={S.td}>{l.stage}</td>
              <td style={S.td}>{new Date(l.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', color: '#94a3b8' }}>No leads yet.</td></tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
