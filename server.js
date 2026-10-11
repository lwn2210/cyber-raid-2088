/**
 * cyber-raid-2088 server — static hosting + account API (Week 8 foundation)
 * Endpoints:
 *   POST /api/register  {username, password} -> {token, username}
 *   POST /api/login     {username, password} -> {token, username}
 *   GET  /api/me        Authorization: Bearer <token> -> {username, meta}
 *   PUT  /api/meta      Authorization: Bearer <token> {meta} -> {ok}
 * Storage: SQLite (accounts.sqlite) via node:sqlite. Passwords: scrypt + per-user salt.
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = 8811;
const ROOT = __dirname;
const DB_PATH = path.join(ROOT, 'accounts.sqlite');

const db = new DatabaseSync(DB_PATH);
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  pass_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  meta_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => {
      data += c;
      if (data.length > 1e6) { reject(new Error('body too large')); req.destroy(); }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(body);
}

function authUser(req) {
  const h = req.headers['authorization'] || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const row = db.prepare('SELECT u.id, u.username, u.meta_json FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?').get(m[1]);
  return row || null;
}

function validUsername(u) {
  return typeof u === 'string' && /^[a-zA-Z0-9_\-]{3,20}$/.test(u);
}
function validPassword(p) {
  return typeof p === 'string' && p.length >= 6 && p.length <= 100;
}

async function handleApi(req, res, url) {
  const route = url.pathname;

  if (route === '/api/register' && req.method === 'POST') {
    let body;
    try { body = JSON.parse(await readBody(req)); } catch { return json(res, 400, { error: 'bad json' }); }
    const { username, password } = body;
    if (!validUsername(username)) return json(res, 400, { error: 'username: 3-20 chars, letters/digits/_-' });
    if (!validPassword(password)) return json(res, 400, { error: 'password: min 6 chars' });
    const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (exists) return json(res, 409, { error: 'username already taken' });
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(password, salt);
    const info = db.prepare('INSERT INTO users (username, pass_hash, salt) VALUES (?, ?, ?)').run(username, hash, salt);
    const token = crypto.randomBytes(32).toString('hex');
    db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, info.lastInsertRowid);
    return json(res, 200, { token, username });
  }

  if (route === '/api/login' && req.method === 'POST') {
    let body;
    try { body = JSON.parse(await readBody(req)); } catch { return json(res, 400, { error: 'bad json' }); }
    const { username, password } = body;
    if (typeof username !== 'string' || typeof password !== 'string') return json(res, 400, { error: 'bad request' });
    const user = db.prepare('SELECT id, username, pass_hash, salt FROM users WHERE username = ?').get(username);
    if (!user) return json(res, 401, { error: 'wrong username or password' });
    const hash = hashPassword(password, user.salt);
    const ok = crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(user.pass_hash, 'hex'));
    if (!ok) return json(res, 401, { error: 'wrong username or password' });
    const token = crypto.randomBytes(32).toString('hex');
    db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, user.id);
    return json(res, 200, { token, username: user.username });
  }

  if (route === '/api/me' && req.method === 'GET') {
    const user = authUser(req);
    if (!user) return json(res, 401, { error: 'unauthorized' });
    return json(res, 200, { username: user.username, meta: JSON.parse(user.meta_json || '{}') });
  }

  if (route === '/api/meta' && req.method === 'PUT') {
    const user = authUser(req);
    if (!user) return json(res, 401, { error: 'unauthorized' });
    let body;
    try { body = JSON.parse(await readBody(req)); } catch { return json(res, 400, { error: 'bad json' }); }
    if (!body || typeof body.meta !== 'object') return json(res, 400, { error: 'meta object required' });
    db.prepare('UPDATE users SET meta_json = ? WHERE id = ?').run(JSON.stringify(body.meta).slice(0, 100000), user.id);
    return json(res, 200, { ok: true });
  }

  return json(res, 404, { error: 'not found' });
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json'
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);

    // static files
    let p = decodeURIComponent(url.pathname);
    if (p === '/') p = '/index.html';
    let filePath = path.normalize(path.join(ROOT, p));
    if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }
    try {
      if (fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html'); // serve dir index (e.g. /arcade/)
      }
    } catch { /* not found below */ }
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); return res.end('not found'); }
      const headers = { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' };
      // never cache HTML or sprites: stale code is the #1 "fix lagi bro" cause
      if (path.extname(filePath) === '.html' || filePath.includes(path.join(ROOT, 'assets'))) {
        headers['Cache-Control'] = 'no-cache, must-revalidate';
      }
      res.writeHead(200, headers);
      res.end(data);
    });
  } catch (e) {
    json(res, 500, { error: 'server error' });
  }
});

server.listen(PORT, () => console.log(`cyber-raid server on :${PORT} (static + API)`));
