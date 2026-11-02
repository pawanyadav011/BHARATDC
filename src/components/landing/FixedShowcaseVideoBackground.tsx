import React, { useState, useEffect, useRef } from 'react';

interface FixedShowcaseVideoBackgroundProps {
  /**
   * Optional manual override for visibility, otherwise tracks `#modules` automatically
   */
  forcedVisible?: boolean;
}

export const FixedShowcaseVideoBackground: React.FC<FixedShowcaseVideoBackgroundProps> = ({
  forcedVisible
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
  const [autoplayFailed, setAutoplayFailed] = useState<boolean>(false);
  const [inShowcaseView, setInShowcaseView] = useState<boolean>(false);

  // Check prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Control video playback based on reduced motion
  useEffect(() => {
    if (videoRef.current) {
      if (prefersReducedMotion) {
        videoRef.current.pause();
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay might be restricted on certain mobile power-saving modes
            setAutoplayFailed(true);
          });
        }
      }
    }
  }, [prefersReducedMotion]);

  // Track `#modules` section visibility continuously without restarting video
  useEffect(() => {
    let ticking = false;

    const checkShowcaseVisibility = () => {
      const el = document.getElementById('modules');
      if (!el) {
        setInShowcaseView(false);
        return;
      }

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;

      // The showcase starts at the header ("Everything for Your Data Infrastructure")
      // and ends at the bottom of module 14 (Settings).
      // We fade in smoothly as soon as the section approaches the viewport,
      // remain 100% visible throughout all 14 modules,
      // and fade out smoothly when completely leaving.
      const isVisible = rect.top < vh * 0.85 && rect.bottom > vh * 0.15;
      setInShowcaseView(isVisible);
    };

    const handleScrollOrResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkShowcaseVisibility();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    checkShowcaseVisibility();

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, []);

  const isVisible = forcedVisible !== undefined ? forcedVisible : inShowcaseView;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 w-full h-screen pointer-events-none select-none z-0 overflow-hidden transition-opacity duration-700 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* ========================================================= */}
      {/* LAYER 0: CONTINUOUSLY PLAYING DATA-CENTER VIDEO           */}
      {/* Viewport-anchored: does NOT scroll with cards             */}
      {/* Never scrubs, never resets currentTime on scroll         */}
      {/* ========================================================= */}
      {!prefersReducedMotion && !autoplayFailed ? (
        <video
          ref={videoRef}
          src="/assets/datacenter-corridor.mp4"
          poster="/assets/datacenter-corridor-poster.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
          className={`w-full h-full object-cover object-center filter blur-[1px] md:blur-[1px] scale-105 transform-gpu transition-opacity duration-1000 ease-out ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            // Target opacity: 0.28 - 0.38 (Requirement 5)
            // Server details, racks, chassis lights clearly recognizable
            opacity: 0.34
          }}
        />
      ) : (
        /* Fallback high-res poster when reduced-motion or autoplay blocked */
        <img
          src="/assets/datacenter-corridor-poster.jpg"
          alt="Data Center Corridor"
          className="w-full h-full object-cover object-center filter blur-[1px] md:blur-[1px] scale-105 opacity-[0.32]"
        />
      )}

      {/* ========================================================= */}
      {/* LAYER 1: CONTROLLED DARK OVERLAY & VIGNETTE               */}
      {/* Matches user requirement 5 gradient formula               */}
      {/* ========================================================= */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(2, 8, 20, 0.45) 0%, rgba(2, 8, 20, 0.30) 50%, rgba(2, 8, 20, 0.55) 100%)'
        }}
      />

      {/* Responsive Overlay: slightly darker on mobile/tablet for crystal-clear readability */}
      <div className="absolute inset-0 bg-[#020817]/25 md:bg-transparent" />

      {/* ========================================================= */}
      {/* LAYER 2: ATMOSPHERIC EFFECTS & CYAN / BLUE ILLUMINATION   */}
      {/* ========================================================= */}
      {/* Electric Blue / Cyan ambient radiance */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(22, 119, 255, 0.16) 0%, rgba(3, 10, 26, 0.35) 60%, rgba(2, 8, 23, 0.70) 100%)'
        }}
      />

      {/* Center Radial Vignette to direct focus to central timeline */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, transparent 32%, rgba(2, 8, 23, 0.45) 65%, rgba(2, 8, 23, 0.85) 100%)'
        }}
      />

      {/* ========================================================= */}
      {/* TOP & BOTTOM SEAMLESS BLEND (Requirement 11)              */}
      {/* No visible rectangular video boundary                     */}
      {/* ========================================================= */}
      <div className="absolute top-0 inset-x-0 h-36 sm:h-52 bg-gradient-to-b from-[#020817] via-[#020817]/85 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-36 sm:h-52 bg-gradient-to-t from-[#020817] via-[#020817]/85 to-transparent pointer-events-none" />
    </div>
  );
};
