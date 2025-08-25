import { getDestinyManifest, HttpClient } from 'bungie-api-ts/destiny2';

export async function getManifest(httpClient: HttpClient) {
  return getDestinyManifest(httpClient);
}
