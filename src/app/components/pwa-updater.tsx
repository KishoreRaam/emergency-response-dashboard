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
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-4 shadow-2xl max-w-md mx-auto flex items-center justify-between gap-3">
        <p className="text-sm text-[#111827]">
          A new version is available
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowUpdate(false)}
            className="text-xs text-[#6B7280] hover:text-[#111827] px-3 py-2 rounded-full transition-colors"
          >
            Later
          </button>
          <button
            onClick={() => updateSW?.(true)}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors active:scale-95"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
