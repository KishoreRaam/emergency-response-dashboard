import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Shield, Phone, Ambulance, X, TruckIcon, Loader2, RefreshCw, Navigation } from 'lucide-react';
import { emergencyServices, type EmergencyService, type ServiceType } from '../data/emergency-services';
import { OfflineIndicator } from '../components/offline-indicator';
import { BottomNav } from '../components/bottom-nav';
import { haversineDistance, etaMinutes } from '../utils/distance';
import { useNavigate, useSearchParams } from 'react-router';
import { SosButton } from '../components/sos-button';
import { fetchNearbyServices, getCachedServices } from '../services/overpass';

// ─── Constants ────────────────────────────────────────────────────────────────

const FALLBACK_LOCATION = { lat: 13.0827, lng: 80.2707 };
const GPS_TIMEOUT_MS = 3000;
const STATIC_MAX_RADIUS_KM = 15; // only for Chennai static fallback

// National emergency numbers — always visible regardless of GPS/network state
const NATIONAL_SERVICES: EmergencyService[] = [
  {
    id: 'nat_108',
    name: '108 Ambulance (Nationwide)',
    type: 'ambulance',
    location: { lat: 0, lng: 0 },
    distance: 0,
    address: 'Dial 108 — free ambulance anywhere in India',
    phone: '108',
    verified: true,
    available24x7: true,
  },
  {
    id: 'nat_112',
    name: '112 Emergency Response',
    type: 'ambulance',
    location: { lat: 0, lng: 0 },
    distance: 0,
    address: 'Dial 112 — all emergencies, all India',
    phone: '112',
    verified: true,
    available24x7: true,
  },
  {
    id: 'nat_100',
    name: '100 Police Control Room',
    type: 'police',
    location: { lat: 0, lng: 0 },
    distance: 0,
    address: 'Dial 100 — police anywhere in India',
    phone: '100',
    verified: true,
    available24x7: true,
  },
];

// ─── Map helpers ──────────────────────────────────────────────────────────────

function MapCenterer({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const didFly = useRef(false);
  useEffect(() => {
    if (!didFly.current) {
      map.flyTo([lat, lng], 13, { duration: 1.2 });
      didFly.current = true;
    }
  }, [lat, lng, map]);
  return null;
}

// ─── Isometric pin markers per service type ─────────────────────────────────

const SERVICE_SVGS: Record<ServiceType, { color: string; symbol: string }> = {
  hospital: {
    color: '#D62828',
    symbol: `<rect x="10" y="9" width="8" height="2.5" rx="0.5" fill="#D62828"/>
      <rect x="12.75" y="7" width="2.5" height="7" rx="0.5" fill="#D62828"/>
      <rect x="9" y="15" width="10" height="7" rx="1" fill="none" stroke="#D62828" stroke-width="1.5"/>
      <rect x="12.5" y="18" width="3" height="4" fill="#D62828"/>`,
  },
  police: {
    color: '#023E8A',
    symbol: `<path d="M14 7 L18.5 10.5 L17 17 L11 17 L9.5 10.5 Z" fill="#023E8A" stroke="white" stroke-width="0.5"/>
      <polygon points="14,10 14.8,12.2 17,12.2 15.3,13.5 15.9,15.7 14,14.3 12.1,15.7 12.7,13.5 11,12.2 13.2,12.2" fill="#FFB703"/>`,
  },
  ambulance: {
    color: '#D62828',
    symbol: `<rect x="6" y="12" width="14" height="8" rx="1.5" fill="#D62828"/>
      <rect x="17" y="14" width="4" height="6" rx="1" fill="#D62828"/>
      <circle cx="10" cy="21" r="1.8" fill="#333" stroke="white" stroke-width="0.8"/>
      <circle cx="18" cy="21" r="1.8" fill="#333" stroke="white" stroke-width="0.8"/>
      <rect x="9" y="13.5" width="1.5" height="4" rx="0.3" fill="white"/>
      <rect x="8" y="14.8" width="4" height="1.5" rx="0.3" fill="white"/>
      <rect x="17.5" y="15" width="3" height="2.5" rx="0.5" fill="#8bcbff"/>`,
  },
  towing: {
    color: '#6B5B00',
    symbol: `<rect x="5" y="13" width="12" height="7" rx="1.5" fill="#6B5B00"/>
      <polygon points="17,13 22,16 22,20 17,20" fill="#6B5B00"/>
      <rect x="17.5" y="16" width="3.5" height="2.5" rx="0.5" fill="#8bcbff"/>
      <circle cx="9" cy="21" r="1.8" fill="#333" stroke="white" stroke-width="0.8"/>
      <circle cx="19" cy="21" r="1.8" fill="#333" stroke="white" stroke-width="0.8"/>
      <line x1="5" y1="13" x2="3" y2="9" stroke="#6B5B00" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="3" y1="9" x2="7" y2="9" stroke="#6B5B00" stroke-width="1.8" stroke-linecap="round"/>`,
  },
  puncture: {
    color: '#8888AA',
    symbol: `<path d="M10 8 L9 13 L11.5 15.5 L12 20 L14 20 L14.5 15.5 L17 13 L16 8" fill="none" stroke="#8888AA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="13" cy="14" r="1.2" fill="#8888AA"/>`,
  },
};

const createCustomIcon = (type: ServiceType) => {
  const { color, symbol } = SERVICE_SVGS[type] ?? SERVICE_SVGS.puncture;
  return new DivIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="54" viewBox="0 0 44 54" style="filter:drop-shadow(0 4px 6px rgba(0,0,0,0.4))">
      <defs><clipPath id="c"><circle cx="22" cy="20" r="18"/></clipPath></defs>
      <path d="M22 52 C22 52 6 30 6 20 A16 16 0 1 1 38 20 C38 30 22 52 22 52Z" fill="white" stroke="${color}" stroke-width="3"/>
      <g transform="translate(8,6)" clip-path="url(#c)">${symbol}</g>
    </svg>`,
    iconSize: [44, 54],
    iconAnchor: [22, 54],
    popupAnchor: [0, -54],
    className: '',
  });
};

const userIcon = new DivIcon({
  html: `
    <style>@keyframes userPulse{0%,100%{transform:scale(0.9)}50%{transform:scale(1.1)}}</style>
    <div style="
      width:32px;height:32px;border-radius:50%;
      background:radial-gradient(circle at 35% 35%,#6ab0ff,#023E8A,#011f45);
      box-shadow:0 6px 16px rgba(2,62,138,0.5),inset -2px -2px 6px rgba(0,0,0,0.3),inset 2px 2px 6px rgba(255,255,255,0.25);
      border:3px solid white;
      animation:userPulse 2s ease-in-out infinite;
    "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
  className: '',
});

// ─── Component ────────────────────────────────────────────────────────────────

type QuickServiceType = 'ambulance' | 'police' | 'towing';

export function HomeScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');

  const [selectedQuickService, setSelectedQuickService] = useState<QuickServiceType | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(true);

  // Live data states
  const [liveServices, setLiveServices] = useState<EmergencyService[] | null>(null);
  const [overpassLoading, setOverpassLoading] = useState(false);
  const [overpassFailed, setOverpassFailed] = useState(false);
  const [limitedData, setLimitedData] = useState(false);
  const [usingCache, setUsingCache] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  // ── Apply ?filter= query param ─────────────────────────────────────────────
  useEffect(() => {
    if (!filterParam) return;
    const paramMap: Record<string, QuickServiceType> = {
      hospital: 'ambulance',
      ambulance: 'ambulance',
      police: 'police',
      towing: 'towing',
    };
    const mapped = paramMap[filterParam];
    if (mapped) setSelectedQuickService(mapped);
  }, [filterParam]);

  // ── Online / offline ───────────────────────────────────────────────────────
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // ── GPS with 5-second timeout ──────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation(FALLBACK_LOCATION);
      setGpsLoading(false);
      return;
    }
    const timer = setTimeout(() => {
      setUserLocation(FALLBACK_LOCATION);
      setGpsLoading(false);
    }, GPS_TIMEOUT_MS);
    navigator.geolocation.getCurrentPosition(
      pos => {
        clearTimeout(timer);
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        clearTimeout(timer);
        setUserLocation(FALLBACK_LOCATION);
        setGpsLoading(false);
      },
      { timeout: GPS_TIMEOUT_MS, enableHighAccuracy: true }
    );
    return () => clearTimeout(timer);
  }, []);

  // ── Fetch live data once GPS resolves (re-runs on Retry) ──────────────────
  useEffect(() => {
    if (!userLocation) return;
    const { lat, lng } = userLocation;

    // 1. Check localStorage cache (instant)
    const cached = getCachedServices(lat, lng, !isOnline);
    if (cached) {
      setLiveServices(cached);
      setUsingCache(true);
      setOverpassFailed(false);
      return;
    }

    // 2. Offline + no cache → static data still shows via localServices fallback
    if (!isOnline) return;

    // 3. Fetch from Overpass (all endpoints raced in parallel)
    setOverpassLoading(true);
    setOverpassFailed(false);
    fetchNearbyServices(lat, lng)
      .then(({ services, limited }) => {
        setLiveServices(services);
        setLimitedData(limited);
        setUsingCache(false);
        setOverpassFailed(false);
      })
      .catch(() => {
        // All endpoints failed — static data + nationals still show
        setLiveServices(null);
        setOverpassFailed(true);
      })
      .finally(() => setOverpassLoading(false));
  }, [userLocation, isOnline, retryTick]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Build display services ─────────────────────────────────────────────────
  // Live data: already sorted + filtered by Overpass (10-20 km window)
  // Static fallback: only useful if user is near Chennai (~15 km)
  // Nationals are appended inside filteredServices below (not in map markers)
  const localServices: EmergencyService[] = (() => {
    if (!userLocation) return [];
    const { lat, lng } = userLocation;

    if (liveServices !== null) {
      return liveServices; // already distance-sorted, no extra cap needed
    }

    // Static fallback (Chennai-area only)
    return emergencyServices
      .map(s => ({ ...s, distance: haversineDistance(lat, lng, s.location.lat, s.location.lng) }))
      .filter(s => s.distance <= STATIC_MAX_RADIUS_KM)
      .sort((a, b) => a.distance - b.distance);
  })();

  // ── Nearest local service per category (for summary card distance text) ───
  const nearest = (type: QuickServiceType) =>
    localServices.find(s => {
      if (type === 'ambulance') return s.type === 'ambulance' || s.type === 'hospital';
      if (type === 'police') return s.type === 'police';
      if (type === 'towing') return s.type === 'towing' || s.type === 'puncture';
      return false;
    }) ?? null;

  // ── Filtered + nationals for drilldown list ────────────────────────────────
  const filteredServices = (() => {
    if (!selectedQuickService) return [];

    const matchFn = (s: EmergencyService) => {
      if (selectedQuickService === 'ambulance') return s.type === 'ambulance' || s.type === 'hospital';
      if (selectedQuickService === 'police') return s.type === 'police';
      if (selectedQuickService === 'towing') return s.type === 'towing' || s.type === 'puncture';
      return false;
    };

    const local = localServices.filter(matchFn).slice(0, 3);
    // Always append matching national numbers so the list is never empty
    const nationals = NATIONAL_SERVICES.filter(matchFn);
    return [...local, ...nationals];
  })();

  const handleServiceClick = (serviceId: string) => {
    // National services have no detail page — call directly
    if (serviceId.startsWith('nat_')) return;
    // Pass the service object + location so detail screen works for live OSM services too
    const svc = localServices.find(s => s.id === serviceId);
    navigate(`/service/${serviceId}`, { state: { service: svc, userLocation } });
  };

  const mapCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [FALLBACK_LOCATION.lat, FALLBACK_LOCATION.lng];

  const hasLocalData = localServices.length > 0;
  const badgeText = gpsLoading       ? 'LOCATING'
    : overpassLoading                ? 'LOADING'
    : usingCache                     ? 'CACHED'
    : overpassFailed && hasLocalData ? 'NEARBY'
    : overpassFailed                 ? 'FALLBACK'
    :                                  'LIVE';

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col relative">
      <OfflineIndicator isOffline={!isOnline} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-5 pt-6 pb-4 bg-gradient-to-b from-[#0D0D0D]/90 to-transparent">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#D62828]" />
          <h1 className="font-bold text-[#F0F0F0] text-xl">RoadSoS</h1>
        </div>
      </div>

      {/* Map — full screen */}
      <div className="absolute inset-0 z-0">
        {gpsLoading ? (
          <div className="w-full h-full bg-[#1A1A2E] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-[#D62828] animate-spin" />
            <p className="text-[#8888AA] text-sm">Locating you…</p>
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics"
              maxZoom={19}
            />
            <ZoomControl position="bottomright" />
            {userLocation && <MapCenterer lat={userLocation.lat} lng={userLocation.lng} />}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                <Popup>Your Location</Popup>
              </Marker>
            )}
            {/* Service markers — clustered */}
            <MarkerClusterGroup
              disableClusteringAtZoom={16}
              chunkedLoading
              iconCreateFunction={(cluster: any) => {
                const count = cluster.getChildCount();
                return new DivIcon({
                  html: `<div style="
                    width:40px;height:40px;border-radius:50%;
                    background:radial-gradient(circle at 35% 35%,#ff8c42,#D62828,#6a0000);
                    box-shadow:0 4px 14px rgba(0,0,0,0.5),inset 2px 2px 6px rgba(255,255,255,0.2);
                    display:flex;align-items:center;justify-content:center;
                    color:white;font-weight:700;font-size:13px;
                    border:2px solid rgba(255,255,255,0.6);
                  ">${count}</div>`,
                  iconSize: [40, 40],
                  iconAnchor: [20, 20],
                  className: '',
                });
              }}
            >
              {(selectedQuickService ? filteredServices : localServices)
                .filter(s => !s.id.startsWith('nat_'))
                .map(service => (
                  <Marker
                    key={service.id}
                    position={[service.location.lat, service.location.lng]}
                    icon={createCustomIcon(service.type)}
                  >
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold mb-1">{service.name}</div>
                        <div className="text-xs text-gray-600">
                          {service.distance} km · Est. {etaMinutes(service.distance)} min
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MarkerClusterGroup>
          </MapContainer>
        )}
      </div>

      {/* Floating Service Selection Card */}
      <div className="absolute bottom-20 left-0 right-0 z-10 px-4">
        <div className="bg-[#F5F5F5] rounded-3xl shadow-2xl overflow-hidden max-w-md mx-auto">

          {!selectedQuickService ? (
            <div className="p-5">
              {/* Header row */}
              <div className="mb-3">
                <div className="text-xs font-semibold text-[#8888AA] mb-1 tracking-wide">DISPATCH CENTER</div>
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-[#1A1A2E] text-2xl">Nearest Help</h2>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    overpassFailed && !hasLocalData ? 'bg-amber-100 text-amber-700' : 'bg-[#FFB703] text-[#1A1A2E]'
                  }`}>
                    <div className="w-2 h-2 rounded-full animate-pulse bg-current" />
                    {badgeText}
                  </div>
                </div>
              </div>

              {/* Fetching pill */}
              {overpassLoading && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-[#FFB703]/10 rounded-xl">
                  <Loader2 className="w-3.5 h-3.5 text-[#FFB703] animate-spin flex-shrink-0" />
                  <span className="text-xs text-[#8888AA]">Finding nearby services…</span>
                </div>
              )}

              {/* Overpass failed — only show error if no static data available */}
              {overpassFailed && !overpassLoading && !hasLocalData && (
                <div className="flex items-center justify-between mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700">Live data unavailable — hotlines active</p>
                  <button
                    onClick={() => setRetryTick(t => t + 1)}
                    className="flex items-center gap-1 text-xs font-semibold text-[#D62828] ml-2 shrink-0"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retry
                  </button>
                </div>
              )}

              {/* Limited data banner */}
              {limitedData && !overpassLoading && !overpassFailed && (
                <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700 font-medium">
                    Limited data in your area — showing available services
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {/* Ambulance / Hospital */}
                {(() => {
                  const svc = nearest('ambulance');
                  return (
                    <button
                      onClick={() => setSelectedQuickService('ambulance')}
                      className="w-full bg-white hover:bg-gray-50 rounded-2xl p-4 flex items-center justify-between group transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#D62828] rounded-xl flex items-center justify-center">
                          <Ambulance className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-[#1A1A2E]">Ambulance</div>
                          <div className="text-xs text-[#8888AA]">
                            {svc
                              ? `${svc.distance} km away · Est. ${etaMinutes(svc.distance)} min`
                              : gpsLoading || overpassLoading
                              ? 'Locating…'
                              : 'Tap — hotlines available'}
                          </div>
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-[#D62828] rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                    </button>
                  );
                })()}

                {/* Police */}
                {(() => {
                  const svc = nearest('police');
                  return (
                    <button
                      onClick={() => setSelectedQuickService('police')}
                      className="w-full bg-white hover:bg-gray-50 rounded-2xl p-4 flex items-center justify-between group transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#023E8A] rounded-xl flex items-center justify-center">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-[#1A1A2E]">Police Dept.</div>
                          <div className="text-xs text-[#8888AA]">
                            {svc
                              ? `${svc.distance} km away · Est. ${etaMinutes(svc.distance)} min`
                              : gpsLoading || overpassLoading
                              ? 'Locating…'
                              : 'Tap — hotlines available'}
                          </div>
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-[#023E8A] rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                    </button>
                  );
                })()}

                {/* Towing */}
                {(() => {
                  const svc = nearest('towing');
                  return (
                    <button
                      onClick={() => setSelectedQuickService('towing')}
                      className="w-full bg-white hover:bg-gray-50 rounded-2xl p-4 flex items-center justify-between group transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#6B5B00] rounded-xl flex items-center justify-center">
                          <TruckIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-[#1A1A2E]">Tow Service</div>
                          <div className="text-xs text-[#8888AA]">
                            {svc
                              ? `${svc.distance} km away · Est. ${etaMinutes(svc.distance)} min`
                              : gpsLoading || overpassLoading
                              ? 'Locating…'
                              : 'Tap — hotlines available'}
                          </div>
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-[#6B5B00] rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                    </button>
                  );
                })()}
              </div>
            </div>

          ) : (
            <div className="max-h-[70vh] flex flex-col">
              <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-[#F5F5F5] sticky top-0 z-10">
                <div>
                  <div className="text-xs font-semibold text-[#8888AA] mb-1 tracking-wide">
                    {selectedQuickService === 'ambulance' ? 'MEDICAL SERVICES' :
                     selectedQuickService === 'police' ? 'POLICE SERVICES' : 'ROADSIDE ASSISTANCE'}
                  </div>
                  <h2 className="font-bold text-[#1A1A2E] text-xl">
                    {filteredServices.length} Option{filteredServices.length !== 1 ? 's' : ''}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedQuickService(null)}
                  className="w-10 h-10 bg-[#1A1A2E]/10 hover:bg-[#1A1A2E]/20 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-[#1A1A2E]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {filteredServices.map(service => (
                  <div
                    key={service.id}
                    className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleServiceClick(service.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-[#1A1A2E] leading-tight pr-2">{service.name}</h3>
                      <div className={`px-2 py-1 rounded-lg text-xs font-semibold shrink-0 ${
                        service.available24x7
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {service.available24x7 ? '24/7' : 'Limited'}
                      </div>
                    </div>
                    <div className="text-xs text-[#8888AA] mb-3">{service.address}</div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-[#8888AA]">
                        {service.id.startsWith('nat_')
                          ? 'Nationwide hotline'
                          : `${service.distance} km · Est. ${etaMinutes(service.distance)} min`}
                      </div>
                      <div className="flex items-center gap-2">
                        {!service.id.startsWith('nat_') && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              navigate(`/tracking/${service.id}`, { state: { userLocation, liveServices: localServices } });
                            }}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1A1A2E]/10 border border-[#8888AA]/20"
                          >
                            <Navigation className="w-4 h-4 text-[#1A1A2E]" />
                          </button>
                        )}
                        <a
                          href={`tel:${service.phone}`}
                          onClick={e => e.stopPropagation()}
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            selectedQuickService === 'ambulance' ? 'bg-[#D62828]' :
                            selectedQuickService === 'police' ? 'bg-[#023E8A]' : 'bg-[#6B5B00]'
                          }`}
                        >
                          <Phone className="w-5 h-5 text-white" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pb-safe">
        <BottomNav />
      </div>

      <SosButton />
    </div>
  );
}
