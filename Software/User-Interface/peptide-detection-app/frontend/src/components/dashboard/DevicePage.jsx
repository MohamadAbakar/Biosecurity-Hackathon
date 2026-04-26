import { useState, useEffect } from 'react';
import { Cpu, PlugZap, Unplug, RefreshCw } from 'lucide-react';
import { deviceAPI } from '../../services/api';
import { useWebSocketEvent } from '../../hooks/useWebSocket';
import AlertBanner from '../common/AlertBanner';
import LoadingSpinner from '../common/LoadingSpinner';

const DevicePage = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [message, setMessage] = useState(null);

  const fetchStatus = () => {
    setLoading(true);
    deviceAPI.getStatus()
      .then((res) => setStatus(res.status))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStatus(); }, []);

  useWebSocketEvent('device_status', (data) => setStatus(data.status));

  const connect = async () => {
    setActionLoading('connect');
    setMessage(null);
    try {
      const res = await deviceAPI.connect();
      setMessage({ type: 'success', text: res.message || 'Connected' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Connection failed' });
    } finally {
      setActionLoading('');
    }
  };

  const disconnect = async () => {
    setActionLoading('disconnect');
    setMessage(null);
    try {
      await deviceAPI.disconnect();
      setMessage({ type: 'info', text: 'Device disconnected' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Failed to disconnect' });
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Device Management</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
          Manage the Arduino biosensor connection.
        </p>
      </div>

      {message && <AlertBanner type={message.type} message={message.text} dismissible onDismiss={() => setMessage(null)} />}

      <div className="card">
        <div className="card-header">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Cpu size={16} color="var(--accent)" /> Connection Status
          </div>
          <button className="btn btn-ghost btn-sm" onClick={fetchStatus}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {loading ? <LoadingSpinner /> : status ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Status',      value: status.connected ? (status.simulated ? 'Simulation' : 'Connected') : 'Disconnected' },
              { label: 'Serial Port', value: status.port },
              { label: 'Baud Rate',   value: status.baud },
              { label: 'Active Session', value: status.activeSessionId || 'None' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '10px 0', borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{label}</span>
                <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>Unable to fetch status</p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-success" onClick={connect}
          disabled={!!actionLoading || status?.connected}>
          {actionLoading === 'connect' ? <LoadingSpinner size="sm" /> : <PlugZap size={15} />}
          Connect
        </button>
        <button className="btn btn-danger" onClick={disconnect}
          disabled={!!actionLoading || !status?.connected}>
          {actionLoading === 'disconnect' ? <LoadingSpinner size="sm" /> : <Unplug size={15} />}
          Disconnect
        </button>
      </div>

      <div className="card" style={{ background: 'var(--bg-elevated)' }}>
        <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>
          Arduino Data Format
        </h4>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
          The backend expects CSV lines from the Arduino at the configured baud rate:
        </p>
        <code className="mono" style={{
          display: 'block', background: 'var(--bg-base)',
          padding: '10px 14px', borderRadius: 8, fontSize: 13,
          color: 'var(--accent)', border: '1px solid var(--border)',
        }}>
          voltage_adc,current_uA,impedance_ohm,temperature_c
        </code>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          Example: <span className="mono" style={{ color: 'var(--success)' }}>612,45.2,1050.0,25.3</span>
        </p>
      </div>
    </div>
  );
};

export default DevicePage;
