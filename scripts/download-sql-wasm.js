// Script to download sql-wasm.wasm for use in public/ (ESM version)
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const WASM_URL =
  'https://cdn.jsdelivr.net/npm/sql.js@1.13.0/dist/sql-wasm.wasm';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const DEST_PATH = path.join(PUBLIC_DIR, 'sql-wasm.wasm');

// Ensure public/ directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

https
  .get(WASM_URL, (res) => {
    if (res.statusCode !== 200) {
      console.error('Failed to download sql-wasm.wasm:', res.statusCode);
      res.resume();
      return;
    }
    const fileStream = fs.createWriteStream(DEST_PATH);
    res.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      console.log('sql-wasm.wasm downloaded to public/.');
    });
  })
  .on('error', (err) => {
    console.error('Error downloading sql-wasm.wasm:', err);
  });
