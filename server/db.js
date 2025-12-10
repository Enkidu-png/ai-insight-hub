import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'mariadb-cloud',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'ankieta_user',
  password: process.env.DB_PASSWORD || 'zaq1@WSXDupa',
  database: process.env.DB_NAME || 'ankieta_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

export const initDatabase = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS survey_responses (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        profession VARCHAR(255) NOT NULL,
        experience VARCHAR(255) NOT NULL,
        aiAreas TEXT NOT NULL,
        challenge TEXT NOT NULL,
        expectations TEXT NOT NULL,
        timeSpent VARCHAR(255) NOT NULL,
        frustration TEXT NOT NULL,
        dataConsent BOOLEAN NOT NULL DEFAULT TRUE,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_createdAt (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Tabela w bazie danych została zainicjalizowana pomyślnie');
  } finally {
    connection.release();
  }
};

export const insertSurveyResponse = async (record) => {
  const [result] = await pool.execute(
    `INSERT INTO survey_responses
    (id, email, profession, experience, aiAreas, challenge, expectations, timeSpent, frustration, dataConsent, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.email,
      record.profession,
      record.experience,
      Array.isArray(record.aiAreas) ? record.aiAreas.join('; ') : record.aiAreas,
      record.challenge,
      record.expectations,
      record.timeSpent,
      record.frustration,
      record.dataConsent,
      record.createdAt
    ]
  );
  return result;
};

export const getAllSurveyResponses = async () => {
  const [rows] = await pool.execute(
    'SELECT * FROM survey_responses ORDER BY createdAt DESC'
  );
  return rows;
};

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('Połączenie z bazą danych nie powiodło się:', error);
    return false;
  }
};

export default pool;
