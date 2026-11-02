import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Server,
  HardDrive,
  Cpu,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  History,
  Menu,
  X,
  Send,
  Mail
} from 'lucide-react';
import { BdcLogo } from '../components/common/BdcLogo';
import { DatacenterHeroBackground } from '../components/landing/DatacenterHeroBackground';
import { TimelineModulesSection } from '../components/landing/TimelineModulesSection';
import { FixedShowcaseVideoBackground } from '../components/landing/FixedShowcaseVideoBackground';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  // Intro steps adhering to sequential requirements:
  // 0: Deep navy / black canvas
  // 1: BHARATDC logo/brand
  // 2: Main BHARATDC title
  // 3: Subtitle
  // 4: Description
  // 5: CTA buttons
  // 6: Infrastructure statistics
  // 7: Scroll indicator
  // 8: Complete hero radiance & header reveal
  const [introStep, setIntroStep] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [contactModalOpen, setContactModalOpen] = useState<boolean>(false);
  const [contactSubmitted, setContactSubmitted] = useState<boolean>(false);
  const [isEnteringPlatform, setIsEnteringPlatform] = useState<boolean>(false);

  useEffect(() => {
    // Check if user already saw intro during this browser session
    const seen = sessionStorage.getItem('bdc_hero_intro_seen');
    if (seen === 'true') {
      setIntroStep(8);
      return;
    }

    // Choreographed cinematic entrance (gentle pacing)
    const t1 = setTimeout(() => setIntroStep(1), 250);
    const t2 = setTimeout(() => setIntroStep(2), 700);
    const t3 = setTimeout(() => setIntroStep(3), 1200);
    const t4 = setTimeout(() => setIntroStep(4), 1700);
    const t5 = setTimeout(() => setIntroStep(5), 2200);
    const t6 = setTimeout(() => setIntroStep(6), 2700);
    const t7 = setTimeout(() => setIntroStep(7), 3200);
    const t8 = setTimeout(() => {
      setIntroStep(8);
      sessionStorage.setItem('bdc_hero_intro_seen', 'true');
    }, 3600);

    // Fast-forward on interaction
    const handleSkip = () => {
      setIntroStep(8);
      sessionStorage.setItem('bdc_hero_intro_seen', 'true');
    };

    window.addEventListener('wheel', handleSkip, { passive: true, once: true });
    window.addEventListener('touchstart', handleSkip, { passive: true, once: true });
    window.addEventListener('keydown', handleSkip, { once: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
      clearTimeout(t8);
      window.removeEventListener('wheel', handleSkip);
      window.removeEventListener('touchstart', handleSkip);
      window.removeEventListener('keydown', handleSkip);
    };
  }, []);

  const handleEnterPlatform = (path: string = '/dashboard') => {
    setIsEnteringPlatform(true);
    setTimeout(() => {
      navigate(path, { state: { fromLanding: true } });
    }, 450);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* ========================================================= */}
      {/* 0. VIEWPORT-ANCHORED FIXED VIDEO BACKGROUND               */}
      {/* Physical datacenter video layer fixed to viewport         */}
      {/* Stays anchored while module cards scroll over it          */}
      {/* ========================================================= */}
      <FixedShowcaseVideoBackground />

      {/* ========================================================= */}
      {/* 1. TOP NAVIGATION BAR (Matches Reference)                 */}
      {/* ========================================================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          introStep >= 5
            ? 'opacity-100 translate-y-0 bg-[#020817]/80 backdrop-blur-xl border-b border-white/[0.08]'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: BDC LOGO + BHARATDC */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <BdcLogo size="md" />
          </div>

          {/* Center: Navigation Links (Reference: Overview, Modules, Infrastructure, Security, Contact) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <button
              onClick={() => scrollToSection('overview')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Overview
            </button>
            <button
              onClick={() => scrollToSection('modules')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Modules
            </button>
            <button
              onClick={() => scrollToSection('infrastructure')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Infrastructure
            </button>
            <button
              onClick={() => scrollToSection('security')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Security
            </button>
            <button
              onClick={() => setContactModalOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Right: Enter Platform → Pill Button (Reference style) */}
          <div className="flex items-center gap-3">
            <button
              id="landing-header-login-btn"
              type="button"
              onClick={() => handleEnterPlatform('/login')}
              className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 transition-colors hidden sm:inline-block"
            >
              Staff Login
            </button>
            <button
              id="landing-header-enter-btn"
              type="button"
              onClick={() => handleEnterPlatform('/dashboard')}
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/50 hover:border-blue-400 transition-all duration-300 shadow-[0_0_15px_rgba(22,119,255,0.25)] hover:shadow-[0_0_20px_rgba(22,119,255,0.5)] active:scale-95"
            >
              <span>Enter Platform</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 text-blue-400 group-hover:text-white" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#030c1c]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-5 space-y-4"
            >
              <button
                onClick={() => scrollToSection('overview')}
                className="block w-full text-left text-sm text-slate-300 hover:text-white py-1.5"
              >
                Overview
              </button>
              <button
                onClick={() => scrollToSection('modules')}
                className="block w-full text-left text-sm text-slate-300 hover:text-white py-1.5"
              >
                Modules
              </button>
              <button
                onClick={() => scrollToSection('infrastructure')}
                className="block w-full text-left text-sm text-slate-300 hover:text-white py-1.5"
              >
                Infrastructure
              </button>
              <button
                onClick={() => scrollToSection('security')}
                className="block w-full text-left text-sm text-slate-300 hover:text-white py-1.5"
              >
                Security
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setContactModalOpen(true);
                }}
                className="block w-full text-left text-sm text-slate-300 hover:text-white py-1.5"
              >
                Contact
              </button>
              <div className="pt-2 border-t border-white/10 flex gap-3">
                <button
                  type="button"
                  onClick={() => handleEnterPlatform('/dashboard')}
                  className="flex-1 bg-[#1677FF] text-white text-xs font-semibold py-2.5 rounded-lg text-center"
                >
                  Enter Platform →
                </button>
                <button
                  type="button"
                  onClick={() => handleEnterPlatform('/login')}
                  className="flex-1 bg-white/10 text-white text-xs font-medium py-2.5 rounded-lg text-center"
                >
                  Staff Login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ========================================================= */}
      {/* 2. CINEMATIC HERO SECTION                                 */}
      {/* ========================================================= */}
      <section
        id="overview"
        className="relative min-h-screen flex flex-col justify-between pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* Background: Symmetrical Server Room Corridor (Revealed smoothly) */}
        <div
          className={`transition-opacity duration-1000 ease-out ${
            introStep >= 7 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <DatacenterHeroBackground />
        </div>

        {/* Side Annotations (Left and Right - exactly as in reference) */}
        <div
          className={`hidden xl:flex flex-col justify-center fixed left-8 top-1/2 -translate-y-1/2 z-20 pointer-events-none transition-all duration-1000 ${
            introStep >= 7 ? 'opacity-70 translate-x-0' : 'opacity-0 -translate-x-6'
          }`}
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent to-blue-500/50 mb-3" />
          <div className="text-[10px] font-mono font-medium tracking-[0.25em] text-slate-400 space-y-1">
            <p>POWERING</p>
            <p>DATA</p>
            <p>INFRASTRUCTURE</p>
          </div>
          <div className="w-[1px] h-16 bg-gradient-to-b from-blue-500/50 to-transparent mt-3" />
        </div>

        <div
          className={`hidden xl:flex flex-col items-end justify-center fixed right-8 top-1/2 -translate-y-1/2 z-20 pointer-events-none text-right transition-all duration-1000 ${
            introStep >= 7 ? 'opacity-70 translate-x-0' : 'opacity-0 translate-x-6'
          }`}
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent to-blue-500/50 mb-3" />
          <div className="text-[10px] font-mono font-medium tracking-[0.25em] text-slate-400 space-y-1">
            <p>SECURE</p>
            <p>SCALABLE</p>
            <p>EFFICIENT</p>
            <p className="text-blue-400">FOR A STRONGER</p>
            <p className="text-white font-bold">DIGITAL INDIA</p>
          </div>
          <div className="w-[1px] h-16 bg-gradient-to-b from-blue-500/50 to-transparent mt-3" />
        </div>

        {/* Spacer for vertical balance */}
        <div className="h-6 sm:h-12" />

        {/* Center Hero Content (Sequential Step Reveals) */}
        <div className="relative z-20 max-w-4xl mx-auto text-center my-auto">
          {/* STEP 1: BHARATDC Logo/Brand Emblem */}
          <div
            className={`flex justify-center mb-5 transition-all duration-700 ease-out transform ${
              introStep >= 1
                ? 'opacity-100 translate-y-0 scale-100 filter-none'
                : 'opacity-0 translate-y-4 scale-95 blur-sm'
            }`}
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(22,119,255,0.25)]">
              <BdcLogo size="sm" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-blue-300 font-semibold">
                ENTERPRISE DATA INFRASTRUCTURE
              </span>
            </div>
          </div>

          {/* STEP 2: Main BHARATDC Title */}
          <div
            className={`transition-all duration-700 ease-out transform ${
              introStep >= 2
                ? 'opacity-100 translate-y-0 scale-100 filter-none'
                : 'opacity-0 translate-y-6 scale-95 blur-sm'
            }`}
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-white select-none drop-shadow-[0_0_40px_rgba(22,119,255,0.45)]">
              BHARATDC
            </h1>
          </div>

          {/* STEP 3: Subtitle */}
          <div
            className={`mt-3 sm:mt-5 transition-all duration-700 ease-out transform ${
              introStep >= 3
                ? 'opacity-100 translate-y-0 filter-none'
                : 'opacity-0 translate-y-4 blur-sm'
            }`}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-200">
              Data Center Management Platform
            </h2>
          </div>

          {/* STEP 4: Description */}
          <div
            className={`mt-4 sm:mt-5 max-w-xl mx-auto transition-all duration-700 ease-out transform ${
              introStep >= 4
                ? 'opacity-100 translate-y-0 filter-none'
                : 'opacity-0 translate-y-4 blur-sm'
            }`}
          >
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Manage data centers, servers, clients, racks, allocations and maintenance in one place.
            </p>
          </div>

          {/* STEP 5: CTA Buttons */}
          <div
            className={`mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 ease-out transform ${
              introStep >= 5
                ? 'opacity-100 translate-y-0 filter-none'
                : 'opacity-0 translate-y-4 blur-sm'
            }`}
          >
            {/* Primary Button: Enter Platform → */}
            <button
              id="landing-hero-enter-btn"
              type="button"
              onClick={() => handleEnterPlatform('/dashboard')}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white bg-[#1677FF] hover:bg-[#2D9CFF] transition-all duration-200 shadow-[0_0_28px_rgba(22,119,255,0.55)] hover:shadow-[0_0_36px_rgba(45,156,255,0.8)] hover:-translate-y-0.5 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <span>Enter Platform</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            {/* Secondary Button: Explore Modules */}
            <button
              type="button"
              onClick={() => scrollToSection('modules')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium text-slate-200 bg-[#061426]/70 hover:bg-[#0a254a]/80 border border-slate-700/80 hover:border-slate-500 transition-all duration-200 hover:text-white hover:-translate-y-0.5 active:scale-95 cursor-pointer backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <span>Explore Modules</span>
            </button>
          </div>

          {/* STEP 6: Infrastructure Statistics Row */}
          <div
            className={`mt-14 sm:mt-20 pt-8 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto text-center transition-all duration-700 ease-out transform ${
              introStep >= 6
                ? 'opacity-100 translate-y-0 filter-none'
                : 'opacity-0 translate-y-6 blur-sm'
            }`}
          >
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
                12+
              </div>
              <p className="text-xs text-slate-400 font-medium">Data Centers</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
                1,280+
              </div>
              <p className="text-xs text-slate-400 font-medium">Servers Managed</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
                99.995%
              </div>
              <p className="text-xs text-slate-400 font-medium">Uptime SLA</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
                24/7
              </div>
              <p className="text-xs text-slate-400 font-medium">Monitoring</p>
            </div>
          </div>
        </div>

        {/* STEP 7: Scroll to Explore Indicator */}
        <div
          className={`relative z-20 flex flex-col items-center justify-center mt-6 transition-all duration-700 ease-out transform ${
            introStep >= 7
              ? 'opacity-90 translate-y-0 filter-none'
              : 'opacity-0 translate-y-4 blur-sm'
          }`}
        >
          <button
            onClick={() => scrollToSection('modules')}
            className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer group focus:outline-none"
          >
            {/* Mouse Outline Pill with Animated Dot */}
            <div className="w-5 h-8 rounded-full border border-slate-500 group-hover:border-blue-400 flex items-start justify-center p-1 transition-colors">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1.5 h-1.5 rounded-full bg-blue-400"
              />
            </div>
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase mt-1">
              SCROLL TO EXPLORE
            </span>
            <ChevronDown className="w-3.5 h-3.5 -mt-0.5 text-slate-500 group-hover:text-blue-400 transition-colors animate-bounce" />
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. CENTRAL VERTICAL TIMELINE MODULES SHOWCASE             */}
      {/* ========================================================= */}
      <TimelineModulesSection />

      {/* ========================================================= */}
      {/* 4. INFRASTRUCTURE FABRIC PREVIEW (Physical Racks & Blades)*/}
      {/* ========================================================= */}
      <section
        id="infrastructure"
        className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="bg-[#040e21]/80 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden">
          {/* Radial ambient background light */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Left Narrative */}
            <div className="w-full lg:w-1/2 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-medium">
                <Server className="w-3.5 h-3.5" />
                <span>FACILITY HARDWARE TELEMETRY</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Engineered for Dense 42U Architecture
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Full-stack hardware oversight down to individual chassis slots. Real-time dual PDU branch circuits, precision cold-aisle thermal gradients, and automated maintenance dispatching.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <div className="text-xs text-slate-400">Navi Mumbai Facility</div>
                  <div className="text-lg font-bold text-white mt-1 font-mono">MUM-1</div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>99.98% Active Uptime</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <div className="text-xs text-slate-400">Noida Tech Park</div>
                  <div className="text-lg font-bold text-white mt-1 font-mono">DEL-2</div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>99.99% Active Uptime</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleEnterPlatform('/racks')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span>View 42U Rack Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleEnterPlatform('/servers')}
                  className="px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-medium border border-white/10 transition-colors"
                >
                  Inspect Bare-Metal Servers
                </button>
              </div>
            </div>

            {/* Right Interactive Rack Terminal Preview */}
            <div className="w-full lg:w-1/2">
              <div className="bg-[#020817] border border-white/15 rounded-2xl p-5 font-mono text-xs shadow-2xl space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-white font-semibold">RACK R-102 • ZONE A</span>
                  </div>
                  <span className="text-[11px] text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
                    Dual PDU: 208V / 30A
                  </span>
                </div>

                {/* Blade units */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-white font-medium">U38–U42: Dell PowerEdge R750</span>
                    </div>
                    <span className="text-emerald-400 text-[11px]">ACTIVE • 340W</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-white font-medium">U34–U37: HPE ProLiant DL380</span>
                    </div>
                    <span className="text-emerald-400 text-[11px]">ACTIVE • 410W</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span className="text-white font-medium">U31–U33: Cisco Nexus 9300</span>
                    </div>
                    <span className="text-cyan-400 text-[11px]">400 Gbps FABRIC</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-dashed border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-600" />
                      <span className="text-slate-400">U27–U30: Unallocated Blade Slot</span>
                    </div>
                    <span className="text-slate-500 text-[11px]">AVAILABLE (4U)</span>
                  </div>
                </div>

                {/* Micro telemetry footer */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Capacity: 38 of 42 Units Allocated</span>
                  <span className="text-emerald-400">Cold Aisle: 21.2°C Normal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. SECURITY & COMPLIANCE SECTION                          */}
      {/* ========================================================= */}
      <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold font-mono tracking-widest text-[#2D9CFF] uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>ENTERPRISE COMPLIANCE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Bank-Grade Security for Critical Workloads
          </h2>
          <p className="text-sm text-slate-400">
            Engineered to fulfill statutory Indian regulatory mandates, MeitY data localization guidelines, and ISO 27001 data-center governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#061426]/60 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Fine-Grained RBAC</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Multi-tiered role authorization ensuring technicians, division managers, and client tenants only access assigned infrastructure boundaries.
            </p>
          </div>

          <div className="bg-[#061426]/60 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Immutable Audit Trails</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Every server configuration tweak, cable cross-connect dispatch, and client tenant allocation is cryptographically time-stamped.
            </p>
          </div>

          <div className="bg-[#061426]/60 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Tier IV SLA Assurance</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Concurrently maintainable infrastructure topology designed for 99.995% uptime availability with zero single points of failure.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. CLOSING CTA BANNER                                     */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/[0.08] relative">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <BdcLogo size="lg" className="mx-auto" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Ready to deploy your enterprise infrastructure?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Experience the BHARATDC operations suite. Oversee facilities, server allocations, and automated preventative maintenance workflows.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              id="landing-footer-enter-btn"
              type="button"
              onClick={() => handleEnterPlatform('/dashboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white bg-[#1677FF] hover:bg-[#2D9CFF] transition-all shadow-[0_0_25px_rgba(22,119,255,0.5)] cursor-pointer"
            >
              <span>Enter Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setContactModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 transition-colors cursor-pointer"
            >
              <span>Schedule Enterprise Consultation</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. FOOTER (Matches Reference)                             */}
      {/* ========================================================= */}
      <footer className="border-t border-white/[0.08] bg-[#020817] py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left Reference Annotation: SECURE • SCALABLE • EFFICIENT */}
          <div className="flex items-center gap-3 font-mono tracking-wider text-[11px]">
            <span className="text-blue-400">SECURE</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">SCALABLE</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400">EFFICIENT</span>
          </div>

          {/* Right Reference Annotation: ────── BHARATDC */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">All Systems Operational</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <span className="w-8 h-[1px] bg-slate-600 inline-block" />
              <span>BHARATDC</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* 8. ENTERPRISE CONTACT MODAL DIALOG                        */}
      {/* ========================================================= */}
      <AnimatePresence>
        {contactModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="bg-[#040e21] border border-white/20 rounded-2xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl"
            >
              <button
                onClick={() => {
                  setContactModalOpen(false);
                  setContactSubmitted(false);
                }}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                <BdcLogo size="sm" />
                <h3 className="text-xl font-bold text-white">
                  Enterprise Infrastructure Inquiries
                </h3>
                <p className="text-xs text-slate-400">
                  Connect with BHARATDC infrastructure architects for custom 42U rack allocations, dedicated cages, or cross-connect provisioning.
                </p>

                {contactSubmitted ? (
                  <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Inquiry received. A senior BHARATDC infrastructure advisor will respond within 2 business hours.</span>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setContactSubmitted(true);
                    }}
                    className="space-y-3 pt-2"
                  >
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Full Name / Organization
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tata Telematics / Rajesh Verma"
                        className="w-full px-3.5 py-2 rounded-lg bg-slate-900/90 border border-white/15 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Enterprise Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="r.verma@enterprise.in"
                        className="w-full px-3.5 py-2 rounded-lg bg-slate-900/90 border border-white/15 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Requirement Type
                      </label>
                      <select className="w-full px-3.5 py-2 rounded-lg bg-slate-900/90 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500">
                        <option>Dedicated 42U Rack Allocation</option>
                        <option>Private Cold-Aisle Cage Lease</option>
                        <option>High-Density GPU Cluster Hosting</option>
                        <option>Disaster Recovery Secondary Node</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Estimated Power / Capacity
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 5kW - 25kW / Dual 208V PDU"
                        className="w-full px-3.5 py-2 rounded-lg bg-slate-900/90 border border-white/15 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setContactModalOpen(false)}
                        className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-[#1677FF] hover:bg-blue-500 transition-colors flex items-center gap-1.5"
                      >
                        <span>Submit Inquiry</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Enter Platform Transition Overlay (Req 5) */}
      <AnimatePresence>
        {isEnteringPlatform && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] bg-[#07111F] flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                <div className="w-3 h-3 rounded-full bg-blue-400 animate-ping" />
              </div>
              <div className="text-sm font-semibold tracking-wider text-white font-mono uppercase">
                Entering BHARATDC Platform
              </div>
              <div className="text-xs text-blue-400 font-mono mt-1">Routing to Data Center NOC...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
