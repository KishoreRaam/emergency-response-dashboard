import { type EmergencyService, type ServiceType, emergencyServices } from '../data/emergency-services';
import { haversineDistance } from '../utils/distance';

// ─── Constants ────────────────────────────────────────────────────────────────

const CACHE_KEY = 'roadsos_services_cache';
const CACHE_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours
const CACHE_VALID_RADIUS_KM = 5;
const OVERPASS_TIMEOUT_MS = 45_000; // public servers can take 30-40 s under load
const STALE_CACHE_RADIUS_KM = 25;

// OSM amenity → our ServiceType
const AMENITY_TYPE_MAP: Record<string, ServiceType> = {
  hospital: 'hospital',
  clinic: 'hospital',
  doctors: 'hospital',
  police: 'police',
  ambulance_station: 'ambulance',
  fire_station: 'ambulance',
};

// Emergency fallback phones when OSM has none
const FALLBACK_PHONE: Partial<Record<ServiceType, string>> = {
  hospital: '108',
  ambulance: '108',
  police: '100',
};

// ─── Overpass response types ───────────────────────────────────────────────────

interface OsmTags {
  name?: string;
  'name:en'?: string;
  amenity?: string;
  phone?: string;
  'contact:phone'?: string;
  'contact:mobile'?: string;
  opening_hours?: string;
  'addr:full'?: string;
  'addr:housenumber'?: string;
  'addr:street'?: string;
  'addr:suburb'?: string;
  'addr:city'?: string;
  'addr:place'?: string;
  [key: string]: string | undefined;
}

interface OsmNode {
  type: 'node';
  id: number;
  lat: number;
  lon: number;
  tags?: OsmTags;
}

interface OsmWay {
  type: 'way';
  id: number;
  center?: { lat: number; lon: number };
  tags?: OsmTags;
}

type OsmElement = OsmNode | OsmWay | { type: 'relation'; id: number; tags?: OsmTags };

interface OverpassResponse {
  elements: OsmElement[];
}

// ─── Cache helpers ─────────────────────────────────────────────────────────────

interface CacheEntry {
  lat: number;
  lng: number;
  timestamp: number;
  services: EmergencyService[];
}

// One-time purge of stale cache from broken GPS build.
// Bump this version string if you ever need to force-clear again.
const CACHE_VERSION = 'v3';
const CACHE_VERSION_KEY = 'roadsos_cache_version';
(function purgeStaleCacheOnce() {
  try {
    if (localStorage.getItem(CACHE_VERSION_KEY) !== CACHE_VERSION) {
      localStorage.removeItem(CACHE_KEY);
      localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
    }
  } catch { /* ignore */ }
})();

function loadCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CacheEntry) : null;
  } catch {
    return null;
  }
}

function saveCache(lat: number, lng: number, services: EmergencyService[]): void {
  try {
    const entry: CacheEntry = { lat, lng, timestamp: Date.now(), services };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Storage full — skip silently
  }
}

/**
 * Returns cached services if they are still valid for the given location.
 * When offline, always returns whatever is cached (age ignored).
 */
export function getCachedServices(
  userLat: number,
  userLng: number,
  offline: boolean
): EmergencyService[] | null {
  const cache = loadCache();
  if (!cache) return null;
  if (offline) return cache.services;

  const age = Date.now() - cache.timestamp;
  const dist = haversineDistance(userLat, userLng, cache.lat, cache.lng);
  if (age < CACHE_MAX_AGE_MS && dist <= CACHE_VALID_RADIUS_KM) return cache.services;
  return null;
}

/**
 * Last-resort cache: any previous result near this location, regardless of age.
 * Distances are recomputed from the current position.
 */
export function getStaleCachedServices(
  userLat: number,
  userLng: number
): EmergencyService[] | null {
  const cache = loadCache();
  if (!cache) return null;
  if (haversineDistance(userLat, userLng, cache.lat, cache.lng) > STALE_CACHE_RADIUS_KM) return null;
  return cache.services
    .map(s => ({ ...s, distance: haversineDistance(userLat, userLng, s.location.lat, s.location.lng) }))
    .sort((a, b) => a.distance - b.distance);
}

// ─── Parsing helpers ───────────────────────────────────────────────────────────

function extractPhone(tags: OsmTags, type: ServiceType): string {
  const raw = tags.phone ?? tags['contact:phone'] ?? tags['contact:mobile'];
  if (raw) return raw.trim();
  return FALLBACK_PHONE[type] ?? 'Tap to find number';
}

function extractAddress(tags: OsmTags): string {
  if (tags['addr:full']) return tags['addr:full'];
  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:suburb'],
    tags['addr:city'],
  ].filter(Boolean);
  return parts.join(', ') || tags['addr:place'] || '';
}

function deduplicateByProximity(services: EmergencyService[]): EmergencyService[] {
  const DEDUP_KM = 0.05; // 50 m
  const kept: EmergencyService[] = [];
  for (const svc of services) {
    const isDupe = kept.some(
      k => haversineDistance(k.location.lat, k.location.lng, svc.location.lat, svc.location.lng) < DEDUP_KM
    );
    if (!isDupe) kept.push(svc);
  }
  return kept;
}

function parseElements(
  elements: OsmElement[],
  userLat: number,
  userLng: number
): EmergencyService[] {
  const results: EmergencyService[] = [];

  for (const el of elements) {
    const tags = el.tags ?? {};
    const amenity = tags.amenity;
    if (!amenity) continue;

    const type = AMENITY_TYPE_MAP[amenity];
    if (!type) continue;

    let lat: number | undefined;
    let lon: number | undefined;

    if (el.type === 'node') {
      lat = (el as OsmNode).lat;
      lon = (el as OsmNode).lon;
    } else if (el.type === 'way' && (el as OsmWay).center) {
      lat = (el as OsmWay).center!.lat;
      lon = (el as OsmWay).center!.lon;
    }

    if (lat === undefined || lon === undefined) continue;

    const name = tags.name ?? tags['name:en'];
    if (!name?.trim()) continue;

    const distance = haversineDistance(userLat, userLng, lat, lon);
    const phone = extractPhone(tags, type);
    const address = extractAddress(tags);
    const openingHours = tags.opening_hours ?? '';
    const available24x7 =
      openingHours === '24/7' ||
      type === 'police' ||
      type === 'ambulance';

    results.push({
      id: `osm_${el.type}_${el.id}`,
      name: name.trim(),
      type,
      location: { lat, lng: lon },
      distance,
      address,
      phone,
      verified: false,
      available24x7,
    });
  }

  return results;
}

// ─── Overpass fetch ────────────────────────────────────────────────────────────

function buildQuery(lat: number, lng: number, radiusMeters: number): string {
  const amenities = Object.keys(AMENITY_TYPE_MAP).join('|');
  return (
    `[out:json][timeout:10];` +
    `(node["amenity"~"${amenities}"](around:${radiusMeters},${lat},${lng});` +
    `way["amenity"~"${amenities}"](around:${radiusMeters},${lat},${lng}););` +
    `out center;`
  );
}

async function queryOverpass(
  lat: number,
  lng: number,
  radiusMeters: number,
): Promise<OsmElement[]> {
  const body = `data=${encodeURIComponent(buildQuery(lat, lng, radiusMeters))}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS);

  try {
    // Nominatim is fast and reliable; the Overpass proxy is the backup
    try {
      const elements = await queryNominatim(lat, lng, radiusMeters, controller.signal);
      console.info(`[Nominatim] Success — ${elements.length} elements`);
      return elements;
    } catch {
      // fall through to Overpass proxy
    }

    const res = await fetch('/api/overpass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Proxy returned ${res.status}`);
    const json: OverpassResponse = await res.json();
    if (!Array.isArray(json.elements)) throw new Error('Proxy returned no elements');
    console.info(`[Overpass] Success — ${json.elements.length} elements`);
    return json.elements;
  } catch {
    console.info('[Overpass] Live data unavailable — using fallback');
    throw new Error('Live data unavailable');
  } finally {
    clearTimeout(timer);
  }
}

// ─── Nominatim fetch ───────────────────────────────────────────────────────────

const NOMINATIM_AMENITIES = ['hospital', 'police', 'clinic', 'fire_station'];

interface NominatimPlace {
  osm_type: 'node' | 'way' | 'relation';
  osm_id: number;
  lat: string;
  lon: string;
  name?: string;
  type?: string;
  address?: Record<string, string>;
  extratags?: Record<string, string> | null;
}

/**
 * Searches OSM amenities via Nominatim within a bounding box and converts
 * results to Overpass-style nodes so parseElements() can handle them.
 * Requests are staggered to respect Nominatim's usage policy.
 */
async function queryNominatim(
  lat: number,
  lng: number,
  radiusMeters: number,
  signal: AbortSignal,
): Promise<OsmElement[]> {
  const dLat = radiusMeters / 111_000;
  const dLng = dLat / Math.max(Math.cos((lat * Math.PI) / 180), 0.1);
  const viewbox = [lng - dLng, lat + dLat, lng + dLng, lat - dLat].map(n => n.toFixed(5)).join(',');

  const fetchAmenity = async (amenity: string, index: number): Promise<OsmElement[]> => {
    await new Promise(r => setTimeout(r, index * 400));
    const url =
      `https://nominatim.openstreetmap.org/search?format=jsonv2&amenity=${amenity}` +
      `&viewbox=${viewbox}&bounded=1&limit=40&addressdetails=1&extratags=1`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`Nominatim returned ${res.status}`);
    const places: NominatimPlace[] = await res.json();
    return places.map(p => {
      const a = p.address ?? {};
      const tags: OsmTags = {
        ...(p.extratags ?? {}),
        name: p.name || undefined,
        amenity: p.type ?? amenity,
        'addr:housenumber': a.house_number,
        'addr:street': a.road,
        'addr:suburb': a.suburb ?? a.neighbourhood,
        'addr:city': a.city ?? a.town ?? a.village,
      };
      return { type: 'node', id: p.osm_id, lat: Number(p.lat), lon: Number(p.lon), tags } as OsmNode;
    });
  };

  const results = await Promise.allSettled(NOMINATIM_AMENITIES.map(fetchAmenity));
  const elements = results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
  if (results.every(r => r.status === 'rejected')) throw new Error('Nominatim failed');
  if (elements.length === 0) throw new Error('Nominatim returned no results');
  return elements;
}

// ─── Public API ────────────────────────────────────────────────────────────────

export interface FetchResult {
  services: EmergencyService[];
  limited: boolean;
}

/**
 * Fetches real emergency services from OpenStreetMap via Overpass API.
 * Races all endpoints in parallel for speed.
 * Auto-widens to 20 km if fewer than 3 results at 10 km.
 * Merges in static towing/puncture data.
 * Saves successful results to localStorage cache.
 */
export async function fetchNearbyServices(
  userLat: number,
  userLng: number
): Promise<FetchResult> {
  const MAX_SERVICES = 15;

  // First pass — 10 km
  let elements = await queryOverpass(userLat, userLng, 10_000);
  let parsed = parseElements(elements, userLat, userLng);
  let deduped = deduplicateByProximity(parsed)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, MAX_SERVICES);

  // Auto-retry at 20 km if sparse results
  if (deduped.length < 3) {
    try {
      elements = await queryOverpass(userLat, userLng, 20_000);
      parsed = parseElements(elements, userLat, userLng);
      deduped = deduplicateByProximity(parsed)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, MAX_SERVICES);
    } catch {
      // Keep the few results we got from 10 km
    }
  }

  const limited = deduped.length < 3;

  // Merge static towing & puncture services (re-enriched with live distances)
  const staticTowing = emergencyServices
    .filter(s => s.type === 'towing' || s.type === 'puncture')
    .map(s => ({
      ...s,
      distance: haversineDistance(userLat, userLng, s.location.lat, s.location.lng),
    }));

  const merged = [...deduped, ...staticTowing].sort((a, b) => a.distance - b.distance);

  saveCache(userLat, userLng, merged);

  return { services: merged, limited };
}
