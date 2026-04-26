const { pool } = require('../config/database');
const logger = require('../utils/logger');

const getAllPeptides = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, dangerLevel } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, name, sequence, molecular_weight, chemical_formula,
             classification, danger_level, description, created_at
      FROM peptides
      WHERE active = true
    `;
    const values = [];

    if (search) {
      query += ` AND (name ILIKE $${values.length + 1} OR sequence ILIKE $${values.length + 1} OR description ILIKE $${values.length + 1})`;
      values.push(`%${search}%`);
    }

    if (dangerLevel) {
      query += ` AND danger_level = $${values.length + 1}`;
      values.push(dangerLevel);
    }

    query += ` ORDER BY name ASC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    let countQuery = 'SELECT COUNT(*) FROM peptides WHERE active = true';
    const countValues = [];
    let paramIndex = 1;

    if (search) {
      countQuery += ` AND (name ILIKE $${paramIndex} OR sequence ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      countValues.push(`%${search}%`);
      paramIndex++;
    }

    if (dangerLevel) {
      countQuery += ` AND danger_level = $${paramIndex}`;
      countValues.push(dangerLevel);
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
    logger.error('Failed to get peptides:', error);
    res.status(500).json({ success: false, message: 'Failed to get peptides' });
  }
};

const getPeptideById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM peptides WHERE id = $1 AND active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Peptide not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error('Failed to get peptide:', error);
    res.status(500).json({ success: false, message: 'Failed to get peptide' });
  }
};

const createPeptide = async (req, res) => {
  try {
    const {
      name, sequence, molecularWeight, chemicalFormula,
      classification, dangerLevel, description, referenceSpectrum
    } = req.body;

    const query = `
      INSERT INTO peptides (
        name, sequence, molecular_weight, chemical_formula,
        classification, danger_level, description, reference_spectrum
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      name, sequence, molecularWeight, chemicalFormula,
      classification, dangerLevel, description,
      JSON.stringify(referenceSpectrum || [])
    ];

    const result = await pool.query(query, values);

    const analysisService = req.app.get('analysisService');
    if (analysisService) {
      analysisService.reloadPeptideDatabase();
    }

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error('Failed to create peptide:', error);
    res.status(500).json({ success: false, message: 'Failed to create peptide' });
  }
};

const updatePeptide = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = {};
    const allowedFields = [
      'name', 'sequence', 'molecular_weight', 'chemical_formula',
      'classification', 'danger_level', 'description', 'reference_spectrum'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    const setClause = Object.keys(updateFields)
      .map((field, index) => `${field} = $${index + 2}`)
      .join(', ');

    const query = `
      UPDATE peptides
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1 AND active = true
      RETURNING *
    `;

    const values = [id, ...Object.values(updateFields)];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Peptide not found' });
    }

    const analysisService = req.app.get('analysisService');
    if (analysisService) {
      analysisService.reloadPeptideDatabase();
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error('Failed to update peptide:', error);
    res.status(500).json({ success: false, message: 'Failed to update peptide' });
  }
};

const deletePeptide = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE peptides SET active = false, updated_at = NOW()
       WHERE id = $1 AND active = true
       RETURNING id, name`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Peptide not found' });
    }

    const analysisService = req.app.get('analysisService');
    if (analysisService) {
      analysisService.reloadPeptideDatabase();
    }

    res.json({ success: true, message: 'Peptide deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete peptide:', error);
    res.status(500).json({ success: false, message: 'Failed to delete peptide' });
  }
};

module.exports = {
  getAllPeptides,
  getPeptideById,
  createPeptide,
  updatePeptide,
  deletePeptide
};
