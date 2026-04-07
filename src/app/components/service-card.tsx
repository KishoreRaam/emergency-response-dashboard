import { Phone, Navigation, Building2, Shield, Ambulance, Truck, Wrench } from 'lucide-react';
import type { EmergencyService } from '../data/emergency-services';
import { buildNavigationUrl } from '../utils/distance';

interface ServiceCardProps {
  service: EmergencyService;
  onClick?: () => void;
  isOffline?: boolean;
}

const typeConfig = {
  hospital: { color: '#D62828', icon: Building2 },
  police: { color: '#023E8A', icon: Shield },
  ambulance: { color: '#FFB703', icon: Ambulance },
  towing: { color: '#FF6B35', icon: Truck },
  puncture: { color: '#8888AA', icon: Wrench }
};

export function ServiceCard({ service, onClick, isOffline }: ServiceCardProps) {
  const config = typeConfig[service.type];
  const Icon = config.icon;
  
  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${service.phone}`;
  };
  
  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOffline) {
      window.open(
        buildNavigationUrl(service.location.lat, service.location.lng, service.name),
        '_blank'
      );
    }
  };
  
  return (
    <div
      onClick={onClick}
      className="bg-[#1A1A2E] rounded-2xl p-5 border-l-4 cursor-pointer hover:bg-[#222233] transition-all active:scale-[0.98]"
      style={{ borderLeftColor: config.color }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color: config.color }} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold text-[#F0F0F0] text-base leading-tight">{service.name}</h3>
            <span className="text-sm font-medium text-[#8888AA] whitespace-nowrap">
              {service.distance} km
            </span>
          </div>
          
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {service.traumaLevel && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#D62828] text-white">
                Trauma Level {service.traumaLevel}
              </span>
            )}
            {service.verified && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#06D6A0]/20 text-[#06D6A0]">
                Verified
              </span>
            )}
            {service.available24x7 && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#8888AA]/20 text-[#8888AA]">
                24/7
              </span>
            )}
            {isOffline && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#8888AA]/20 text-[#8888AA]">
                Cached
              </span>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleCall}
              className="flex-1 bg-[#D62828] hover:bg-[#B81F1F] text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-colors active:scale-95"
            >
              <Phone className="w-4 h-4" />
              Call
            </button>
            <button
              onClick={handleNavigate}
              className="flex-1 border border-[#023E8A] text-[#023E8A] hover:bg-[#023E8A]/10 px-5 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-colors active:scale-95"
              disabled={isOffline}
            >
              <Navigation className="w-4 h-4" />
              Navigate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}