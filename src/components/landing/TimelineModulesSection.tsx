import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Building,
  Users,
  Briefcase,
  Building2,
  Server,
  HardDrive,
  Cpu,
  Wrench,
  Bell,
  FileText,
  History,
  UserCheck,
  Sliders,
  ArrowRight,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Lock,
  Layers,
  Thermometer,
  Zap,
  Radio,
  Check,
  AlertTriangle
} from 'lucide-react';

interface ModuleData {
  num: string;
  id: string;
  title: string;
  description: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  side: 'left' | 'right';
  preview: React.ReactNode;
}

export const TimelineModulesSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(0);
  const moduleRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Check prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Set up scroll tracking for active node
  useEffect(() => {
    const handleScroll = () => {
      // Find the module closest to 45% of viewport height
      const viewportCenter = window.innerHeight * 0.45;
      let closestIndex = 0;
      let minDistance = Infinity;

      moduleRefs.current.forEach((el, index) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elementCenter = rect.top + rect.height * 0.35;
        const distance = Math.abs(elementCenter - viewportCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      setActiveModuleIndex(closestIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (route: string) => {
    navigate(route, { state: { fromLanding: true } });
  };

  // 14 Module Definitions with custom mini enterprise UI previews
  const modules: ModuleData[] = [
    {
      num: '01',
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Real-time overview and infrastructure insights across all data center clusters.',
      route: '/dashboard',
      icon: LayoutDashboard,
      tag: 'Real-time Telemetry',
      side: 'left',
      preview: (
        <div className="space-y-2.5 font-mono text-[11px]">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              GLOBAL CLUSTER
            </span>
            <span className="text-emerald-400 font-semibold">12/12 ONLINE</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] text-slate-500">CPU LOAD</div>
              <div className="text-white font-bold text-xs mt-0.5">38.4%</div>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] text-slate-500">RAM USAGE</div>
              <div className="text-blue-400 font-bold text-xs mt-0.5">64.2%</div>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] text-slate-500">THROUGHPUT</div>
              <div className="text-cyan-400 font-bold text-xs mt-0.5">1.4 Tbps</div>
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div className="bg-[#1677FF] h-full w-[64%]" />
            <div className="bg-[#00E5FF] h-full w-[22%]" />
          </div>
        </div>
      )
    },
    {
      num: '02',
      id: 'organizations',
      title: 'Organizations',
      description: 'Manage tenants, enterprise structures, multi-region access, and corporate hierarchies.',
      route: '/organizations',
      icon: Building2,
      tag: 'Multi-Tenant Architecture',
      side: 'right',
      preview: (
        <div className="space-y-2 text-xs">
          <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-white font-medium text-[11px]">Bharat Telecom Core</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              PARENT
            </span>
          </div>
          <div className="pl-4 space-y-1.5 border-l border-blue-500/30">
            <div className="p-1.5 rounded bg-white/[0.02] flex items-center justify-between text-[11px]">
              <span className="text-slate-300">Mumbai Cloud Zone (MUM-1)</span>
              <span className="text-[10px] font-mono text-slate-400">28 Racks</span>
            </div>
            <div className="p-1.5 rounded bg-white/[0.02] flex items-center justify-between text-[11px]">
              <span className="text-slate-300">National FinTech Gateway</span>
              <span className="text-[10px] font-mono text-slate-400">14 Racks</span>
            </div>
          </div>
        </div>
      )
    },
    {
      num: '03',
      id: 'users',
      title: 'Users',
      description: 'Role management, granular permissions, hardware key enforcement, and access control.',
      route: '/users',
      icon: Users,
      tag: 'RBAC & Identity',
      side: 'left',
      preview: (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-1 border-b border-white/[0.06]">
            <span>DIRECTORY MEMBERS</span>
            <span className="text-blue-400">42 ACTIVE</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between p-1.5 rounded bg-white/[0.03] text-[11px]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center text-[9px] font-bold">
                  RS
                </div>
                <span className="text-white">Rajesh Sharma</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                Super Admin
              </span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded bg-white/[0.03] text-[11px]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center text-[9px] font-bold">
                  PK
                </div>
                <span className="text-white">Pooja Kulkarni</span>
              </div>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                NOC Lead
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 pt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FIPS 140-2 Hardware Token Enforced</span>
          </div>
        </div>
      )
    },
    {
      num: '04',
      id: 'clients',
      title: 'Clients',
      description: 'Manage clients, service contracts, billing relations, and high-assurance SLAs.',
      route: '/clients',
      icon: Briefcase,
      tag: 'Enterprise Contracts',
      side: 'right',
      preview: (
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-lg bg-gradient-to-r from-blue-950/40 to-transparent border border-blue-500/20">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold text-[11px]">State Bank Enterprise</span>
              <span className="text-[10px] font-mono text-emerald-400">TIER IV SLA</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Contract: 36 Mos • 12 Dedicated Cages</div>
            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/[0.06] text-[10px] font-mono">
              <span className="text-slate-400">Guaranteed Uptime</span>
              <span className="text-white font-bold">99.995%</span>
            </div>
          </div>
        </div>
      )
    },
    {
      num: '05',
      id: 'data-centers',
      title: 'Data Centers',
      description: 'Manage multiple physical facilities, campus topology, power grids, and cooling nodes.',
      route: '/data-centers',
      icon: Building,
      tag: 'Facility Management',
      side: 'left',
      preview: (
        <div className="space-y-1.5 text-xs font-mono">
          <div className="p-2 rounded bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="text-white font-bold text-[11px]">MUM-1 (Navi Mumbai)</div>
              <div className="text-[10px] text-slate-400">PUE: 1.14 • Substation A/B</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="p-2 rounded bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="text-white font-bold text-[11px]">DEL-2 (Noida Tech Zone)</div>
              <div className="text-[10px] text-slate-400">PUE: 1.18 • Dual Solar Ingress</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
        </div>
      )
    },
    {
      num: '06',
      id: 'racks',
      title: 'Racks',
      description: 'Rack inventory, 42U slot allocation, dual-branch PDU circuits, and cold-aisle thermal maps.',
      route: '/racks',
      icon: Layers,
      tag: '42U Standard Architecture',
      side: 'right',
      preview: (
        <div className="space-y-2 font-mono text-[11px]">
          <div className="flex items-center justify-between text-slate-300">
            <span>RACK R-102 (42U)</span>
            <span className="text-emerald-400">38/42U OCCUPIED</span>
          </div>
          {/* Visual slot representation */}
          <div className="space-y-1">
            <div className="h-2 rounded bg-[#1677FF] w-full" title="U38-42 Compute" />
            <div className="h-2 rounded bg-[#00E5FF] w-[90%]" title="U32-37 Storage" />
            <div className="h-2 rounded bg-purple-500 w-[75%]" title="U26-31 Networking" />
            <div className="h-2 rounded bg-slate-800 w-full" title="Available Slots" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-cyan-400" /> 21.2°C Cold Aisle
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> 208V / 28.4A
            </span>
          </div>
        </div>
      )
    },
    {
      num: '07',
      id: 'servers',
      title: 'Servers',
      description: 'Server management, bare-metal telemetry, IPMI console control, and automated health checks.',
      route: '/servers',
      icon: HardDrive,
      tag: 'Bare-Metal Oversight',
      side: 'left',
      preview: (
        <div className="space-y-2 text-xs font-mono">
          <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-white font-bold">Dell PowerEdge R750xs</span>
              <span className="text-emerald-400 text-[10px]">HEALTHY</span>
            </div>
            <div className="grid grid-cols-2 gap-1 mt-1.5 text-[10px] text-slate-400">
              <div>CPU: 2x Xeon 8480+</div>
              <div>RAM: 1024 GB DDR5</div>
              <div>DISK: 4x 3.84TB NVMe</div>
              <div>NIC: Dual 100GbE</div>
            </div>
          </div>
        </div>
      )
    },
    {
      num: '08',
      id: 'server-allocation',
      title: 'Server Allocation',
      description: 'Allocate bare-metal chassis to clients, provision tenant networks, and rebalance capacity.',
      route: '/server-allocation',
      icon: Cpu,
      tag: 'Resource Provisioning',
      side: 'right',
      preview: (
        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span>QUOTA UTILIZATION</span>
            <span className="text-blue-400 font-bold">86.4%</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div className="bg-blue-600 h-full w-[65%]" title="Dedicated" />
            <div className="bg-emerald-500 h-full w-[21%]" title="Shared Pool" />
            <div className="bg-slate-700 h-full w-[14%]" title="Spare" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Dedicated: 820 Nodes</span>
            <span>Hot Spare: 42 Nodes</span>
          </div>
        </div>
      )
    },
    {
      num: '09',
      id: 'maintenance',
      title: 'Maintenance',
      description: 'Track preventative maintenance schedules, filter replacements, and service NOC tickets.',
      route: '/maintenance',
      icon: Wrench,
      tag: 'NOC Service Dispatch',
      side: 'left',
      preview: (
        <div className="space-y-1.5 text-xs font-mono">
          <div className="p-2 rounded bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium text-[11px]">#MNT-8821 CRAC Unit 04</span>
              <span className="text-amber-400 text-[10px]">SCHEDULED</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Filter Inspection & Glycol Flush</div>
            <div className="text-[10px] text-slate-500 mt-1">Window: 02:00 - 04:00 IST (Non-disruptive)</div>
          </div>
        </div>
      )
    },
    {
      num: '10',
      id: 'notifications',
      title: 'Notifications',
      description: 'Real-time telemetry alerts, threshold breaches, SNMP traps, and push updates.',
      route: '/notifications',
      icon: Bell,
      tag: 'Instant Alerts & Traps',
      side: 'right',
      preview: (
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between p-1.5 rounded bg-blue-950/40 border border-blue-500/20 text-[11px]">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span className="text-slate-200">Secondary PDU load shift DEL-2</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">2m ago</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded bg-white/[0.02] border border-white/[0.06] text-[11px]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300">Daily generator self-test passed</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">14m ago</span>
          </div>
        </div>
      )
    },
    {
      num: '11',
      id: 'reports',
      title: 'Reports',
      description: 'Generate operational insights, energy consumption reports, and regulatory audit compliance.',
      route: '/reports',
      icon: FileText,
      tag: 'Analytics & Compliance',
      side: 'left',
      preview: (
        <div className="space-y-2 text-xs font-mono">
          <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
            <div className="p-1.5 rounded bg-white/[0.03] border border-white/[0.06]">
              <div className="text-slate-500">ISO 27001</div>
              <div className="text-emerald-400 font-bold mt-0.5">COMPLIANT</div>
            </div>
            <div className="p-1.5 rounded bg-white/[0.03] border border-white/[0.06]">
              <div className="text-slate-500">MeitY AUDIT</div>
              <div className="text-cyan-400 font-bold mt-0.5">CERTIFIED</div>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 text-center">
            Last automated compliance run: Today 00:00 UTC
          </div>
        </div>
      )
    },
    {
      num: '12',
      id: 'activity',
      title: 'Activity History',
      description: 'Track all system activities, rack door unlocks, configuration edits, and administrative actions.',
      route: '/activity',
      icon: History,
      tag: 'Immutable Audit Trail',
      side: 'right',
      preview: (
        <div className="space-y-1.5 font-mono text-[10px]">
          <div className="p-1.5 rounded bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <span className="text-slate-300">02:14:22 • Operator #402 • Rack R-102 Unlock</span>
            <span className="text-emerald-400">VERIFIED</span>
          </div>
          <div className="p-1.5 rounded bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <span className="text-slate-300">01:52:10 • SysAdmin • VLAN-402 Rebalance</span>
            <span className="text-blue-400">COMMITTED</span>
          </div>
        </div>
      )
    },
    {
      num: '13',
      id: 'profile',
      title: 'Profile',
      description: 'Manage operator profile, security keys, biometric authorizations, and clearance levels.',
      route: '/profile',
      icon: UserCheck,
      tag: 'Operator Credentials',
      side: 'left',
      preview: (
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center font-bold text-blue-300">
              RS
            </div>
            <div>
              <div className="text-white font-bold text-[11px]">Rajesh Sharma</div>
              <div className="text-[10px] font-mono text-slate-400">Chief Infrastructure Architect</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono bg-white/[0.03] p-1.5 rounded border border-white/[0.06]">
            <span className="text-slate-400">Security Clearance</span>
            <span className="text-emerald-400 font-bold">LEVEL 5 ACCESS</span>
          </div>
        </div>
      )
    },
    {
      num: '14',
      id: 'settings',
      title: 'Settings',
      description: 'System configuration, syslog daemon ports, NTP servers, and air-gapped security policies.',
      route: '/settings',
      icon: Sliders,
      tag: 'Platform Governance',
      side: 'right',
      preview: (
        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between p-1.5 rounded bg-white/[0.03] text-[10px]">
            <span className="text-slate-300">Syslog TLS Daemon (Port 6514)</span>
            <span className="text-emerald-400">ACTIVE</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded bg-white/[0.03] text-[10px]">
            <span className="text-slate-300">Dual-Operator Approval Rule</span>
            <span className="text-cyan-400">ENFORCED</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="modules" className="relative py-28 sm:py-36 w-full overflow-hidden bg-transparent z-10">
      {/* Top & Bottom Ambient Edge Blends (Requirement 11) */}
      <div className="absolute top-0 inset-x-0 h-36 sm:h-48 bg-gradient-to-b from-[#020817] via-[#020817]/60 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 inset-x-0 h-36 sm:h-48 bg-gradient-to-t from-[#020817] via-[#020817]/60 to-transparent pointer-events-none z-10" />

      {/* ========================================================= */}
      {/* SHOWCASE CONTENT CONTAINER                                */}
      {/* ========================================================= */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Ambient background soft light */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-[800px] bg-blue-600/[0.04] rounded-full blur-[140px] pointer-events-none" />

        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-24 relative z-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/35 text-[#00E5FF] text-xs font-mono font-medium tracking-widest uppercase shadow-[0_0_20px_rgba(0,229,255,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
            <span>EVERYTHING FOR YOUR DATA INFRASTRUCTURE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Complete Operational Sovereignty
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Powerful modules to manage and operate your data center environment efficiently. Scroll through the core architectural fabric below.
          </p>
        </div>

        {/* CENTRAL VERTICAL TIMELINE CONTAINER (Requirement 12) */}
        <div className="relative z-20">
          {/* Continuous Central Vertical Glowing Spine */}
          <div className="absolute top-8 bottom-8 left-6 md:left-1/2 -translate-x-1/2 w-[2px] bg-slate-800/80 pointer-events-none z-20">
            {/* Subtle static ambient glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/30 via-[#1677FF]/60 to-blue-500/30 shadow-[0_0_16px_rgba(22,119,255,0.5)]" />

            {/* Animated Energy Traveling Through the Center Line */}
            {!prefersReducedMotion && (
              <motion.div
                animate={{
                  top: ['-5%', '105%']
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                className="absolute left-1/2 -translate-x-1/2 w-1.5 h-36 bg-gradient-to-b from-transparent via-[#00E5FF] to-transparent rounded-full shadow-[0_0_18px_#00E5FF,0_0_30px_#1677FF]"
              />
            )}
          </div>

          {/* 14 Modules Stacked Along the Timeline */}
          <div className="space-y-16 sm:space-y-24">
            {modules.map((mod, index) => {
              const Icon = mod.icon;
              const isLeft = mod.side === 'left';
              const isActive = activeModuleIndex === index;
              const isPast = activeModuleIndex > index;

              // Refined Glassmorphism card styling (Requirement 13)
              // background: rgba(6, 18, 36, 0.72); backdrop-filter: blur(14px); border: 1px solid rgba(80,150,255,0.20);
              const cardEmphasisClass = isActive
                ? 'border-[rgba(0,229,255,0.55)] ring-1 ring-[rgba(0,229,255,0.4)] shadow-[0_0_35px_rgba(22,119,255,0.35)] scale-[1.01]'
                : isPast
                ? 'border-[rgba(80,150,255,0.22)] opacity-95 hover:opacity-100 hover:border-blue-400/50'
                : 'border-[rgba(80,150,255,0.18)] opacity-90 hover:opacity-100 hover:border-blue-400/50';

              return (
                <div
                  key={mod.id}
                  ref={(el) => {
                    moduleRefs.current[index] = el;
                  }}
                  className="relative flex items-center md:justify-between w-full"
                >
                  {/* TIMELINE NODE */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-none">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isActive
                          ? 'bg-blue-500/30 shadow-[0_0_24px_rgba(0,229,255,0.9)] scale-110'
                          : 'bg-transparent scale-90'
                      }`}
                    >
                      {isActive && !prefersReducedMotion && (
                        <span className="absolute inset-0 rounded-full bg-[#00E5FF]/40 animate-ping" />
                      )}

                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                          isActive
                            ? 'bg-[#00E5FF] border-white shadow-[0_0_14px_#00E5FF]'
                            : 'bg-[#06142a] border-slate-600'
                        }`}
                      />
                    </div>
                  </div>

                  {/* HORIZONTAL CONNECTOR LINE */}
                  <div
                    className={`md:hidden absolute left-6 w-8 h-[1px] transition-all duration-300 pointer-events-none z-20 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#00E5FF] to-blue-500 shadow-[0_0_8px_#00E5FF]'
                        : 'bg-slate-700/60'
                    }`}
                  />

                  <div
                    className={`hidden md:block absolute left-1/2 h-[1px] transition-all duration-300 pointer-events-none z-20 ${
                      isLeft
                        ? '-translate-x-full w-12 lg:w-16 right-auto'
                        : 'w-12 lg:w-16 left-1/2'
                    } ${
                      isActive
                        ? isLeft
                          ? 'bg-gradient-to-l from-[#00E5FF] to-blue-500 shadow-[0_0_8px_#00E5FF]'
                          : 'bg-gradient-to-r from-[#00E5FF] to-blue-500 shadow-[0_0_8px_#00E5FF]'
                        : 'bg-slate-700/60'
                    }`}
                  />

                  {/* MODULE CARD CONTENT */}
                  <div
                    className={`w-full md:w-[calc(50%-48px)] lg:w-[calc(50%-64px)] pl-14 sm:pl-16 md:pl-0 z-30 ${
                      isLeft ? 'md:mr-auto' : 'md:ml-auto'
                    }`}
                  >
                    <motion.div
                      initial={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : {
                              opacity: 0,
                              x: isLeft ? -70 : 70,
                              filter: 'blur(6px)',
                              scale: 0.96
                            }
                      }
                      whileInView={
                        prefersReducedMotion
                          ? { opacity: 1 }
                          : {
                              opacity: 1,
                              x: 0,
                              filter: 'blur(0px)',
                              scale: 1
                            }
                      }
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{
                        duration: 0.55,
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      style={{
                        backgroundColor: isActive
                          ? 'rgba(6, 18, 36, 0.80)'
                          : 'rgba(6, 18, 36, 0.72)',
                        backdropFilter: 'blur(14px)',
                        WebkitBackdropFilter: 'blur(14px)'
                      }}
                      className={`relative rounded-2xl p-6 transition-all duration-300 overflow-hidden border ${cardEmphasisClass}`}
                    >
                      {/* Subtle Top Specular Edge Line */}
                      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                      {/* Card Header: 01, Tag, & Icon */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-sm text-[#00E5FF] bg-blue-950/80 border border-blue-500/35 px-2.5 py-1 rounded-lg">
                            {mod.num}
                          </span>
                          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
                            {mod.tag}
                          </span>
                        </div>

                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-transform duration-300 ${
                            isActive
                              ? 'bg-blue-600/30 border-blue-400/50 text-blue-300 scale-105'
                              : 'bg-white/[0.04] border-white/10 text-slate-400'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Module Title & Description */}
                      <h3 className="text-xl font-bold tracking-tight text-white mb-2 group-hover:text-blue-200 transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-5">
                        {mod.description}
                      </p>

                      {/* Mini UI Data Preview Panel */}
                      <div className="bg-[#030914]/85 border border-white/[0.08] rounded-xl p-3.5 mb-5 shadow-inner">
                        {mod.preview}
                      </div>

                      {/* Action Bar: Explore Module → Button */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                        <span className="text-[11px] font-mono text-slate-400">
                          Route: {mod.route}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleNavigate(mod.route)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600/30 hover:bg-[#1677FF] border border-blue-500/40 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-[0_0_15px_rgba(22,119,255,0.4)] cursor-pointer active:scale-95"
                        >
                          <span>Explore</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
