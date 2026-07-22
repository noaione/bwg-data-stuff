import { gmRequest } from '@makoojs/cli/monkey';

export function parseContentId(pathname: string): string | null {
  const m = pathname.match(/^\/(volume|chapter)\/([A-Za-z0-9]+)(?:\/|$)/);
  return m ? m[2] : null;
}

export type GeoBlocks = {
  global: boolean;
  allowed: string[];
  blocked: string[];
};

export type GeoblockResponse = {
  id: string;
  productId: string;
  title: string;
  geoBlocks: GeoBlocks;
};

export function fetchGeoblock(host: string, contentId: string): Promise<GeoblockResponse> {
  const url = `${host.replace(/\/$/, '')}/api/geoblocks/${encodeURIComponent(contentId)}?normalize=true`;

  return new Promise((resolve, reject) => {
    gmRequest.get<'text'>(url, {
      timeout: 10000,
      onload: (res) => {
        if (res.status >= 200 && res.status < 300) {
          try {
            resolve(JSON.parse(res.responseText) as GeoblockResponse);
          } catch {
            reject(new Error('invalid response'));
          }
        } else {
          reject(new Error(`HTTP ${res.status}`));
        }
      },
      onerror: () => reject(new Error('network error')),
      ontimeout: () => reject(new Error('timeout')),
    });
  });
}

export function formatGeoblock(gb: GeoBlocks): string {
  // A geoblock can carry an allow list and a block list at the same time
  // (e.g. an explicit allow list layered under a worldwide baseline, or
  // both an allow and a block list with no worldwide baseline at all) —
  // both need to show up, not just whichever branch happened to match first.
  if (gb.global) {
    return gb.blocked.length > 0
      ? `Available worldwide (except ${gb.blocked.join(', ')})`
      : 'Available worldwide';
  }

  const clauses: string[] = [];
  if (gb.allowed.length > 0) clauses.push(`Available in ${gb.allowed.join(', ')}`);
  if (gb.blocked.length > 0) clauses.push(`Blocked in ${gb.blocked.join(', ')}`);

  return clauses.length > 0 ? clauses.join('; ') : 'No geo-block data available';
}
