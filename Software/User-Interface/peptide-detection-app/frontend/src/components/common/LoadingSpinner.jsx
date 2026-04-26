const LoadingSpinner = ({ size = 'md', text = '' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
    <div className={`spinner ${size === 'lg' ? 'spinner-lg' : ''}`} />
    {text && <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{text}</p>}
  </div>
);

export default LoadingSpinner;
