import React from 'react';

export const Logo = ({ size = 'md', className = '' }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight text-slate-900 ${className}`}>
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20 ${iconSizes[size]}`}>
        {/* Shield outline + Circular Return Arrow + Clock Concept */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3/5 h-3/5">
          {/* Shield background curve */}
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="opacity-30 fill-white/20" />
          {/* Circular return arrow */}
          <path d="M9 14l-3-3m0 0l3-3m-3 3h8a3 3 0 013 3v1" strokeWidth="2.2" />
          {/* Clock hands small dot */}
          <circle cx="12" cy="11" r="1.5" fill="currentColor" />
        </svg>
      </div>
      <span className={`font-black tracking-tight ${textSizes[size]}`}>
        Return<span className="text-blue-600">Guard</span>
      </span>
    </div>
  );
};

export default Logo;
