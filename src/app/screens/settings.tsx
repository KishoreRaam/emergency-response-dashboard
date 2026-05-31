import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, Bell, MapPin, Wifi, Info, Shield, Phone } from 'lucide-react';
import { BottomNav } from '../components/bottom-nav';
import { emergencyNumbers } from '../data/emergency-services';

export function SettingsScreen() {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  return (
    <div className="min-h-screen bg-[#FAFBFC] pb-20">
      {/* Header */}
      <div className="bg-[#FFFFFF] px-4 py-4 border-b border-[#E5E7EB]">
        <h1 className="font-bold text-[#111827] text-lg">Settings</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Emergency Numbers — keeps red as these are emergency hotline markers */}
        <div>
          <h2 className="text-sm font-semibold text-[#6B7280] mb-3 px-2">EMERGENCY NUMBERS</h2>
          <div className="bg-[#FFFFFF] rounded-2xl overflow-hidden border border-[#E5E7EB]">
            {emergencyNumbers.map((emergency, index) => (
              <a
                key={emergency.number}
                href={`tel:${emergency.number}`}
                className={`w-full px-4 py-4 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors active:scale-[0.98] block ${
                  index !== emergencyNumbers.length - 1 ? 'border-b border-[#E5E7EB]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#DC2626]/10 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[#DC2626]" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-[#111827]">{emergency.name}</p>
                    <p className="text-xs text-[#6B7280]">{emergency.description}</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#DC2626]">{emergency.number}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h2 className="text-sm font-semibold text-[#6B7280] mb-3 px-2">PREFERENCES</h2>
          <div className="bg-[#FFFFFF] rounded-2xl overflow-hidden border border-[#E5E7EB]">
            <button
              onClick={() => navigate('/settings/notifications')}
              className="w-full px-4 py-4 flex items-center justify-between border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#6B7280]" />
                <span className="text-[#111827]">Notifications</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#6B7280]" />
            </button>

            <button
              onClick={() => navigate('/settings/location')}
              className="w-full px-4 py-4 flex items-center justify-between border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#6B7280]" />
                <span className="text-[#111827]">Location Services</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#6B7280]" />
            </button>

            <div className="w-full px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wifi className={`w-5 h-5 ${isOnline ? 'text-[#6B7280]' : 'text-[#F59E0B]'}`} />
                <span className="text-[#111827]">Offline Mode</span>
              </div>
              <span className={`text-sm font-medium ${isOnline ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* About */}
        <div>
          <h2 className="text-sm font-semibold text-[#6B7280] mb-3 px-2">ABOUT</h2>
          <div className="bg-[#FFFFFF] rounded-2xl overflow-hidden border border-[#E5E7EB]">
            <button
              onClick={() => navigate('/settings/app-info')}
              className="w-full px-4 py-4 flex items-center justify-between border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-[#6B7280]" />
                <span className="text-[#111827]">App Info</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#6B7280]" />
            </button>

            <button
              onClick={() => navigate('/settings/privacy')}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#6B7280]" />
                <span className="text-[#111827]">Privacy Policy</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#6B7280]" />
            </button>
          </div>
        </div>

        {/* App badge */}
        <div className="text-center space-y-2 pt-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-[#111827]">RoadSoS</h3>
          <p className="text-sm text-[#6B7280]">Version 1.0.0</p>
          <p className="text-xs text-[#6B7280] max-w-xs mx-auto leading-relaxed">
            Emergency services locator for road accident victims. Help is always nearby.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
