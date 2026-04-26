import { useState, useCallback, useRef } from 'react';
import { analysisAPI } from '../services/api';
import { useWebSocketEvent } from './useWebSocket';
import { MAX_GRAPH_POINTS } from '../utils/constants';

export const useAnalysis = () => {
  const [session, setSession] = useState(null);
  const [readings, setReadings] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const sessionRef = useRef(null);

  useWebSocketEvent('sensor_reading', (data) => {
    if (!sessionRef.current || data.sessionId !== sessionRef.current.id) return;
    setReadings((prev) => {
      const next = [...prev, { ...data.reading, t: prev.length }];
      return next.length > MAX_GRAPH_POINTS ? next.slice(-MAX_GRAPH_POINTS) : next;
    });
  });

  useWebSocketEvent('analysis_result', (data) => {
    if (!sessionRef.current || data.sessionId !== sessionRef.current.id) return;
    setAnalysisResult(data.result);
    setIsRunning(false);
  });

  const startSession = useCallback(async (name, notes = '') => {
    try {
      setError(null);
      setReadings([]);
      setAnalysisResult(null);
      const res = await analysisAPI.startSession({ name, notes });
      setSession(res.session);
      sessionRef.current = res.session;
      setIsRunning(true);
      return res.session;
    } catch (err) {
      setError(err.message || 'Failed to start session');
      throw err;
    }
  }, []);

  const stopSession = useCallback(async () => {
    if (!sessionRef.current) return;
    try {
      const res = await analysisAPI.stopSession(sessionRef.current.id);
      setSession(res.session);
      setAnalysisResult(res.analysis);
      setIsRunning(false);
      return res;
    } catch (err) {
      setError(err.message || 'Failed to stop session');
      throw err;
    }
  }, []);

  const loadSession = useCallback(async (id) => {
    const res = await analysisAPI.getSession(id);
    setSession(res.session);
    setReadings(res.session.readings || []);
    return res.session;
  }, []);

  return {
    session, readings, analysisResult, isRunning, error,
    startSession, stopSession, loadSession,
  };
};
