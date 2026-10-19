import { createServer } from 'node:http';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCatalog } from './catalog.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.join(root, 'data');
const port = Number(process.env.PORT || 4173);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

async function isClientRoute(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length < 1 || parts.length > 2 || parts.some(part => !/^[A-Za-z0-9_-]+$/.test(part))) return false;

  const categories = await readdir(dataDirectory, { withFileTypes: true });
  const category = categories.find(entry => entry.isDirectory() && entry.name === parts[0]);
  if (!category) return false;

  const files = await readdir(path.join(dataDirectory, category.name), { withFileTypes: true });
  const exercises = files.filter(file => file.isFile() && file.name.toLowerCase().endsWith('.json'));
  if (parts.length === 1) return exercises.length > 0;

  return /^\d{2,}$/.test(parts[1]) &&
    exercises.some(file => file.name.endsWith(`-${parts[1]}.json`));
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

  if (request.method !== 'GET') {
    response.writeHead(405, { Allow: 'GET' }).end('Method Not Allowed');
    return;
  }

  if (requestUrl.pathname === '/catalog.json' || requestUrl.pathname === '/api/exercises') {
    try {
      response.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      }).end(JSON.stringify(await createCatalog(dataDirectory)));
    } catch (error) {
      console.error('Unable to list exercise categories:', error);
      response.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
        .end(JSON.stringify({ error: 'Unable to list exercise categories.' }));
    }
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    response.writeHead(400).end('Bad Request');
    return;
  }

  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(root, relativePath);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    }).end(body);
  } catch {
    if (await isClientRoute(pathname)) {
      const appShell = await readFile(path.join(root, 'index.html'));
      response.writeHead(200, {
        'Content-Type': mimeTypes['.html'],
        'Cache-Control': 'no-store'
      }).end(appShell);
      return;
    }
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not Found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`BERT trainer running at http://127.0.0.1:${port}`);
});
