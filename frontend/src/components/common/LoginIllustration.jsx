import React from 'react';

export const LoginIllustration = () => {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl" />

      {/* Main SVG Composition */}
      <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10 drop-shadow-xl">
        {/* Soft Background Circle */}
        <circle cx="200" cy="200" r="160" fill="#F1F5F9" />
        <circle cx="200" cy="200" r="130" fill="#E2E8F0" opacity="0.5" />

        {/* Shield Concept */}
        <path
          d="M200 60C250 60 300 75 300 75V190C300 260 200 320 200 320C200 320 100 260 100 190V75C100 75 150 60 200 60Z"
          fill="url(#shieldGrad)"
          stroke="#1E40AF"
          strokeWidth="3"
        />

        {/* Package / Box inside Shield */}
        <g transform="translate(140, 140)">
          {/* Main Box Top */}
          <path d="M60 10L110 35L60 60L10 35L60 10Z" fill="#60A5FA" />
          {/* Main Box Left */}
          <path d="M10 35L60 60V110L10 85V35Z" fill="#2563EB" />
          {/* Main Box Right */}
          <path d="M60 60L110 35V85L60 110V60Z" fill="#1D4ED8" />
          {/* Tape line */}
          <path d="M40 20L80 40L60 50L20 30L40 20Z" fill="#93C5FD" opacity="0.8" />
        </g>

        {/* Clock / Deadline Overlay Circle */}
        <g transform="translate(240, 220)" className="drop-shadow-lg">
          <circle cx="45" cy="45" r="40" fill="#FFFFFF" stroke="#DC2626" strokeWidth="4" />
          {/* Clock face */}
          <circle cx="45" cy="45" r="3" fill="#0F172A" />
          {/* Clock hands showing 2 days / urgent time */}
          <path d="M45 45V22" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M45 45L62 45" stroke="#DC2626" strokeWidth="3.5" strokeLinecap="round" />
          {/* Alert Exclamation */}
          <circle cx="70" cy="20" r="10" fill="#DC2626" />
          <text x="70" y="24" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">!</text>
        </g>

        {/* Circular Return Arrow around the Box */}
        <path
          d="M130 250 A 75 75 0 0 1 250 140"
          stroke="#10B981"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="8 6"
        />
        <polygon points="255,135 265,150 245,150" fill="#10B981" />

        {/* Gradients */}
        <defs>
          <linearGradient id="shieldGrad" x1="100" y1="60" x2="300" y2="320" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EFF6FF" />
            <stop offset="1" stopColor="#DBEAFE" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default LoginIllustration;
