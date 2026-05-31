import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Phone, MapPin, Share2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { injuries, getSeverityColor, getSeverityLabel } from '../data/first-aid';
import { BottomNav } from '../components/bottom-nav';

export function InjuryDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Acquire GPS once on mount so Share Location doesn't need to request it again
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {} // silent fail — handleShareLocation falls back to its own call
    );
  }, []);
  
  const injury = injuries.find(inj => inj.id === id);
  
  if (!injury) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6B7280]">Injury guide not found</p>
          <button
            onClick={() => navigate('/first-aid')}
            className="mt-4 text-[#4F46E5] font-semibold"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }
  
  const severityColor = getSeverityColor(injury.severity);
  const severityLabel = getSeverityLabel(injury.severity);
  
  const handleCall108 = () => {
    window.location.href = 'tel:108';
  };
  
  const handleFindHospital = () => {
    navigate('/?filter=hospital');
  };
  
  const handleShareLocation = () => {
    if (!navigator.share) {
      alert('Location sharing not available on this device');
      return;
    }

    const doShare = (lat: number, lng: number) => {
      navigator.share({
        title: 'Emergency Location',
        text: `I need help! My location: https://maps.google.com/?q=${lat},${lng}`
      }).catch(() => alert('Location sharing not available'));
    };

    if (userLocation) {
      // Use already-acquired GPS — no second permission prompt
      doShare(userLocation.lat, userLocation.lng);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => doShare(pos.coords.latitude, pos.coords.longitude),
        () => alert('Location sharing not available')
      );
    } else {
      alert('Location sharing not available on this device');
    }
  };
  
  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col">
      {/* Sticky Emergency Call Bar — keeps red as it's a critical emergency UI element */}
      <div className="sticky top-0 z-30 bg-[#DC2626] px-5 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2 text-white font-bold">
          <span className="text-lg">⚠️</span>
          <span className="tracking-wide">CALL 108 IMMEDIATELY</span>
        </div>
        <button
          onClick={handleCall108}
          className="bg-white text-[#DC2626] px-5 py-2 rounded-full font-bold text-sm hover:bg-gray-100 active:scale-95 transition-all flex items-center gap-2 shadow-md"
        >
          <Phone className="w-4 h-4" />
          Call 108
        </button>
      </div>

      {/* Back Button */}
      <div className="px-5 pt-4 pb-2">
        <button
          onClick={() => navigate('/first-aid')}
          className="w-10 h-10 bg-[#FFFFFF] rounded-full flex items-center justify-center hover:bg-[#F3F4F6] transition-colors border border-[#E5E7EB]"
        >
          <ArrowLeft className="w-5 h-5 text-[#111827]" />
        </button>
      </div>

      {/* Page Header */}
      <div className="px-5 pb-6 border-b border-[#E5E7EB]">
        <h1 className="text-3xl font-bold text-[#111827] mb-3">
          {injury.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: severityColor }}
          >
            {severityLabel}
          </div>
          {injury.traumaLevel && (
            <div className="bg-[#F3F4F6] text-[#6B7280] px-3 py-1.5 rounded-lg text-xs font-semibold">
              {injury.traumaLevel}
            </div>
          )}
        </div>
        <p className="text-sm text-[#6B7280]">
          Follow these steps while waiting for ambulance
        </p>
      </div>

      {/* Steps Section */}
      <div className="px-5 py-6 space-y-6">
        <div>
          <h2 className="text-xs font-bold text-[#6B7280] tracking-widest mb-4">
            IMMEDIATE STEPS
          </h2>
          <div className="space-y-4">
            {injury.immediateSteps.map((step) => (
              <div
                key={step.number}
                className="bg-[#FFFFFF] rounded-2xl p-5 flex gap-4 border border-[#E5E7EB]"
              >
                <div
                  className="text-4xl font-bold flex-shrink-0 leading-none"
                  style={{ color: severityColor }}
                >
                  {step.number}
                </div>
                <div className="flex-1">
                  <p className="text-[#111827] text-base leading-relaxed mb-2">
                    {step.instruction}
                  </p>
                  {step.warning && (
                    <div className="bg-[#F59E0B]/10 border-l-2 border-[#F59E0B] pl-3 py-2 mt-3">
                      <p className="text-[#F59E0B] text-sm">
                        ⚠️ {step.warning}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DO's and DON'Ts */}
        <div className="bg-[#FFFFFF] rounded-2xl overflow-hidden border border-[#E5E7EB]">
          <div className="grid grid-cols-2 divide-x divide-[#E5E7EB]">
            {/* DO's */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                <h3 className="font-bold text-[#10B981]">DO</h3>
              </div>
              <ul className="space-y-2.5">
                {injury.dos.map((item, index) => (
                  <li key={index} className="text-[#111827] text-sm flex items-start gap-2">
                    <span className="text-[#10B981] flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* DON'Ts — keeps red as it's a danger/warning indicator */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-[#DC2626]" />
                <h3 className="font-bold text-[#DC2626]">DON'T</h3>
              </div>
              <ul className="space-y-2.5">
                {injury.donts.map((item, index) => (
                  <li key={index} className="text-[#111827] text-sm flex items-start gap-2">
                    <span className="text-[#DC2626] flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Card - Fixed above nav */}
      <div className="mt-auto sticky bottom-16 px-5 pb-4">
        <div className="bg-[#FFFFFF] rounded-2xl p-4 shadow-lg border border-[#E5E7EB]">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleFindHospital}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Find Hospital
            </button>
            <button
              onClick={handleShareLocation}
              className="bg-transparent border-2 border-[#06B6D4] text-[#06B6D4] hover:bg-[#06B6D4]/10 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Location
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="pb-safe">
        <BottomNav />
      </div>
    </div>
  );
}
