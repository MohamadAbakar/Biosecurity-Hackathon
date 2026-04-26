import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useWebSocket } from '../../hooks/useWebSocket';

const dangerColors = {
  critical: { bg: 'bg-red-100',    text: 'text-red-700',    bar: '#ef4444' },
  high:     { bg: 'bg-orange-100', text: 'text-orange-700', bar: '#f97316' },
  medium:   { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: '#eab308' },
  low:      { bg: 'bg-blue-100',   text: 'text-blue-700',   bar: '#3b82f6' },
  safe:     { bg: 'bg-green-100',  text: 'text-green-700',  bar: '#22c55e' },
  unknown:  { bg: 'bg-purple-100', text: 'text-purple-700', bar: '#a855f7' },
};

const THRESHOLD = 0.6;

const LiveAnalysis = () => {
  const { analysisResults, isConnected } = useWebSocket();

  const detections = useMemo(() => {
    const flat = [];
    analysisResults.forEach((result) => {
      (result.matches ?? []).forEach((match) => {
        flat.push({
          name:        match.name        ?? 'Unknown',
          sequence:    match.sequence    ?? '',
          dangerLevel: match.dangerLevel ?? 'safe',
          confidence:  match.confidence  ?? result.confidence ?? 0,
          timestamp:   result.timestamp  ?? new Date().toISOString(),
        });
      });
    });
    return flat;
  }, [analysisResults]);

  const recognized   = detections.filter(d => d.confidence >= THRESHOLD).length;
  const unrecognized = detections.length - recognized;
  const total        = detections.length;
  const recPct       = total > 0 ? Math.round((recognized   / total) * 100) : 0;
  const unrecPct     = total > 0 ? Math.round((unrecognized / total) * 100) : 0;

  const pieData = [
    { name: 'Recognized',   value: recognized,   color: '#22c55e' },
    { name: 'Unrecognized', value: unrecognized, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-card border border-border rounded-lg shadow-card flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Detection History</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {total} peptide{total !== 1 ? 's' : ''} detected this session
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/40'}`} />
          <span className="text-[11px] text-muted-foreground">{isConnected ? 'Live' : 'Offline'}</span>
        </div>
      </div>

      <div className="p-5 flex-1">
        {total === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <div className="text-3xl mb-2">🔬</div>
            <div className="text-sm font-medium">No detections yet</div>
            <div className="text-xs mt-1">
              {isConnected
                ? 'Start an analysis session to see detections'
                : 'Connect your Arduino and start a session'}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Recognition breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Donut */}
              <div>
                <p className="text-xs font-medium text-foreground mb-2">Recognition Rate</p>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip
                        formatter={(v, n) => [`${v} detections`, n]}
                        contentStyle={{
                          background: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          fontSize: '0.75rem',
                          color: 'var(--popover-foreground)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bars */}
              <div className="flex flex-col justify-center space-y-4">
                {[
                  { label: 'Recognized', pct: recPct,   count: recognized,   color: 'bg-green-500', textColor: 'text-green-700' },
                  { label: 'Unrecognized', pct: unrecPct, count: unrecognized, color: 'bg-red-400',   textColor: 'text-red-600'   },
                ].map(({ label, pct, count, color, textColor }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={`font-medium ${textColor}`}>{label}</span>
                      <span className={`font-semibold tabular-nums ${textColor}`}>{pct}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{count} of {total}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detection log */}
            <div>
              <p className="text-xs font-medium text-foreground mb-2">Detection Log</p>
              <div className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-thin pr-0.5">
                {detections.map((d, i) => {
                  const col = dangerColors[d.dangerLevel] ?? dangerColors.safe;
                  const pct = Math.round(d.confidence * 100);
                  const rec = d.confidence >= THRESHOLD;
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 rounded-md border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${rec ? 'bg-green-500' : 'bg-red-400'}`} />
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-foreground truncate">{d.name}</div>
                          {d.sequence && (
                            <div className="text-[11px] text-muted-foreground font-mono truncate">{d.sequence}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className={`px-1.5 py-0.5 text-[11px] font-medium rounded-md ${col.bg} ${col.text}`}>
                          {d.dangerLevel}
                        </span>
                        <span className={`text-xs font-semibold tabular-nums ${rec ? 'text-green-600' : 'text-red-500'}`}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveAnalysis;
