import { User, Mail, Shield, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatters';

const UserProfile = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Profile</h2>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'var(--accent-dim)', border: '2px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User size={28} color="var(--accent)" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{user.username}</div>
            <span className="badge badge-info" style={{ marginTop: 4, textTransform: 'capitalize' }}>{user.role}</span>
          </div>
        </div>

        {[
          { icon: Mail, label: 'Email', value: user.email },
          { icon: Shield, label: 'Role', value: user.role },
          { icon: Clock, label: 'Member since', value: formatDate(user.created_at) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 0', borderBottom: '1px solid var(--border)',
          }}>
            <Icon size={16} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-muted)', fontSize: 13, width: 100 }}>{label}</span>
            <span style={{ color: 'var(--text-primary)', fontSize: 14 }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProfile;
