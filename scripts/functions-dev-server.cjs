/* eslint-disable no-console */
const http = require('http');
const fs = require('fs');
const path = require('path');

const loadEnvFile = (relativePath) => {
  const filePath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(filePath)) return;

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) return;

      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1);

      if (!key) return;
      if (Object.prototype.hasOwnProperty.call(process.env, key)) return;

      value = value.trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    });
  } catch (err) {
    console.error(`Failed to load ${relativePath}:`, err);
  }
};

// Load common env files for local dev (Netlify CLI normally does this)
loadEnvFile('.env');
loadEnvFile('.env.local');
loadEnvFile('.env.development');
loadEnvFile('.env.development.local');

const FUNCTIONS_PREFIX = '/.netlify/functions/';
const functionsDir = path.join(process.cwd(), 'dist/functions');
const port = Number(process.env.FUNCTIONS_PORT || 9999);

const sendJson = (res, statusCode, body, extraHeaders) => {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...extraHeaders,
  });
  res.end(payload);
};

const readRequestBody = (req) => new Promise((resolve, reject) => {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => resolve(Buffer.concat(chunks)));
  req.on('error', reject);
});

const toSingleHeaderValue = (value) => {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'string') return value;
  return value ? String(value) : '';
};

const buildQueryStringParameters = (urlObj) => {
  const params = {};
  urlObj.searchParams.forEach((v, k) => {
    // Netlify event.queryStringParameters is a simple key/value object
    params[k] = v;
  });
  return Object.keys(params).length > 0 ? params : null;
};

const loadHandler = (functionName) => {
  const filePath = path.join(functionsDir, `${functionName}.js`);
  if (!fs.existsSync(filePath)) return null;

  try {
    // Hot-reload on each request
    const resolved = require.resolve(filePath);
    delete require.cache[resolved];
    const mod = require(filePath);
    const handler = mod?.handler || mod?.default || mod;
    return typeof handler === 'function' ? handler : null;
  } catch (err) {
    console.error(`Failed to load function "${functionName}":`, err);
    return { __error: err };
  }
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      });
      res.end('');
      return;
    }

    const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    if (!urlObj.pathname.startsWith(FUNCTIONS_PREFIX)) {
      sendJson(res, 404, { ok: false, error: 'Not found' });
      return;
    }

    const functionPath = urlObj.pathname.slice(FUNCTIONS_PREFIX.length);
    const functionName = functionPath.split('/')[0];
    if (!functionName) {
      sendJson(res, 404, { ok: false, error: 'Missing function name' });
      return;
    }

    const handler = loadHandler(functionName);
    if (!handler) {
      sendJson(res, 503, {
        ok: false,
        error: `Function "${functionName}" not built. Run "npm run functions:watch" first.`,
      });
      return;
    }

    if (handler.__error) {
      sendJson(res, 500, { ok: false, error: 'Failed to load function module' });
      return;
    }

    const bodyBuffer = await readRequestBody(req);
    const bodyString = bodyBuffer.length ? bodyBuffer.toString('utf8') : null;

    const headers = {};
    Object.entries(req.headers || {}).forEach(([k, v]) => {
      headers[k.toLowerCase()] = toSingleHeaderValue(v);
    });

    const event = {
      httpMethod: req.method || 'GET',
      headers,
      queryStringParameters: buildQueryStringParameters(urlObj),
      path: urlObj.pathname,
      body: bodyString,
      isBase64Encoded: false,
      rawBody: bodyString || '',
    };

    const result = await handler(event, {});
    const statusCode = Number(result?.statusCode || 200);
    const responseHeaders = result?.headers || {};
    const responseBody = result?.body || '';
    const isBase64 = Boolean(result?.isBase64Encoded);

    res.writeHead(statusCode, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...responseHeaders,
    });

    if (isBase64) {
      res.end(Buffer.from(responseBody, 'base64'));
    } else {
      res.end(responseBody);
    }
  } catch (err) {
    console.error('functions-dev-server error:', err);
    sendJson(res, 500, { ok: false, error: 'Internal server error' });
  }
});

server.listen(port, () => {
  console.log(`[functions] listening on http://localhost:${port}`);
  console.log(`[functions] expecting built functions in ${path.relative(process.cwd(), functionsDir)}`);
});

