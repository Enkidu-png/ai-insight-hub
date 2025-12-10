import http from 'http';
import { randomUUID } from 'crypto';
import { initDatabase, insertSurveyResponse, getAllSurveyResponses, testConnection } from './db.js';

const PORT = process.env.PORT || 4000;

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const validateSurveyPayload = (payload) => {
  const fieldNames = {
    profession: 'Zawód',
    experience: 'Doświadczenie',
    email: 'Email',
    challenge: 'Wyzwanie',
    expectations: 'Oczekiwania',
    timeSpent: 'Czas spędzony',
    frustration: 'Frustracje'
  };

  const requiredStrings = ['profession', 'experience', 'email', 'challenge', 'expectations', 'timeSpent', 'frustration'];
  for (const field of requiredStrings) {
    if (!payload[field] || typeof payload[field] !== 'string' || payload[field].trim().length === 0) {
      return `Pole "${fieldNames[field]}" jest wymagane.`;
    }
  }

  if (!Array.isArray(payload.aiAreas) || payload.aiAreas.length === 0) {
    return 'Należy wybrać przynajmniej jeden obszar AI.';
  }

  if (typeof payload.dataConsent !== 'boolean' || payload.dataConsent !== true) {
    return 'Zgoda na przetwarzanie danych jest wymagana do przesłania ankiety.';
  }

  return null;
};

const readRequestBody = (req, limit = 1_000_000) => new Promise((resolve, reject) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > limit) {
      req.destroy();
      reject(new Error('Dane są zbyt duże'));
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

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    return sendText(res, 400, 'Nieprawidłowe żądanie');
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    const dbConnected = await testConnection();
    return sendJson(res, 200, {
      status: dbConnected ? 'ok' : 'error',
      database: dbConnected ? 'connected' : 'disconnected'
    });
  }

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
      return sendText(res, 400, 'Nieprawidłowy format danych JSON');
    }

    const validationError = validateSurveyPayload(payload);
    if (validationError) {
      return sendText(res, 400, validationError);
    }

    const now = new Date();
    const mysqlDateTime = now.toISOString().slice(0, 19).replace('T', ' ');

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
      createdAt: mysqlDateTime
    };

    try {
      await insertSurveyResponse(record);
      console.log(`Zapisano odpowiedź z ankiety ${record.id} do bazy danych`);
      return sendJson(res, 201, { id: record.id, storedAt: record.createdAt });
    } catch (error) {
      console.error('Nie udało się zapisać odpowiedzi z ankiety', error);
      return sendText(res, 500, 'Nie można zapisać odpowiedzi z ankiety. Spróbuj ponownie później.');
    }
  }

  if (req.method === 'GET' && url.pathname === '/api/survey/export') {
    try {
      const responses = await getAllSurveyResponses();

      // Convert to CSV format
      const headers = ['id', 'email', 'profession', 'experience', 'aiAreas', 'challenge', 'expectations', 'timeSpent', 'frustration', 'dataConsent', 'createdAt'];
      const csvRows = [headers.join(',')];

      responses.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '""';
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        });
        csvRows.push(values.join(','));
      });

      const csvContent = csvRows.join('\n');

      res.writeHead(200, {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="survey-responses-${new Date().toISOString().split('T')[0]}.csv"`
      });
      return res.end(csvContent);
    } catch (error) {
      console.error('Nie udało się wyeksportować danych CSV', error);
      return sendText(res, 500, 'Nie można wyeksportować danych CSV. Spróbuj ponownie później.');
    }
  }

  return sendText(res, 404, 'Nie znaleziono');
});

// Initialize database on startup
initDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Serwer ankiet nasłuchuje na porcie ${PORT}`);
      console.log(`Połączono z bazą danych: ${process.env.DB_NAME || 'ankieta_db'} na ${process.env.DB_HOST || 'mariadb-cloud'}`);
    });
  })
  .catch((error) => {
    console.error('Nie udało się zainicjalizować bazy danych:', error);
    process.exit(1);
  });
