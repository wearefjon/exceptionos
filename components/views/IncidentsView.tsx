'use client';

import React, { useState } from 'react';
import { Incident } from '@/lib/types';
import { Search, Plus, Filter } from 'lucide-react';

interface IncidentsViewProps {
  incidents: Incident[];
  onSelectIncident: (id: string) => void;
  onOpenNewIncident: () => void;
}

export default function IncidentsView({
  incidents,
  onSelectIncident,
  onOpenNewIncident,
}: IncidentsViewProps) {
  const [filterTab, setFilterTab] = useState<'All' | 'Open' | 'Investigating' | 'Awaiting auth' | 'Resolved'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIncidents = incidents.filter((incident) => {
    // Tab filter
    if (filterTab === 'Open' && incident.status !== 'OPEN') return false;
    if (filterTab === 'Investigating' && incident.status !== 'INVESTIGATING') return false;
    if (filterTab === 'Awaiting auth' && incident.status !== 'AWAITING_AUTHORIZATION') return false;
    if (filterTab === 'Resolved' && incident.status !== 'RESOLVED') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = incident.id.toLowerCase().includes(q);
      const matchTitle = incident.title.toLowerCase().includes(q);
      const matchAsset = incident.assetName.toLowerCase().includes(q);
      const matchReporter = incident.reporterName.toLowerCase().includes(q);
      return matchId || matchTitle || matchAsset || matchReporter;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Incidents</h1>
          <p className="text-xs text-slate-500 mt-1">Operational exception registry and real-time state tracking</p>
        </div>
        <button
          onClick={onOpenNewIncident}
          className="px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New incident</span>
        </button>
      </div>

      {/* Control Bar: Tabs + Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 border border-slate-200 bg-white p-1 rounded-lg self-start">
          {(['All', 'Open', 'Investigating', 'Awaiting auth', 'Resolved'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterTab === tab
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incidents, assets..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Incidents Operational Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Incident</th>
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Site</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
                    No incidents matching current criteria
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => {
                  const isAwaitingAuth = incident.status === 'AWAITING_AUTHORIZATION';
                  const isResolved = incident.status === 'RESOLVED';
                  return (
                    <tr
                      key={incident.id}
                      onClick={() => onSelectIncident(incident.id)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-600">{incident.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{incident.title}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-sm">{incident.description}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{incident.assetName}</td>
                      <td className="py-3.5 px-4 text-slate-500">{incident.siteName}</td>
                      <td className="py-3.5 px-4">
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
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-medium ${
                            isAwaitingAuth
                              ? 'bg-amber-100 text-amber-900 font-semibold'
                              : isResolved
                              ? 'bg-emerald-100 text-emerald-800 font-semibold'
                              : incident.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800 font-semibold'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {incident.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                        {incident.updatedAt}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Showing {filteredIncidents.length} of {incidents.length} incidents</span>
          <span>Click any row to open full operational investigation</span>
        </div>
      </div>
    </div>
  );
}
