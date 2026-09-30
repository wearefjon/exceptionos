'use client';

import React, { useState } from 'react';
import { Incident, IncidentEvent, Authorization, WorkOrder } from '@/lib/types';
import { useAuth } from '../AuthContext';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Loader2,
  Wrench,
  Check,
  X,
  Truck,
  RotateCw,
} from 'lucide-react';

interface IncidentDetailViewProps {
  incident: Incident & {
    events?: IncidentEvent[];
    authorization?: Authorization;
    workOrder?: WorkOrder;
  };
  onBack: () => void;
  onRefresh: () => void;
}

export default function IncidentDetailView({
  incident,
  onBack,
  onRefresh,
}: IncidentDetailViewProps) {
  const { currentUser } = useAuth();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isCompletingWo, setIsCompletingWo] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const isSupervisorOrAdmin = currentUser?.role === 'Supervisor' || currentUser?.role === 'Admin';
  const isAwaitingAuth = incident.status === 'AWAITING_AUTHORIZATION';
  const isInProgress = incident.status === 'IN_PROGRESS';
  const isAwaitingVerification = incident.status === 'AWAITING_VERIFICATION';
  const isResolved = incident.status === 'RESOLVED';
  const isEscalated = incident.status === 'ESCALATED';

  // Approve Authorization
  const handleApprove = async () => {
    if (!incident.authorizationId) return;
    setIsApproving(true);
    setFeedbackMessage('');

    try {
      const res = await fetch('/api/authorizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authId: incident.authorizationId,
          action: 'approve',
          approverName: `${currentUser?.name} (${currentUser?.role})`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage('Dispatch approved. Work order created and dispatched.');
        onRefresh();
      }
    } catch {
      setFeedbackMessage('Failed to approve authorization.');
    } finally {
      setIsApproving(false);
    }
  };

  // Reject Authorization
  const handleReject = async () => {
    if (!incident.authorizationId) return;
    setIsRejecting(true);
    setFeedbackMessage('');

    try {
      const res = await fetch('/api/authorizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authId: incident.authorizationId,
          action: 'reject',
          approverName: `${currentUser?.name} (${currentUser?.role})`,
          reason: 'Rejected by operational supervisor during shift review.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage('Action rejected. Incident escalated.');
        onRefresh();
      }
    } catch {
      setFeedbackMessage('Failed to reject authorization.');
    } finally {
      setIsRejecting(false);
    }
  };

  // Mark Repair Complete (Transitions to Awaiting Verification)
  const handleCompleteRepair = async () => {
    if (!incident.workOrderId) return;
    setIsCompletingWo(true);
    setFeedbackMessage('');

    try {
      const res = await fetch('/api/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workOrderId: incident.workOrderId,
          action: 'complete',
          technicianName: currentUser?.name || 'James Okoro (Technician)',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage('Repair marked complete. System initiating verification.');
        onRefresh();
      }
    } catch {
      setFeedbackMessage('Failed to update work order.');
    } finally {
      setIsCompletingWo(false);
    }
  };

  // Verify and Resolve Loop
  const handleVerifyResolution = async () => {
    setIsVerifying(true);
    setFeedbackMessage('');

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId: incident.id }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage(data.message);
        onRefresh();
      }
    } catch {
      setFeedbackMessage('Failed to run verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Incidents</span>
        </button>
      </div>

      {/* Header matching Image 5 */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-sm font-bold text-slate-500">{incident.id}</span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {incident.title}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${
                incident.severity === 'Critical'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {incident.severity}
            </span>
            <span
              className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${
                isAwaitingAuth
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : isResolved
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : isInProgress
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {incident.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Operational Context Metadata */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 font-medium">Site:</span>{' '}
            <span className="font-semibold text-slate-900">{incident.siteName}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Asset:</span>{' '}
            <span className="font-semibold text-slate-900">{incident.assetName} ({incident.assetCode})</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Reporter:</span>{' '}
            <span className="font-semibold text-slate-900">{incident.reporterName}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Reported:</span>{' '}
            <span className="font-mono text-slate-900">{incident.createdAt}</span>
          </div>
        </div>

        {feedbackMessage && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>

      {/* CURRENT CONDITION / TELEMETRY CARD */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
          Current Condition & Telemetry
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="text-xs text-slate-500">Operating Temperature</div>
            <div className={`text-2xl font-bold font-mono ${incident.currentCondition.temperature > 80 ? 'text-rose-600' : 'text-slate-900'}`}>
              {incident.currentCondition.temperature}°C
            </div>
            <div className="text-[11px] font-medium text-rose-500">
              {incident.currentCondition.tempStatus} (Baseline &lt; 75°C)
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-500">Radial Vibration</div>
            <div className={`text-2xl font-bold font-mono ${incident.currentCondition.vibration > 0.25 ? 'text-rose-600' : 'text-slate-900'}`}>
              {incident.currentCondition.vibration}g
            </div>
            <div className="text-[11px] font-medium text-rose-500">
              {incident.currentCondition.vibStatus} (Baseline &lt; 0.15g)
            </div>
          </div>

          {/* Post-Repair / Verification section if present */}
          {incident.postRepairCondition && (
            <>
              <div className="space-y-1 border-l pl-4 border-slate-200">
                <div className="text-xs text-slate-500">Post-Repair Temp</div>
                <div className="text-2xl font-bold font-mono text-emerald-600">
                  {incident.postRepairCondition.temperature}°C
                </div>
                <div className="text-[11px] font-medium text-emerald-600">
                  ✓ Verified within bounds
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-500">Post-Repair Vibration</div>
                <div className="text-2xl font-bold font-mono text-emerald-600">
                  {incident.postRepairCondition.vibration}g
                </div>
                <div className="text-[11px] font-medium text-emerald-600">
                  ✓ Tolerance satisfied
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Split Content: AI Investigation / Proposed Action (Left) & Timeline (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Investigation + Consequential Action */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Investigation Block */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Operational Investigation
            </h2>
            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              {incident.investigationNotes.map((note, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Consequential Action & Authorization / Workflow Block */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Recovery Action & Execution
              </h2>
              {isAwaitingAuth && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                  Requires Authorization
                </span>
              )}
            </div>

            {/* Proposed action details */}
            {incident.proposedAction && (
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {incident.proposedAction.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {incident.proposedAction.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-slate-900">
                      ${incident.proposedAction.estimatedCost}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {incident.proposedAction.distanceKm} km transit
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400">Source:</span>{' '}
                    <span className="font-semibold text-slate-700">{incident.proposedAction.sourceWarehouse}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Destination:</span>{' '}
                    <span className="font-semibold text-slate-700">{incident.proposedAction.destinationSite}</span>
                  </div>
                </div>
              </div>
            )}

            {/* STATE 1: AWAITING AUTHORIZATION */}
            {isAwaitingAuth && (
              <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/50 space-y-3">
                <div className="flex items-center space-x-2 text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-semibold">
                    Awaiting human supervisor authorization
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  Rule triggered: Cross-warehouse parts dispatch (&gt; $250) requires explicit authorization by an authorized supervisor or plant administrator.
                </p>

                {/* Supervisor/Admin Action Controls */}
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={handleApprove}
                    disabled={isApproving || isRejecting}
                    className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                  >
                    {isApproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Approve Dispatch & Issue Work Order</span>
                  </button>

                  <button
                    onClick={handleReject}
                    disabled={isApproving || isRejecting}
                    className="py-2.5 px-4 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                  >
                    {isRejecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                    <span>Reject</span>
                  </button>
                </div>

                {!isSupervisorOrAdmin && (
                  <p className="text-[11px] text-amber-700 italic">
                    Note: Logged in as {currentUser?.name} ({currentUser?.role}). Switch to Supervisor or Admin to approve.
                  </p>
                )}
              </div>
            )}

            {/* STATE 2: IN PROGRESS (Work order active) */}
            {isInProgress && (
              <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                      Work Order Active: {incident.workOrderId || 'WO-2031'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-blue-700">Part in transit</span>
                </div>
                <p className="text-xs text-slate-600">
                  Assigned technician: <span className="font-semibold text-slate-900">James Okoro</span>.
                  Bearing B-204 dispatched from Warehouse B to Plant A.
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleCompleteRepair}
                    disabled={isCompletingWo}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                  >
                    {isCompletingWo ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Wrench className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>Mark Repair Complete & Initiate Verification</span>
                  </button>
                </div>
              </div>
            )}

            {/* STATE 3: AWAITING VERIFICATION */}
            {isAwaitingVerification && (
              <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/50 space-y-3">
                <div className="flex items-center space-x-2">
                  <RotateCw className="w-4 h-4 text-amber-600 animate-spin" />
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Awaiting Physical Outcome Verification
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Repair was marked complete by technician. ExceptionOS does not assume the repair succeeded — it independently verifies live sensor feedback against operating thresholds (T &le; 75°C, V &le; 0.15g).
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleVerifyResolution}
                    disabled={isVerifying}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>Run Verification & Close Operational Loop</span>
                  </button>
                </div>
              </div>
            )}

            {/* STATE 4: RESOLVED */}
            {isResolved && (
              <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/60 space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Operational Loop Closed · Incident Resolved
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-snug">
                  Telemetry verified at 71°C and 0.12g. Asset Machine 7 returned to Online status. Complete immutable audit trail preserved.
                </p>
              </div>
            )}

            {/* STATE 5: ESCALATED */}
            {isEscalated && (
              <div className="p-4 rounded-lg border border-rose-200 bg-rose-50/60 space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                    Incident Escalated
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-snug">
                  Authorization was rejected or verification criteria failed. Escalated for manual engineering review.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Activity Timeline */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Incident Timeline
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              {incident.events?.length || 0} events
            </span>
          </div>

          <div className="space-y-4">
            {incident.events && incident.events.length > 0 ? (
              incident.events.map((evt) => (
                <div
                  key={evt.id}
                  className="relative pl-5 pb-3 border-l border-slate-200 last:border-0 last:pb-0"
                >
                  <span className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full border-2 border-white bg-slate-500" />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{evt.timestamp}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{evt.actor}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 mt-0.5">{evt.title}</div>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{evt.description}</p>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center">No timeline events recorded</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
