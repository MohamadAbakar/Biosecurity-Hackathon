import { X, FlaskConical } from 'lucide-react';

const PeptideDetails = ({ peptide, onClose }) => {
  if (!peptide) return null;

  const fields = [
    { label: 'Sequence',          value: peptide.sequence,          mono: true },
    { label: 'Category',          value: peptide.category },
    { label: 'Molecular Weight',  value: peptide.molecular_weight ? `${peptide.molecular_weight} Da` : '—' },
    { label: 'Charge',            value: peptide.charge ?? '—' },
    { label: 'Isoelectric Point', value: peptide.isoelectric_point ?? '—' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: 560, maxHeight: '85vh', overflow: 'auto' }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: 'var(--accent-dim)',
            border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FlaskConical size={18} color="var(--accent)" />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>{peptide.name}</h2>
            {peptide.category && <span className="badge badge-info" style={{ marginTop: 2 }}>{peptide.category}</span>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {peptide.description && (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20, lineHeight: 1.7 }}>
            {peptide.description}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {fields.map(({ label, value, mono }) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: '10px 0', borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{label}</span>
              <span style={{
                color: 'var(--text-primary)', fontSize: 13,
                fontFamily: mono ? 'var(--font-mono)' : undefined,
                wordBreak: 'break-all', maxWidth: '60%', textAlign: 'right',
              }}>{value || '—'}</span>
            </div>
          ))}
        </div>

        {peptide.electrochem_data && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Electrochemical Reference</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {Object.entries(peptide.electrochem_data).map(([k, v]) => (
                <div key={k} style={{
                  background: 'var(--bg-elevated)', borderRadius: 8, padding: '8px 12px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{k}</div>
                  <div className="mono" style={{ fontSize: 13, color: 'var(--accent)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PeptideDetails;
