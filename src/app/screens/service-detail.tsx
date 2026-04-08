import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Phone, Navigation, Clock, MapPin, Shield, CheckCircle, ArrowLeft, Bed, Building2, Share2, Flag, Locate, Ambulance } from 'lucide-react';
import { emergencyServices, type EmergencyService } from '../data/emergency-services';
import { BottomNav } from '../components/bottom-nav';
import { buildNavigationUrl, etaMinutes } from '../utils/distance';

export function ServiceDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Try route state first (live OSM services), then static data
  const stateService = (location.state as any)?.service as EmergencyService | undefined;
  const stateUserLocation = (location.state as any)?.userLocation as { lat: number; lng: number } | undefined;
  const service = stateService ?? emergencyServices.find(s => s.id === id) ?? null;

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(stateUserLocation ?? null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (userLocation) return; // Already have it from route state
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 3000, enableHighAccuracy: true },
    );
  }, [userLocation]);

  if (!service) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#8888AA] mb-4">Service not found</p>
          <button
            onClick={() => navigate('/home')}
            className="bg-[#D62828] text-white px-6 py-2 rounded-full"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleCall = () => {
    window.location.href = `tel:${service.phone}`;
  };

  const handleNavigate = () => {
    if (!isOnline) return;
    window.open(
      buildNavigationUrl(service.location.lat, service.location.lng, service.name),
      '_blank'
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: service.name,
          text: `${service.name} - ${service.distance}km away`,
          url: window.location.href
        });
      } catch {
        // Share cancelled
      }
    }
  };

  const eta = etaMinutes(service.distance);

  const TYPE_COLOR: Record<string, string> = {
    hospital: '#D62828',
    ambulance: '#D62828',
    police: '#023E8A',
    towing: '#6B5B00',
    puncture: '#8888AA',
  };
  const color = TYPE_COLOR[service.type] ?? '#8888AA';

  const TYPE_LABEL: Record<string, string> = {
    hospital: 'Hospital',
    ambulance: 'Ambulance',
    police: 'Police',
    towing: 'Tow Service',
    puncture: 'Mechanic',
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-20">
      {/* Header */}
      <div className="bg-[#1A1A2E] px-4 py-3 flex items-center gap-3 border-b border-[#8888AA]/20 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-[#2A2A3E] flex items-center justify-center hover:bg-[#333344] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#F0F0F0]" />
        </button>
        <span className="font-semibold text-[#F0F0F0]">Service Details</span>
      </div>

      <div className="p-4 space-y-6">
        {/* Service Header */}
        <div>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-white"
                  style={{ backgroundColor: color }}
                >
                  {TYPE_LABEL[service.type]?.toUpperCase()}
                </span>
                {service.verified && (
                  <div className="flex items-center gap-1 bg-[#06D6A0]/20 text-[#06D6A0] px-2 py-0.5 rounded-full text-[10px] font-medium">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </div>
                )}
              </div>
              <h1 className="text-2xl font-bold text-[#F0F0F0]">{service.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-4">
            {service.traumaLevel && (
              <span className="px-3 py-1.5 rounded-full bg-[#D62828] text-white text-sm font-semibold">
                Trauma Level {service.traumaLevel}
              </span>
            )}
            {service.available24x7 && (
              <span className="px-3 py-1.5 rounded-full bg-[#8888AA]/20 text-[#8888AA] text-sm font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                24/7
              </span>
            )}
          </div>

          {service.distance > 0 && (
            <div className="flex items-center gap-2 text-[#8888AA] mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{service.distance} km away · ~{eta} min</span>
            </div>
          )}

          {service.address ? (
            <p className="text-[#8888AA] text-sm">{service.address}</p>
          ) : (
            <p className="text-[#8888AA]/50 text-sm italic">Address not available</p>
          )}
        </div>

        {/* Quick Stats — hospitals */}
        {service.type === 'hospital' && (
          <div className="bg-[#1A1A2E] rounded-2xl p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#D62828]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Bed className="w-6 h-6 text-[#D62828]" />
                </div>
                <p className="text-xs text-[#8888AA] mb-1">Beds</p>
                <p className="font-semibold text-[#F0F0F0]">{service.beds ?? '—'}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#D62828]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Building2 className="w-6 h-6 text-[#D62828]" />
                </div>
                <p className="text-xs text-[#8888AA] mb-1">Emergency</p>
                <p className="font-semibold text-[#F0F0F0]">Active</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#06D6A0]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-[#06D6A0]" />
                </div>
                <p className="text-xs text-[#8888AA] mb-1">Available</p>
                <p className="font-semibold text-[#F0F0F0]">{service.available24x7 ? '24/7' : 'Limited'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="bg-[#1A1A2E] rounded-2xl p-4">
          <h3 className="font-semibold text-[#F0F0F0] mb-3 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Contact
          </h3>
          <p className="text-[#8888AA] text-sm mb-4">{service.phone}</p>
          <button
            onClick={handleCall}
            className="w-full bg-[#D62828] hover:bg-[#B81F1F] text-white px-6 py-4 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors active:scale-95 text-lg"
          >
            <Phone className="w-5 h-5" />
            Call Now
          </button>
        </div>

        {/* Call Ambulance — for hospitals/police (request an ambulance to this location) */}
        {(service.type === 'hospital' || service.type === 'police') && (
          <div className="bg-[#1A1A2E] rounded-2xl p-4">
            <h3 className="font-semibold text-[#F0F0F0] mb-3 flex items-center gap-2">
              <Ambulance className="w-4 h-4 text-[#D62828]" />
              Need an Ambulance?
            </h3>
            <p className="text-[#8888AA] text-sm mb-4">
              Call 108 for a free government ambulance to your location.
            </p>
            <a
              href="tel:108"
              className="w-full bg-[#D62828]/10 border border-[#D62828]/30 text-[#D62828] px-6 py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors active:scale-95"
            >
              <Phone className="w-4 h-4" />
              Dial 108 — Ambulance
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleNavigate}
            disabled={!isOnline}
            className="w-full border-2 border-[#023E8A] text-[#023E8A] hover:bg-[#023E8A]/10 disabled:border-[#8888AA]/30 disabled:text-[#8888AA] disabled:cursor-not-allowed px-6 py-4 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <Navigation className="w-5 h-5" />
            {isOnline ? 'Open in Maps' : 'Maps unavailable offline'}
          </button>

          {service.distance > 0 && (
            <button
              onClick={() => navigate(`/tracking/${service.id}`, { state: { userLocation, liveServices: [service] } })}
              className="w-full border-2 border-[#FFB703] text-[#FFB703] hover:bg-[#FFB703]/10 px-6 py-4 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors active:scale-95"
            >
              <Locate className="w-5 h-5" />
              Track Vehicle
            </button>
          )}

          <button
            onClick={handleShare}
            className="w-full border-2 border-[#8888AA]/30 text-[#F0F0F0] hover:bg-[#8888AA]/10 px-6 py-4 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <Share2 className="w-5 h-5" />
            Share Location
          </button>
        </div>

        {/* Report */}
        <button className="w-full text-[#8888AA] text-sm hover:text-[#F0F0F0] transition-colors flex items-center justify-center gap-2 py-2">
          <Flag className="w-4 h-4" />
          Report outdated info
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
