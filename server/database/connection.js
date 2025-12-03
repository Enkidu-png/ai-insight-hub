import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'mariadb-cloud',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'ankieta_user',
  password: process.env.DB_PASSWORD || 'zaq1@WSXDupa',
  database: process.env.DB_NAME || 'ankieta_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection function
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    return false;
  }
};

// Get pool for queries
export const getPool = () => pool;

// Query helper function
export const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Initialize database tables if needed
export const initializeDatabase = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS survey_responses (
      id CHAR(36) PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      profession VARCHAR(255) NOT NULL,
      experience VARCHAR(255) NOT NULL,
      ai_areas TEXT NOT NULL COMMENT 'JSON array of selected AI areas',
      challenge VARCHAR(500) NOT NULL,
      expectations VARCHAR(500) NOT NULL,
      time_spent VARCHAR(100) NOT NULL,
      frustration TEXT NOT NULL,
      data_consent BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_created_at (created_at),
      INDEX idx_profession (profession),
      INDEX idx_experience (experience)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await query(createTableSQL);
    console.log('✓ Database tables initialized');
    return true;
  } catch (error) {
    console.error('✗ Failed to initialize database tables:', error.message);
    return false;
  }
};

// Close pool gracefully
export const closePool = async () => {
  await pool.end();
  console.log('Database connection pool closed');
};

export default {
  testConnection,
  getPool,
  query,
  initializeDatabase,
  closePool
};
