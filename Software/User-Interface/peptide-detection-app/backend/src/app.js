const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { connectDB } = require('./config/database');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const peptideRoutes = require('./routes/peptides');
const analysisRoutes = require('./routes/analysis');
const deviceRoutes = require('./routes/device');

// Import services
const WebSocketService = require('./services/websocketService');
const ArduinoService = require('./services/arduinoService');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/peptides', peptideRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/device', deviceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Initialize services
const wsService = new WebSocketService(io);
const arduinoService = new ArduinoService(wsService);

// Expose services on the app instance so controllers can access via req.app.get()
app.set('arduinoService', arduinoService);
app.set('analysisService', arduinoService.analysisService);
app.set('wsService', wsService);

// Database connection
connectDB()
  .then(() => {
    logger.info('Database connected successfully');

    // Start Arduino service
    arduinoService.initialize();

    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    logger.error('Failed to connect to database:', err);
    process.exit(1);
  });

module.exports = { app, server, io };
