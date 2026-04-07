import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Phone, X } from 'lucide-react';
import { emergencyNumbers } from '../data/emergency-services';

export function SosButton() {
  const [showPanel, setShowPanel] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const handleLongPressStart = () => {
    setShowPanel(true);
    setCountdown(3);
    
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          // Auto-call 112
          window.location.href = 'tel:112';
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Store interval ID to clear on cancel
    (window as any).sosInterval = interval;
  };
  
  const handleCancel = () => {
    if ((window as any).sosInterval) {
      clearInterval((window as any).sosInterval);
    }
    setCountdown(null);
    setShowPanel(false);
  };
  
  const handleQuickDial = (number: string) => {
    window.location.href = `tel:${number}`;
  };
  
  return (
    <>
      <motion.button
        onMouseDown={handleLongPressStart}
        onTouchStart={handleLongPressStart}
        className="fixed bottom-24 right-6 w-16 h-16 bg-[#D62828] rounded-full flex items-center justify-center shadow-2xl z-50 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(214, 40, 40, 0.7)',
            '0 0 0 20px rgba(214, 40, 40, 0)',
          ]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: 'loop'
        }}
      >
        <AlertTriangle className="w-8 h-8 text-white" />
        <div className="absolute -top-12 right-0 bg-[#1A1A2E] text-[#F0F0F0] px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          Hold for SOS
        </div>
      </motion.button>
      
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#D62828]/95 z-[100] flex flex-col items-center justify-center p-6"
            onClick={handleCancel}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center mb-8"
            >
              <motion.div
                className="relative w-32 h-32 mx-auto mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <svg className="w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="4"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="60"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="377"
                    strokeDashoffset={countdown ? 377 * (1 - (4 - countdown) / 3) : 377}
                    style={{ transformOrigin: 'center' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl font-bold text-white">SOS</span>
                </div>
              </motion.div>
              
              <p className="text-white text-xl font-semibold mb-2">
                Calling 112 in {countdown} seconds...
              </p>
              <p className="text-white/80 text-sm">Tap anywhere to cancel</p>
            </motion.div>
            
            <div className="w-full max-w-sm space-y-3">
              <p className="text-white/60 text-xs text-center mb-4">Quick Dial</p>
              {emergencyNumbers.slice(1).map((emergency) => (
                <button
                  key={emergency.number}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickDial(emergency.number);
                  }}
                  className="w-full bg-white text-[#D62828] px-6 py-4 rounded-full text-lg font-bold flex items-center justify-between hover:bg-white/90 transition-colors active:scale-95"
                >
                  <span>{emergency.name}</span>
                  <div className="flex items-center gap-2">
                    <span>{emergency.number}</span>
                    <Phone className="w-5 h-5" />
                  </div>
                </button>
              ))}
            </div>
            
            <button
              onClick={handleCancel}
              className="mt-8 w-14 h-14 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <p className="text-white/60 text-xs mt-6">Your location is being shared</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
