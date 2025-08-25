// IndexedDB helpers for storing/retrieving the manifest database
function openIDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('ManifestDB', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('files');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveDatabaseToIDB(blob: Blob, version: string) {
  const db = await openIDB();
  const tx = db.transaction('files', 'readwrite');
  tx.objectStore('files').put(blob, version);
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getDatabaseFromIDB(version: string): Promise<Blob | null> {
  const db = await openIDB();
  const tx = db.transaction('files', 'readonly');
  const request = tx.objectStore('files').get(version);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}
// Download the manifest database file from the provided URL
export async function downloadManifestDatabase(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to download manifest database: ${response.statusText}`,
      );
    }
    const blob = await response.blob();
    console.log('Downloaded manifest database file. Size:', blob.size, 'bytes');
    // You can process the blob further here (e.g., save, parse, etc.)
    return blob;
  } catch (err) {
    console.error('Error downloading manifest database:', err);
    throw err;
  }
}
import { getManifest } from '../api/getManifest';
import type { HttpClient } from 'bungie-api-ts/destiny2';
import initSqlJs from 'sql.js';
import { unzip } from 'unzipit';

declare global {
  interface Window {
    manifestDb: any;
  }
}

// import { sqlite3 } from "sqlite3";

export async function initDatabase(httpClient: HttpClient) {
  console.log('Initializing database with manifest data...');
  const manifest = await getManifest(httpClient);
  if (
    manifest &&
    manifest.Response &&
    manifest.Response.mobileWorldContentPaths &&
    manifest.Response.mobileWorldContentPaths.en &&
    manifest.Response.version
  ) {
    const dbUrl = `https://www.bungie.net${manifest.Response.mobileWorldContentPaths.en}`;
    const version = manifest.Response.version;
    console.log('mobileWorldContentPaths.en:', dbUrl);
    console.log('Manifest version:', version);

    const storedVersion = localStorage.getItem('manifestVersion');
    if (storedVersion === version) {
      const cachedBlob = await getDatabaseFromIDB(version);
      if (cachedBlob) {
        console.log('Loaded manifest database from cache.');
        await openManifestDatabase(cachedBlob);
        return;
      } else {
        console.log(
          'Manifest version unchanged, but no cached DB found. Downloading...',
        );
      }
    }

    const blob = await downloadManifestDatabase(dbUrl);
    await saveDatabaseToIDB(blob, version);
    await openManifestDatabase(blob);
    localStorage.setItem('manifestVersion', version);
  } else {
    console.warn(
      'mobileWorldContentPaths.en or version not found in manifest:',
      manifest,
    );
  }
}

export async function openManifestDatabase(blob: Blob) {
  const SQL = await initSqlJs({
    locateFile: (file) => `/sql-wasm.wasm`, // Adjust path if needed
  });
  // Unzip the blob to get the SQLite file
  const zip = await unzip(blob);
  // Log all file names in the zip
  const zipEntries = Object.keys(zip);
  console.log('Manifest zip file entries:', zipEntries);

  // Recursively search for a SQLite file
  function findSqliteEntry(obj: any, prefix = ''): [string, any] | null {
    for (const [name, entry] of Object.entries(obj)) {
      const fullName = prefix ? `${prefix}/${name}` : name;
      if (
        name.endsWith('.content') ||
        name.endsWith('.sqlite') ||
        name.endsWith('.db')
      ) {
        return [fullName, entry];
      }
      // If entry is a folder, recurse
      if (entry && typeof entry === 'object' && !('blob' in entry)) {
        const found = findSqliteEntry(entry, fullName);
        if (found) return found;
      }
    }
    return null;
  }

  const dbEntry = findSqliteEntry(zip);
  if (!dbEntry) {
    throw new Error(
      'No SQLite file (.content/.sqlite/.db) found in manifest zip',
    );
  }
  console.log('Found SQLite file in zip:', dbEntry[0]);
  const dbZipEntry = dbEntry[1] as any; // ZipEntry
  const dbBlob = await dbZipEntry.blob();
  const dbArrayBuffer = await dbBlob.arrayBuffer();
  const db = new SQL.Database(new Uint8Array(dbArrayBuffer));
  // Expose the db globally for browser console access
  window.manifestDb = db;
  // List tables
  const tablesResult = db.exec(
    'SELECT name FROM sqlite_master WHERE type="table"',
  );
  const tableNames = tablesResult[0]?.values?.map((row) => row[0]) || [];
  console.log('Tables:', tableNames);

  // Try to select one value from the first table
  if (tableNames.length > 0) {
    try {
      const firstTable = tableNames[0];
      const testResult = db.exec(`SELECT * FROM ${firstTable} LIMIT 1`);
      console.log(
        `Sample row from ${firstTable}:`,
        testResult[0]?.values?.[0] || 'No rows found',
      );
    } catch (err) {
      console.warn('Could not query first table:', err);
    }
  }
  return db;
}

// async function initializeDatabase(httpClient: unknown) {
//   const manifest = await getManifest(httpClient);
//   console.log('Manifest data:', manifest);
//   // Initialize your database with the manifest data
// }
