export type UserRole = 'Admin' | 'Supervisor' | 'Technician' | 'Operator';

export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: UserRole;
  siteId: string;
  status: 'Active' | 'Inactive';
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  defaultSiteId: string;
  timezone: string;
}

export interface Site {
  id: string;
  organizationId: string;
  name: string;
  location: string;
  assetCount: number;
  activeIncidentCount: number;
}

export interface AssetTelemetry {
  temperature: number; // in °C
  vibration: number;   // in g
  pressure?: number;   // in bar
  runtimeHours: number;
}

export interface AssetHistoryItem {
  date: string;
  event: string;
  hoursAgo?: number;
}

export interface Asset {
  id: string;
  assetCode: string; // e.g. M-007
  name: string;      // e.g. Machine 7
  type: 'Machine' | 'Conveyor' | 'Press' | 'Compressor' | 'Motor';
  siteId: string;
  siteName: string;
  status: 'Online' | 'Warning' | 'Maintenance' | 'Offline';
  description: string;
  telemetry: AssetTelemetry;
  lastService: string;
  nextService: string;
  maintenanceHistory: AssetHistoryItem[];
}

export interface InventoryItem {
  id: string;
  partCode: string; // e.g. B-204
  name: string;     // e.g. Bearing B-204
  category: string; // e.g. Drive Bearings
  description: string;
  quantity: number;
  warehouse: string; // e.g. Plant A or Warehouse B
  locationBin: string; // e.g. A1-2
  unitCost: number;  // in USD
  compatibleAssetCodes: string[]; // e.g. ['M-007', 'M-012', 'M-015']
}

export type IncidentSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type IncidentStatus = 
  | 'OPEN'
  | 'INVESTIGATING'
  | 'AWAITING_AUTHORIZATION'
  | 'AUTHORIZED'
  | 'IN_PROGRESS'
  | 'AWAITING_VERIFICATION'
  | 'RESOLVED'
  | 'ESCALATED';

export interface IncidentEvent {
  id: string;
  incidentId: string;
  timestamp: string; // HH:MM or ISO string
  title: string;
  description: string;
  category: 'creation' | 'investigation' | 'telemetry' | 'history' | 'sop' | 'inventory' | 'authorization' | 'dispatch' | 'work_order' | 'verification' | 'resolution';
  actor: string;
}

export interface ProposedAction {
  actionType: 'dispatch' | 'shutdown' | 'contractor' | 'schedule_change';
  title: string;
  description: string;
  partCode?: string;
  quantity?: number;
  sourceWarehouse?: string;
  destinationSite?: string;
  distanceKm?: number;
  estimatedCost: number;
  requiresAuthorization: boolean;
}

export interface Incident {
  id: string; // e.g. INC-10482
  organizationId: string;
  siteId: string;
  siteName: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  reporterName: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  currentCondition: {
    temperature: number;
    vibration: number;
    tempStatus: 'Normal' | 'Above normal' | 'Critical';
    vibStatus: 'Normal' | 'Above normal' | 'Critical';
  };
  postRepairCondition?: {
    temperature: number;
    vibration: number;
    verifiedAt: string;
    verifiedStatus: 'Verified' | 'Failed';
  };
  investigationNotes: string[];
  proposedAction?: ProposedAction;
  authorizationId?: string;
  workOrderId?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface Authorization {
  id: string;
  incidentId: string;
  incidentTitle: string;
  proposedAction: string;
  reason: string;
  affectedAsset: string;
  fromLocation?: string;
  toLocation?: string;
  distanceKm?: number;
  estimatedCost: number;
  requestedBy: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  decidedBy?: string;
  decidedAt?: string;
  rejectionReason?: string;
}

export type WorkOrderStatus = 'Open' | 'Assigned' | 'In Progress' | 'Completed';

export interface WorkOrderPart {
  partCode: string;
  name: string;
  quantity: number;
  status: 'Pending' | 'Dispatched' | 'Delivered' | 'Installed';
}

export interface WorkOrder {
  id: string; // e.g. WO-2031
  organizationId: string;
  incidentId: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  siteName: string;
  title: string;
  description: string;
  assignedToUserId?: string;
  assignedToName: string;
  status: WorkOrderStatus;
  priority: IncidentSeverity;
  requiredParts: WorkOrderPart[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  timeFormatted: string;
  title: string;
  description: string;
  category: 'Incidents' | 'Work Orders' | 'Authorizations' | 'System';
  actor: string;
  targetId: string;
}
