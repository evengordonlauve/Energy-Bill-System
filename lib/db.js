const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.AZURE_POSTGRESQL_USER,
  host: process.env.AZURE_POSTGRESQL_HOST,
  database: process.env.AZURE_POSTGRESQL_DATABASE,
  password: process.env.AZURE_POSTGRESQL_PASSWORD,
  port: parseInt(process.env.AZURE_POSTGRESQL_PORT || '5432', 10),
  ssl:
    process.env.AZURE_POSTGRESQL_SSL === 'true'
      ? { rejectUnauthorized: false }
      : false,
});

module.exports = pool;
