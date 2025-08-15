/**
 * A simple Deno server to serve static files from the 'dist' directory.
 * This is used in the Docker container to host the built SolidJS application.
 */
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Set the port to listen on. Deno's default is 8000.
const PORT = 8000;

// Set the root directory for serving files.
const FILE_SERVER_ROOT = "./dist";

// Start the Deno HTTP server.
console.log(`Serving static files from '${FILE_SERVER_ROOT}' on http://localhost:${PORT}`);
serve((req: Request) => {
  // Use serveDir from the standard library to handle the request.
  // It automatically finds and serves files from the specified root.
  // This handles all the routing and file handling for you.
  return serveDir(req, {
    fsRoot: FILE_SERVER_ROOT,
    showDirListing: false,
    quiet: true,
  });
}, { port: PORT });
