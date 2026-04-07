import { useState, useEffect } from 'react';
import { ChevronRight, Bell, MapPin, Wifi, Info, Shield, Phone } from 'lucide-react';
import { BottomNav } from '../components/bottom-nav';
import { emergencyNumbers } from '../data/emergency-services';

export function SettingsScreen() {
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
    <div className="min-h-screen bg-[#0D0D0D] pb-20">
      {/* Header */}
      <div className="bg-[#1A1A2E] px-4 py-4 border-b border-[#8888AA]/20">
        <h1 className="font-bold text-[#F0F0F0] text-lg">Settings</h1>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Emergency Numbers */}
        <div>
          <h2 className="text-sm font-semibold text-[#8888AA] mb-3 px-2">EMERGENCY NUMBERS</h2>
          <div className="bg-[#1A1A2E] rounded-2xl overflow-hidden">
            {emergencyNumbers.map((emergency, index) => (
              <button
                key={emergency.number}
                onClick={() => window.location.href = `tel:${emergency.number}`}
                className={`w-full px-4 py-4 flex items-center justify-between hover:bg-[#222233] transition-colors ${
                  index !== emergencyNumbers.length - 1 ? 'border-b border-[#8888AA]/10' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#D62828]/20 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[#D62828]" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-[#F0F0F0]">{emergency.name}</p>
                    <p className="text-xs text-[#8888AA]">{emergency.description}</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#D62828]">{emergency.number}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Settings */}
        <div>
          <h2 className="text-sm font-semibold text-[#8888AA] mb-3 px-2">PREFERENCES</h2>
          <div className="bg-[#1A1A2E] rounded-2xl overflow-hidden">
            <button className="w-full px-4 py-4 flex items-center justify-between border-b border-[#8888AA]/10 hover:bg-[#222233] transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#8888AA]" />
                <span className="text-[#F0F0F0]">Notifications</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#8888AA]" />
            </button>
            
            <button className="w-full px-4 py-4 flex items-center justify-between border-b border-[#8888AA]/10 hover:bg-[#222233] transition-colors">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#8888AA]" />
                <span className="text-[#F0F0F0]">Location Services</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#8888AA]" />
            </button>
            
            <div className="w-full px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wifi className={`w-5 h-5 ${isOnline ? 'text-[#8888AA]' : 'text-[#FFB703]'}`} />
                <span className="text-[#F0F0F0]">Offline Mode</span>
              </div>
              <span className={`text-sm font-medium ${isOnline ? 'text-[#06D6A0]' : 'text-[#FFB703]'}`}>
                {isOnline ? 'Online' : 'Offline Mode Active'}
              </span>
            </div>
          </div>
        </div>
        
        {/* About */}
        <div>
          <h2 className="text-sm font-semibold text-[#8888AA] mb-3 px-2">ABOUT</h2>
          <div className="bg-[#1A1A2E] rounded-2xl overflow-hidden">
            <button className="w-full px-4 py-4 flex items-center justify-between border-b border-[#8888AA]/10 hover:bg-[#222233] transition-colors">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-[#8888AA]" />
                <span className="text-[#F0F0F0]">App Info</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#8888AA]" />
            </button>
            
            <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-[#222233] transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#8888AA]" />
                <span className="text-[#F0F0F0]">Privacy Policy</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#8888AA]" />
            </button>
          </div>
        </div>
        
        {/* App Info */}
        <div className="text-center space-y-2 pt-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#D62828] to-[#A01F1F] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-[#F0F0F0]">RoadSoS</h3>
          <p className="text-sm text-[#8888AA]">Version 1.0.0</p>
          <p className="text-xs text-[#8888AA] max-w-xs mx-auto leading-relaxed">
            Emergency services locator for road accident victims. Help is always nearby.
          </p>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}