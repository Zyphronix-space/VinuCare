const mysql = require('mysql2');
const path  = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'vinucare',
  // Managed MySQL hosts (e.g. Railway) reject plaintext connections
  // (require_secure_transport=ON); localhost dev servers don't need this.
  ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost'
    ? { rejectUnauthorized: false }
    : undefined,
});

module.exports = pool.promise();