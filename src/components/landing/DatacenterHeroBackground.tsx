import React from 'react';

export const DatacenterHeroBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Base deep navy / near black background */}
      <div className="absolute inset-0 bg-[#020817]" />

      {/* Central atmospheric blue radial glow behind BHARATDC */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 50% 46%, rgba(22, 119, 255, 0.26) 0%, rgba(6, 20, 38, 0.6) 45%, rgba(2, 8, 23, 0.95) 80%, #020817 100%)'
        }}
      />

      {/* High-fidelity Vector Perspective Server Room */}
      <svg
        className="absolute inset-0 w-full h-full object-cover"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients for Server Racks */}
          <linearGradient id="rack_body_left" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#040c1c" />
            <stop offset="70%" stopColor="#071933" />
            <stop offset="100%" stopColor="#0a254a" />
          </linearGradient>

          <linearGradient id="rack_body_right" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#040c1c" />
            <stop offset="70%" stopColor="#071933" />
            <stop offset="100%" stopColor="#0a254a" />
          </linearGradient>

          {/* Electric Blue Vertical LED Strip Gradient */}
          <linearGradient id="neon_blue_vertical" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.3" />
            <stop offset="25%" stopColor="#1677FF" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#00B4D8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0077B6" stopOpacity="0.2" />
          </linearGradient>

          {/* Ceiling Linear Glow Light */}
          <linearGradient id="ceiling_light_left" x1="0" y1="0" x2="960" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#1677FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#020817" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="ceiling_light_right" x1="1920" y1="0" x2="960" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#1677FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#020817" stopOpacity="0" />
          </linearGradient>

          {/* Floor Reflection Gradient */}
          <linearGradient id="floor_reflection" x1="0" y1="520" x2="0" y2="1080" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0a254a" stopOpacity="0.5" />
            <stop offset="35%" stopColor="#071830" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#020817" stopOpacity="0.95" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="glow_subtle" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="glow_strong" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ---------------------------------------------------- */}
        {/* 1. CEILING & OVERHEAD LINEAR LIGHT GUIDES            */}
        {/* ---------------------------------------------------- */}
        {/* Left ceiling perspective lights */}
        <line x1="280" y1="0" x2="860" y2="420" stroke="url(#ceiling_light_left)" strokeWidth="3" filter="url(#glow_subtle)" />
        <line x1="140" y1="0" x2="820" y2="420" stroke="url(#ceiling_light_left)" strokeWidth="2" strokeOpacity="0.6" />
        <line x1="420" y1="0" x2="890" y2="420" stroke="#1677FF" strokeWidth="1.5" strokeOpacity="0.4" />

        {/* Right ceiling perspective lights */}
        <line x1="1640" y1="0" x2="1060" y2="420" stroke="url(#ceiling_light_right)" strokeWidth="3" filter="url(#glow_subtle)" />
        <line x1="1780" y1="0" x2="1100" y2="420" stroke="url(#ceiling_light_right)" strokeWidth="2" strokeOpacity="0.6" />
        <line x1="1500" y1="0" x2="1030" y2="420" stroke="#1677FF" strokeWidth="1.5" strokeOpacity="0.4" />

        {/* ---------------------------------------------------- */}
        {/* 2. FLOOR PERSPECTIVE GRID & SPECULAR SHEEN          */}
        {/* ---------------------------------------------------- */}
        <polygon points="0,520 1920,520 1920,1080 0,1080" fill="url(#floor_reflection)" />

        {/* Floor center perspective lines */}
        <line x1="960" y1="520" x2="200" y2="1080" stroke="#1677FF" strokeOpacity="0.15" strokeWidth="1" />
        <line x1="960" y1="520" x2="560" y2="1080" stroke="#1677FF" strokeOpacity="0.2" strokeWidth="1" />
        <line x1="960" y1="520" x2="800" y2="1080" stroke="#1677FF" strokeOpacity="0.25" strokeWidth="1" />
        <line x1="960" y1="520" x2="960" y2="1080" stroke="#00E5FF" strokeOpacity="0.3" strokeWidth="1.5" />
        <line x1="960" y1="520" x2="1120" y2="1080" stroke="#1677FF" strokeOpacity="0.25" strokeWidth="1" />
        <line x1="960" y1="520" x2="1360" y2="1080" stroke="#1677FF" strokeOpacity="0.2" strokeWidth="1" />
        <line x1="960" y1="520" x2="1720" y2="1080" stroke="#1677FF" strokeOpacity="0.15" strokeWidth="1" />

        {/* Horizontal floor tile lines */}
        <line x1="880" y1="550" x2="1040" y2="550" stroke="#1677FF" strokeOpacity="0.15" strokeWidth="1" />
        <line x1="820" y1="590" x2="1100" y2="590" stroke="#1677FF" strokeOpacity="0.18" strokeWidth="1" />
        <line x1="720" y1="650" x2="1200" y2="650" stroke="#1677FF" strokeOpacity="0.2" strokeWidth="1" />
        <line x1="580" y1="740" x2="1340" y2="740" stroke="#1677FF" strokeOpacity="0.22" strokeWidth="1" />
        <line x1="380" y1="870" x2="1540" y2="870" stroke="#1677FF" strokeOpacity="0.25" strokeWidth="1.2" />
        <line x1="100" y1="1040" x2="1820" y2="1040" stroke="#1677FF" strokeOpacity="0.3" strokeWidth="1.5" />

        {/* ---------------------------------------------------- */}
        {/* 3. LEFT FLANKING SERVER RACKS (PERSPECTIVE 42U ROWS) */}
        {/* ---------------------------------------------------- */}
        {/* Far Left Server Rack (Rack 1 - Forefront) */}
        <g opacity="0.95">
          <polygon points="0,40 240,140 240,940 0,1040" fill="url(#rack_body_left)" />
          {/* Vertical edge neon strip */}
          <line x1="240" y1="140" x2="240" y2="940" stroke="url(#neon_blue_vertical)" strokeWidth="4" filter="url(#glow_subtle)" />
          <line x1="240" y1="140" x2="240" y2="940" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" />
          
          {/* Server unit horizontal slots & LEDs */}
          {Array.from({ length: 24 }).map((_, i) => {
            const y1 = 180 + i * 30;
            const y0 = 80 + i * 36;
            return (
              <g key={`l1-${i}`}>
                <line x1="10" y1={y0} x2="230" y2={y1} stroke="#003882" strokeWidth="1" strokeOpacity="0.6" />
                <rect x="200" y={y1 - 3} width="22" height="4" rx="1" fill={i % 3 === 0 ? '#00E5FF' : '#1677FF'} opacity={0.8} />
                <circle cx="185" cy={y1 - 1} r="1.5" fill={i % 5 === 0 ? '#10B981' : '#00E5FF'} />
                <circle cx="178" cy={y1 - 1} r="1.2" fill="#1677FF" />
              </g>
            );
          })}
        </g>

        {/* Middle Left Server Rack (Rack 2) */}
        <g opacity="0.9">
          <polygon points="260,160 480,240 480,840 260,920" fill="url(#rack_body_left)" />
          <line x1="480" y1="240" x2="480" y2="840" stroke="url(#neon_blue_vertical)" strokeWidth="3" filter="url(#glow_subtle)" />
          {Array.from({ length: 20 }).map((_, i) => {
            const y1 = 270 + i * 26;
            const y0 = 190 + i * 32;
            return (
              <g key={`l2-${i}`}>
                <line x1="280" y1={y0} x2="470" y2={y1} stroke="#0a3570" strokeWidth="1" strokeOpacity="0.5" />
                <rect x="445" y={y1 - 2.5} width="18" height="3" rx="1" fill="#00E5FF" opacity={0.85} />
                <circle cx="432" cy={y1 - 1} r="1.2" fill={i % 4 === 0 ? '#38BDF8' : '#1677FF'} />
              </g>
            );
          })}
        </g>

        {/* Inner Left Server Rack (Rack 3 - Deeper corridor) */}
        <g opacity="0.8">
          <polygon points="500,260 680,330 680,750 500,820" fill="url(#rack_body_left)" />
          <line x1="680" y1="330" x2="680" y2="750" stroke="url(#neon_blue_vertical)" strokeWidth="2.5" filter="url(#glow_subtle)" />
          {Array.from({ length: 16 }).map((_, i) => {
            const y1 = 350 + i * 23;
            const y0 = 285 + i * 29;
            return (
              <g key={`l3-${i}`}>
                <line x1="515" y1={y0} x2="670" y2={y1} stroke="#072b5c" strokeWidth="1" strokeOpacity="0.5" />
                <rect x="650" y={y1 - 2} width="14" height="2.5" rx="1" fill="#00E5FF" opacity={0.8} />
                <circle cx="638" cy={y1 - 1} r="1" fill="#1677FF" />
              </g>
            );
          })}
        </g>

        {/* Background Left Rack (Rack 4 - Horizon) */}
        <g opacity="0.65">
          <polygon points="700,340 820,390 820,690 700,740" fill="url(#rack_body_left)" />
          <line x1="820" y1="390" x2="820" y2="690" stroke="#1677FF" strokeWidth="2" filter="url(#glow_subtle)" />
          {Array.from({ length: 12 }).map((_, i) => {
            const y1 = 405 + i * 22;
            return (
              <rect key={`l4-${i}`} x="805" y={y1} width="10" height="2" rx="0.5" fill="#38BDF8" opacity={0.7} />
            );
          })}
        </g>

        {/* ---------------------------------------------------- */}
        {/* 4. RIGHT FLANKING SERVER RACKS (SYMMETRICAL CORRIDOR)*/}
        {/* ---------------------------------------------------- */}
        {/* Far Right Server Rack (Rack 1 - Forefront) */}
        <g opacity="0.95">
          <polygon points="1920,40 1680,140 1680,940 1920,1040" fill="url(#rack_body_right)" />
          <line x1="1680" y1="140" x2="1680" y2="940" stroke="url(#neon_blue_vertical)" strokeWidth="4" filter="url(#glow_subtle)" />
          <line x1="1680" y1="140" x2="1680" y2="940" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" />
          
          {Array.from({ length: 24 }).map((_, i) => {
            const y1 = 180 + i * 30;
            const y0 = 80 + i * 36;
            return (
              <g key={`r1-${i}`}>
                <line x1="1910" y1={y0} x2="1690" y2={y1} stroke="#003882" strokeWidth="1" strokeOpacity="0.6" />
                <rect x="1698" y={y1 - 3} width="22" height="4" rx="1" fill={i % 3 === 0 ? '#00E5FF' : '#1677FF'} opacity={0.8} />
                <circle cx="1735" cy={y1 - 1} r="1.5" fill={i % 4 === 0 ? '#10B981' : '#00E5FF'} />
                <circle cx="1742" cy={y1 - 1} r="1.2" fill="#1677FF" />
              </g>
            );
          })}
        </g>

        {/* Middle Right Server Rack (Rack 2) */}
        <g opacity="0.9">
          <polygon points="1660,160 1440,240 1440,840 1660,920" fill="url(#rack_body_right)" />
          <line x1="1440" y1="240" x2="1440" y2="840" stroke="url(#neon_blue_vertical)" strokeWidth="3" filter="url(#glow_subtle)" />
          {Array.from({ length: 20 }).map((_, i) => {
            const y1 = 270 + i * 26;
            const y0 = 190 + i * 32;
            return (
              <g key={`r2-${i}`}>
                <line x1="1640" y1={y0} x2="1450" y2={y1} stroke="#0a3570" strokeWidth="1" strokeOpacity="0.5" />
                <rect x="1457" y={y1 - 2.5} width="18" height="3" rx="1" fill="#00E5FF" opacity={0.85} />
                <circle cx="1485" cy={y1 - 1} r="1.2" fill={i % 3 === 0 ? '#38BDF8' : '#1677FF'} />
              </g>
            );
          })}
        </g>

        {/* Inner Right Server Rack (Rack 3) */}
        <g opacity="0.8">
          <polygon points="1420,260 1240,330 1240,750 1420,820" fill="url(#rack_body_right)" />
          <line x1="1240" y1="330" x2="1240" y2="750" stroke="url(#neon_blue_vertical)" strokeWidth="2.5" filter="url(#glow_subtle)" />
          {Array.from({ length: 16 }).map((_, i) => {
            const y1 = 350 + i * 23;
            const y0 = 285 + i * 29;
            return (
              <g key={`r3-${i}`}>
                <line x1="1405" y1={y0} x2="1250" y2={y1} stroke="#072b5c" strokeWidth="1" strokeOpacity="0.5" />
                <rect x="1256" y={y1 - 2} width="14" height="2.5" rx="1" fill="#00E5FF" opacity={0.8} />
                <circle cx="1280" cy={y1 - 1} r="1" fill="#1677FF" />
              </g>
            );
          })}
        </g>

        {/* Background Right Rack (Rack 4) */}
        <g opacity="0.65">
          <polygon points="1220,340 1100,390 1100,690 1220,740" fill="url(#rack_body_right)" />
          <line x1="1100" y1="390" x2="1100" y2="690" stroke="#1677FF" strokeWidth="2" filter="url(#glow_subtle)" />
          {Array.from({ length: 12 }).map((_, i) => {
            const y1 = 405 + i * 22;
            return (
              <rect key={`r4-${i}`} x="1105" y={y1} width="10" height="2" rx="0.5" fill="#38BDF8" opacity={0.7} />
            );
          })}
        </g>

        {/* ---------------------------------------------------- */}
        {/* 5. CENTER HORIZON GLOW & VANISHING PORTAL             */}
        {/* ---------------------------------------------------- */}
        <circle cx="960" cy="500" r="140" fill="#1677FF" opacity="0.25" filter="url(#glow_strong)" />
        <ellipse cx="960" cy="510" rx="90" ry="25" fill="#00E5FF" opacity="0.3" filter="url(#glow_subtle)" />
      </svg>

      {/* Atmospheric subtle top and bottom vignettes */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020817]/90 via-transparent to-[#020817] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#020817_90%)] pointer-events-none" />
    </div>
  );
};
