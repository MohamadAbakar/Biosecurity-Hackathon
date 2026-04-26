const { pool } = require('../config/database');

class AnalysisSession {
  static async create({ user_id, name, notes }) {
    const { rows } = await pool.query(
      `INSERT INTO analysis_sessions (user_id, name, notes, status)
       VALUES ($1, $2, $3, 'running')
       RETURNING *`,
      [user_id, name, notes]
    );
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await pool.query('SELECT * FROM analysis_sessions WHERE id = $1', [id]);
    return rows[0] || null;
  }

  static async listByUser(user_id, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM analysis_sessions WHERE user_id = $1',
      [user_id]
    );
    const { rows } = await pool.query(
      `SELECT * FROM analysis_sessions WHERE user_id = $1
       ORDER BY started_at DESC LIMIT $2 OFFSET $3`,
      [user_id, limit, offset]
    );
    return {
      data:  rows,
      total: parseInt(countResult.rows[0].count, 10),
      page,
      limit,
    };
  }

  static async updateStatus(id, status, detected_peptide_id = null) {
    const { rows } = await pool.query(
      `UPDATE analysis_sessions
       SET status = $1,
           detected_peptide_id = COALESCE($2, detected_peptide_id),
           ended_at = CASE WHEN $1 IN ('completed', 'failed') THEN NOW() ELSE ended_at END
       WHERE id = $3
       RETURNING *`,
      [status, detected_peptide_id, id]
    );
    return rows[0] || null;
  }

  static async getWithReadings(id) {
    const sessionResult = await pool.query(
      `SELECT s.*, u.username, p.name AS detected_peptide_name
       FROM analysis_sessions s
       LEFT JOIN users u ON u.id = s.user_id
       LEFT JOIN peptides p ON p.id = s.detected_peptide_id
       WHERE s.id = $1`,
      [id]
    );
    if (!sessionResult.rows[0]) return null;

    const readingsResult = await pool.query(
      'SELECT * FROM sensor_readings WHERE session_id = $1 ORDER BY recorded_at ASC',
      [id]
    );
    return { ...sessionResult.rows[0], readings: readingsResult.rows };
  }
}

module.exports = AnalysisSession;
