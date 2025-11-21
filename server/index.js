import http from 'http';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const CSV_PATH = process.env.CSV_PATH || path.join(DATA_DIR, 'survey-responses.csv');

const CSV_HEADERS = [
  'id',
  'email',
  'profession',
  'experience',
  'aiAreas',
  'challenge',
  'expectations',
  'timeSpent',
  'frustration',
  'dataConsent',
  'createdAt'
];

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const escapeCsvValue = (value) => {
  if (value === undefined || value === null) return '""';
  const normalizedValue = Array.isArray(value)
    ? value.join('; ')
    : typeof value === 'boolean'
      ? value.toString()
      : String(value);
  const escapedValue = normalizedValue.replace(/"/g, '""');
  return `"${escapedValue}"`;
};

const ensureCsvHeader = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const stats = await fs.stat(CSV_PATH);
    if (stats.size > 0) return;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const headerRow = `${CSV_HEADERS.map((header) => escapeCsvValue(header)).join(',')}\n`;
  await fs.appendFile(CSV_PATH, headerRow, { encoding: 'utf-8' });
};

const appendSurveyRow = async (record) => {
  await ensureCsvHeader();
  const row = CSV_HEADERS.map((header) => escapeCsvValue(record[header])).join(',');
  await fs.appendFile(CSV_PATH, `${row}\n`, { encoding: 'utf-8' });
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

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    return sendText(res, 400, 'Bad request');
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    return sendJson(res, 200, { status: 'ok', dataPath: CSV_PATH });
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
      await appendSurveyRow(record);
      console.log(`Stored survey response ${record.id} at ${CSV_PATH}`);
      return sendJson(res, 201, { id: record.id, storedAt: record.createdAt });
    } catch (error) {
      console.error('Failed to store survey response', error);
      return sendText(res, 500, 'Unable to save survey response at this time.');
    }
  }

  if (req.method === 'GET' && url.pathname === '/api/survey/export') {
    try {
      await ensureCsvHeader();
      const fileBuffer = await fs.readFile(CSV_PATH);
      res.writeHead(200, {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="survey-responses-${new Date().toISOString().split('T')[0]}.csv"`
      });
      return res.end(fileBuffer);
    } catch (error) {
      console.error('Failed to serve CSV export', error);
      return sendText(res, 500, 'Unable to provide CSV export at this time.');
    }
  }

  return sendText(res, 404, 'Not found');
});

server.listen(PORT, () => {
  console.log(`Survey backend listening on port ${PORT}`);
  console.log(`CSV file will be stored at ${CSV_PATH}`);
});
