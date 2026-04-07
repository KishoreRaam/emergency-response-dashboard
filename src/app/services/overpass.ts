import { type EmergencyService, type ServiceType, emergencyServices } from '../data/emergency-services';
import { haversineDistance } from '../utils/distance';

// ─── Constants ────────────────────────────────────────────────────────────────

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const CACHE_KEY = 'roadsos_services_cache';
const CACHE_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours
const CACHE_VALID_RADIUS_KM = 5;
const OVERPASS_TIMEOUT_MS = 10_000;

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

    // Resolve coordinates — nodes have lat/lon directly, ways have center
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

    // Skip entries with no name
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
  // out center gives centroid coords for ways; tags are included by default
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
  radiusMeters: number
): Promise<OsmElement[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS);

  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(buildQuery(lat, lng, radiusMeters))}`,
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
    const json: OverpassResponse = await res.json();
    return json.elements;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────

export interface FetchResult {
  services: EmergencyService[];
  limited: boolean;
}

/**
 * Fetches real emergency services from OpenStreetMap via Overpass API.
 * Automatically retries at 20 km if fewer than 3 results found at 10 km.
 * Merges in static towing/puncture data (OSM has very sparse towing coverage).
 * Saves successful results to localStorage cache.
 */
export async function fetchNearbyServices(
  userLat: number,
  userLng: number
): Promise<FetchResult> {
  // First pass — 10 km
  let elements = await queryOverpass(userLat, userLng, 10_000);
  let parsed = parseElements(elements, userLat, userLng);
  let deduped = deduplicateByProximity(parsed);

  // Auto-retry at 20 km if sparse results
  if (deduped.length < 3) {
    elements = await queryOverpass(userLat, userLng, 20_000);
    parsed = parseElements(elements, userLat, userLng);
    deduped = deduplicateByProximity(parsed);
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
