const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: process.env.DB_HOST === 'localhost'
    ? false
    : { rejectUnauthorized: false }
});

// Create tables if they don't exist
const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create Classes Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_date TIMESTAMP WITH TIME ZONE,
        end_date TIMESTAMP WITH TIME ZONE,
        schedule VARCHAR(255),
        status VARCHAR(50),
        price DECIMAL(10, 2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        certificates_issued BOOLEAN DEFAULT FALSE,
        trainers TEXT[]
      );
    `);

    // Ensure trainers column exists (migration for existing db)
    await client.query(`
      ALTER TABLE classes 
      ADD COLUMN IF NOT EXISTS trainers TEXT[];
    `);

    // Create Students Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        dob DATE NOT NULL,
        organization VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        class_id UUID REFERENCES classes(id),
        class_name VARCHAR(255), -- Denormalized for simpler querying or just use JOIN
        id_type VARCHAR(50),
        id_file_path VARCHAR(500),
        id_file_name VARCHAR(255),
        enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('Database initialized successfully');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Database initialization error:', e);
  } finally {
    client.release();
  }
};

// Auto-initialize on import (or call explicitly in index.js)
initDb();

module.exports = {
  query: (text, params) => pool.query(text, params),
};
