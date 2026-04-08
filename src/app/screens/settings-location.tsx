import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, RefreshCw, Trash2, Crosshair, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { BottomNav } from '../components/bottom-nav';

const GPS_SESSION_KEY = 'roadsos_user_location';
const CACHE_KEY = 'roadsos_services_cache';

export function SettingsLocationScreen() {
  const navigate = useNavigate();
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(() => {
    try {
      const saved = sessionStorage.getItem(GPS_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [locating, setLocating] = useState(false);
  const [hasCachedServices, setHasCachedServices] = useState(!!localStorage.getItem(CACHE_KEY));

  // Check permission state on mount
  useEffect(() => {
    if (!navigator.permissions) {
      setPermissionState('unknown');
      return;
    }
    navigator.permissions.query({ name: 'geolocation' }).then(result => {
      setPermissionState(result.state as 'granted' | 'denied' | 'prompt');
      result.onchange = () => setPermissionState(result.state as 'granted' | 'denied' | 'prompt');
    }).catch(() => setPermissionState('unknown'));
  }, []);

  const refreshLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentLocation(loc);
        setLocating(false);
        setPermissionState('granted');
        try { sessionStorage.setItem(GPS_SESSION_KEY, JSON.stringify(loc)); } catch {}
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true },
    );
  }, []);

  const clearCachedData = () => {
    localStorage.removeItem(CACHE_KEY);
    sessionStorage.removeItem(GPS_SESSION_KEY);
    setCurrentLocation(null);
    setHasCachedServices(false);
  };

  const permColor = permissionState === 'granted' ? '#06D6A0' : permissionState === 'denied' ? '#D62828' : '#FFB703';
  const permText = permissionState === 'granted' ? 'Allowed' : permissionState === 'denied' ? 'Blocked' : permissionState === 'prompt' ? 'Not requested' : 'Unknown';
  const PermIcon = permissionState === 'granted' ? CheckCircle : permissionState === 'denied' ? XCircle : Crosshair;

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-20">
      <div className="bg-[#1A1A2E] px-4 py-3 flex items-center gap-3 border-b border-[#8888AA]/20 sticky top-0 z-10">
        <button
          onClick={() => navigate('/settings')}
          className="w-10 h-10 rounded-full bg-[#2A2A3E] flex items-center justify-center hover:bg-[#333344] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#F0F0F0]" />
        </button>
        <span className="font-semibold text-[#F0F0F0]">Location Services</span>
      </div>

      <div className="p-4 space-y-6">
        {/* Permission Status */}
        <div className="bg-[#1A1A2E] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${permColor}20` }}>
              <PermIcon className="w-6 h-6" style={{ color: permColor }} />
            </div>
            <div>
              <p className="font-semibold text-[#F0F0F0]">GPS Permission</p>
              <p className="text-sm" style={{ color: permColor }}>{permText}</p>
            </div>
          </div>

          {permissionState === 'denied' && (
            <p className="text-sm text-[#8888AA]">
              Location access is blocked. Open your browser or device settings to allow location for this site.
            </p>
          )}
        </div>

        {/* Current Location */}
        <div>
          <h2 className="text-sm font-semibold text-[#8888AA] mb-3 px-2">CURRENT LOCATION</h2>
          <div className="bg-[#1A1A2E] rounded-2xl p-5">
            {currentLocation ? (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-[#06D6A0]" />
                  <p className="text-sm text-[#06D6A0] font-medium">Location acquired</p>
                </div>
                <div className="bg-[#0D0D0D] rounded-xl p-3 font-mono text-sm text-[#8888AA]">
                  <p>Lat: {currentLocation.lat.toFixed(6)}</p>
                  <p>Lng: {currentLocation.lng.toFixed(6)}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-[#8888AA]" />
                <p className="text-sm text-[#8888AA]">No location data available</p>
              </div>
            )}

            <button
              onClick={refreshLocation}
              disabled={locating}
              className="w-full bg-[#023E8A] hover:bg-[#012f6b] disabled:opacity-50 text-white px-5 py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors active:scale-95"
            >
              {locating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Locating...</>
              ) : (
                <><RefreshCw className="w-4 h-4" /> Refresh Location</>
              )}
            </button>
          </div>
        </div>

        {/* Cache Management */}
        <div>
          <h2 className="text-sm font-semibold text-[#8888AA] mb-3 px-2">CACHED DATA</h2>
          <div className="bg-[#1A1A2E] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[#F0F0F0] font-medium">Cached Services</p>
                <p className="text-xs text-[#8888AA]">
                  {hasCachedServices ? 'Service data is cached for faster loading' : 'No cached service data'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${hasCachedServices ? 'bg-[#06D6A0]' : 'bg-[#8888AA]/30'}`} />
            </div>

            <button
              onClick={clearCachedData}
              disabled={!hasCachedServices && !currentLocation}
              className="w-full border-2 border-[#D62828]/30 text-[#D62828] hover:bg-[#D62828]/10 disabled:opacity-30 disabled:cursor-not-allowed px-5 py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Cached Data
            </button>
            <p className="text-xs text-[#8888AA] text-center mt-2">
              This will clear saved location and service data. The app will re-fetch everything on next use.
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
