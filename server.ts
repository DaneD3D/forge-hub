/**
 * A simple Node.js server to serve static files from the 'dist' directory.
 * This is used in the Docker container to host the built SolidJS application.
 */
import http from 'http';
import path from 'path';
import fs from 'fs';

const PORT = 8000;
const FILE_SERVER_ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  'dist',
);

const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const filePath = path.join(
    FILE_SERVER_ROOT,
    req.url === '/' ? '/index.html' : req.url,
  );
  // Prevent directory traversal
  if (!filePath.startsWith(FILE_SERVER_ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(
    `Serving static files from '${FILE_SERVER_ROOT}' on http://localhost:${PORT}`,
  );
});
