const http = require('http');
const { URL } = require('url');
const storage = require('./storage');

const PORT = process.env.PORT || 3000;

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
}

function notFound(res) {
  sendJson(res, 404, { error: 'Not found' });
}

function methodNotAllowed(res) {
  sendJson(res, 405, { error: 'Method not allowed' });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function pickAllowed(body) {
  const allowed = [
    'title',
    'category',
    'city',
    'location',
    'price',
    'price_unit',
    'description',
    'images',
    'tags',
    'contact_name',
    'contact_email',
    'contact_phone',
    'external_url',
    'admin_code',
    'expires_at',
    'published'
  ];
  const payload = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      payload[key] = body[key];
    }
  }
  return payload;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  let url;
  try {
    url = new URL(req.url, `http://${req.headers.host}`);
  } catch (err) {
    sendJson(res, 400, { error: 'Invalid URL' });
    return;
  }

  const segments = url.pathname.split('/').filter(Boolean);
  if (segments[0] !== 'tables') {
    notFound(res);
    return;
  }
  const table = segments[1];
  if (table !== 'posts') {
    notFound(res);
    return;
  }

  if (segments.length === 2) {
    if (req.method === 'GET') {
      try {
        const result = storage.getList(Object.fromEntries(url.searchParams.entries()));
        sendJson(res, 200, result);
      } catch (err) {
        console.error(err);
        sendJson(res, 500, { error: 'Internal server error' });
      }
      return;
    }
    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        if (typeof body !== 'object' || body === null) {
          sendJson(res, 400, { error: 'Invalid body' });
          return;
        }
        const payload = pickAllowed(body);
        if (!Object.keys(payload).length) {
          sendJson(res, 400, { error: 'No fields to insert' });
          return;
        }
        const record = storage.insert(payload);
        sendJson(res, 201, record);
      } catch (err) {
        if (err.message === 'Invalid JSON body' || err.message === 'Payload too large') {
          sendJson(res, 400, { error: err.message });
          return;
        }
        if (err.message.includes('title is required')) {
          sendJson(res, 400, { error: 'title is required' });
          return;
        }
        console.error(err);
        sendJson(res, 500, { error: 'Internal server error' });
      }
      return;
    }
    methodNotAllowed(res);
    return;
  }

  if (segments.length === 3) {
    const id = segments[2];
    if (req.method === 'GET') {
      try {
        const record = storage.getById(id);
        if (!record) {
          notFound(res);
          return;
        }
        sendJson(res, 200, record);
      } catch (err) {
        console.error(err);
        sendJson(res, 500, { error: 'Internal server error' });
      }
      return;
    }
    if (req.method === 'PATCH') {
      try {
        const body = await parseBody(req);
        if (typeof body !== 'object' || body === null) {
          sendJson(res, 400, { error: 'Invalid body' });
          return;
        }
        const payload = pickAllowed(body);
        if (!Object.keys(payload).length) {
          sendJson(res, 400, { error: 'No fields to update' });
          return;
        }
        const record = storage.update(id, payload);
        if (!record) {
          notFound(res);
          return;
        }
        sendJson(res, 200, record);
      } catch (err) {
        if (err.message === 'Invalid JSON body' || err.message === 'Payload too large') {
          sendJson(res, 400, { error: err.message });
          return;
        }
        console.error(err);
        sendJson(res, 500, { error: 'Internal server error' });
      }
      return;
    }
    methodNotAllowed(res);
    return;
  }

  notFound(res);
});

server.listen(PORT, () => {
  console.log(`HEATERs API listening on http://localhost:${PORT}`);
});
