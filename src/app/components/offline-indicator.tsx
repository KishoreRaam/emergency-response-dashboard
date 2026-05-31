import { Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';

export function OfflineIndicator() {
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
    <div
      className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium ${
        isOnline
          ? 'bg-[#10B981]/20 text-[#10B981]'
          : 'bg-[#DC2626]/20 text-[#DC2626]'
      }`}
    >
      {isOnline ? (
        <>
          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}
