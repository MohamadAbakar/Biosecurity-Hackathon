import React from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

import SystemStatus from './SystemStatus';
import LiveAnalysis from './LiveAnalysis';
import RecentResults from './RecentResults';
import AlertPanel from '../common/AlertBanner';

const Dashboard = () => {
  const { deviceStatus, alerts, analysisResults } = useWebSocket();

  const { data: sessionsData } = useQuery({
    queryKey: ['analysis-sessions', { limit: 5 }],
    queryFn:  () => api.get('/analysis?limit=5'),
    refetchInterval: 30000,
  });

  const recentSessions = sessionsData?.data?.data || [];
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).slice(0, 3);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Page title */}
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold text-foreground tracking-tight">Dashboard</h1>
        <span className="text-xs text-muted-foreground">Real-time monitoring</span>
      </div>

      {/* Alerts */}
      {unacknowledgedAlerts.length > 0 && (
        <AlertPanel alerts={unacknowledgedAlerts} />
      )}

      {/* Top row: status + detection history */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SystemStatus deviceConnected={deviceStatus.connected} recentSessions={recentSessions} />
        <div className="lg:col-span-2">
          <LiveAnalysis />
        </div>
      </div>

      {/* Bottom row: live detections (full width) */}
      <RecentResults results={analysisResults} />
    </div>
  );
};

export default Dashboard;
