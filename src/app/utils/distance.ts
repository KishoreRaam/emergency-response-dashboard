const EARTH_RADIUS_KM = 6371;

/**
 * Haversine formula — returns great-circle distance in kilometres.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((EARTH_RADIUS_KM * c).toFixed(1));
}

/**
 * ETA in minutes assuming 30 km/h average urban speed.
 */
export function etaMinutes(distanceKm: number): number {
  return Math.ceil((distanceKm / 30) * 60);
}

/**
 * Build a platform-appropriate navigation deep link.
 */
export function buildNavigationUrl(
  lat: number,
  lng: number,
  label: string
): string {
  const ua = navigator.userAgent;
  const isAndroid = /android/i.test(ua);
  const isIOS = /ipad|iphone|ipod/i.test(ua);

  if (isAndroid) {
    return `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(label)})`;
  }
  if (isIOS) {
    return `maps:?daddr=${lat},${lng}`;
  }
  // Desktop / other — OpenStreetMap directions
  return `https://www.openstreetmap.org/directions?to=${lat},${lng}`;
}
