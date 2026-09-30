'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { UserRole } from '@/lib/types';
import { ArrowLeft, Shield, CheckCircle2 } from 'lucide-react';

interface AuthPageProps {
  onBackToLanding: () => void;
  onSuccess: () => void;
}

export default function AuthPage({ onBackToLanding, onSuccess }: AuthPageProps) {
  const { switchUser, login, allUsers } = useAuth();
  const [email, setEmail] = useState('alex@acme.com');
  const [password, setPassword] = useState('••••••••••••');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    onSuccess();
  };

  const handleQuickRole = (role: UserRole) => {
    switchUser(role);
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Left Form Column */}
      <div className="flex-1 flex flex-col justify-between p-8 sm:p-12 lg:p-16 max-w-xl mx-auto w-full">
        <div>
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to website</span>
          </button>

          <div className="flex items-center space-x-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm tracking-tight">
              EX
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">ExceptionOS</span>
          </div>

          <div className="space-y-2 mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Sign into your operational console to manage incidents and authorizations.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <a href="#" className="text-xs text-slate-500 hover:text-slate-900">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              Sign In
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-400">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleQuickRole('Admin')}
              className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span>Continue with Enterprise SSO</span>
            </button>
          </form>

          {/* Instant Role Testing Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Quick Sign-in by Operational Role:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickRole(u.role)}
                  className="p-2.5 text-left rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-colors text-xs"
                >
                  <div className="font-semibold text-slate-900 flex items-center justify-between">
                    <span>{u.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-mono">
                      {u.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">{u.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 text-xs text-slate-400 text-center">
          Don&apos;t have an account? Contact your plant operations administrator.
        </div>
      </div>

      {/* Right Visual Column */}
      <div className="hidden lg:flex flex-1 bg-slate-900 text-white p-12 relative flex-col justify-between overflow-hidden">
        {/* Background industrial graphic pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
            <span>PLANT A · CNC & HYDRAULIC CELLS</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md space-y-4">
          <blockquote className="text-xl font-medium leading-relaxed tracking-tight text-slate-200">
            &ldquo;ExceptionOS gives our supervisors full control over parts dispatches while cutting our diagnostic-to-work-order time from 45 minutes to 30 seconds.&rdquo;
          </blockquote>
          <div>
            <div className="text-sm font-bold text-white">James Okoro</div>
            <div className="text-xs text-slate-400">Lead Reliability Technician · Acme Manufacturing</div>
          </div>
        </div>

        <div className="relative z-10 flex items-center space-x-6 text-xs text-slate-400 font-mono">
          <span>SOP-M007-BRG</span>
          <span>ISO 55000 ASSET MGMT</span>
          <span>SOC2 TYPE II</span>
        </div>
      </div>
    </div>
  );
}
