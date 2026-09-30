'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from '@/components/AuthContext';
import AppShell from '@/components/AppShell';
import LandingPage from '@/components/LandingPage';
import AuthPage from '@/components/AuthPage';
import VoiceDrawer from '@/components/VoiceDrawer';
import CreateIncidentModal from '@/components/CreateIncidentModal';

// Views
import OverviewView from '@/components/views/OverviewView';
import IncidentsView from '@/components/views/IncidentsView';
import IncidentDetailView from '@/components/views/IncidentDetailView';
import WorkOrdersView from '@/components/views/WorkOrdersView';
import AssetsView from '@/components/views/AssetsView';
import InventoryView from '@/components/views/InventoryView';
import ActivityView from '@/components/views/ActivityView';
import AuthorizationsView from '@/components/views/AuthorizationsView';
import SettingsView from '@/components/views/SettingsView';

import { Incident, Asset, WorkOrder, InventoryItem, AuditLog, Authorization } from '@/lib/types';
import { Loader2 } from 'lucide-react';

function ExceptionOSApp() {
  const { isAuthenticated } = useAuth();
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [currentTab, setCurrentTab] = useState('overview');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'app' | 'landing' | 'auth'>('landing');

  // Drawers & Modals
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState(false);

  // Operational Data State
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    criticalIncidents: 0,
    awaitingAuthorization: 0,
    workOrdersInProgress: 0,
    verificationFailed: 0,
    activeIncidentsCount: 0,
    totalAssetsCount: 0,
  });
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [authorizations, setAuthorizations] = useState<Authorization[]>([]);

  // Fetch all state from persistent API
  const refreshData = useCallback(async () => {
    try {
      const [ovRes, incRes, astRes, woRes, invRes, audRes, authRes] = await Promise.all([
        fetch('/api/overview'),
        fetch('/api/incidents'),
        fetch('/api/assets'),
        fetch('/api/work-orders'),
        fetch('/api/inventory'),
        fetch('/api/audit'),
        fetch('/api/authorizations'),
      ]);

      const [ov, inc, ast, wo, inv, aud, auth] = await Promise.all([
        ovRes.json(),
        incRes.json(),
        astRes.json(),
        woRes.json(),
        invRes.json(),
        audRes.json(),
        authRes.json(),
      ]);

      if (ov.success) setMetrics(ov.metrics);
      if (inc.success) setIncidents(inc.incidents);
      if (ast.success) setAssets(ast.assets);
      if (wo.success) setWorkOrders(wo.workOrders);
      if (inv.success) setInventory(inv.inventory);
      if (aud.success) setAuditLogs(aud.auditLogs);
      if (auth.success) setAuthorizations(auth.authorizations);
    } catch (err) {
      console.error('Failed to load operational state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handler when voice creates an incident
  const handleIncidentCreatedByVoice = (incidentId: string) => {
    refreshData();
    setSelectedIncidentId(incidentId);
    setCurrentTab('incidents');
    setViewMode('app');
  };

  // If user selected Landing Page mode
  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage
          onEnterApp={() => setViewMode('app')}
          onOpenVoiceDemo={() => setIsVoiceOpen(true)}
          onGoToAuth={() => setViewMode('auth')}
        />
        <VoiceDrawer
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
          onIncidentCreated={handleIncidentCreatedByVoice}
        />
      </>
    );
  }

  // If user selected Auth mode or is not authenticated
  if (viewMode === 'auth' || !isAuthenticated) {
    return (
      <AuthPage
        onBackToLanding={() => setViewMode('landing')}
        onSuccess={() => setViewMode('app')}
      />
    );
  }

  // Authenticated Application (viewMode === 'app')
  const pendingAuthCount = authorizations.filter((a) => a.status === 'PENDING').length;
  const criticalIncidentCount = incidents.filter(
    (i) => i.severity === 'Critical' && i.status !== 'RESOLVED'
  ).length;

  const currentIncidentDetail = selectedIncidentId
    ? incidents.find((i) => i.id === selectedIncidentId)
    : null;

  return (
    <AppShell
      currentTab={currentTab}
      onNavigate={(tab) => {
        setSelectedIncidentId(null);
        setCurrentTab(tab);
      }}
      onOpenVoice={() => setIsVoiceOpen(true)}
      onViewLanding={() => setViewMode('landing')}
      pendingAuthCount={pendingAuthCount}
      criticalIncidentCount={criticalIncidentCount}
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
          <span className="text-xs font-medium text-slate-500">Loading operations console...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {currentTab === 'overview' && (
            <OverviewView
              metrics={metrics}
              recentIncidents={incidents.slice(0, 6)}
              recentActivity={auditLogs.slice(0, 5)}
              onSelectIncident={(id) => {
                setSelectedIncidentId(id);
                setCurrentTab('incidents');
              }}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenVoice={() => setIsVoiceOpen(true)}
              onOpenNewIncident={() => setIsNewIncidentOpen(true)}
            />
          )}

          {/* TAB 2: INCIDENTS (List or Detail) */}
          {currentTab === 'incidents' && (
            selectedIncidentId && currentIncidentDetail ? (
              <IncidentDetailView
                incident={currentIncidentDetail}
                onBack={() => setSelectedIncidentId(null)}
                onRefresh={refreshData}
              />
            ) : (
              <IncidentsView
                incidents={incidents}
                onSelectIncident={(id) => setSelectedIncidentId(id)}
                onOpenNewIncident={() => setIsNewIncidentOpen(true)}
              />
            )
          )}

          {/* TAB 3: WORK ORDERS */}
          {currentTab === 'work-orders' && (
            <WorkOrdersView
              workOrders={workOrders}
              onSelectIncident={(incidentId) => {
                setSelectedIncidentId(incidentId);
                setCurrentTab('incidents');
              }}
              onRefresh={refreshData}
            />
          )}

          {/* TAB 4: ASSETS */}
          {currentTab === 'assets' && (
            <AssetsView
              assets={assets}
              onSelectAssetIncident={(assetCode) => {
                const found = incidents.find((i) => i.assetCode === assetCode);
                if (found) {
                  setSelectedIncidentId(found.id);
                  setCurrentTab('incidents');
                }
              }}
            />
          )}

          {/* TAB 5: INVENTORY */}
          {currentTab === 'inventory' && <InventoryView inventory={inventory} />}

          {/* TAB 6: ACTIVITY / AUDIT TRAIL */}
          {currentTab === 'activity' && (
            <ActivityView
              auditLogs={auditLogs}
              onSelectIncident={(id) => {
                if (id.startsWith('INC-')) {
                  setSelectedIncidentId(id);
                  setCurrentTab('incidents');
                }
              }}
            />
          )}

          {/* TAB 7: AUTHORIZATIONS QUEUE */}
          {currentTab === 'authorizations' && (
            <AuthorizationsView
              authorizations={authorizations}
              onSelectIncident={(id) => {
                setSelectedIncidentId(id);
                setCurrentTab('incidents');
              }}
              onRefresh={refreshData}
            />
          )}

          {/* TAB 8: SETTINGS */}
          {currentTab === 'settings' && <SettingsView />}
        </>
      )}

      {/* Voice Interaction Side Drawer */}
      <VoiceDrawer
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onIncidentCreated={handleIncidentCreatedByVoice}
      />

      {/* New Incident Fast Form Modal */}
      <CreateIncidentModal
        isOpen={isNewIncidentOpen}
        onClose={() => setIsNewIncidentOpen(false)}
        onCreated={(newId) => {
          refreshData();
          setSelectedIncidentId(newId);
          setCurrentTab('incidents');
        }}
        assets={assets}
        onOpenVoice={() => setIsVoiceOpen(true)}
      />
    </AppShell>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <ExceptionOSApp />
    </AuthProvider>
  );
}
