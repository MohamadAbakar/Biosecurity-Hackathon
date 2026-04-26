import React from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../services/api';

const StatusRow = ({ dot, dotColor, bg, title, sub, badge }) => (
  <div className={`flex items-center justify-between px-3 py-2.5 rounded-md ${bg}`}>
    <div className="flex items-center gap-2.5">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
      <div>
        <div className="text-xs font-medium text-foreground">{title}</div>
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      </div>
    </div>
    {badge}
  </div>
);

const SystemStatus = ({ deviceConnected, recentSessions }) => {
  const isRunning     = recentSessions.some(s => s.status === 'running');
  const totalSessions = recentSessions.length;

  const connectMutation = useMutation({ mutationFn: () => api.post('/device/connect') });

  return (
    <div className="bg-card border border-border rounded-lg shadow-card flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">System Status</h3>
      </div>

      <div className="p-4 space-y-2 flex-1">
        {/* Device */}
        <StatusRow
          dot={deviceConnected ? 'bg-green-500 animate-pulse' : 'bg-red-400'}
          bg={deviceConnected ? 'bg-green-50' : 'bg-red-50/60'}
          title={deviceConnected ? 'Arduino Connected' : 'No Device'}
          sub={process.env.REACT_APP_ARDUINO_PORT || '/dev/ttyUSB0'}
          badge={
            !deviceConnected && (
              <button
                onClick={() => connectMutation.mutate()}
                disabled={connectMutation.isPending}
                className="text-[11px] bg-primary text-primary-foreground px-2.5 py-1 rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {connectMutation.isPending ? 'Connecting…' : 'Connect'}
              </button>
            )
          }
        />

        {/* Analysis running */}
        <StatusRow
          dot={isRunning ? 'bg-blue-500 animate-pulse' : 'bg-muted-foreground/30'}
          bg={isRunning ? 'bg-blue-50' : 'bg-muted/50'}
          title={isRunning ? 'Analysis Running' : 'No Active Analysis'}
          sub={isRunning ? 'Recording in progress' : 'Start a session to begin'}
          badge={
            isRunning && (
              <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                Active
              </span>
            )
          }
        />

        {/* Session counter */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-md bg-muted/50 mt-1">
          <span className="text-xs text-muted-foreground">Total Sessions</span>
          <span className="text-lg font-bold text-foreground tabular-nums">{totalSessions}</span>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
