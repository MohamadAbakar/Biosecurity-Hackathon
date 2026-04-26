export const API_BASE = process.env.REACT_APP_API_URL || '/api';
// Socket.IO uses HTTP(S) URLs, not ws:// — the client upgrades internally
export const SOCKET_URL = process.env.REACT_APP_WS_URL || 'http://localhost:5000';

export const SESSION_STATUS = {
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export const ROLES = {
  ADMIN: 'admin',
  RESEARCHER: 'researcher',
  VIEWER: 'viewer',
};

export const CHART_COLORS = {
  voltage: '#38bdf8',
  current: '#34d399',
  impedance: '#f472b6',
  temperature: '#fbbf24',
};

export const MAX_GRAPH_POINTS = 200;
