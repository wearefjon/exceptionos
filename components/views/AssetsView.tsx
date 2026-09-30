'use client';

import React, { useState } from 'react';
import { Asset } from '@/lib/types';
import { Search, Plus, Activity, Clock, Wrench, X, ShieldAlert } from 'lucide-react';

interface AssetsViewProps {
  assets: Asset[];
  onSelectAssetIncident?: (assetId: string) => void;
}

export default function AssetsView({ assets, onSelectAssetIncident }: AssetsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [siteFilter, setSiteFilter] = useState('All sites');
  const [typeFilter, setTypeFilter] = useState('All types');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const filteredAssets = assets.filter((asset) => {
    if (siteFilter !== 'All sites' && asset.siteName !== siteFilter) return false;
    if (typeFilter !== 'All types' && asset.type !== typeFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        asset.name.toLowerCase().includes(q) ||
        asset.assetCode.toLowerCase().includes(q) ||
        asset.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assets</h1>
          <p className="text-xs text-slate-500 mt-1">Physical machine registry, live sensor feeds, and lifecycle tracking</p>
        </div>
        <button
          onClick={() => alert('New physical asset onboarding requires administrative registry access.')}
          className="px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add asset</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option>All sites</option>
            <option>Plant A</option>
            <option>Plant B</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option>All types</option>
            <option>Machine</option>
            <option>Conveyor</option>
            <option>Press</option>
            <option>Compressor</option>
            <option>Motor</option>
          </select>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Assets Table matching Image 7 */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Site</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.map((asset) => {
                const isWarning = asset.status === 'Warning';
                const isMaintenance = asset.status === 'Maintenance';
                return (
                  <tr
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{asset.name}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-500">{asset.assetCode}</td>
                    <td className="py-3.5 px-4 text-slate-600">{asset.type}</td>
                    <td className="py-3.5 px-4 text-slate-600">{asset.siteName}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          isWarning
                            ? 'bg-rose-100 text-rose-800'
                            : isMaintenance
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-600">
                      {asset.telemetry.temperature}°C · {asset.telemetry.vibration}g
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Machine Record Drawer matching Section 16 */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-slate-500">{selectedAsset.assetCode}</span>
                <h2 className="text-xl font-bold text-slate-900">{selectedAsset.name}</h2>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                    selectedAsset.status === 'Warning'
                      ? 'bg-rose-100 text-rose-800'
                      : selectedAsset.status === 'Maintenance'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {selectedAsset.status}
                </span>
                <button onClick={() => setSelectedAsset(null)} className="p-1 rounded text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-500">
              {selectedAsset.description} · <span className="font-semibold text-slate-900">{selectedAsset.siteName}</span>
            </div>

            {/* Current Telemetry */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Telemetry</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="text-[10px] text-slate-500">Temperature</div>
                  <div className="text-lg font-mono font-bold text-slate-900">{selectedAsset.telemetry.temperature}°C</div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="text-[10px] text-slate-500">Vibration</div>
                  <div className="text-lg font-mono font-bold text-slate-900">{selectedAsset.telemetry.vibration}g</div>
                </div>
                {selectedAsset.telemetry.pressure && (
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="text-[10px] text-slate-500">Pressure</div>
                    <div className="text-lg font-mono font-bold text-slate-900">{selectedAsset.telemetry.pressure} bar</div>
                  </div>
                )}
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="text-[10px] text-slate-500">Runtime</div>
                  <div className="text-lg font-mono font-bold text-slate-900">{selectedAsset.telemetry.runtimeHours} h</div>
                </div>
              </div>
            </div>

            {/* Maintenance History */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Maintenance History</div>
              <div className="space-y-2">
                {selectedAsset.maintenanceHistory.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">{item.event}</div>
                      {item.hoursAgo && (
                        <div className="text-[10px] text-slate-400">{item.hoursAgo} operating hours ago</div>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Dates */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between">
              <div>
                <span className="text-slate-400">Last Service:</span>{' '}
                <span className="font-semibold text-slate-700">{selectedAsset.lastService}</span>
              </div>
              <div>
                <span className="text-slate-400">Next Scheduled:</span>{' '}
                <span className="font-semibold text-slate-700">{selectedAsset.nextService}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
