import { useNavigate } from 'react-router';
import { ArrowLeft, Shield, Globe, MapPin, Database, Code } from 'lucide-react';
import { BottomNav } from '../components/bottom-nav';

const APP_VERSION = '1.0.0';

const DATA_SOURCES = [
  {
    name: 'OpenStreetMap',
    description: 'Map data and emergency service locations',
    icon: Globe,
    url: 'https://www.openstreetmap.org',
  },
  {
    name: 'Overpass API',
    description: 'Real-time querying of nearby services',
    icon: Database,
    url: 'https://overpass-api.de',
  },
  {
    name: 'OSRM',
    description: 'Route calculation and navigation',
    icon: MapPin,
    url: 'https://project-osrm.org',
  },
  {
    name: 'ESRI World Imagery',
    description: 'Satellite map tiles',
    icon: Globe,
    url: 'https://www.esri.com',
  },
];

export function SettingsAppInfoScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFBFC] pb-20">
      <div className="bg-[#FFFFFF] px-4 py-3 flex items-center gap-3 border-b border-[#E5E7EB] sticky top-0 z-10">
        <button
          onClick={() => navigate('/settings')}
          className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#111827]" />
        </button>
        <span className="font-semibold text-[#111827]">App Info</span>
      </div>

      <div className="p-4 space-y-6">
        {/* App Identity */}
        <div className="text-center pt-4 pb-2">
          <div className="w-20 h-20 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#111827]">RoadSoS</h2>
          <p className="text-[#6B7280] text-sm mt-1">Version {APP_VERSION}</p>
        </div>

        {/* Description */}
        <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E5E7EB]">
          <p className="text-[#111827] leading-relaxed text-sm">
            RoadSoS is an emergency services locator designed for road accident victims and anyone in need of immediate help. The app works offline, requires no sign-up, and uses your GPS to find the nearest hospitals, police stations, ambulances, and roadside assistance.
          </p>
        </div>

        {/* Features */}
        <div>
          <h2 className="text-sm font-semibold text-[#6B7280] mb-3 px-2">KEY FEATURES</h2>
          <div className="bg-[#FFFFFF] rounded-2xl p-5 space-y-3 border border-[#E5E7EB]">
            {[
              'Real-time nearby emergency service discovery',
              'Works offline with cached data',
              'One-tap emergency calling',
              'Live vehicle tracking simulation',
              'First aid guides for common injuries',
              'AI-powered emergency assistant',
              'No account or sign-up required',
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                <p className="text-sm text-[#111827]">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Data Sources */}
        <div>
          <h2 className="text-sm font-semibold text-[#6B7280] mb-3 px-2">DATA SOURCES</h2>
          <div className="bg-[#FFFFFF] rounded-2xl overflow-hidden border border-[#E5E7EB]">
            {DATA_SOURCES.map((source, i) => {
              const Icon = source.icon;
              return (
                <a
                  key={source.name}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-4 flex items-center gap-3 hover:bg-[#F9FAFB] transition-colors block ${
                    i !== DATA_SOURCES.length - 1 ? 'border-b border-[#E5E7EB]' : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-[#06B6D4]/10 rounded-full flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#06B6D4]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[#111827] font-medium text-sm">{source.name}</p>
                    <p className="text-xs text-[#6B7280]">{source.description}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Technical */}
        <div>
          <h2 className="text-sm font-semibold text-[#6B7280] mb-3 px-2">TECHNICAL</h2>
          <div className="bg-[#FFFFFF] rounded-2xl p-5 space-y-3 border border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B7280]">Platform</span>
              <span className="text-sm text-[#111827]">Progressive Web App</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B7280]">Framework</span>
              <span className="text-sm text-[#111827]">React + Vite</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B7280]">Maps</span>
              <span className="text-sm text-[#111827]">Leaflet + CartoDB Tiles</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B7280]">Offline</span>
              <span className="text-sm text-[#111827]">Workbox Service Worker</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-1 text-[#6B7280] text-xs">
            <Code className="w-3 h-3" />
            <span>Built with care for emergencies</span>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
