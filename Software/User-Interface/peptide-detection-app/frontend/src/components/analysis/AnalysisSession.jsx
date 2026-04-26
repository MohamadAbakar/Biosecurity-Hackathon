import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useWebSocket } from '../../hooks/useWebSocket';

import RealTimeGraph from './RealTimeGraph';
import ResultsPanel from './ResultsPanel';

const DEVICE_NAME = process.env.REACT_APP_DEVICE_NAME || 'PeptideDetect Unit 1';

const SAMPLE_ORIGINS = [
  { value: '',                    label: 'Select sample origin…' },
  { value: 'domestic',            label: 'Domestically Made' },
  { value: 'overseas',            label: 'Overseas / Imported' },
  { value: 'unknown',             label: 'Unknown Origin' },
  { value: 'confiscated',         label: 'Confiscated / Seized' },
  { value: 'lab_synthesized',     label: 'Lab Synthesized' },
  { value: 'commercial_purchase', label: 'Commercial Purchase' },
  { value: 'field_collected',     label: 'Field Collected' },
  { value: 'clinical_sample',     label: 'Clinical Sample' },
  { value: 'environmental',       label: 'Environmental Sample' },
];

/* ── Shared field label ──────────────────────────────────────────────────── */
const Label = ({ children }) => (
  <label className="block text-xs font-medium text-foreground mb-1.5">{children}</label>
);

/* ── Read-only info chip (used in active session summary) ────────────────── */
const InfoChip = ({ label, value, accent }) => (
  <div className={`px-3 py-2.5 rounded-md ${accent ? 'bg-blue-50' : 'bg-muted/50'}`}>
    <div className={`text-[11px] mb-0.5 ${accent ? 'text-blue-500' : 'text-muted-foreground'}`}>{label}</div>
    <div className={`text-xs font-semibold ${accent ? 'text-blue-900 font-mono tabular-nums' : 'text-foreground'}`}>
      {value}
    </div>
  </div>
);

/* ── Stat card (session statistics) ─────────────────────────────────────── */
const StatCard = ({ value, label, colorClass }) => (
  <div className={`flex flex-col items-center justify-center p-4 rounded-md ${colorClass}`}>
    <span className="text-2xl font-bold tabular-nums">{value}</span>
    <span className="text-xs mt-0.5 font-medium">{label}</span>
  </div>
);

const AnalysisSession = () => {
  const [currentSession, setCurrentSession] = useState(null);
  const [sampleOrigin, setSampleOrigin]     = useState('');
  const [notes, setNotes]                   = useState('');
  const [elapsed, setElapsed]               = useState(0);

  const queryClient = useQueryClient();
  const { subscribeToAnalysis, unsubscribeFromAnalysis, deviceStatus } = useWebSocket();

  const { data: allSessionsData } = useQuery({
    queryKey: ['analysis-sessions-count'],
    queryFn:  () => api.get('/analysis?limit=1'),
  });
  const totalSessions    = allSessionsData?.data?.pagination?.total ?? 0;
  const autoSampleName   = `Sample #${totalSessions + 1}`;

  useEffect(() => {
    if (!currentSession) { setElapsed(0); return; }
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(currentSession.started_at)) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [currentSession]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  const startMutation = useMutation({
    mutationFn: (body) => api.post('/analysis/sessions/start', body),
    onSuccess: (res) => {
      const session = res.data.data;
      setCurrentSession(session);
      subscribeToAnalysis(session.id);
      toast.success(`${autoSampleName} started`);
      queryClient.invalidateQueries(['analysis-sessions']);
      queryClient.invalidateQueries(['analysis-sessions-count']);
    },
    onError: () => toast.error('Failed to start analysis session'),
  });

  const stopMutation = useMutation({
    mutationFn: (id) => api.put(`/analysis/sessions/${id}/stop`),
    onSuccess: () => {
      if (currentSession) unsubscribeFromAnalysis(currentSession.id);
      setCurrentSession(null);
      setSampleOrigin('');
      setNotes('');
      toast.success('Analysis session stopped');
      queryClient.invalidateQueries(['analysis-sessions']);
      queryClient.invalidateQueries(['analysis-sessions-count']);
    },
    onError: () => toast.error('Failed to stop analysis session'),
  });

  const { data: sessionDetails } = useQuery({
    queryKey: ['session-details', currentSession?.id],
    queryFn:  () => api.get(`/analysis/sessions/${currentSession.id}`),
    enabled:  !!currentSession?.id,
    refetchInterval: 5000,
  });

  const handleStart = () => {
    if (!deviceStatus.connected) { toast.error('Arduino device not connected'); return; }
    if (!sampleOrigin)           { toast.error('Please select a sample origin'); return; }
    const originLabel = SAMPLE_ORIGINS.find(o => o.value === sampleOrigin)?.label ?? sampleOrigin;
    startMutation.mutate({
      sessionName: autoSampleName,
      operatorId:  null,
      notes: [`Device: ${DEVICE_NAME}`, `Origin: ${originLabel}`, notes ? `Notes: ${notes}` : null]
        .filter(Boolean).join('\n'),
    });
  };

  const isActive = currentSession?.status === 'running';
  const details  = sessionDetails?.data?.data;

  const inputCls = `w-full px-3 py-2 text-sm bg-background border border-input rounded-md
    text-foreground placeholder:text-muted-foreground
    focus:outline-none focus:ring-2 focus:ring-ring transition-shadow`;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* Page header */}
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Analysis Session</h1>
          {!isActive && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Next sample will be logged as{' '}
              <span className="font-semibold text-foreground">{autoSampleName}</span>
            </p>
          )}
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
          deviceStatus.connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${deviceStatus.connected ? 'bg-green-500' : 'bg-red-500'}`} />
          Device {deviceStatus.connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Session control card */}
      <div className="bg-card border border-border rounded-lg shadow-card">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Session Control</h3>
        </div>

        <div className="p-5">
          {!isActive ? (
            /* ── Setup form ── */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>
                    Sample ID
                    <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">(auto-assigned)</span>
                  </Label>
                  <input
                    type="text" value={autoSampleName} disabled
                    className={`${inputCls} bg-muted/60 text-foreground font-medium cursor-default`}
                  />
                </div>
                <div>
                  <Label>Device</Label>
                  <input
                    type="text" value={DEVICE_NAME} disabled
                    className={`${inputCls} bg-muted/60 cursor-default`}
                  />
                </div>
              </div>

              <div>
                <Label>
                  Sample Origin <span className="text-destructive">*</span>
                </Label>
                <select
                  value={sampleOrigin}
                  onChange={e => setSampleOrigin(e.target.value)}
                  className={inputCls}
                >
                  {SAMPLE_ORIGINS.map(({ value, label }) => (
                    <option key={value} value={value} disabled={value === ''}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Notes</Label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Enter any notes/description about the given sample"
                  rows={3}
                  className={inputCls}
                />
              </div>

              <button
                onClick={handleStart}
                disabled={!deviceStatus.connected || startMutation.isPending}
                className="bg-green-600 text-white text-sm font-medium px-5 py-2 rounded-md
                           hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {startMutation.isPending ? 'Starting…' : 'Start Analysis'}
              </button>
            </div>

          ) : (
            /* ── Active session summary ── */
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <InfoChip label="Sample"  value={currentSession.session_name} />
                <InfoChip label="Device"  value={DEVICE_NAME} />
                <InfoChip label="Started" value={new Date(currentSession.started_at).toLocaleTimeString()} />
                <InfoChip label="Elapsed" value={fmt(elapsed)} accent />
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => stopMutation.mutate(currentSession.id)}
                  disabled={stopMutation.isPending}
                  className="bg-destructive text-white text-sm font-medium px-5 py-2 rounded-md
                             hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {stopMutation.isPending ? 'Stopping…' : 'Stop Session'}
                </button>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground">Recording…</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live charts (visible only while session is active) */}
      {isActive && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2"><RealTimeGraph /></div>
          <div><ResultsPanel sessionData={details} sessionId={currentSession?.id} /></div>
        </div>
      )}

      {/* Session statistics */}
      {details && (
        <div className="bg-card border border-border rounded-lg shadow-card">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Session Statistics</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                value={details.readings?.length ?? 0}
                label="Total Readings"
                colorClass="bg-blue-50 text-blue-800"
              />
              <StatCard
                value={details.results?.length ?? 0}
                label="Detections"
                colorClass="bg-green-50 text-green-800"
              />
              <StatCard
                value={details.results?.filter(r => r.confidence_level > 0.8).length ?? 0}
                label="High Confidence"
                colorClass="bg-yellow-50 text-yellow-800"
              />
              <StatCard
                value={details.results?.filter(r => r.danger_level === 'critical').length ?? 0}
                label="Critical Threats"
                colorClass="bg-red-50 text-red-800"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisSession;
