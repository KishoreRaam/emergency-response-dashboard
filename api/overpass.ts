export const config = { runtime: 'edge' };

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await req.text();
  if (!body) {
    return new Response('Missing body', { status: 400 });
  }

  for (const url of ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12_000);

      const upstream = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!upstream.ok) continue;

      const data = await upstream.text();
      return new Response(data, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=3600',
        },
      });
    } catch {
      // try next endpoint
    }
  }

  return new Response(JSON.stringify({ error: 'All Overpass endpoints failed' }), {
    status: 502,
    headers: { 'Content-Type': 'application/json' },
  });
}
