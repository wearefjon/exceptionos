'use client';

import React, { useState } from 'react';
import { InventoryItem } from '@/lib/types';
import { Search, Package, MapPin, CheckCircle, X } from 'lucide-react';

interface InventoryViewProps {
  inventory: InventoryItem[];
}

export default function InventoryView({ inventory }: InventoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('All warehouses');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [selectedPart, setSelectedPart] = useState<InventoryItem | null>(null);

  const filteredItems = inventory.filter((item) => {
    if (warehouseFilter !== 'All warehouses' && item.warehouse !== warehouseFilter) return false;
    if (categoryFilter !== 'All categories' && item.category !== categoryFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.partCode.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory</h1>
          <p className="text-xs text-slate-500 mt-1">Cross-warehouse spare parts stock, locations, and asset compatibility</p>
        </div>
      </div>

      {/* Control Bar matching Image 8 */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option>All warehouses</option>
            <option>Plant A</option>
            <option>Plant B</option>
            <option>Warehouse B</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option>All categories</option>
            <option>Drive Bearings</option>
            <option>Belts & Drives</option>
            <option>Filtration</option>
            <option>Electrical</option>
            <option>Instrumentation</option>
          </select>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search parts..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Inventory Table matching Image 8 */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-3 px-4">Part</th>
                <th className="py-3 px-4">Part ID</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Unit Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const isOutOfStock = item.quantity === 0;
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedPart(item)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{item.name}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-500">{item.partCode}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-mono font-bold ${
                          isOutOfStock ? 'text-rose-600' : 'text-slate-900'
                        }`}
                      >
                        {item.quantity}
                      </span>
                      {isOutOfStock && (
                        <span className="ml-2 text-[10px] text-rose-500 font-semibold uppercase">
                          Exhausted
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{item.warehouse}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{item.locationBin}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-900">
                      ${item.unitCost}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Part Detail Drawer matching section 18 */}
      {selectedPart && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-slate-500">{selectedPart.partCode}</span>
                <h2 className="text-xl font-bold text-slate-900">{selectedPart.name}</h2>
              </div>
              <button onClick={() => setSelectedPart(null)} className="p-1 rounded text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed">
              {selectedPart.description} · <span className="font-semibold text-slate-900">${selectedPart.unitCost}</span>
            </div>

            {/* Warehouse Stock */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Inventory Distribution</div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">{selectedPart.warehouse}</span>
                  <span className="font-mono font-bold text-slate-900">{selectedPart.quantity} units</span>
                </div>
                <div className="text-[11px] text-slate-400">Bin Location: {selectedPart.locationBin}</div>
              </div>
            </div>

            {/* Compatibility list */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Asset Compatibility</div>
              <div className="space-y-1.5">
                {selectedPart.compatibleAssetCodes.map((code, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                    <span className="font-medium text-slate-800">Asset {code}</span>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Movement */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recent Movement</div>
              <div className="text-xs space-y-2 text-slate-600 font-mono">
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-400">Sep 28</div>
                  <div>Warehouse B → Plant A · Transfer reserved</div>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-400">Sep 20</div>
                  <div>Supplier Inbound Delivery · Received × 10 units</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
