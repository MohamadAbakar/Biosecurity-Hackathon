let SerialPort, ReadlineParser;
try {
  SerialPort     = require('serialport').SerialPort;
  ReadlineParser = require('@serialport/parser-readline').ReadlineParser;
} catch (_) {
  // serialport is an optional dep — Arduino features disabled in this environment
}
const logger = require('../utils/logger');
const AnalysisService = require('./analysisService');

class ArduinoService {
  constructor(websocketService) {
    this.port = null;
    this.parser = null;
    this.isConnected = false;
    this.wsService = websocketService;
    this.analysisService = new AnalysisService();
    this.currentSession = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    ArduinoService._instance = this;
  }

  /** Retrieve the singleton created by app.js (used by controllers). */
  static getInstance() {
    return ArduinoService._instance;
  }

  async initialize() {
    if (!SerialPort) {
      logger.warn('SerialPort module not available — Arduino features disabled (run inside Docker for full support)');
      return;
    }
    try {
      await this.connect();
      this.setupDataHandlers();
    } catch (error) {
      logger.error('Arduino initialization failed:', error);
      this.scheduleReconnect();
    }
  }

  async connect() {
    const portPath = process.env.ARDUINO_PORT || '/dev/ttyUSB0';
    const baudRate = parseInt(process.env.ARDUINO_BAUD_RATE) || 9600;

    this.port = new SerialPort({
      path: portPath,
      baudRate: baudRate,
      autoOpen: false
    });

    this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));

    return new Promise((resolve, reject) => {
      this.port.open((err) => {
        if (err) {
          reject(err);
        } else {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          logger.info('Arduino connected successfully');
          this.wsService.broadcast('device-status', { connected: true });
          resolve();
        }
      });
    });
  }

  setupDataHandlers() {
    this.parser.on('data', (data) => {
      try {
        const sensorData = this.parseArduinoData(data.trim());
        this.processSensorData(sensorData);
      } catch (error) {
        logger.error('Error processing Arduino data:', error);
      }
    });

    this.port.on('error', (err) => {
      logger.error('Arduino port error:', err);
      this.handleDisconnection();
    });

    this.port.on('close', () => {
      logger.warn('Arduino port closed');
      this.handleDisconnection();
    });
  }

  parseArduinoData(rawData) {
    try {
      // Arduino sends JSON: {"timestamp":1234567890,"spectrum":[1.2,3.4],"temperature":25.5}
      const parsed = JSON.parse(rawData);
      return {
        timestamp:   new Date(parsed.timestamp || Date.now()),
        spectrum:    parsed.spectrum    || [],
        temperature: parsed.temperature || 0,
        humidity:    parsed.humidity    || 0,
        raw:         rawData
      };
    } catch (error) {
      logger.warn('Failed to parse JSON, using raw data:', error);
      return {
        timestamp: new Date(),
        raw:       rawData,
        spectrum:  []
      };
    }
  }

  async processSensorData(sensorData) {
    try {
      await this.storeSensorReading(sensorData);

      this.wsService.broadcast('sensor-data', sensorData);

      if (sensorData.spectrum && sensorData.spectrum.length > 0) {
        const analysis = await this.analysisService.analyzeSample(sensorData);

        if (analysis.matches.length > 0) {
          this.wsService.broadcast('analysis-result', analysis);

          if (analysis.confidence > 0.8) {
            this.wsService.broadcast('alert', {
              type:       'detection',
              severity:   analysis.dangerLevel,
              message:    `Peptide detected: ${analysis.matches[0].name}`,
              confidence: analysis.confidence,
              timestamp:  new Date()
            });
          }
        }
      }
    } catch (error) {
      logger.error('Error processing sensor data:', error);
    }
  }

  async storeSensorReading(sensorData) {
    const { pool } = require('../config/database');
    const query = `
      INSERT INTO sensor_readings (session_id, timestamp, raw_data, processed_data, confidence_score)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const values = [
      this.currentSession,
      sensorData.timestamp,
      JSON.stringify({ raw: sensorData.raw }),
      JSON.stringify({
        spectrum:    sensorData.spectrum,
        temperature: sensorData.temperature,
        humidity:    sensorData.humidity
      }),
      0 // Updated after analysis
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0].id;
    } catch (error) {
      logger.error('Failed to store sensor reading:', error);
      throw error;
    }
  }

  handleDisconnection() {
    this.isConnected = false;
    this.wsService.broadcast('device-status', { connected: false });
    this.scheduleReconnect();
  }

  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      setTimeout(() => {
        this.reconnectAttempts++;
        logger.info(`Attempting to reconnect to Arduino (attempt ${this.reconnectAttempts})`);
        this.initialize();
      }, delay);
    } else {
      logger.error('Max reconnection attempts reached');
    }
  }

  setCurrentSession(sessionId) {
    this.currentSession = sessionId;
    // Keep the analysis service in sync so stored results carry the right session FK
    this.analysisService.setCurrentSession(sessionId);
  }

  isDeviceConnected() {
    return this.isConnected;
  }

  getStatus() {
    return {
      connected:       this.isConnected,
      port:            process.env.ARDUINO_PORT || '/dev/ttyUSB0',
      baud:            parseInt(process.env.ARDUINO_BAUD_RATE) || 9600,
      currentSession:  this.currentSession,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  async sendCommand(command) {
    if (this.isConnected && this.port) {
      return new Promise((resolve, reject) => {
        this.port.write(command + '\n', (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } else {
      throw new Error('Arduino not connected');
    }
  }

  async disconnect() {
    return new Promise((resolve) => {
      if (this.port && this.port.isOpen) {
        this.port.close(() => {
          this.isConnected = false;
          this.currentSession = null;
          this.wsService.broadcast('device-status', { connected: false });
          resolve({ success: true });
        });
      } else {
        this.isConnected = false;
        resolve({ success: true });
      }
    });
  }
}

module.exports = ArduinoService;
