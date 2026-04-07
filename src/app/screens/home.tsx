import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shield, Phone, Ambulance, X, TruckIcon, Loader2 } from 'lucide-react';
import { emergencyServices, type EmergencyService, type ServiceType } from '../data/emergency-services';
import { OfflineIndicator } from '../components/offline-indicator';
import { BottomNav } from '../components/bottom-nav';
import { haversineDistance, etaMinutes } from '../utils/distance';
import { useNavigate, useSearchParams } from 'react-router';
import { SosButton } from '../components/sos-button';
import { fetchNearbyServices, getCachedServices } from '../services/overpass';

// ─── Constants ────────────────────────────────────────────────────────────────

const FALLBACK_LOCATION = { lat: 13.0827, lng: 80.2707 }; // Chennai city centre
const GPS_TIMEOUT_MS = 5000;
const MAX_RADIUS_KM = 15;

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

const createCustomIcon = (type: ServiceType) => {
  const colorMap: Record<ServiceType, string> = {
    hospital: '#D62828',
    police: '#023E8A',
    ambulance: '#D62828',
    towing: '#6B5B00',
    puncture: '#8888AA',
  };
  const color = colorMap[type] ?? '#8888AA';
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
        <path fill="${color}" stroke="white" stroke-width="2" d="M12 0C7.58 0 4 3.58 4 8c0 5.5 8 14 8 14s8-8.5 8-14c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const userIcon = new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <circle cx="12" cy="12" r="10" fill="#023E8A" stroke="white" stroke-width="3"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  `)}`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
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

  // Live data state
  const [liveServices, setLiveServices] = useState<EmergencyService[] | null>(null);
  const [overpassLoading, setOverpassLoading] = useState(false);
  const [limitedData, setLimitedData] = useState(false);
  const [usingCache, setUsingCache] = useState(false);

  // ── Apply ?filter= query param from injury-detail ──────────────────────────
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

  // ── Online / offline listeners ─────────────────────────────────────────────
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // ── GPS with 5-second timeout fallback ────────────────────────────────────
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

  // ── Fetch live data once GPS resolves ─────────────────────────────────────
  useEffect(() => {
    if (!userLocation) return;
    const { lat, lng } = userLocation;

    // 1. Check cache first (instant — no network)
    const cached = getCachedServices(lat, lng, !isOnline);
    if (cached) {
      setLiveServices(cached);
      setUsingCache(true);
      return; // Skip Overpass — cache is fresh enough
    }

    // 2. If offline and no cache, fall through to static data
    if (!isOnline) return;

    // 3. Fetch from Overpass
    setOverpassLoading(true);
    fetchNearbyServices(lat, lng)
      .then(({ services, limited }) => {
        setLiveServices(services);
        setLimitedData(limited);
        setUsingCache(false);
      })
      .catch(() => {
        // Overpass failed — silently fall back to static data
        setLiveServices(null);
      })
      .finally(() => setOverpassLoading(false));
  }, [userLocation, isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Build display services (live > cache > static) ────────────────────────
  const allServices: EmergencyService[] = (() => {
    if (!userLocation) return [];

    const { lat, lng } = userLocation;

    if (liveServices !== null) {
      // Live/cached data already contains re-enriched towing from overpass.ts
      return liveServices.filter(s => s.distance <= MAX_RADIUS_KM);
    }

    // Static fallback — re-compute distances
    return emergencyServices
      .map(s => ({
        ...s,
        distance: haversineDistance(lat, lng, s.location.lat, s.location.lng),
      }))
      .filter(s => s.distance <= MAX_RADIUS_KM)
      .sort((a, b) => a.distance - b.distance);
  })();

  // ── Filtered list for selected category (top 3) ───────────────────────────
  const filteredServices = (() => {
    if (!selectedQuickService) return [];
    return allServices
      .filter(s => {
        if (selectedQuickService === 'ambulance') return s.type === 'ambulance' || s.type === 'hospital';
        if (selectedQuickService === 'police') return s.type === 'police';
        if (selectedQuickService === 'towing') return s.type === 'towing' || s.type === 'puncture';
        return false;
      })
      .slice(0, 3);
  })();

  // Nearest single service per category (for summary cards)
  const nearest = (type: QuickServiceType) => {
    return allServices.find(s => {
      if (type === 'ambulance') return s.type === 'ambulance' || s.type === 'hospital';
      if (type === 'police') return s.type === 'police';
      if (type === 'towing') return s.type === 'towing' || s.type === 'puncture';
      return false;
    }) ?? null;
  };

  const handleServiceClick = (serviceId: string) => navigate(`/service/${serviceId}`);

  const mapCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [FALLBACK_LOCATION.lat, FALLBACK_LOCATION.lng];

  // Badge text for the "LIVE" pill
  const badgeText = gpsLoading
    ? 'LOCATING'
    : overpassLoading
    ? 'LOADING'
    : usingCache
    ? 'CACHED'
    : 'LIVE';

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
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <ZoomControl position="bottomright" />

            {userLocation && <MapCenterer lat={userLocation.lat} lng={userLocation.lng} />}

            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                <Popup>Your Location</Popup>
              </Marker>
            )}

            {(selectedQuickService ? filteredServices : allServices).map(service => (
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
                  <div className="bg-[#FFB703] text-[#1A1A2E] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#1A1A2E] rounded-full animate-pulse" />
                    {badgeText}
                  </div>
                </div>
              </div>

              {/* Loading pill */}
              {overpassLoading && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-[#FFB703]/10 rounded-xl">
                  <Loader2 className="w-3.5 h-3.5 text-[#FFB703] animate-spin flex-shrink-0" />
                  <span className="text-xs text-[#8888AA]">Finding nearby services…</span>
                </div>
              )}

              {/* Limited data banner */}
              {limitedData && !overpassLoading && (
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
                              : gpsLoading || overpassLoading ? 'Locating…' : 'None within 15 km'}
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
                              : gpsLoading || overpassLoading ? 'Locating…' : 'None within 15 km'}
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
                              : gpsLoading || overpassLoading ? 'Locating…' : 'None within 15 km'}
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
                    {filteredServices.length} Nearest Options
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
                      <h3 className="font-bold text-[#1A1A2E]">{service.name}</h3>
                      <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        service.available24x7
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {service.available24x7 ? '24/7' : 'Limited'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-[#8888AA]">
                        {service.distance} km · Est. {etaMinutes(service.distance)} min
                      </div>
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
