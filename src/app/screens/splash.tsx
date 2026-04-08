import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router';

const VISITED_KEY = 'roadsos_visited';

export function SplashScreen() {
  const navigate = useNavigate();

  // Returning users skip splash entirely — go straight to home
  useEffect(() => {
    if (localStorage.getItem(VISITED_KEY)) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  const handleStart = () => {
    localStorage.setItem(VISITED_KEY, '1');
    // Request location permission then proceed
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => navigate('/home', { replace: true }),
        () => navigate('/home', { replace: true }),
        { timeout: 5000 },
      );
    } else {
      navigate('/home', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background pulse rings */}
      <motion.div
        className="absolute w-64 h-64 rounded-full border-2 border-[#D62828]"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.5, 0, 0.5]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.div
        className="absolute w-64 h-64 rounded-full border-2 border-[#D62828]"
        animate={{
          scale: [1, 2.5, 1],
          opacity: [0.3, 0, 0.3]
        }}
        transition={{
          duration: 3,
          delay: 0.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center z-10"
      >
        {/* Logo */}
        <motion.div
          className="w-28 h-28 bg-gradient-to-br from-[#D62828] to-[#A01F1F] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl relative"
          animate={{
            boxShadow: [
              '0 0 40px rgba(214, 40, 40, 0.3)',
              '0 0 60px rgba(214, 40, 40, 0.5)',
              '0 0 40px rgba(214, 40, 40, 0.3)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Shield className="w-14 h-14 text-white" strokeWidth={2.5} />
          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 112 112"
            animate={{
              pathLength: [0, 1, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.path
              d="M 20 56 Q 35 40, 56 56 T 92 56"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </motion.svg>
        </motion.div>

        {/* App Name */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-bold text-[#F0F0F0] mb-3"
        >
          RoadSoS
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-[#06D6A0] mb-2 font-medium"
        >
          Help is always nearby
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[#8888AA] mb-12 max-w-sm mx-auto leading-relaxed"
        >
          Locate emergency services instantly, even without internet
        </motion.p>

        {/* CTA Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="bg-[#D62828] hover:bg-[#B81F1F] text-white px-8 py-4 rounded-full font-semibold flex items-center gap-3 mx-auto shadow-2xl transition-colors"
        >
          <MapPin className="w-5 h-5" />
          Allow Location & Get Started
        </motion.button>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-4 mt-8 text-xs text-[#8888AA]"
        >
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#06D6A0]" />
            Works offline
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#06D6A0]" />
            No sign-up required
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
