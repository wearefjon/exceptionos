'use client';

import React, { useState } from 'react';
import { AuditLog } from '@/lib/types';
import { Clock, Shield, Wrench, AlertCircle, Cpu } from 'lucide-react';

interface ActivityViewProps {
  auditLogs: AuditLog[];
  onSelectIncident?: (incidentId: string) => void;
}

export default function ActivityView({ auditLogs, onSelectIncident }: ActivityViewProps) {
  const [activeTab, setActiveTab] = useState<'All' | 'Incidents' | 'Work Orders' | 'Authorizations' | 'System'>('All');

  const filteredLogs = auditLogs.filter((log) => {
    if (activeTab === 'All') return true;
    return log.category.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Activity</h1>
        <p className="text-xs text-slate-500 mt-1">Immutable operational audit trail, AI tool calls, and human approvals</p>
      </div>

      {/* Filter Tabs matching Image 9 */}
      <div className="flex items-center space-x-1 border border-slate-200 bg-white p-1 rounded-lg self-start">
        {(['All', 'Incidents', 'Work Orders', 'Authorizations', 'System'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === tab
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Activity Timeline matching Image 9 */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs p-6">
        <div className="space-y-6 max-w-3xl">
          {filteredLogs.map((log) => {
            const isAuth = log.category === 'Authorizations';
            const isWo = log.category === 'Work Orders';
            const isIncident = log.category === 'Incidents';

            return (
              <div key={log.id} className="relative pl-7 pb-6 border-l border-slate-200 last:border-0 last:pb-0">
                <span
                  className={`absolute -left-2 top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                    isAuth ? 'bg-amber-500' : isWo ? 'bg-blue-500' : isIncident ? 'bg-slate-800' : 'bg-slate-400'
                  }`}
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-700">{log.timeFormatted}</span>
                    <span>·</span>
                    <span className="uppercase tracking-wider">{log.category}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{log.actor}</span>
                </div>

                <div className="text-xs font-bold text-slate-900">{log.title}</div>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">{log.description}</p>

                {log.targetId && (log.targetId.startsWith('INC-') || log.targetId.startsWith('WO-')) && (
                  <button
                    onClick={() => onSelectIncident && onSelectIncident(log.targetId)}
                    className="mt-2 text-[11px] font-semibold text-slate-800 hover:text-blue-600 underline underline-offset-2"
                  >
                    View {log.targetId} →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
