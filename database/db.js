// PostgreSQL Database Pool Connection Setup
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'medastrax_db',
  password: process.env.PGPASSWORD || 'postgres',
  port: process.env.PGPORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('🐘 PostgreSQL Database Connected Successfully!');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL Unexpected Client Error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
