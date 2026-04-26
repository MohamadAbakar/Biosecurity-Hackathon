const { pool } = require('../config/database');
const logger = require('../utils/logger');

const startAnalysisSession = async (req, res) => {
  try {
    const { sessionName, operatorId, notes } = req.body;

    const query = `
      INSERT INTO analysis_sessions (session_name, operator_id, notes, status, started_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;

    const values = [sessionName, operatorId, notes, 'running'];
    const result = await pool.query(query, values);

    const arduinoService = req.app.get('arduinoService');
    if (arduinoService) {
      arduinoService.setCurrentSession(result.rows[0].id);
    }

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Failed to start analysis session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start analysis session'
    });
  }
};

const stopAnalysisSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const arduinoService = req.app.get('arduinoService');
    if (arduinoService) {
      arduinoService.setCurrentSession(null);
    }

    const query = `
      UPDATE analysis_sessions
      SET status = $1, ended_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const values = ['completed', sessionId];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Failed to stop analysis session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop analysis session'
    });
  }
};

const getAnalysisSessions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.*, u.username as operator_name,
             COUNT(sr.id) as reading_count,
             COUNT(ar.id) as result_count
      FROM analysis_sessions s
      LEFT JOIN users u ON s.operator_id = u.id
      LEFT JOIN sensor_readings sr ON s.id = sr.session_id
      LEFT JOIN analysis_results ar ON s.id = ar.session_id
    `;

    const values = [];
    if (status) {
      query += ` WHERE s.status = $1`;
      values.push(status);
    }

    query += `
      GROUP BY s.id, u.username
      ORDER BY s.started_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    let countQuery = 'SELECT COUNT(*) FROM analysis_sessions';
    const countValues = [];
    if (status) {
      countQuery += ' WHERE status = $1';
      countValues.push(status);
    }

    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page:  parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Failed to get analysis sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analysis sessions'
    });
  }
};

const getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const sessionQuery = `
      SELECT s.*, u.username as operator_name
      FROM analysis_sessions s
      LEFT JOIN users u ON s.operator_id = u.id
      WHERE s.id = $1
    `;
    const sessionResult = await pool.query(sessionQuery, [sessionId]);

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const readingsQuery = `
      SELECT * FROM sensor_readings
      WHERE session_id = $1
      ORDER BY timestamp DESC
      LIMIT 100
    `;
    const readingsResult = await pool.query(readingsQuery, [sessionId]);

    const resultsQuery = `
      SELECT ar.*, p.name as peptide_name, p.danger_level
      FROM analysis_results ar
      LEFT JOIN peptides p ON ar.peptide_id = p.id
      WHERE ar.session_id = $1
      ORDER BY ar.detected_at DESC
    `;
    const resultsResult = await pool.query(resultsQuery, [sessionId]);

    res.json({
      success: true,
      data: {
        session:  sessionResult.rows[0],
        readings: readingsResult.rows,
        results:  resultsResult.rows
      }
    });
  } catch (error) {
    logger.error('Failed to get session details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get session details'
    });
  }
};

module.exports = {
  startAnalysisSession,
  stopAnalysisSession,
  getAnalysisSessions,
  getSessionDetails
};
