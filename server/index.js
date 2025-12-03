import http from 'http';
import { randomUUID } from 'crypto';
import { testConnection, query, initializeDatabase, closePool } from './database/connection.js';

const PORT = process.env.PORT || 4000;

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const validateSurveyPayload = (payload) => {
  const requiredStrings = ['profession', 'experience', 'email', 'challenge', 'expectations', 'timeSpent', 'frustration'];
  for (const field of requiredStrings) {
    if (!payload[field] || typeof payload[field] !== 'string' || payload[field].trim().length === 0) {
      return `Field "${field}" is required.`;
    }
  }

  if (!Array.isArray(payload.aiAreas) || payload.aiAreas.length === 0) {
    return 'At least one AI area is required.';
  }

  if (typeof payload.dataConsent !== 'boolean' || payload.dataConsent !== true) {
    return 'Data consent must be granted to submit the survey.';
  }

  return null;
};

const readRequestBody = (req, limit = 1_000_000) => new Promise((resolve, reject) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > limit) {
      req.destroy();
      reject(new Error('Payload too large'));
    }
  });
  req.on('end', () => resolve(body));
  req.on('error', reject);
});

const sendJson = (res, status, data) => {
  res.writeHead(status, { 'Content-Type': 'application/json', ...corsHeaders });
  res.end(JSON.stringify(data));
};

const sendText = (res, status, message, contentType = 'text/plain') => {
  res.writeHead(status, { 'Content-Type': contentType, ...corsHeaders });
  res.end(message);
};

// Insert survey response into database
const saveSurveyResponse = async (record) => {
  const sql = `
    INSERT INTO survey_responses
    (id, email, profession, experience, ai_areas, challenge, expectations, time_spent, frustration, data_consent, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    record.id,
    record.email,
    record.profession,
    record.experience,
    JSON.stringify(record.aiAreas), // Store array as JSON
    record.challenge,
    record.expectations,
    record.timeSpent,
    record.frustration,
    record.dataConsent ? 1 : 0,
    record.createdAt
  ];

  await query(sql, params);
};

// Export all survey responses as CSV
const exportSurveyResponses = async () => {
  const sql = 'SELECT * FROM survey_responses ORDER BY created_at DESC';
  const results = await query(sql);

  // Convert to CSV
  const headers = ['id', 'email', 'profession', 'experience', 'ai_areas', 'challenge', 'expectations', 'time_spent', 'frustration', 'data_consent', 'created_at'];
  const csvRows = [];

  // Add header row
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of results) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape and quote values
      if (value === null || value === undefined) return '""';
      const strValue = String(value).replace(/"/g, '""');
      return `"${strValue}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    return sendText(res, 400, 'Bad request');
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Health check endpoint
  if (req.method === 'GET' && url.pathname === '/health') {
    try {
      const dbConnected = await testConnection();
      return sendJson(res, 200, {
        status: 'ok',
        database: dbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return sendJson(res, 500, {
        status: 'error',
        database: 'error',
        message: error.message
      });
    }
  }

  // Submit survey response
  if (req.method === 'POST' && url.pathname === '/api/survey') {
    let rawBody = '';
    try {
      rawBody = await readRequestBody(req);
    } catch (error) {
      return sendText(res, 413, error.message);
    }

    let payload;
    try {
      payload = rawBody ? JSON.parse(rawBody) : {};
    } catch (error) {
      return sendText(res, 400, 'Invalid JSON payload');
    }

    const validationError = validateSurveyPayload(payload);
    if (validationError) {
      return sendText(res, 400, validationError);
    }

    const record = {
      id: randomUUID(),
      email: payload.email.trim(),
      profession: payload.profession.trim(),
      experience: payload.experience.trim(),
      aiAreas: payload.aiAreas.map((area) => String(area).trim()),
      challenge: payload.challenge.trim(),
      expectations: payload.expectations.trim(),
      timeSpent: payload.timeSpent.trim(),
      frustration: payload.frustration.trim(),
      dataConsent: payload.dataConsent,
      createdAt: new Date().toISOString()
    };

    try {
      await saveSurveyResponse(record);
      console.log(`✓ Stored survey response ${record.id} in database`);
      return sendJson(res, 201, { id: record.id, storedAt: record.createdAt });
    } catch (error) {
      console.error('✗ Failed to store survey response:', error);
      return sendText(res, 500, 'Unable to save survey response at this time.');
    }
  }

  // Export survey responses as CSV
  if (req.method === 'GET' && url.pathname === '/api/survey/export') {
    try {
      const csvContent = await exportSurveyResponses();
      res.writeHead(200, {
        ...corsHeaders,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="survey-responses-${new Date().toISOString().split('T')[0]}.csv"`
      });
      return res.end(csvContent);
    } catch (error) {
      console.error('✗ Failed to export CSV:', error);
      return sendText(res, 500, 'Unable to provide CSV export at this time.');
    }
  }

  return sendText(res, 404, 'Not found');
});

// Initialize and start server
const startServer = async () => {
  console.log('Starting survey backend...');

  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('⚠ Warning: Could not connect to database. Server will start anyway.');
    console.error('   Please check database configuration and ensure MariaDB is running.');
  }

  // Initialize database tables
  if (dbConnected) {
    await initializeDatabase();
  }

  // Start HTTP server
  server.listen(PORT, () => {
    console.log(`✓ Survey backend listening on port ${PORT}`);
    console.log(`  Database: ${process.env.DB_HOST || 'mariadb-cloud'}:${process.env.DB_PORT || '3306'}`);
    console.log(`  Database name: ${process.env.DB_NAME || 'ankieta_db'}`);
  });
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await closePool();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await closePool();
    process.exit(0);
  });
});

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
