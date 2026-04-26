require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

const seedFile = path.join(__dirname, '../database/seeds/sample_peptides.sql');

(async () => {
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(seedFile, 'utf-8');
    console.log('Running seed: sample_peptides.sql');
    await client.query(sql);
    console.log('Seed completed.');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
