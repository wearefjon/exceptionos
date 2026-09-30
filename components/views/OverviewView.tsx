'use client';

import React from 'react';
import { Incident, AuditLog } from '@/lib/types';
import { ArrowRight, AlertTriangle, Clock, Wrench, CheckCircle2, ChevronRight } from 'lucide-react';

interface OverviewViewProps {
  metrics: {
    criticalIncidents: number;
    awaitingAuthorization: number;
    workOrdersInProgress: number;
    verificationFailed: number;
    activeIncidentsCount: number;
    totalAssetsCount: number;
  };
  recentIncidents: Incident[];
  recentActivity: AuditLog[];
  onSelectIncident: (id: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenVoice: () => void;
  onOpenNewIncident: () => void;
}

export default function OverviewView({
  metrics,
  recentIncidents,
  recentActivity,
  onSelectIncident,
  onNavigateTab,
  onOpenVoice,
  onOpenNewIncident,
}: OverviewViewProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h1>
          <p className="text-xs text-slate-500 mt-1">Operations at a glance. What needs attention?</p>
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="text-xs font-mono font-medium text-slate-500 px-2.5 py-1 rounded bg-slate-100 border border-slate-200">
            Plant A · Today
          </span>
          <button
            onClick={onOpenNewIncident}
            className="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs transition-colors"
          >
            + New Incident
          </button>
        </div>
      </div>

      {/* 4 Metric Tiles matching Image 3 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical Incidents */}
        <div
          onClick={() => onNavigateTab('incidents')}
          className="p-5 rounded-xl border border-rose-200 bg-white hover:border-rose-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-2xl font-extrabold tracking-tight font-mono">{metrics.criticalIncidents}</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xs font-semibold text-slate-800">Critical incidents</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Requiring urgent containment</p>
        </div>

        {/* Awaiting Authorization */}
        <div
          onClick={() => onNavigateTab('authorizations')}
          className="p-5 rounded-xl border border-amber-200 bg-white hover:border-amber-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-2xl font-extrabold tracking-tight font-mono">{metrics.awaitingAuthorization}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xs font-semibold text-slate-800">Awaiting authorization</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Pending supervisor sign-off</p>
        </div>

        {/* Work Orders in progress */}
        <div
          onClick={() => onNavigateTab('work-orders')}
          className="p-5 rounded-xl border border-blue-200 bg-white hover:border-blue-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-2xl font-extrabold tracking-tight font-mono">{metrics.workOrdersInProgress}</span>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xs font-semibold text-slate-800">Work orders in progress</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Technicians active in field</p>
        </div>

        {/* Verification failed / Escalate */}
        <div
          onClick={() => onNavigateTab('incidents')}
          className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-700 mb-2">
            <span className="text-2xl font-extrabold tracking-tight font-mono">{metrics.verificationFailed}</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xs font-semibold text-slate-800">Verification failed</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Post-repair tolerance checks</p>
        </div>
      </div>

      {/* Main Grid: Needs Attention Table + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Needs Attention Table (8 cols) */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Recent incidents</h2>
              <p className="text-[11px] text-slate-500">Live operational events requiring review</p>
            </div>
            <button
              onClick={() => onNavigateTab('incidents')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2.5 px-4">ID</th>
                  <th className="py-2.5 px-4">Title</th>
                  <th className="py-2.5 px-4">Asset</th>
                  <th className="py-2.5 px-4">Severity</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentIncidents.map((incident) => {
                  const isAwaitingAuth = incident.status === 'AWAITING_AUTHORIZATION';
                  const isResolved = incident.status === 'RESOLVED';
                  return (
                    <tr
                      key={incident.id}
                      onClick={() => onSelectIncident(incident.id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">{incident.id}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-[200px] truncate">
                        {incident.title}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{incident.assetName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            incident.severity === 'Critical'
                              ? 'bg-rose-100 text-rose-800'
                              : incident.severity === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : incident.severity === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {incident.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                            isAwaitingAuth
                              ? 'bg-amber-100 text-amber-900 font-semibold'
                              : isResolved
                              ? 'bg-emerald-100 text-emerald-800 font-semibold'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {incident.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                        {incident.updatedAt}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Operational Activity (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Recent Activity</h2>
            <button
              onClick={() => onNavigateTab('activity')}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-900"
            >
              Audit log →
            </button>
          </div>

          <div className="space-y-4">
            {recentActivity.map((log) => (
              <div key={log.id} className="relative pl-5 pb-3 border-l border-slate-200 last:border-0 last:pb-0">
                <span className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full border-2 border-white bg-slate-400" />
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{log.timeFormatted}</span>
                  <span className="text-[10px] uppercase">{log.category}</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{log.title}</div>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-2">{log.description}</p>
              </div>
            ))}
          </div>

          {/* Quick Voice Bar */}
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={onOpenVoice}
              className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 flex items-center justify-between transition-colors"
            >
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Talk to ExceptionOS</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
