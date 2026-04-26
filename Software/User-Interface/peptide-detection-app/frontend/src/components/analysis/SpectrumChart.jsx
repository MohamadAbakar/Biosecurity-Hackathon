import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

const SpectrumChart = ({ readings = [] }) => {
  // Compute histogram-style bins of voltage values
  const voltages = readings
    .map((r) => parseFloat(r.voltage))
    .filter((v) => !isNaN(v));

  if (!voltages.length) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No spectrum data yet</p>
      </div>
    );
  }

  const bins = 40;
  const min = Math.min(...voltages);
  const max = Math.max(...voltages);
  const step = (max - min) / bins || 1;

  const counts = Array.from({ length: bins }, (_, i) => ({
    mv: parseFloat((min + i * step).toFixed(1)),
    count: 0,
  }));

  voltages.forEach((v) => {
    const idx = Math.min(Math.floor((v - min) / step), bins - 1);
    counts[idx].count++;
  });

  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={counts} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="specGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.voltage} stopOpacity={0.4} />
              <stop offset="95%" stopColor={CHART_COLORS.voltage} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="mv" tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            label={{ value: 'Voltage (mV)', position: 'insideBottomRight', offset: -5, fill: 'var(--text-muted)', fontSize: 11 }} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} width={30} />
          <Tooltip
            contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
            formatter={(val) => [val, 'Count']}
            labelFormatter={(l) => `${l} mV`}
          />
          <Area type="monotone" dataKey="count" stroke={CHART_COLORS.voltage}
            fill="url(#specGradient)" strokeWidth={2} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpectrumChart;
