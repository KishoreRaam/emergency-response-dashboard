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
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#8888AA]">Injury guide not found</p>
          <button
            onClick={() => navigate('/first-aid')}
            className="mt-4 text-[#D62828] font-semibold"
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
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      {/* Sticky Emergency Call Bar */}
      <div className="sticky top-0 z-30 bg-[#D62828] px-5 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2 text-white font-bold">
          <span className="text-lg">⚠️</span>
          <span className="tracking-wide">CALL 108 IMMEDIATELY</span>
        </div>
        <button
          onClick={handleCall108}
          className="bg-white text-[#D62828] px-5 py-2 rounded-full font-bold text-sm hover:bg-gray-100 active:scale-95 transition-all flex items-center gap-2 shadow-md"
        >
          <Phone className="w-4 h-4" />
          Call 108
        </button>
      </div>
      
      {/* Back Button */}
      <div className="px-5 pt-4 pb-2">
        <button
          onClick={() => navigate('/first-aid')}
          className="w-10 h-10 bg-[#1A1A2E] rounded-full flex items-center justify-center hover:bg-[#252538] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#F0F0F0]" />
        </button>
      </div>
      
      {/* Page Header */}
      <div className="px-5 pb-6 border-b border-[#8888AA]/10">
        <h1 className="text-3xl font-bold text-[#F0F0F0] mb-3">
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
            <div className="bg-[#1A1A2E] text-[#8888AA] px-3 py-1.5 rounded-lg text-xs font-semibold">
              {injury.traumaLevel}
            </div>
          )}
        </div>
        <p className="text-sm text-[#8888AA]">
          Follow these steps while waiting for ambulance
        </p>
      </div>
      
      {/* Steps Section */}
      <div className="px-5 py-6 space-y-6">
        <div>
          <h2 className="text-xs font-bold text-[#8888AA] tracking-widest mb-4">
            IMMEDIATE STEPS
          </h2>
          <div className="space-y-4">
            {injury.immediateSteps.map((step) => (
              <div
                key={step.number}
                className="bg-[#1A1A2E] rounded-2xl p-5 flex gap-4"
              >
                <div
                  className="text-4xl font-bold flex-shrink-0 leading-none"
                  style={{ color: severityColor }}
                >
                  {step.number}
                </div>
                <div className="flex-1">
                  <p className="text-[#F0F0F0] text-base leading-relaxed mb-2">
                    {step.instruction}
                  </p>
                  {step.warning && (
                    <div className="bg-[#FFB703]/10 border-l-2 border-[#FFB703] pl-3 py-2 mt-3">
                      <p className="text-[#FFB703] text-sm">
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
        <div className="bg-[#1A1A2E] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-[#8888AA]/10">
            {/* DO's */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-[#06D6A0]" />
                <h3 className="font-bold text-[#06D6A0]">DO</h3>
              </div>
              <ul className="space-y-2.5">
                {injury.dos.map((item, index) => (
                  <li key={index} className="text-[#F0F0F0] text-sm flex items-start gap-2">
                    <span className="text-[#06D6A0] flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* DON'Ts */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-[#D62828]" />
                <h3 className="font-bold text-[#D62828]">DON'T</h3>
              </div>
              <ul className="space-y-2.5">
                {injury.donts.map((item, index) => (
                  <li key={index} className="text-[#F0F0F0] text-sm flex items-start gap-2">
                    <span className="text-[#D62828] flex-shrink-0">•</span>
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
        <div className="bg-[#1A1A2E] rounded-2xl p-4 shadow-2xl border border-[#8888AA]/10">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleFindHospital}
              className="bg-[#D62828] hover:bg-[#B81F1F] text-white px-4 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Find Hospital
            </button>
            <button
              onClick={handleShareLocation}
              className="bg-transparent border-2 border-[#023E8A] text-[#023E8A] hover:bg-[#023E8A]/10 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
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
