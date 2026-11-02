import React from 'react';

interface BdcLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  className?: string;
}

export const BdcLogo: React.FC<BdcLogoProps> = ({
  size = 'md',
  showWordmark = true,
  className = ''
}) => {
  const badgeSizeMap = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-2xl'
  };

  const textClassMap = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon Badge */}
      <div
        className={`${badgeSizeMap[size]} bg-gradient-to-br from-[#1677FF] via-[#0A4BB8] to-[#041E56] flex items-center justify-center shadow-[0_0_15px_rgba(22,119,255,0.4)] border border-blue-400/30 shrink-0 relative overflow-hidden p-1.5`}
      >
        {/* Subtle inner highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

        {/* Vector SVG Emblem matching the reference BDC server emblem */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10"
        >
          {/* Stylized 'B' Backbone */}
          <path
            d="M16 18L32 18L44 32L36 48L46 64L32 82L16 82L24 50L16 18Z"
            fill="white"
          />
          <path
            d="M24 30L30 30L34 38L28 44L24 44L24 30Z"
            fill="#0A4BB8"
          />
          <path
            d="M25 54L33 54L38 64L31 72L23 72L25 54Z"
            fill="#0A4BB8"
          />

          {/* Central Server Rack Grid with Cyan LEDs */}
          <rect x="42" y="30" width="18" height="6" rx="2" fill="white" />
          <circle cx="56" cy="33" r="1.5" fill="#00E5FF" />

          <rect x="42" y="44" width="18" height="6" rx="2" fill="white" />
          <circle cx="56" cy="47" r="1.5" fill="#00E5FF" />

          <rect x="42" y="58" width="18" height="6" rx="2" fill="white" />
          <circle cx="56" cy="61" r="1.5" fill="#00E5FF" />

          {/* Stylized 'D' & 'C' Outer Curve */}
          <path
            d="M60 22C74 22 84 32 84 48C84 64 74 76 60 76L60 66C70 66 74 58 74 48C74 38 70 32 60 32L60 22Z"
            fill="url(#bdc_cyan_grad)"
          />

          <defs>
            <linearGradient id="bdc_cyan_grad" x1="60" y1="22" x2="84" y2="76" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00E5FF" />
              <stop offset="1" stopColor="#1677FF" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className={`font-bold tracking-tight leading-none ${textClassMap[size]}`}>
          <span className="text-white">BHARAT</span>
          <span className="bg-gradient-to-r from-[#00E5FF] to-[#1677FF] bg-clip-text text-transparent ml-0.5">
            DC
          </span>
        </div>
      )}
    </div>
  );
};
