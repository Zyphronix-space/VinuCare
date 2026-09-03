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
  // Without this, idle pooled connections to a remote managed MySQL host
  // (which drops idle TLS connections more aggressively than a typical
  // host) silently die and get re-established from scratch on the next
  // request — paying a full TLS handshake on requests that should've
  // reused a warm connection, which is most of what "the site feels slow"
  // reports on Azure/Railway turned out to be.
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectionLimit: 10,
});

module.exports = pool.promise();