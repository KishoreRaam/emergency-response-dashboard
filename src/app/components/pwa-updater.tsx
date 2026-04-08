import { useState, useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';

export function PwaUpdater() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateSW, setUpdateSW] = useState<((reloadPage?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    const update = registerSW({
      onNeedRefresh() {
        setShowUpdate(true);
      },
      onOfflineReady() {
        // silently ready — no toast needed
      },
    });
    setUpdateSW(() => update);
  }, []);

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[9999] animate-slide-down">
      <div className="bg-[#1A1A2E] border border-[#8888AA]/20 rounded-2xl p-4 shadow-2xl max-w-md mx-auto flex items-center justify-between gap-3">
        <p className="text-sm text-[#F0F0F0]">
          A new version is available
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowUpdate(false)}
            className="text-xs text-[#8888AA] hover:text-[#F0F0F0] px-3 py-2 rounded-full transition-colors"
          >
            Later
          </button>
          <button
            onClick={() => updateSW?.(true)}
            className="bg-[#D62828] hover:bg-[#B81F1F] text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors active:scale-95"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
