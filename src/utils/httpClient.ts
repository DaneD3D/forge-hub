import { HttpClientConfig } from 'bungie-api-ts/http';

export interface HttpClientConfigWithHeaders extends HttpClientConfig {
  headers?: Record<string, string>;
}

/**
 * A basic HttpClient implementation using fetch.
 */
export async function httpClient(config: HttpClientConfigWithHeaders) {
  const url = new URL(config.url);

  // Add query params for GET requests
  if (config.method === 'GET' && config.params) {
    Object.entries(config.params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  // Always include the API key from .env as X-API-Key
  const apiKey = import.meta.env.VITE_API_KEY;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
    ...(config.headers || {}),
  };

  const response = await fetch(url.toString(), {
    method: config.method,
    headers,
    body:
      config.method === 'POST' && config.body
        ? JSON.stringify(config.body)
        : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json();
}
