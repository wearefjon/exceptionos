'use client';

import React from 'react';
import {
  Mic,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Factory,
  Wrench,
  Truck,
  Building2,
  HardHat,
  Zap,
  ArrowRight,
  Play,
  Terminal,
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenVoiceDemo: () => void;
  onGoToAuth: () => void;
}

export default function LandingPage({ onEnterApp, onOpenVoiceDemo, onGoToAuth }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 selection:bg-slate-900 selection:text-white flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onEnterApp}>
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-sm">
              EX
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">ExceptionOS</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</a>
            <a href="#capabilities" className="hover:text-slate-900 transition-colors">Product</a>
            <a href="#solutions" className="hover:text-slate-900 transition-colors">Solutions</a>
            <a href="#architecture" className="hover:text-slate-900 transition-colors">Architecture</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={onGoToAuth}
              className="text-xs font-semibold px-3 py-1.5 text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={onEnterApp}
              className="text-xs font-semibold px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-20 px-6 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Voice-native operational exception management</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
              When operations break, <br className="hidden sm:inline" />
              your team shouldn&apos;t have <br className="hidden sm:inline" />
              to fight the software.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed font-normal">
              ExceptionOS turns field-reported problems into coordinated, authorized, and verified action. 
              Workers simply speak — ExceptionOS investigates telemetry, retrieves SOPs, checks cross-warehouse inventory, requests human sign-off, and verifies the physical outcome.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onEnterApp}
                className="px-5 py-3 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all flex items-center space-x-2"
              >
                <span>Launch Operations Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenVoiceDemo}
                className="px-5 py-3 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all flex items-center space-x-2"
              >
                <Mic className="w-4 h-4 text-rose-500" />
                <span>Test Voice Agent</span>
              </button>
            </div>

            <div className="pt-4 flex items-center space-x-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero complex manual forms</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mandatory human authorization</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Independent outcome verification</span>
              </span>
            </div>
          </div>

          {/* Real application slice preview card */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-1 shadow-xl">
              <div className="rounded-lg bg-white border border-slate-200 overflow-hidden">
                {/* Simulated App Header */}
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono font-bold text-slate-500">INC-10482</span>
                    <span className="text-xs font-semibold text-slate-900">Machine 7</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                    Critical
                  </span>
                </div>

                {/* Simulated Content */}
                <div className="p-5 space-y-4">
                  {/* Spoken report quote */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start space-x-2.5">
                    <Mic className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-700 italic">
                      &ldquo;Machine 7 is overheating and vibrating more than usual.&rdquo;
                    </div>
                  </div>

                  {/* Telemetry snippet */}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Live Telemetry</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                        <div className="text-[10px] text-slate-500">Temperature</div>
                        <div className="text-sm font-bold text-rose-600">94°C</div>
                        <div className="text-[10px] text-rose-500 font-medium">Critical anomaly</div>
                      </div>
                      <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                        <div className="text-[10px] text-slate-500">Vibration</div>
                        <div className="text-sm font-bold text-rose-600">0.38g</div>
                        <div className="text-[10px] text-rose-500 font-medium">Above normal</div>
                      </div>
                    </div>
                  </div>

                  {/* Proposed Consequential Action */}
                  <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        Action Requires Authorization
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900">$420</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-snug">
                      Dispatch 1 × Bearing B-204 from Warehouse B (14 km away) to Plant A.
                    </p>
                    <div className="flex space-x-2 pt-1">
                      <button
                        onClick={onEnterApp}
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs"
                      >
                        Approve Dispatch
                      </button>
                      <button
                        onClick={onEnterApp}
                        className="px-3 py-1.5 border border-slate-300 bg-white text-slate-700 rounded text-xs font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card footer status */}
                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Status: Awaiting Supervisor</span>
                  <span>10:46 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Section */}
      <section id="capabilities" className="py-20 px-6 border-b border-slate-200 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Core Architecture</h2>
            <p className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Engineered as an operational control layer
            </p>
            <p className="text-sm text-slate-600">
              Not a chat bot or dashboard template. ExceptionOS is designed to manage real-world outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Mic,
                title: 'VOICE-FIRST',
                desc: 'Workers report problems naturally from the field. No complex dropdowns or manual asset lookup required.',
              },
              {
                icon: Cpu,
                title: 'OPERATIONAL CONTEXT',
                desc: 'Telemetry, assets, maintenance history, SOPs, and cross-warehouse inventory unified into a single operational state.',
              },
              {
                icon: ShieldCheck,
                title: 'CONTROLLED ACTION',
                desc: 'Autonomous investigation coordinates work, but consequential dispatches and expenditures require explicit human authorization.',
              },
              {
                icon: CheckCircle2,
                title: 'VERIFIED OUTCOMES',
                desc: "Don't assume the repair worked. The system independently verifies post-maintenance telemetry before closing the incident.",
              },
            ].map((pillar, i) => (
              <div key={i} className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
                  <pillar.icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold tracking-wider uppercase text-slate-900">{pillar.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8-Stage Operational Flow Section */}
      <section id="how-it-works" className="py-20 px-6 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">The Recovery Lifecycle</h2>
            <p className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              From voice report to verified physical resolution
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { num: '01', title: 'REPORT', desc: 'Worker speaks the issue' },
              { num: '02', title: 'UNDERSTAND', desc: 'Identifies asset & site' },
              { num: '03', title: 'INVESTIGATE', desc: 'Checks sensor telemetry' },
              { num: '04', title: 'PLAN', desc: 'Builds recovery action' },
              { num: '05', title: 'AUTHORIZE', desc: 'Requests human sign-off' },
              { num: '06', title: 'ACT', desc: 'Dispatches parts & assigns' },
              { num: '07', title: 'VERIFY', desc: 'Confirms physical drop' },
              { num: '08', title: 'RESOLVE', desc: 'Closes incident & audits' },
            ].map((step, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-[#f8fafc] text-center space-y-2">
                <div className="text-xs font-mono font-bold text-slate-400">{step.num}</div>
                <div className="text-xs font-bold text-slate-900 tracking-tight">{step.title}</div>
                <div className="text-[11px] text-slate-500 leading-snug">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions / Use Cases Section */}
      <section id="solutions" className="py-20 px-6 border-b border-slate-200 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Industry Applications</h2>
            <p className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Built for real operations
            </p>
            <p className="text-sm text-slate-600">
              Designed for the people who keep critical equipment and physical infrastructure running.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Factory,
                title: 'MANUFACTURING',
                tag: 'Keep production moving',
                desc: 'Overheating drives, hydraulic pressure loss, or conveyor jams are diagnosed in seconds. Compatible spares dispatched cross-plant.',
              },
              {
                icon: Wrench,
                title: 'INDUSTRIAL MAINTENANCE',
                tag: 'Turn symptoms into work orders',
                desc: 'Technicians describe anomalous vibrations or noise. The system links maintenance logs, checks wear cycles, and issues exact tasks.',
              },
              {
                icon: Truck,
                title: 'LOGISTICS & WAREHOUSING',
                tag: 'Prevent bottleneck delays',
                desc: 'Sorting line failures or automated crane interruptions trigger immediate alternative routing and technician dispatch.',
              },
              {
                icon: Building2,
                title: 'FACILITIES MANAGEMENT',
                tag: 'Chiller & HVAC anomalies',
                desc: 'Audited authorization rules prevent unauthorized $1,000+ emergency contractor callouts while resolving critical faults.',
              },
              {
                icon: HardHat,
                title: 'FIELD SERVICE',
                tag: 'Voice-native remote execution',
                desc: 'Hands-free operational incident submission directly from service vans or remote utility substations.',
              },
              {
                icon: Zap,
                title: 'UTILITIES & INFRASTRUCTURE',
                tag: 'Rapid outage coordination',
                desc: 'Structured incident creation and verifiable restoration checks for power, water, and distributed physical assets.',
              },
            ].map((sol, i) => (
              <div key={i} className="p-6 rounded-xl border border-slate-200 bg-white space-y-3 hover:border-slate-300 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
                    <sol.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">{sol.title}</h3>
                    <div className="text-[11px] font-medium text-slate-500">{sol.tag}</div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{sol.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to see ExceptionOS in action?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Experience the voice-to-verification operational workflow on your live system right now.
          </p>
          <div className="pt-2 flex justify-center space-x-4">
            <button
              onClick={onEnterApp}
              className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs sm:text-sm rounded-lg shadow-sm transition-colors flex items-center space-x-2"
            >
              <span>Launch Operations Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-slate-200 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
              EX
            </div>
            <span className="font-semibold text-slate-900">ExceptionOS</span>
            <span>&copy; {new Date().getFullYear()} ExceptionOS Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-slate-900">Privacy</a>
            <a href="#" className="hover:text-slate-900">Terms</a>
            <a href="#" className="hover:text-slate-900">Documentation</a>
            <a href="#" className="hover:text-slate-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
