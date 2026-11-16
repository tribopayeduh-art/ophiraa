import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../public/', import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};
createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) return res.writeHead(405).end();
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname.startsWith('/api/')) {
      return res.writeHead(503, { 'Content-Type': 'application/json' })
        .end(JSON.stringify({ message: 'API indisponível na prévia visual.' }));
    }
    const file = resolve(root, './' + pathname.replace(/^\/+/, ''));
    if (file !== resolve(root) && !file.startsWith(resolve(root) + sep)) return res.writeHead(404).end();
    const path = (await stat(file)).isDirectory() ? resolve(file, 'index.html') : file;
    const info = await stat(path);
    if (!info.isFile()) return res.writeHead(404).end();
    res.writeHead(200, {
      'Content-Type': types[extname(path)] || 'application/octet-stream',
      'Content-Length': info.size,
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex',
    });
    if (req.method === 'HEAD') return res.end();
    createReadStream(path).on('error', () => res.destroy()).pipe(res);
  } catch {
    res.writeHead(404).end();
  }
}).listen(Number(process.env.PORT || 3000), '0.0.0.0');
