require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'peptide_user',
    password: process.env.DB_PASSWORD || 'peptide_pass',
    name: process.env.DB_NAME || 'peptide_db',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  arduino: {
    port: process.env.ARDUINO_PORT || '/dev/ttyUSB0',
    baud: parseInt(process.env.ARDUINO_BAUD, 10) || 9600,
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

module.exports = env;
