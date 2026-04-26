import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useWebSocket } from '../../hooks/useWebSocket';

const RealTimeGraph = () => {
  const { sensorData, isConnected } = useWebSocket();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (sensorData.length > 0) {
      setChartData(sensorData.slice(-100).map((d, i) => ({
        index:       i,
        intensity:   d.spectrum?.[0] ?? 0,
        temperature: d.temperature   ?? 0,
      })));
    }
  }, [sensorData]);

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Real-time Sensor</h3>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/40'}`} />
          <span className="text-[11px] text-muted-foreground">{isConnected ? 'Streaming' : 'Paused'}</span>
        </div>
      </div>

      <div className="p-5">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="index" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.75rem',
                  color: 'var(--popover-foreground)',
                }}
                formatter={(v) => v.toFixed(3)}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line
                type="monotone" dataKey="intensity" stroke="#2563eb" strokeWidth={2}
                dot={false} name="Intensity" isAnimationActive={false}
              />
              <Line
                type="monotone" dataKey="temperature" stroke="#16a34a" strokeWidth={1.5}
                dot={false} name="Temp (°C)" isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {!isConnected && (
          <p className="text-center text-muted-foreground text-xs mt-3">Waiting for device…</p>
        )}
      </div>
    </div>
  );
};

export default RealTimeGraph;
