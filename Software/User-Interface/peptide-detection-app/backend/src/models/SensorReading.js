const { pool } = require('../config/database');

class SensorReading {
  static async create({ session_id, timestamp, raw_data, processed_data, confidence_score = 0 }) {
    const { rows } = await pool.query(
      `INSERT INTO sensor_readings (session_id, timestamp, raw_data, processed_data, confidence_score)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        session_id,
        timestamp || new Date(),
        typeof raw_data       === 'string' ? raw_data       : JSON.stringify(raw_data),
        typeof processed_data === 'string' ? processed_data : JSON.stringify(processed_data),
        confidence_score,
      ]
    );
    return rows[0];
  }

  static async updateConfidence(id, confidence_score) {
    const { rows } = await pool.query(
      'UPDATE sensor_readings SET confidence_score = $1 WHERE id = $2 RETURNING *',
      [confidence_score, id]
    );
    return rows[0] || null;
  }

  static async getBySession(session_id, limit = 500) {
    const { rows } = await pool.query(
      `SELECT * FROM sensor_readings
       WHERE session_id = $1
       ORDER BY timestamp ASC
       LIMIT $2`,
      [session_id, limit]
    );
    return rows;
  }

  static async getLatestForSession(session_id, count = 50) {
    const { rows } = await pool.query(
      `SELECT * FROM (
         SELECT * FROM sensor_readings
         WHERE session_id = $1
         ORDER BY timestamp DESC LIMIT $2
       ) sub ORDER BY timestamp ASC`,
      [session_id, count]
    );
    return rows;
  }

  static async getStats(session_id) {
    const { rows } = await pool.query(
      `SELECT
         COUNT(*)                  AS reading_count,
         AVG(confidence_score)     AS avg_confidence,
         MAX(confidence_score)     AS max_confidence,
         MIN(timestamp)            AS first_reading,
         MAX(timestamp)            AS last_reading
       FROM sensor_readings WHERE session_id = $1`,
      [session_id]
    );
    return rows[0];
  }

  static async getHighConfidenceReadings(session_id, threshold = 0.7) {
    const { rows } = await pool.query(
      `SELECT * FROM sensor_readings
       WHERE session_id = $1 AND confidence_score >= $2
       ORDER BY confidence_score DESC`,
      [session_id, threshold]
    );
    return rows;
  }
}

module.exports = SensorReading;
