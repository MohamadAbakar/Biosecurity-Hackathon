import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sensorData, setSensorData] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [deviceStatus, setDeviceStatus] = useState({ connected: false });
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const newSocket = io(
      process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000',
      { withCredentials: true }
    );

    newSocket.on('connect', () => {
      setIsConnected(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      newSocket.emit('authenticate', { userId: user.id, role: user.role });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('sensor-data', (data) => {
      setSensorData(prev => [...prev, data].slice(-200));
    });

    newSocket.on('analysis-result', (result) => {
      setAnalysisResults(prev => [result, ...prev].slice(0, 50));
      if (result.confidence > 0.8) {
        toast.success(`Peptide detected: ${result.matches?.[0]?.name}`);
      }
    });

    newSocket.on('device-status', (status) => {
      setDeviceStatus(status);
      if (status.connected) {
        toast.success('Arduino device connected');
      } else {
        toast.error('Arduino device disconnected');
      }
    });

    newSocket.on('alert', (alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 20));
      switch (alert.severity) {
        case 'critical': toast.error(alert.message);                        break;
        case 'warning':  toast(alert.message, { icon: '⚠️' });              break;
        default:         toast(alert.message);
      }
    });

    newSocket.on('connection-status', (status) => {
      console.debug('Connection status:', status);
    });

    setSocket(newSocket);
    return () => { newSocket.close(); };
  }, []);

  const subscribeToAnalysis = (sessionId) => {
    socket?.emit('subscribe-to-analysis', sessionId);
  };

  const unsubscribeFromAnalysis = (sessionId) => {
    socket?.emit('unsubscribe-from-analysis', sessionId);
  };

  return (
    <WebSocketContext.Provider value={{
      socket,
      isConnected,
      sensorData,
      analysisResults,
      deviceStatus,
      alerts,
      subscribeToAnalysis,
      unsubscribeFromAnalysis,
      clearSensorData:  () => setSensorData([]),
      clearResults:     () => setAnalysisResults([]),
      clearAlerts:      () => setAlerts([]),
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};
