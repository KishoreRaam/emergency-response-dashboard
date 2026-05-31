import { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Loader2, MapPin } from 'lucide-react';
import { emergencyServices, type EmergencyService, type ServiceType } from '../data/emergency-services';
import { ServiceCard } from '../components/service-card';
import { BottomNav } from '../components/bottom-nav';
import { useNavigate } from 'react-router';
import { getCachedServices, fetchNearbyServices } from '../services/overpass';
import { haversineDistance } from '../utils/distance';

// ─── Type filter chips ────────────────────────────────────────────────────────

const TYPE_FILTERS: { label: string; value: ServiceType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Hospital', value: 'hospital' },
  { label: 'Police', value: 'police' },
  { label: 'Ambulance', value: 'ambulance' },
  { label: 'Towing', value: 'towing' },
];

const GPS_TIMEOUT_MS = 5000;

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ServiceType | 'all'>('all');
  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [liveServices, setLiveServices] = useState<EmergencyService[] | null>(null);
  const [loading, setLoading] = useState(true); // true while GPS + initial data resolves

  // ── GPS then data ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const resolveData = async (lat: number, lng: number) => {
      if (cancelled) return;
      setUserLocation({ lat, lng });

      // 1. Cache hit → instant
      const cached = getCachedServices(lat, lng, !navigator.onLine);
      if (cached) {
        if (!cancelled) { setLiveServices(cached); setLoading(false); }
        return;
      }

      // 2. Offline, no cache → fall back to static (distances computed below)
      if (!navigator.onLine) {
        if (!cancelled) setLoading(false);
        return;
      }

      // 3. Fetch from Overpass
      try {
        const { services } = await fetchNearbyServices(lat, lng);
        if (!cancelled) setLiveServices(services);
      } catch {
        // Silent — static fallback handles it
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (!navigator.geolocation) {
      resolveData(13.0827, 80.2707); // Chennai fallback
      return;
    }

    const timer = setTimeout(() => {
      resolveData(13.0827, 80.2707);
    }, GPS_TIMEOUT_MS);

    navigator.geolocation.getCurrentPosition(
      pos => {
        clearTimeout(timer);
        resolveData(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        clearTimeout(timer);
        resolveData(13.0827, 80.2707);
      },
      { timeout: GPS_TIMEOUT_MS, enableHighAccuracy: true }
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // ── Build searchable pool ──────────────────────────────────────────────────
  // Use live data if available, otherwise static re-enriched with distances
  const allServices: EmergencyService[] = (() => {
    if (!userLocation) return [];
    const { lat, lng } = userLocation;

    const base = liveServices !== null
      ? liveServices
      : emergencyServices.map(s => ({
          ...s,
          distance: haversineDistance(lat, lng, s.location.lat, s.location.lng),
        }));

    return [...base].sort((a, b) => a.distance - b.distance);
  })();

  // ── Filter by query + type chip ────────────────────────────────────────────
  const q = query.trim().toLowerCase();
  const results = allServices.filter(s => {
    const matchesType = typeFilter === 'all' || s.type === typeFilter;
    if (!matchesType) return false;
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q) ||
      s.type.toLowerCase().includes(q)
    );
  });

  const isLive = liveServices !== null;

  return (
    <div className="min-h-screen bg-[#FAFBFC] pb-20">
      {/* Sticky header */}
      <div className="bg-[#FFFFFF] px-4 py-4 border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-bold text-[#111827] text-lg">Search Services</h1>
          {/* Data source badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
            loading
              ? 'bg-[#6B7280]/20 text-[#6B7280]'
              : isLive
              ? 'bg-[#10B981]/20 text-[#10B981]'
              : 'bg-[#F59E0B]/20 text-[#F59E0B]'
          }`}>
            {loading
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <MapPin className="w-3 h-3" />}
            {loading ? 'Locating…' : isLive ? 'Live data' : 'Cached'}
          </div>
        </div>

        {/* Search input */}
        <div className="bg-[#F3F4F6] rounded-2xl px-4 py-3 flex items-center gap-2 mb-3">
          <SearchIcon className="w-5 h-5 text-[#6B7280] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search hospitals, police stations…"
            className="flex-1 bg-transparent text-[#111827] placeholder:text-[#9CA3AF] outline-none"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[#6B7280] hover:text-[#111827] transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Type filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {TYPE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                typeFilter === f.value
                  ? 'bg-[#4F46E5] text-white'
                  : 'bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 text-[#4F46E5] animate-spin mx-auto mb-4" />
            <p className="text-[#6B7280] text-sm">Finding services near you…</p>
          </div>

        ) : query === '' && typeFilter === 'all' ? (
          <div>
            {allServices.length > 0 && (
              <>
                <p className="text-xs text-[#6B7280] mb-4 font-medium tracking-wide">
                  {allServices.length} SERVICES NEAR YOU
                </p>
                <div className="space-y-3">
                  {allServices.slice(0, 10).map(service => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onClick={() => {
                        if (!service.id.startsWith('osm_')) navigate(`/service/${service.id}`);
                      }}
                    />
                  ))}
                  {allServices.length > 10 && (
                    <p className="text-center text-xs text-[#6B7280] pt-2">
                      Search to see all {allServices.length} services
                    </p>
                  )}
                </div>
              </>
            )}
            {allServices.length === 0 && (
              <div className="text-center py-12">
                <SearchIcon className="w-16 h-16 text-[#6B7280]/30 mx-auto mb-4" />
                <h3 className="text-[#111827] font-semibold mb-2">Search for services</h3>
                <p className="text-[#6B7280] text-sm">Find hospitals, police stations, ambulances and more</p>
              </div>
            )}
          </div>

        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-[#6B7280]/30 mx-auto mb-4" />
            <h3 className="text-[#111827] font-semibold mb-2">No results found</h3>
            <p className="text-[#6B7280] text-sm">Try a different search term or filter</p>
          </div>

        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[#6B7280] mb-4">
              {results.length} {results.length === 1 ? 'result' : 'results'} found
            </p>
            {results.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onClick={() => {
                  if (!service.id.startsWith('osm_')) navigate(`/service/${service.id}`);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
