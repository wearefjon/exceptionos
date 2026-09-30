'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { UserRole } from '@/lib/types';
import {
  LayoutDashboard,
  AlertCircle,
  Wrench,
  Boxes,
  Activity,
  ShieldCheck,
  Settings,
  Mic,
  Search,
  Bell,
  LogOut,
  ChevronDown,
  User,
  Menu,
  X,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

interface AppShellProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenVoice: () => void;
  onViewLanding?: () => void;
  onResetDemo?: () => void;
  pendingAuthCount: number;
  criticalIncidentCount: number;
  children: React.ReactNode;
}

export default function AppShell({
  currentTab,
  onNavigate,
  onOpenVoice,
  onViewLanding,
  onResetDemo,
  pendingAuthCount,
  criticalIncidentCount,
  children,
}: AppShellProps) {
  const { currentUser, switchUser, logout, allUsers } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'incidents', label: 'Incidents', icon: AlertCircle, badge: criticalIncidentCount > 0 ? criticalIncidentCount : undefined, badgeColor: 'bg-rose-500' },
    { id: 'work-orders', label: 'Work Orders', icon: Wrench },
    { id: 'assets', label: 'Assets', icon: Boxes },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'authorizations', label: 'Authorizations', icon: ShieldCheck, badge: pendingAuthCount > 0 ? pendingAuthCount : undefined, badgeColor: 'bg-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* SIDEBAR (Desktop) matching Image 3 & section 7 */}
      <aside className="hidden lg:flex w-64 bg-[#0b121e] text-slate-300 flex-col justify-between shrink-0 border-r border-slate-800">
        <div>
          {/* Logo / Header */}
          <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-800/80">
            <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center text-slate-950 font-bold text-xs tracking-tight">
              EX
            </div>
            <span className="font-bold text-sm text-white tracking-tight">ExceptionOS</span>
          </div>

          {/* Primary Navigation */}
          <div className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-white ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Special Section: Talk to ExceptionOS */}
          <div className="px-3 pt-3">
            <button
              onClick={onOpenVoice}
              className="w-full py-2.5 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700/80 text-white text-xs font-semibold flex items-center justify-between group transition-all"
            >
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Talk to ExceptionOS</span>
              </div>
              <Mic className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Bottom Section: Settings & User Profile Badge */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <button
            onClick={() => onNavigate('settings')}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              currentTab === 'settings'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>

          {/* User Profile dropdown */}
          <div className="relative pt-1">
            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-2.5 rounded-lg hover:bg-slate-900/80 cursor-pointer flex items-center justify-between transition-colors border border-transparent hover:border-slate-800"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <div className="text-left overflow-hidden">
                  <div className="text-xs font-semibold text-white truncate max-w-[120px]">
                    {currentUser?.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {currentUser?.role} · Acme Mfg
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </div>

            {/* Role switch popup menu */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl border border-slate-200 py-1 text-xs text-slate-800 z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Switch Operational Role:
                </div>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.role);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between ${
                      currentUser?.role === u.role ? 'font-bold text-slate-900 bg-slate-50' : 'text-slate-700'
                    }`}
                  >
                    <span>{u.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {u.role}
                    </span>
                  </button>
                ))}
                <div className="border-t border-slate-100 mt-1 pt-1 space-y-0.5">
                  {onViewLanding && (
                    <button
                      onClick={() => {
                        onViewLanding();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium flex items-center space-x-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span>Public Landing Page</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 font-medium flex items-center space-x-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar matching Image 3 */}
        <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center space-x-4 flex-1 max-w-xl">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search incidents, assets, work orders..."
                className="w-full text-xs pl-9 pr-12 py-2 rounded-lg border border-slate-200 bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
              <span className="absolute right-3 top-2.5 text-[10px] font-mono text-slate-400 border border-slate-200 px-1 rounded">
                ⌘K
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Landing Page link */}
            {onViewLanding && (
              <button
                onClick={onViewLanding}
                className="hidden md:inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                title="View Public Marketing Landing Page"
              >
                <span>Landing Page</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
            )}

            {/* Demo Environment Badge */}
            <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
              Demo Environment
            </span>

            {/* Deterministic Demo Fallback: Load Machine 7 */}
            {onResetDemo && (
              <button
                onClick={onResetDemo}
                className="hidden lg:inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                title="Load Seeded Machine 7 Incident State"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Load Machine 7</span>
              </button>
            )}

            {/* Plant Site indicator */}
            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-600 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Plant A · Online</span>
            </div>

            {/* Quick Voice Launch */}
            <button
              onClick={onOpenVoice}
              className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center space-x-1"
              title="Voice Agent"
            >
              <Mic className="w-4 h-4 text-rose-500" />
            </button>

            {/* Notifications */}
            <button
              onClick={() => onNavigate('authorizations')}
              className="relative p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              title="Authorizations requiring attention"
            >
              <Bell className="w-4 h-4" />
              {pendingAuthCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* MOBILE SIDEBAR DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-64 max-w-xs bg-[#0b121e] text-slate-300 flex flex-col justify-between p-4 z-10 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded bg-white text-slate-900 font-bold text-xs flex items-center justify-center">
                    EX
                  </div>
                  <span className="font-bold text-white text-sm">ExceptionOS</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1 mt-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium ${
                      currentTab === item.id ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] text-white ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenVoice();
                  }}
                  className="w-full py-2.5 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-semibold flex items-center space-x-2"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Talk to ExceptionOS</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  onNavigate('settings');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 text-xs text-slate-400 hover:text-white p-2"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <div className="text-xs text-slate-500 font-mono">
                {currentUser?.name} · {currentUser?.role}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
