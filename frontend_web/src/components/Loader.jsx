import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B0B0B]">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Spinner with Gold Accent */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-[#1A1A1A] rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-[#C19D6C] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-white tracking-widest uppercase">
            Hair Ways
          </h2>
          <p className="text-[10px] text-[#C19D6C] font-bold uppercase tracking-[0.3em] mt-2 animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loader;
