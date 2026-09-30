'use client';

import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import {
  Building2,
  Users,
  Shield,
  MapPin,
  Workflow,
  Bell,
  Scale,
  CheckCircle2,
  Sliders,
  ExternalLink,
} from 'lucide-react';

export default function SettingsView() {
  const { allUsers } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'organization' | 'users' | 'roles' | 'sites' | 'integrations' | 'notifications' | 'rules'
  >('organization');

  const [orgName, setOrgName] = useState('Acme Manufacturing');
  const [industry, setIndustry] = useState('Manufacturing');
  const [defaultSite, setDefaultSite] = useState('Plant A');
  const [timezone, setTimezone] = useState('Africa/Lagos');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Operational policies, authorization thresholds, and organization configuration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Settings Navigation matching Image 12 */}
        <div className="lg:col-span-3 space-y-1">
          {[
            { id: 'organization', label: 'Organization', icon: Building2 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'roles', label: 'Roles', icon: Shield },
            { id: 'sites', label: 'Sites', icon: MapPin },
            { id: 'integrations', label: 'Integrations', icon: Workflow },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'rules', label: 'Authorization rules', icon: Scale },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center space-x-2.5 transition-colors ${
                activeTab === item.id
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content Area matching Image 12 */}
        <div className="lg:col-span-9 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          {/* TAB 1: ORGANIZATION */}
          {activeTab === 'organization' && (
            <form onSubmit={handleSave} className="space-y-5 max-w-xl">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Organization Settings</h3>
                <p className="text-xs text-slate-500">Global operating profile and operational default timezone</p>
              </div>

              {savedSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Organization settings saved successfully.</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Organization name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Default site</label>
                <select
                  value={defaultSite}
                  onChange={(e) => setDefaultSite(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
                >
                  <option>Plant A</option>
                  <option>Plant B</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Timezone</label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  Save changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Users</h3>
                  <p className="text-xs text-slate-500">Assigned plant operators, technicians, and supervisors</p>
                </div>
                <button
                  onClick={() => alert('User invitation sent via corporate directory.')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  + Invite user
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-semibold text-slate-900">{u.name}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500">{u.email}</td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ROLES */}
          {activeTab === 'roles' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Roles & Permissions</h3>
                <p className="text-xs text-slate-500">Operational hierarchy and authorization privileges</p>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { role: 'ADMIN', desc: 'Full system configuration, user provisioning, audit inspection, and unconditional overrides.' },
                  { role: 'SUPERVISOR', desc: 'Approve consequential actions (dispatches, expenditures > $250, contractor calls), manage work orders.' },
                  { role: 'TECHNICIAN', desc: 'View assigned work orders, execute physical repairs, mark tasks complete, report exceptions.' },
                  { role: 'OPERATOR', desc: 'Voice-native incident reporting, view active plant equipment state.' },
                ].map((r, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                    <div className="font-bold text-slate-900">{r.role}</div>
                    <p className="text-slate-600 leading-snug">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SITES */}
          {activeTab === 'sites' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Operational Sites</h3>
                  <p className="text-xs text-slate-500">Physical plants, campuses, and warehouses</p>
                </div>
                <button
                  onClick={() => alert('New site addition')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  + Add site
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-900">Plant A</div>
                  <div className="text-xs text-slate-500">Lagos, Nigeria</div>
                  <div className="text-[11px] text-slate-600 pt-2 font-mono">127 assets · 8 active incidents</div>
                </div>
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-900">Plant B</div>
                  <div className="text-xs text-slate-500">Abuja, Nigeria</div>
                  <div className="text-[11px] text-slate-600 pt-2 font-mono">83 assets · 3 active incidents</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Connected Operational Systems</h3>
                <p className="text-xs text-slate-500">Enterprise interfaces and telemetry streams</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Connected</div>
                  <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">AssemblyAI Voice Engine</div>
                      <div className="text-[11px] text-slate-500">Real-time WebSocket speech recognition & telemetry token provider</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                      Connected
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Enterprise Adapters</div>
                  <div className="space-y-2">
                    {[
                      { name: 'CMMS (Maintenance)', desc: 'IBM Maximo / SAP PM connector' },
                      { name: 'ERP / Procurement', desc: 'Spare parts purchase order authorization sync' },
                      { name: 'Warehouse WMS', desc: 'Real-time bin inventory stock reservation' },
                      { name: 'Industrial IoT Telemetry', desc: 'OPC-UA / MQTT live vibration & temperature telemetry' },
                    ].map((integ, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-800">{integ.name}</div>
                          <div className="text-[11px] text-slate-500">{integ.desc}</div>
                        </div>
                        <button
                          onClick={() => alert(`Connect ${integ.name}`)}
                          className="px-3 py-1 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded text-xs font-medium"
                        >
                          Connect
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Operational Alerts & Notifications</h3>
                <p className="text-xs text-slate-500">Alert routing for supervisors and maintenance crews</p>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { title: 'Incident assigned to technician', channel: 'SMS & Email', active: true },
                  { title: 'Critical severity detected (overheating / seizure)', channel: 'Direct Push & Siren', active: true },
                  { title: 'Authorization required for parts dispatch', channel: 'In-app & Supervisor SMS', active: true },
                  { title: 'Work order completed by technician', channel: 'Email', active: false },
                  { title: 'Independent verification failed (re-escalation)', channel: 'High-priority Email', active: true },
                ].map((notif, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">{notif.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{notif.channel}</div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${notif.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                      {notif.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: AUTHORIZATION RULES matching section 29 */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Authorization Rules</h3>
                <p className="text-xs text-slate-500">Define which operational recovery actions require human sign-off</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Cross-warehouse parts dispatch</span>
                    <span className="font-mono text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                      Required above $250
                    </span>
                  </div>
                  <p className="text-slate-600">
                    Transfers between regional warehouses incurring freight costs or drawing reserved stock require supervisor approval.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Equipment shutdown</span>
                    <span className="font-mono text-[10px] text-rose-800 bg-rose-100 px-2 py-0.5 rounded font-semibold">
                      Always requires approval
                    </span>
                  </div>
                  <p className="text-slate-600">
                    Halting primary line machines requires plant manager authorization to protect batch yields.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>External specialist contractor dispatch</span>
                    <span className="font-mono text-[10px] text-rose-800 bg-rose-100 px-2 py-0.5 rounded font-semibold">
                      Always requires approval
                    </span>
                  </div>
                  <p className="text-slate-600">
                    Engaging third-party OEM technicians (rates &gt; $150/hr) requires budget holder sign-off.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Production schedule change</span>
                    <span className="font-mono text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                      Required from supervisor
                    </span>
                  </div>
                  <p className="text-slate-600">
                    Shifting jobs from Machine 7 to Machine 12 updates ERP routing and requires supervisory acknowledgment.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
