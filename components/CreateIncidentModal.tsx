'use client';

import React, { useState } from 'react';
import { X, Mic, AlertCircle, Loader2 } from 'lucide-react';
import { Asset } from '@/lib/types';

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (incidentId: string) => void;
  assets: Asset[];
  onOpenVoice: () => void;
}

export default function CreateIncidentModal({
  isOpen,
  onClose,
  onCreated,
  assets,
  onOpenVoice,
}: CreateIncidentModalProps) {
  const [description, setDescription] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(assets[0]?.assetCode || 'M-007');
  const [site, setSite] = useState('Plant A');
  const [severity, setSeverity] = useState<'Auto-detect' | 'Critical' | 'High' | 'Medium' | 'Low'>('Auto-detect');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please describe what happened');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: description.slice(0, 60),
          description,
          assetIdentifier: selectedAsset,
          severity: severity === 'Auto-detect' ? undefined : severity,
          reporterName: 'Operator',
        }),
      });

      const data = await res.json();
      if (data.success && data.incident) {
        onCreated(data.incident.id);
        onClose();
      } else {
        setError(data.error || 'Failed to create incident');
      }
    } catch {
      setError('Network error while creating incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">New Incident</h3>
            <p className="text-xs text-slate-500">Report an operational exception for autonomous investigation</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">What happened?</label>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenVoice();
                }}
                className="text-xs font-medium text-slate-900 hover:text-blue-600 flex items-center space-x-1"
              >
                <Mic className="w-3.5 h-3.5 text-rose-500" />
                <span>Talk instead</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Machine 7 is overheating and vibrating more than usual..."
              className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Asset</label>
              <select
                value={selectedAsset}
                onChange={(e) => {
                  setSelectedAsset(e.target.value);
                  const found = assets.find((a) => a.assetCode === e.target.value);
                  if (found) setSite(found.siteName);
                }}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              >
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.assetCode}>
                    {asset.name} ({asset.assetCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Site</label>
              <input
                type="text"
                readOnly
                value={site}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            >
              <option value="Auto-detect">Auto-detect based on telemetry and SOP</option>
              <option value="Critical">Critical (Immediate shutdown / seizure risk)</option>
              <option value="High">High (Significant operational degradation)</option>
              <option value="Medium">Medium (Maintenance threshold warning)</option>
              <option value="Low">Low (Informational / minor anomaly)</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create incident</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
