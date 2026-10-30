export const config = { runtime: 'edge' };

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

// Edge functions must start responding within 25 s
const TIMEOUT_MS = 24_000;

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await req.text();
  if (!body) {
    return new Response('Missing body', { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // Race all endpoints in parallel; first valid response wins
  const attempt = async (url: string): Promise<string> => {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // overpass-api.de rejects requests without a User-Agent (406)
        'User-Agent': 'RoadSoS/1.0 (emergency services locator)',
        Accept: 'application/json',
      },
      body,
      signal: controller.signal,
    });
    if (!upstream.ok) throw new Error(`${url} returned ${upstream.status}`);
    const data = await upstream.text();
    if (!data.trimStart().startsWith('{')) throw new Error(`${url} returned non-JSON`);
    return data;
  };

  try {
    const data = await Promise.any(ENDPOINTS.map(attempt));
    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=3600',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'All Overpass endpoints failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}
