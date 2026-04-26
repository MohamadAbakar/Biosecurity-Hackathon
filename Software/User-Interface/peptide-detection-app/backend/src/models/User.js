const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ username, email, password, first_name, last_name, role = 'operator' }) {
    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, uuid, username, email, first_name, last_name, role, created_at`,
      [username, email, passwordHash, first_name || null, last_name || null, role]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND active = true',
      [email]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, uuid, username, email, first_name, last_name, role, created_at
       FROM users WHERE id = $1 AND active = true`,
      [id]
    );
    return rows[0] || null;
  }

  static async updateLastLogin(id) {
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [id]);
  }

  static async verifyPassword(plainText, hash) {
    return bcrypt.compare(plainText, hash);
  }
}

module.exports = User;
