export const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatDuration = (startIso, endIso) => {
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : new Date();
  const secs = Math.floor((end - start) / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

export const formatVoltage = (mv) =>
  mv != null ? `${(mv / 1000).toFixed(3)} V` : '—';

export const formatCurrent = (ua) =>
  ua != null ? `${ua.toFixed(2)} µA` : '—';

export const formatImpedance = (ohm) =>
  ohm != null ? `${ohm.toFixed(0)} Ω` : '—';

export const formatTemperature = (c) =>
  c != null ? `${c.toFixed(1)} °C` : '—';

export const formatConfidence = (val) =>
  val != null ? `${(val * 100).toFixed(1)}%` : '—';

export const truncate = (str, maxLen = 40) =>
  str && str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;
