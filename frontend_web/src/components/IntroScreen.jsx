import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scissors } from 'lucide-react';

const IntroScreen = ({ onComplete }) => {
  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0B0B0B] text-white overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(193,157,108,0.15)_0%,_rgba(0,0,0,0)_70%)] animate-pulse"></div>

      {/* Icon Animation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 mb-8"
      >
        <div className="p-8 rounded-full border border-[#C19D6C]/30 shadow-[0_0_30px_rgba(193,157,108,0.2)] bg-[#1A1A1A]">
          <Scissors size={64} className="text-[#C19D6C]" />
        </div>
      </motion.div>

      {/* Brand Name */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative z-10 text-5xl md:text-7xl font-sans font-bold tracking-tight text-white mb-4"
      >
        Hair Ways<span className="text-[#C19D6C] ">.</span>
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="relative z-10 text-xs md:text-sm uppercase tracking-[0.3em] text-gray-400 font-medium"
      >
        Premium Grooming & Style
      </motion.p>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-[#C19D6C]" style={{ width: '100%', animation: 'progress 2.5s linear forwards' }}></div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default IntroScreen;