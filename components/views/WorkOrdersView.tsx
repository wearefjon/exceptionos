'use client';

import React, { useState } from 'react';
import { WorkOrder } from '@/lib/types';
import { Search, Plus, Wrench, CheckCircle2, Clock, User, Package } from 'lucide-react';

interface WorkOrdersViewProps {
  workOrders: WorkOrder[];
  onSelectIncident: (incidentId: string) => void;
  onRefresh: () => void;
}

export default function WorkOrdersView({
  workOrders,
  onSelectIncident,
  onRefresh,
}: WorkOrdersViewProps) {
  const [filterTab, setFilterTab] = useState<'All' | 'Open' | 'In Progress' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWo, setSelectedWo] = useState<WorkOrder | null>(null);

  const filteredOrders = workOrders.filter((wo) => {
    if (filterTab === 'Open' && wo.status !== 'Open') return false;
    if (filterTab === 'In Progress' && wo.status !== 'In Progress') return false;
    if (filterTab === 'Completed' && wo.status !== 'Completed') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        wo.id.toLowerCase().includes(q) ||
        wo.title.toLowerCase().includes(q) ||
        wo.assetName.toLowerCase().includes(q) ||
        wo.assignedToName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Work Orders</h1>
          <p className="text-xs text-slate-500 mt-1">Field execution, technician assignments, and parts tracking</p>
        </div>
        <button
          onClick={() => alert('New work orders are generated automatically when recovery authorizations are approved.')}
          className="px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New work order</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center space-x-1 border border-slate-200 bg-white p-1 rounded-lg self-start">
          {(['All', 'Open', 'In Progress', 'Completed'] as const).map((tab) => (
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

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search work orders, assets..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Work Orders Table matching Image 6 */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
                    No work orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((wo) => {
                  const isInProgress = wo.status === 'In Progress';
                  const isCompleted = wo.status === 'Completed';
                  return (
                    <tr
                      key={wo.id}
                      onClick={() => setSelectedWo(wo)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-600">{wo.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{wo.title}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-sm">{wo.description}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {wo.assetName} <span className="text-slate-400">({wo.assetCode})</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="inline-flex items-center space-x-1.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{wo.assignedToName}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800 font-semibold'
                              : isInProgress
                              ? 'bg-blue-100 text-blue-800 font-semibold'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {wo.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            wo.priority === 'Critical'
                              ? 'bg-rose-100 text-rose-800'
                              : wo.priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {wo.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                        {wo.createdAt}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Work Order Modal / Drawer matching section 14 */}
      {selectedWo && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-slate-500">{selectedWo.id}</span>
                <h3 className="text-base font-bold text-slate-900">{selectedWo.title}</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
                {selectedWo.status}
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <div>
                <span className="text-slate-400">Asset:</span>{' '}
                <span className="font-semibold text-slate-900">{selectedWo.assetName} · {selectedWo.siteName}</span>
              </div>
              <div>
                <span className="text-slate-400">Assigned Technician:</span>{' '}
                <span className="font-semibold text-slate-900">{selectedWo.assignedToName}</span>
              </div>
              <div>
                <span className="text-slate-400">Priority:</span>{' '}
                <span className="font-semibold text-slate-900">{selectedWo.priority}</span>
              </div>
              <div>
                <span className="text-slate-400">Task Scope:</span>{' '}
                <p className="mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-700">
                  {selectedWo.description}
                </p>
              </div>

              {/* Required parts */}
              {selectedWo.requiredParts && selectedWo.requiredParts.length > 0 && (
                <div className="pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Dispatched Parts
                  </div>
                  {selectedWo.requiredParts.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center space-x-2">
                        <Package className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-semibold text-slate-800">{p.name}</span>
                      </div>
                      <span className="font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
                        {p.quantity} × {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  onSelectIncident(selectedWo.incidentId);
                  setSelectedWo(null);
                }}
                className="text-xs font-semibold text-slate-900 hover:text-blue-600"
              >
                Open Linked Incident {selectedWo.incidentId} →
              </button>
              <button
                onClick={() => setSelectedWo(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded bg-slate-100 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
