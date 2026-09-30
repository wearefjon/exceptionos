'use client';

import React, { useState } from 'react';
import { Authorization } from '@/lib/types';
import { useAuth } from '../AuthContext';
import { ShieldCheck, Clock, Check, X, Loader2, ArrowRight } from 'lucide-react';

interface AuthorizationsViewProps {
  authorizations: Authorization[];
  onSelectIncident: (incidentId: string) => void;
  onRefresh: () => void;
}

export default function AuthorizationsView({
  authorizations,
  onSelectIncident,
  onRefresh,
}: AuthorizationsViewProps) {
  const { currentUser } = useAuth();
  const [selectedAuth, setSelectedAuth] = useState<Authorization | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState('');

  const pendingCount = authorizations.filter((a) => a.status === 'PENDING').length;
  const isSupervisorOrAdmin = currentUser?.role === 'Supervisor' || currentUser?.role === 'Admin';

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedAuth) return;
    setIsProcessing(true);
    setFeedback('');

    try {
      const res = await fetch('/api/authorizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authId: selectedAuth.id,
          action,
          approverName: `${currentUser?.name} (${currentUser?.role})`,
          reason: action === 'reject' ? 'Supervisor denied action' : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Action successfully ${action}d.`);
        setSelectedAuth(null);
        onRefresh();
      }
    } catch {
      setFeedback('Failed to execute authorization action.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Authorizations</h1>
        <p className="text-xs text-slate-500 mt-1">
          Human-in-the-loop control for consequential actions, dispatches, and expenditures
        </p>
      </div>

      {/* Counter banner */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">
              {pendingCount} {pendingCount === 1 ? 'action requires' : 'actions require'} your attention
            </div>
            <div className="text-[11px] text-slate-500">
              Actions above $250 or impacting machine runtime require supervisor approval
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
          {feedback}
        </div>
      )}

      {/* Authorizations Queue matching Section 20 */}
      <div className="space-y-4">
        {authorizations.map((auth) => {
          const isPending = auth.status === 'PENDING';
          const isApproved = auth.status === 'APPROVED';
          return (
            <div
              key={auth.id}
              className={`p-6 rounded-xl border transition-all ${
                isPending ? 'border-amber-200 bg-white shadow-xs' : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{auth.incidentId}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isPending
                          ? 'bg-amber-100 text-amber-900'
                          : isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {auth.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{auth.proposedAction}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{auth.reason}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <div>
                      <span className="text-slate-400">Route:</span>{' '}
                      <span className="font-semibold text-slate-700">
                        {auth.fromLocation || 'Local'} → {auth.toLocation || 'Site'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Asset:</span>{' '}
                      <span className="font-semibold text-slate-700">{auth.affectedAsset}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Requested:</span>{' '}
                      <span className="font-mono text-slate-700">{auth.requestedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right space-y-2 shrink-0">
                  <div className="text-lg font-mono font-bold text-slate-900">${auth.estimatedCost}</div>
                  {isPending ? (
                    <button
                      onClick={() => setSelectedAuth(auth)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      Review Action
                    </button>
                  ) : (
                    <div className="text-[11px] text-slate-500">
                      Decided by {auth.decidedBy}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Modal matching section 20 */}
      {selectedAuth && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  Consequential Action Authorization
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedAuth.proposedAction}</h3>
              </div>
              <button
                onClick={() => setSelectedAuth(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3 text-slate-700">
              <div>
                <div className="font-semibold text-slate-900 mb-0.5">Operational Rationale:</div>
                <p className="p-2.5 rounded bg-slate-50 border border-slate-200">{selectedAuth.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-400">Transfer Transit:</span>
                  <div className="font-semibold text-slate-900">
                    {selectedAuth.fromLocation} → {selectedAuth.toLocation}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Estimated Cost:</span>
                  <div className="font-mono font-bold text-slate-900">${selectedAuth.estimatedCost}</div>
                </div>
              </div>

              <div>
                <span className="text-slate-400">Related Incident:</span>
                <div className="font-mono font-semibold text-slate-900">{selectedAuth.incidentId}</div>
              </div>
            </div>

            {/* Approval Controls */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleAction('approve')}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-sm disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Approve</span>
                </button>

                <button
                  onClick={() => handleAction('reject')}
                  disabled={isProcessing}
                  className="py-2.5 px-4 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium disabled:opacity-50"
                >
                  Reject
                </button>
              </div>

              {!isSupervisorOrAdmin && (
                <div className="text-[11px] text-amber-700 italic text-center">
                  Logged in as {currentUser?.name} ({currentUser?.role}). Supervisors or Admins can approve.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
