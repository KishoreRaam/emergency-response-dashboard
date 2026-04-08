import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { Icon, DivIcon, type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, ArrowLeft, Loader2 } from 'lucide-react';
import { emergencyServices, type ServiceType } from '../data/emergency-services';
import { haversineDistance, etaMinutes } from '../utils/distance';

// ─── Vehicle emoji per type ──────────────────────────────────────────────────

const VEHICLE_EMOJI: Record<ServiceType, string> = {
  hospital: '\u{1F691}',
  ambulance: '\u{1F691}',
  police: '\u{1F694}',
  towing: '\u{1F69B}',
  puncture: '\u{1F69B}',
};

const TYPE_LABELS: Record<ServiceType, string> = {
  hospital: 'AMBULANCE',
  ambulance: 'AMBULANCE',
  police: 'POLICE',
  towing: 'TOW TRUCK',
  puncture: 'TOW TRUCK',
};

const TYPE_COLORS: Record<ServiceType, string> = {
  hospital: '#D62828',
  ambulance: '#D62828',
  police: '#023E8A',
  towing: '#6B5B00',
  puncture: '#6B5B00',
};

// ─── Icons ───────────────────────────────────────────────────────────────────

const userIcon = new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
      <circle cx="20" cy="20" r="18" fill="#023E8A" stroke="white" stroke-width="3"/>
      <circle cx="20" cy="20" r="6" fill="white"/>
    </svg>
  `)}`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const createVehicleDivIcon = (emoji: string) =>
  new DivIcon({
    html: `<div style="font-size:32px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    className: '',
  });

// ─── Map helpers ─────────────────────────────────────────────────────────────

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (!fitted.current && points.length >= 2) {
      map.fitBounds(points as LatLngExpression[], { padding: [60, 60] });
      fitted.current = true;
    }
  }, [map, points]);
  return null;
}

function FollowVehicle({ pos }: { pos: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.panTo(pos, { animate: true, duration: 0.5 });
  }, [map, pos]);
  return null;
}

// ─── OSRM route fetching ─────────────────────────────────────────────────────

async function fetchRoute(
  sLat: number, sLng: number,
  uLat: number, uLng: number,
): Promise<[number, number][]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${sLng},${sLat};${uLng},${uLat}?overview=full&geometries=geojson`,
      { signal: controller.signal },
    );
    clearTimeout(timeout);
    const data = await res.json();
    const coords: [number, number][] = data.routes?.[0]?.geometry?.coordinates ?? [];
    return coords.map(([lng, lat]) => [lat, lng]);
  } catch {
    clearTimeout(timeout);
    return [];
  }
}

// ─── Route geometry helpers ──────────────────────────────────────────────────

function computeSegments(route: [number, number][]) {
  const segLengths: number[] = [];
  let totalLen = 0;
  for (let i = 1; i < route.length; i++) {
    const dLat = route[i][0] - route[i - 1][0];
    const dLng = route[i][1] - route[i - 1][1];
    const len = Math.sqrt(dLat * dLat + dLng * dLng);
    segLengths.push(len);
    totalLen += len;
  }
  return { segLengths, totalLen };
}

function interpolateRoute(route: [number, number][], t: number): [number, number] {
  if (route.length === 0) return [0, 0];
  if (route.length === 1 || t <= 0) return route[0];
  if (t >= 1) return route[route.length - 1];

  const { segLengths, totalLen } = computeSegments(route);
  if (totalLen === 0) return route[0];

  const targetDist = t * totalLen;
  let accumulated = 0;
  for (let i = 0; i < segLengths.length; i++) {
    if (accumulated + segLengths[i] >= targetDist) {
      const segT = (targetDist - accumulated) / segLengths[i];
      const lat = route[i][0] + segT * (route[i + 1][0] - route[i][0]);
      const lng = route[i][1] + segT * (route[i + 1][1] - route[i][1]);
      return [lat, lng];
    }
    accumulated += segLengths[i];
  }
  return route[route.length - 1];
}

/** Split route into [traveled, remaining] at progress t (0..1) */
function splitRoute(
  route: [number, number][],
  t: number,
): { traveled: [number, number][]; remaining: [number, number][] } {
  if (route.length < 2 || t <= 0) return { traveled: [], remaining: route };
  if (t >= 1) return { traveled: route, remaining: [] };

  const { segLengths, totalLen } = computeSegments(route);
  if (totalLen === 0) return { traveled: [], remaining: route };

  const targetDist = t * totalLen;
  let accumulated = 0;

  for (let i = 0; i < segLengths.length; i++) {
    if (accumulated + segLengths[i] >= targetDist) {
      const segT = (targetDist - accumulated) / segLengths[i];
      const splitPt: [number, number] = [
        route[i][0] + segT * (route[i + 1][0] - route[i][0]),
        route[i][1] + segT * (route[i + 1][1] - route[i][1]),
      ];
      return {
        traveled: [...route.slice(0, i + 1), splitPt],
        remaining: [splitPt, ...route.slice(i + 1)],
      };
    }
    accumulated += segLengths[i];
  }
  return { traveled: route, remaining: [] };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TrackingScreen() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const userLocation = (location.state as any)?.userLocation as { lat: number; lng: number } | null;

  const liveServices = (location.state as any)?.liveServices as typeof emergencyServices | undefined;
  const service = useMemo(() => {
    const all = [...(liveServices ?? []), ...emergencyServices];
    return all.find(s => s.id === serviceId) ?? null;
  }, [serviceId, liveServices]);

  const [route, setRoute] = useState<[number, number][]>([]);
  const [vehiclePos, setVehiclePos] = useState<[number, number] | null>(null);
  const [progress, setProgress] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const animStart = useRef<number>(0);

  const distance = useMemo(() => {
    if (!userLocation || !service) return 0;
    return service.distance > 0
      ? service.distance
      : haversineDistance(userLocation.lat, userLocation.lng, service.location.lat, service.location.lng);
  }, [userLocation, service]);

  const eta = useMemo(() => etaMinutes(distance), [distance]);

  // Fetch route
  useEffect(() => {
    if (!userLocation || !service) return;
    const { lat: sLat, lng: sLng } = service.location;
    fetchRoute(sLat, sLng, userLocation.lat, userLocation.lng).then(r => {
      if (r.length >= 2) {
        setRoute(r);
      } else {
        setRoute([[sLat, sLng], [userLocation.lat, userLocation.lng]]);
      }
    });
  }, [userLocation, service]);

  // Animate vehicle (10x accelerated)
  useEffect(() => {
    if (route.length < 2 || eta === 0) return;
    const totalMs = (eta * 60 * 1000) / 10;
    animStart.current = Date.now();
    setCountdown(eta);
    setArrived(false);
    setProgress(0);

    const interval = setInterval(() => {
      const elapsed = Date.now() - animStart.current;
      const t = Math.min(elapsed / totalMs, 1);
      setVehiclePos(interpolateRoute(route, t));
      setProgress(t);

      const remainingMs = totalMs - elapsed;
      setCountdown(Math.max(0, Math.ceil(remainingMs / 60000)));

      if (t >= 1) {
        clearInterval(interval);
        setArrived(true);
        setCountdown(0);
        setProgress(1);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [route, eta]);

  // ── Loading / error states ─────────────────────────────────────────────────
  if (!userLocation) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-[#D62828] animate-spin" />
        <p className="text-[#8888AA] text-sm">Waiting for GPS...</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#8888AA] text-sm underline">
          Go back
        </button>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center gap-3">
        <p className="text-[#8888AA]">Service not found</p>
        <button onClick={() => navigate(-1)} className="text-[#D62828] font-semibold">Go back</button>
      </div>
    );
  }

  const color = TYPE_COLORS[service.type];
  const label = TYPE_LABELS[service.type];
  const emoji = VEHICLE_EMOJI[service.type];
  const mapPoints: [number, number][] = [
    [service.location.lat, service.location.lng],
    [userLocation.lat, userLocation.lng],
  ];
  const { traveled, remaining } = splitRoute(route, progress);

  return (
    <div className="h-screen bg-[#F5F5F5] flex flex-col relative overflow-hidden">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-20 w-10 h-10 bg-white/90 backdrop-blur shadow-md rounded-full flex items-center justify-center"
      >
        <ArrowLeft className="w-5 h-5 text-[#1A1A2E]" />
      </button>

      {/* Arrived banner */}
      {arrived && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#06D6A0] text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg">
          Vehicle Arrived!
        </div>
      )}

      {/* Map — takes most of the screen */}
      <div className="flex-1 min-h-0">
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          {/* Light/white map for tracking visibility */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <FitBounds points={mapPoints} />

          {/* Traveled path — faded */}
          {traveled.length >= 2 && (
            <Polyline
              positions={traveled}
              pathOptions={{ color, weight: 4, opacity: 0.15 }}
            />
          )}
          {/* Remaining path — solid */}
          {remaining.length >= 2 && (
            <Polyline
              positions={remaining}
              pathOptions={{ color, weight: 4, opacity: 0.85 }}
            />
          )}

          {/* User location — "home" dot */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />

          {/* Animated vehicle emoji on the map */}
          {vehiclePos && (
            <Marker position={vehiclePos} icon={createVehicleDivIcon(emoji)} />
          )}

          {/* Gently follow the vehicle */}
          <FollowVehicle pos={vehiclePos} />
        </MapContainer>
      </div>

      {/* Compact bottom card — Zomato/Swiggy style */}
      <div className="bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-5 pt-4 pb-5 flex-shrink-0">
        {/* ETA row */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[#8888AA] text-xs font-medium tracking-wide">
              {arrived ? 'STATUS' : 'ARRIVING IN'}
            </p>
            <p className="text-[#1A1A2E] text-2xl font-bold leading-tight">
              {arrived ? 'Arrived' : `${countdown ?? eta} mins`}
            </p>
          </div>
          <span className="text-4xl">{emoji}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%`, backgroundColor: color }}
          />
        </div>

        {/* Service info + call */}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider text-white"
                style={{ backgroundColor: color }}
              >
                {label}
              </span>
            </div>
            <p className="text-[#1A1A2E] font-semibold text-sm truncate">{service.name}</p>
            {!arrived && (
              <p className="text-[#8888AA] text-xs">{distance} km away</p>
            )}
          </div>
          <a
            href={`tel:${service.phone}`}
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 ml-3"
            style={{ backgroundColor: color }}
          >
            <Phone className="w-5 h-5 text-white" />
          </a>
        </div>
      </div>
    </div>
  );
}
