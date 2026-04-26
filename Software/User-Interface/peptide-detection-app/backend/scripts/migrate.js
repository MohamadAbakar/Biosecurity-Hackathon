require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

const migrationsDir = path.join(__dirname, '../database/migrations');

(async () => {
  const client = await pool.connect();
  try {
    const files = fs.readdirSync(migrationsDir).sort();
    for (const file of files) {
      if (!file.endsWith('.sql')) continue;
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      console.log(`Running migration: ${file}`);
      await client.query(sql);
    }
    console.log('All migrations completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
