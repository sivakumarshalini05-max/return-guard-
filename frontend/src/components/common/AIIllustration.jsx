import React from 'react';

export const AIIllustration = () => {
  return (
    <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
      <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl" />
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10 drop-shadow-md">
        {/* Soft Background Circle */}
        <circle cx="100" cy="100" r="80" fill="#F1F5F9" />

        {/* Shield outline */}
        <path
          d="M100 30C125 30 150 38 150 38V95C150 130 100 160 100 160C100 160 50 130 50 95V38C50 38 75 30 100 30Z"
          fill="#EEF2FF"
          stroke="#4F46E5"
          strokeWidth="2.5"
        />

        {/* AI Sparkles */}
        <path d="M100 50L103 62L115 65L103 68L100 80L97 68L85 65L97 62L100 50Z" fill="#6366F1" />
        <path d="M135 70L137 77L144 79L137 81L135 88L133 81L126 79L133 77L135 70Z" fill="#818CF8" />

        {/* Package inside */}
        <rect x="75" y="90" width="50" height="40" rx="4" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
        <path d="M75 102H125" stroke="#93C5FD" strokeWidth="2" />
        <path d="M100 90V130" stroke="#93C5FD" strokeWidth="2" />

        {/* Circular Return Arrow */}
        <path
          d="M60 120 A 45 45 0 0 1 140 120"
          stroke="#10B981"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="4 3"
        />
        <polygon points="144,115 150,125 138,125" fill="#10B981" />
      </svg>
    </div>
  );
};

export default AIIllustration;
