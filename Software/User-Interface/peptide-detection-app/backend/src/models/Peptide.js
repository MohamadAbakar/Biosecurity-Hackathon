const { pool } = require('../config/database');

class Peptide {
  static async create({ name, sequence, molecular_weight, charge, isoelectric_point, description, category, electrochem_data }) {
    const { rows } = await pool.query(
      `INSERT INTO peptides
         (name, sequence, molecular_weight, charge, isoelectric_point, description, category, electrochem_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, sequence, molecular_weight, charge, isoelectric_point, description, category,
       electrochem_data ? JSON.stringify(electrochem_data) : null]
    );
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await pool.query('SELECT * FROM peptides WHERE id = $1', [id]);
    return rows[0] || null;
  }

  static async search({ name, sequence, category, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (name)     { conditions.push(`name ILIKE $${idx++}`);     params.push(`%${name}%`); }
    if (sequence) { conditions.push(`sequence ILIKE $${idx++}`); params.push(`%${sequence}%`); }
    if (category) { conditions.push(`category = $${idx++}`);     params.push(category); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(`SELECT COUNT(*) FROM peptides ${where}`, params);
    const { rows } = await pool.query(
      `SELECT * FROM peptides ${where} ORDER BY name ASC LIMIT $${idx++} OFFSET $${idx}`,
      [...params, limit, offset]
    );

    return {
      data:  rows,
      total: parseInt(countResult.rows[0].count, 10),
      page,
      limit,
    };
  }

  static async getCategories() {
    const { rows } = await pool.query(
      'SELECT DISTINCT category FROM peptides WHERE category IS NOT NULL ORDER BY category'
    );
    return rows.map((r) => r.category);
  }

  static async update(id, fields) {
    const allowed = ['name', 'sequence', 'molecular_weight', 'charge', 'isoelectric_point', 'description', 'category'];
    const updates = [];
    const params = [];
    let idx = 1;

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${idx++}`);
        params.push(fields[key]);
      }
    }
    if (!updates.length) return null;

    params.push(id);
    const { rows } = await pool.query(
      `UPDATE peptides SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      params
    );
    return rows[0] || null;
  }

  static async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM peptides WHERE id = $1', [id]);
    return rowCount > 0;
  }
}

module.exports = Peptide;
