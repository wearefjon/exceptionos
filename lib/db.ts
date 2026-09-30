import fs from 'fs';
import path from 'path';
import {
  Organization,
  User,
  Site,
  Asset,
  InventoryItem,
  Incident,
  IncidentEvent,
  Authorization,
  WorkOrder,
  AuditLog,
} from './types';

interface DatabaseSchema {
  organization: Organization;
  users: User[];
  sites: Site[];
  assets: Asset[];
  inventory: InventoryItem[];
  incidents: Incident[];
  incidentEvents: IncidentEvent[];
  authorizations: Authorization[];
  workOrders: WorkOrder[];
  auditLogs: AuditLog[];
}

const DB_FILE = path.join(process.cwd(), 'data', 'exceptionos-db.json');

const INITIAL_DATA: DatabaseSchema = {
  organization: {
    id: 'org-acme',
    name: 'Acme Manufacturing',
    industry: 'Industrial Manufacturing',
    defaultSiteId: 'site-plant-a',
    timezone: 'Africa/Lagos',
  },
  users: [
    {
      id: 'usr-alex',
      organizationId: 'org-acme',
      name: 'Alex Johnson',
      email: 'alex@acme.com',
      role: 'Admin',
      siteId: 'site-plant-a',
      status: 'Active',
    },
    {
      id: 'usr-sarah',
      organizationId: 'org-acme',
      name: 'Sarah Williams',
      email: 'sarah@acme.com',
      role: 'Supervisor',
      siteId: 'site-plant-b',
      status: 'Active',
    },
    {
      id: 'usr-james',
      organizationId: 'org-acme',
      name: 'James Okoro',
      email: 'james@acme.com',
      role: 'Technician',
      siteId: 'site-plant-a',
      status: 'Active',
    },
    {
      id: 'usr-taylor',
      organizationId: 'org-acme',
      name: 'Taylor K.',
      email: 'taylor@acme.com',
      role: 'Operator',
      siteId: 'site-plant-a',
      status: 'Active',
    },
  ],
  sites: [
    {
      id: 'site-plant-a',
      organizationId: 'org-acme',
      name: 'Plant A',
      location: 'Lagos, Nigeria',
      assetCount: 127,
      activeIncidentCount: 8,
    },
    {
      id: 'site-plant-b',
      organizationId: 'org-acme',
      name: 'Plant B',
      location: 'Abuja, Nigeria',
      assetCount: 83,
      activeIncidentCount: 3,
    },
  ],
  assets: [
    {
      id: 'ast-m007',
      assetCode: 'M-007',
      name: 'Machine 7',
      type: 'Machine',
      siteId: 'site-plant-a',
      siteName: 'Plant A',
      status: 'Warning',
      description: 'Primary CNC precision cutting cell',
      telemetry: {
        temperature: 94,
        vibration: 0.38,
        pressure: 4.8,
        runtimeHours: 8241,
      },
      lastService: 'Aug 21',
      nextService: 'Nov 21',
      maintenanceHistory: [
        { date: 'Aug 21', event: 'Drive bearing replaced', hoursAgo: 2100 },
        { date: 'Jun 04', event: 'Routine calibration & inspection' },
        { date: 'Mar 18', event: 'Spindle vibration warning' },
      ],
    },
    {
      id: 'ast-m012',
      assetCode: 'M-012',
      name: 'Machine 12',
      type: 'Machine',
      siteId: 'site-plant-a',
      siteName: 'Plant A',
      status: 'Online',
      description: 'Secondary CNC milling station',
      telemetry: {
        temperature: 68,
        vibration: 0.09,
        pressure: 5.1,
        runtimeHours: 5410,
      },
      lastService: 'Jul 15',
      nextService: 'Oct 15',
      maintenanceHistory: [
        { date: 'Jul 15', event: 'Coolant flush & filter replacement' },
        { date: 'Apr 02', event: 'Axis motor recalibration' },
      ],
    },
    {
      id: 'ast-c003',
      assetCode: 'C-003',
      name: 'Conveyor 3',
      type: 'Conveyor',
      siteId: 'site-plant-a',
      siteName: 'Plant A',
      status: 'Online',
      description: 'Main assembly transfer conveyor',
      telemetry: {
        temperature: 55,
        vibration: 0.22,
        runtimeHours: 11450,
      },
      lastService: 'Sep 01',
      nextService: 'Dec 01',
      maintenanceHistory: [
        { date: 'Sep 01', event: 'Belt tension inspection' },
        { date: 'May 10', event: 'Roller bearing lubrication' },
      ],
    },
    {
      id: 'ast-p002',
      assetCode: 'P-002',
      name: 'Hydraulic Press 2',
      type: 'Press',
      siteId: 'site-plant-b',
      siteName: 'Plant B',
      status: 'Maintenance',
      description: '50-ton hydraulic stamping press',
      telemetry: {
        temperature: 62,
        vibration: 0.14,
        pressure: 3.2,
        runtimeHours: 9120,
      },
      lastService: 'Aug 10',
      nextService: 'Oct 30',
      maintenanceHistory: [
        { date: 'Aug 10', event: 'Pressure relief valve seal replacement' },
        { date: 'Feb 14', event: 'Annual hydraulic fluid overhaul' },
      ],
    },
    {
      id: 'ast-cp001',
      assetCode: 'CP-001',
      name: 'Compressor 1',
      type: 'Compressor',
      siteId: 'site-plant-b',
      siteName: 'Plant B',
      status: 'Online',
      description: 'Rotary screw industrial air compressor',
      telemetry: {
        temperature: 78,
        vibration: 0.11,
        pressure: 7.4,
        runtimeHours: 14200,
      },
      lastService: 'Sep 12',
      nextService: 'Dec 12',
      maintenanceHistory: [
        { date: 'Sep 12', event: 'Air intake filter replacement' },
      ],
    },
    {
      id: 'ast-mo004',
      assetCode: 'MO-004',
      name: 'Motor 4',
      type: 'Motor',
      siteId: 'site-plant-a',
      siteName: 'Plant A',
      status: 'Online',
      description: 'Induction drive motor for exhaust system',
      telemetry: {
        temperature: 64,
        vibration: 0.10,
        runtimeHours: 7300,
      },
      lastService: 'Jun 22',
      nextService: 'Sep 22',
      maintenanceHistory: [
        { date: 'Jun 22', event: 'Stator winding insulation test' },
      ],
    },
  ],
  inventory: [
    {
      id: 'inv-b204-pb',
      partCode: 'B-204',
      name: 'Bearing B-204',
      category: 'Drive Bearings',
      description: 'Heavy-duty ceramic hybrid drive bearing',
      quantity: 4,
      warehouse: 'Warehouse B',
      locationBin: 'B3-1',
      unitCost: 420,
      compatibleAssetCodes: ['M-007', 'M-012', 'MO-004'],
    },
    {
      id: 'inv-b204-pa',
      partCode: 'B-204',
      name: 'Bearing B-204',
      category: 'Drive Bearings',
      description: 'Heavy-duty ceramic hybrid drive bearing',
      quantity: 0,
      warehouse: 'Plant A',
      locationBin: 'A1-2',
      unitCost: 420,
      compatibleAssetCodes: ['M-007', 'M-012', 'MO-004'],
    },
    {
      id: 'inv-b304',
      partCode: 'B-304',
      name: 'Bearing B-304',
      category: 'Bearings',
      description: 'Standard roller bearing',
      quantity: 0,
      warehouse: 'Plant A',
      locationBin: 'A1-4',
      unitCost: 310,
      compatibleAssetCodes: ['C-003'],
    },
    {
      id: 'inv-v118',
      partCode: 'V-118',
      name: 'V-Belt V-118',
      category: 'Belts & Drives',
      description: 'Reinforced industrial synchronous drive belt',
      quantity: 12,
      warehouse: 'Plant A',
      locationBin: 'A2-3',
      unitCost: 85,
      compatibleAssetCodes: ['C-003', 'CP-001'],
    },
    {
      id: 'inv-hf233',
      partCode: 'HF-233',
      name: 'Hydraulic Filter HF-233',
      category: 'Filtration',
      description: 'High-pressure micro-glass hydraulic filter element',
      quantity: 6,
      warehouse: 'Plant B',
      locationBin: 'B1-4',
      unitCost: 140,
      compatibleAssetCodes: ['P-002'],
    },
    {
      id: 'inv-mc440',
      partCode: 'MC-440',
      name: 'Motor Contactor MC-440',
      category: 'Electrical',
      description: '3-Pole 40A AC-3 heavy industrial contactor',
      quantity: 8,
      warehouse: 'Plant A',
      locationBin: 'A3-2',
      unitCost: 195,
      compatibleAssetCodes: ['MO-004', 'CP-001'],
    },
    {
      id: 'inv-ps772',
      partCode: 'PS-772',
      name: 'Pressure Sensor PS-772',
      category: 'Instrumentation',
      description: '4-20mA 0-16 bar piezoresistive pressure transmitter',
      quantity: 3,
      warehouse: 'Warehouse B',
      locationBin: 'B4-2',
      unitCost: 280,
      compatibleAssetCodes: ['P-002', 'CP-001'],
    },
  ],
  incidents: [
    {
      id: 'INC-10482',
      organizationId: 'org-acme',
      siteId: 'site-plant-a',
      siteName: 'Plant A',
      assetId: 'ast-m007',
      assetCode: 'M-007',
      assetName: 'Machine 7',
      reporterName: 'James',
      title: 'Machine 7 overheating and abnormal vibration',
      description: 'Worker reported Machine 7 is overheating and vibrating significantly more than usual during high-speed cutting cycles.',
      severity: 'Critical',
      status: 'AWAITING_AUTHORIZATION',
      currentCondition: {
        temperature: 94,
        vibration: 0.38,
        tempStatus: 'Critical',
        vibStatus: 'Critical',
      },
      investigationNotes: [
        'Telemetry indicates abnormal temperature (94°C) and vibration (0.38g). Both values are outside standard operating thresholds (T < 75°C, V < 0.15g).',
        'Recent maintenance history shows drive bearing was last replaced 2,100 operating hours ago.',
        'Relevant SOP (SOP-M007-BRG) recommends immediate drive bearing inspection and replacement to avoid catastrophic spindle seizure.',
        'Plant A local inventory has 0 units of Bearing B-204 in stock.',
        'Warehouse B has 4 compatible units in stock (14 km distance, estimated dispatch time 45 mins).',
      ],
      proposedAction: {
        actionType: 'dispatch',
        title: 'Dispatch 1 × Bearing B-204 from Warehouse B to Plant A',
        description: 'Dispatch replacement drive bearing B-204 from Warehouse B to Plant A and assign technician James Okoro.',
        partCode: 'B-204',
        quantity: 1,
        sourceWarehouse: 'Warehouse B',
        destinationSite: 'Plant A',
        distanceKm: 14,
        estimatedCost: 420,
        requiresAuthorization: true,
      },
      authorizationId: 'auth-10482',
      createdAt: '10:42',
      updatedAt: '10:46',
    },
    {
      id: 'INC-10479',
      organizationId: 'org-acme',
      siteId: 'site-plant-a',
      siteName: 'Plant A',
      assetId: 'ast-c003',
      assetCode: 'C-003',
      assetName: 'Conveyor 3',
      reporterName: 'Taylor K.',
      title: 'Conveyor 3 high vibration and belt slip',
      description: 'Conveyor transfer belt showing recurring vibration and slip during load spikes.',
      severity: 'High',
      status: 'IN_PROGRESS',
      currentCondition: {
        temperature: 55,
        vibration: 0.22,
        tempStatus: 'Normal',
        vibStatus: 'Above normal',
      },
      investigationNotes: [
        'Belt tension check indicated 18% slack.',
        'Technician Sam T. assigned with replacement V-Belt V-118.',
      ],
      workOrderId: 'WO-2030',
      createdAt: '09:15',
      updatedAt: '18m ago',
    },
    {
      id: 'INC-10471',
      organizationId: 'org-acme',
      siteId: 'site-plant-b',
      siteName: 'Plant B',
      assetId: 'ast-p002',
      assetCode: 'P-002',
      assetName: 'Hydraulic Press 2',
      reporterName: 'Sarah W.',
      title: 'Hydraulic pressure drop on stamping cycle',
      description: 'Operating pressure dipped below 3.5 bar during active cycle.',
      severity: 'Medium',
      status: 'RESOLVED',
      currentCondition: {
        temperature: 62,
        vibration: 0.14,
        tempStatus: 'Normal',
        vibStatus: 'Normal',
      },
      postRepairCondition: {
        temperature: 61,
        vibration: 0.12,
        verifiedAt: '09:45',
        verifiedStatus: 'Verified',
      },
      investigationNotes: [
        'Hydraulic filter HF-233 was replaced.',
        'Post-repair pressure restored to 5.0 bar, temperature stable at 61°C.',
      ],
      createdAt: '08:30',
      updatedAt: '42m ago',
      resolvedAt: '09:48',
    },
    {
      id: 'INC-10468',
      organizationId: 'org-acme',
      siteId: 'site-plant-a',
      siteName: 'Plant A',
      assetId: 'ast-mo004',
      assetCode: 'MO-004',
      assetName: 'Motor 4',
      reporterName: 'Riley S.',
      title: 'Motor 4 contactor chatter and thermal trip',
      description: 'Thermal overload relay tripped twice during morning startup.',
      severity: 'High',
      status: 'INVESTIGATING',
      currentCondition: {
        temperature: 64,
        vibration: 0.10,
        tempStatus: 'Normal',
        vibStatus: 'Normal',
      },
      investigationNotes: [
        'Checking auxiliary contacts and line voltage balance.',
      ],
      createdAt: '07:50',
      updatedAt: '1h ago',
    },
    {
      id: 'INC-10465',
      organizationId: 'org-acme',
      siteId: 'site-plant-b',
      siteName: 'Plant B',
      assetId: 'ast-cp001',
      assetCode: 'CP-001',
      assetName: 'Compressor 1',
      reporterName: 'Jordan L.',
      title: 'Air compressor pressure relief leakage',
      description: 'Audible air venting from secondary valve assembly.',
      severity: 'Medium',
      status: 'OPEN',
      currentCondition: {
        temperature: 78,
        vibration: 0.11,
        tempStatus: 'Above normal',
        vibStatus: 'Normal',
      },
      investigationNotes: [],
      createdAt: '06:30',
      updatedAt: '2h ago',
    },
    {
      id: 'INC-10462',
      organizationId: 'org-acme',
      siteId: 'site-plant-a',
      siteName: 'Plant A',
      assetId: 'ast-m012',
      assetCode: 'M-012',
      assetName: 'Machine 12',
      reporterName: 'Alex R.',
      title: 'Coolant flow reduction warning',
      description: 'Coolant intake nozzle partially obstructed.',
      severity: 'Low',
      status: 'RESOLVED',
      currentCondition: {
        temperature: 68,
        vibration: 0.09,
        tempStatus: 'Normal',
        vibStatus: 'Normal',
      },
      postRepairCondition: {
        temperature: 67,
        vibration: 0.08,
        verifiedAt: '07:15',
        verifiedStatus: 'Verified',
      },
      investigationNotes: [
        'Cleared chip debris from nozzle orifice.',
      ],
      createdAt: '06:00',
      updatedAt: '3h ago',
      resolvedAt: '07:18',
    },
  ],
  incidentEvents: [
    {
      id: 'evt-1',
      incidentId: 'INC-10482',
      timestamp: '10:42',
      title: 'Incident created',
      description: 'Reported by voice: "Machine 7 is overheating and vibrating more than usual."',
      category: 'creation',
      actor: 'James Okoro',
    },
    {
      id: 'evt-2',
      incidentId: 'INC-10482',
      timestamp: '10:43',
      title: 'Telemetry checked',
      description: 'Temperature: 94°C (Normal < 75°C) · Vibration: 0.38g (Normal < 0.15g). Critical anomaly confirmed.',
      category: 'telemetry',
      actor: 'ExceptionOS AI Agent',
    },
    {
      id: 'evt-3',
      incidentId: 'INC-10482',
      timestamp: '10:43',
      title: 'Maintenance history queried',
      description: 'Drive bearing serviced 2,100 operating hours ago. Component reached end of recommended lifecycle.',
      category: 'history',
      actor: 'ExceptionOS AI Agent',
    },
    {
      id: 'evt-4',
      incidentId: 'INC-10482',
      timestamp: '10:44',
      title: 'SOP retrieved',
      description: 'SOP-M007-BRG: Mandatory spindle drive bearing replacement prior to further high-load operations.',
      category: 'sop',
      actor: 'ExceptionOS AI Agent',
    },
    {
      id: 'evt-5',
      incidentId: 'INC-10482',
      timestamp: '10:44',
      title: 'Inventory checked',
      description: 'Plant A local stock for Bearing B-204 is 0 units.',
      category: 'inventory',
      actor: 'ExceptionOS AI Agent',
    },
    {
      id: 'evt-6',
      incidentId: 'INC-10482',
      timestamp: '10:45',
      title: 'Part alternative located',
      description: '4 compatible units found at Warehouse B (14 km away). Estimated transfer time: 45 minutes.',
      category: 'inventory',
      actor: 'ExceptionOS AI Agent',
    },
    {
      id: 'evt-7',
      incidentId: 'INC-10482',
      timestamp: '10:46',
      title: 'Authorization requested',
      description: 'Consequential action requiring supervisor approval: Dispatch Bearing B-204 from Warehouse B ($420).',
      category: 'authorization',
      actor: 'ExceptionOS AI Agent',
    },
  ],
  authorizations: [
    {
      id: 'auth-10482',
      incidentId: 'INC-10482',
      incidentTitle: 'Machine 7 overheating and abnormal vibration',
      proposedAction: 'Dispatch Bearing B-204 from Warehouse B to Plant A',
      reason: 'Plant A local inventory is exhausted. Machine 7 is at critical seizure risk (94°C, 0.38g).',
      affectedAsset: 'Machine 7 (M-007)',
      fromLocation: 'Warehouse B',
      toLocation: 'Plant A',
      distanceKm: 14,
      estimatedCost: 420,
      requestedBy: 'ExceptionOS Autonomous Dispatcher',
      requestedAt: '10:46',
      status: 'PENDING',
    },
    {
      id: 'auth-10461',
      incidentId: 'INC-10461',
      incidentTitle: 'High-pressure hydraulic line overhaul',
      proposedAction: 'Emergency specialist hydraulic contractor dispatch',
      reason: 'Specialized hydraulic valve recalibration exceeding in-house tooling specifications.',
      affectedAsset: 'Hydraulic Press 2 (P-002)',
      fromLocation: 'FluidTech Services',
      toLocation: 'Plant B',
      distanceKm: 28,
      estimatedCost: 1200,
      requestedBy: 'Operations Dispatch',
      requestedAt: '09:32',
      status: 'APPROVED',
      decidedBy: 'Sarah Williams (Supervisor)',
      decidedAt: '09:38',
    },
  ],
  workOrders: [
    {
      id: 'WO-2031',
      organizationId: 'org-acme',
      incidentId: 'INC-10482',
      assetId: 'ast-m007',
      assetCode: 'M-007',
      assetName: 'Machine 7',
      siteName: 'Plant A',
      title: 'Replace drive bearing and calibrate spindle runout',
      description: 'Install replacement ceramic hybrid bearing B-204 upon arrival from Warehouse B. Check vibration levels.',
      assignedToUserId: 'usr-james',
      assignedToName: 'Alex Rivera',
      status: 'In Progress',
      priority: 'Critical',
      requiredParts: [
        {
          partCode: 'B-204',
          name: 'Bearing B-204',
          quantity: 1,
          status: 'Dispatched',
        },
      ],
      createdAt: '10:46',
      startedAt: '10:50',
    },
    {
      id: 'WO-2030',
      organizationId: 'org-acme',
      incidentId: 'INC-10479',
      assetId: 'ast-c003',
      assetCode: 'C-003',
      assetName: 'Conveyor 3',
      siteName: 'Plant A',
      title: 'Inspect conveyor belt tension and replace V-Belt',
      description: 'Adjust drive pulley and fit replacement belt V-118.',
      assignedToUserId: 'usr-james',
      assignedToName: 'Sam T.',
      status: 'Assigned',
      priority: 'High',
      requiredParts: [
        {
          partCode: 'V-118',
          name: 'V-Belt V-118',
          quantity: 1,
          status: 'Delivered',
        },
      ],
      createdAt: '09:20',
    },
    {
      id: 'WO-2028',
      organizationId: 'org-acme',
      incidentId: 'INC-10471',
      assetId: 'ast-p002',
      assetCode: 'P-002',
      assetName: 'Hydraulic Press 2',
      siteName: 'Plant B',
      title: 'Check hydraulic pressure and replace filter HF-233',
      description: 'Flush cartridge manifold and insert new element.',
      assignedToUserId: 'usr-taylor',
      assignedToName: 'Taylor K.',
      status: 'Open',
      priority: 'Medium',
      requiredParts: [
        {
          partCode: 'HF-233',
          name: 'Hydraulic Filter HF-233',
          quantity: 1,
          status: 'Pending',
        },
      ],
      createdAt: '08:35',
    },
    {
      id: 'WO-2027',
      organizationId: 'org-acme',
      incidentId: 'INC-10465',
      assetId: 'ast-cp001',
      assetCode: 'CP-001',
      assetName: 'Compressor 1',
      siteName: 'Plant B',
      title: 'Replace air intake and secondary relief filter',
      description: 'Routine maintenance and seal check on rotary compressor.',
      assignedToUserId: 'usr-james',
      assignedToName: 'Jordan L.',
      status: 'Completed',
      priority: 'Low',
      requiredParts: [],
      createdAt: '06:40',
      completedAt: '07:55',
    },
    {
      id: 'WO-2026',
      organizationId: 'org-acme',
      incidentId: 'INC-10462',
      assetId: 'ast-mo004',
      assetCode: 'MO-004',
      assetName: 'Motor 4',
      siteName: 'Plant A',
      title: 'Electrical inspection & terminal torque check',
      description: 'Thermal inspection on motor junction box and leads.',
      assignedToUserId: 'usr-alex',
      assignedToName: 'Riley S.',
      status: 'Completed',
      priority: 'Low',
      requiredParts: [],
      createdAt: '06:10',
      completedAt: '07:10',
    },
  ],
  auditLogs: [
    {
      id: 'aud-1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      timeFormatted: '10:46',
      title: 'Authorization requested',
      description: 'ExceptionOS AI created authorization request auth-10482 for dispatch of Bearing B-204 ($420).',
      category: 'Authorizations',
      actor: 'ExceptionOS Autonomous Engine',
      targetId: 'auth-10482',
    },
    {
      id: 'aud-2',
      timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
      timeFormatted: '10:45',
      title: 'Part alternative found',
      description: 'Bearing B-204 located at Warehouse B (4 available). Cross-warehouse dispatch plan formulated.',
      category: 'Incidents',
      actor: 'Inventory Agent',
      targetId: 'INC-10482',
    },
    {
      id: 'aud-3',
      timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
      timeFormatted: '10:44',
      title: 'Inventory checked',
      description: 'Queried Plant A store for Bearing B-204. Balance: 0 units.',
      category: 'Incidents',
      actor: 'Inventory Agent',
      targetId: 'INC-10482',
    },
    {
      id: 'aud-4',
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      timeFormatted: '10:43',
      title: 'Maintenance history queried',
      description: 'Machine 7 service records analyzed. 2,100 operating hours since last bearing replacement.',
      category: 'Incidents',
      actor: 'Diagnostic Agent',
      targetId: 'ast-m007',
    },
    {
      id: 'aud-5',
      timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
      timeFormatted: '10:43',
      title: 'Telemetry checked',
      description: 'Temperature 94°C (Limit: 75°C), Vibration 0.38g (Limit: 0.15g). Severity elevated to Critical.',
      category: 'Incidents',
      actor: 'Diagnostic Agent',
      targetId: 'INC-10482',
    },
    {
      id: 'aud-6',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      timeFormatted: '10:42',
      title: 'Incident created',
      description: 'Field voice report by James Okoro processed. Asset M-007 identified automatically.',
      category: 'Incidents',
      actor: 'James Okoro',
      targetId: 'INC-10482',
    },
  ],
};

function ensureDataDirectory() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readDatabase(): DatabaseSchema {
  ensureDataDirectory();
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
    return INITIAL_DATA;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch (err) {
    console.error('Error reading database, restoring seed data:', err);
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
    return INITIAL_DATA;
  }
}

export function writeDatabase(data: DatabaseSchema): void {
  ensureDataDirectory();
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

// -------------------------------------------------------------
// OPERATIONAL DOMAIN ACCESSORS & MUTATORS
// -------------------------------------------------------------

export const db = {
  // ORGANIZATIONS & SITES
  getOrganization: () => readDatabase().organization,
  getSites: () => readDatabase().sites,
  getUsers: () => readDatabase().users,

  // OVERVIEW METRICS
  getOverviewMetrics: () => {
    const data = readDatabase();
    const criticalCount = data.incidents.filter((i) => i.severity === 'Critical' && i.status !== 'RESOLVED').length;
    const awaitingAuthCount = data.authorizations.filter((a) => a.status === 'PENDING').length;
    const inProgressCount = data.workOrders.filter((w) => w.status === 'In Progress').length;
    const verificationFailedCount = data.incidents.filter((i) => i.status === 'ESCALATED').length;

    return {
      criticalIncidents: criticalCount,
      awaitingAuthorization: awaitingAuthCount,
      workOrdersInProgress: inProgressCount,
      verificationFailed: verificationFailedCount,
      activeIncidentsCount: data.incidents.filter((i) => i.status !== 'RESOLVED').length,
      totalAssetsCount: data.assets.length,
    };
  },

  // ASSETS
  getAssets: () => readDatabase().assets,
  getAsset: (idOrCode: string) => {
    const data = readDatabase();
    return data.assets.find(
      (a) => a.id === idOrCode || a.assetCode.toLowerCase() === idOrCode.toLowerCase() || a.name.toLowerCase() === idOrCode.toLowerCase()
    );
  },

  // INVENTORY
  getInventory: () => readDatabase().inventory,
  findCompatiblePart: (assetCode: string, partCode?: string) => {
    const data = readDatabase();
    return data.inventory.filter((item) => {
      const matchAsset = item.compatibleAssetCodes.includes(assetCode);
      const matchPart = !partCode || item.partCode.toLowerCase() === partCode.toLowerCase();
      return matchAsset && matchPart;
    });
  },

  // INCIDENTS
  getIncidents: (filter?: { status?: string; severity?: string; site?: string }) => {
    let list = readDatabase().incidents;
    if (filter?.status && filter.status !== 'all') {
      list = list.filter((i) => i.status.toLowerCase() === filter.status!.toLowerCase());
    }
    if (filter?.severity && filter.severity !== 'all') {
      list = list.filter((i) => i.severity.toLowerCase() === filter.severity!.toLowerCase());
    }
    return list;
  },

  getIncident: (id: string) => {
    const data = readDatabase();
    const incident = data.incidents.find((i) => i.id === id);
    if (!incident) return null;
    const events = data.incidentEvents.filter((e) => e.incidentId === id);
    const authorization = incident.authorizationId
      ? data.authorizations.find((a) => a.id === incident.authorizationId)
      : undefined;
    const workOrder = incident.workOrderId
      ? data.workOrders.find((w) => w.id === incident.workOrderId)
      : undefined;

    return {
      ...incident,
      events,
      authorization,
      workOrder,
    };
  },

  createIncident: (params: {
    title: string;
    description: string;
    assetIdentifier: string;
    reporterName?: string;
    severity?: 'Critical' | 'High' | 'Medium' | 'Low';
    autoInvestigate?: boolean;
  }) => {
    const data = readDatabase();
    const asset =
      data.assets.find(
        (a) =>
          a.assetCode.toLowerCase() === params.assetIdentifier.toLowerCase() ||
          a.name.toLowerCase().includes(params.assetIdentifier.toLowerCase()) ||
          params.title.toLowerCase().includes(a.name.toLowerCase()) ||
          params.description.toLowerCase().includes(a.name.toLowerCase())
      ) || data.assets[0];

    const incidentNumber = 10483 + data.incidents.length;
    const incidentId = `INC-${incidentNumber}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const severity = params.severity || (params.description.toLowerCase().includes('overheating') || params.description.toLowerCase().includes('smoke') ? 'Critical' : 'High');

    const newIncident: Incident = {
      id: incidentId,
      organizationId: data.organization.id,
      siteId: asset.siteId,
      siteName: asset.siteName,
      assetId: asset.id,
      assetCode: asset.assetCode,
      assetName: asset.name,
      reporterName: params.reporterName || 'Voice Operator',
      title: params.title,
      description: params.description,
      severity,
      status: 'INVESTIGATING',
      currentCondition: {
        temperature: asset.telemetry.temperature,
        vibration: asset.telemetry.vibration,
        tempStatus: asset.telemetry.temperature > 85 ? 'Critical' : asset.telemetry.temperature > 70 ? 'Above normal' : 'Normal',
        vibStatus: asset.telemetry.vibration > 0.3 ? 'Critical' : asset.telemetry.vibration > 0.15 ? 'Above normal' : 'Normal',
      },
      investigationNotes: [
        `Incident captured from field report. Asset matched: ${asset.name} (${asset.assetCode}).`,
        `Current telemetry read: Temperature ${asset.telemetry.temperature}°C, Vibration ${asset.telemetry.vibration}g.`,
        `Asset runtime: ${asset.telemetry.runtimeHours} operating hours.`,
      ],
      createdAt: timeStr,
      updatedAt: timeStr,
    };

    const initialEvent: IncidentEvent = {
      id: `evt-${Date.now()}-1`,
      incidentId,
      timestamp: timeStr,
      title: 'Incident created',
      description: `Reported: "${params.description}"`,
      category: 'creation',
      actor: params.reporterName || 'Voice Operator',
    };

    data.incidents.unshift(newIncident);
    data.incidentEvents.unshift(initialEvent);

    // Add Audit Log
    data.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: timeStr,
      title: 'Incident created',
      description: `New incident ${incidentId} created for ${asset.name} (${severity})`,
      category: 'Incidents',
      actor: params.reporterName || 'Voice Operator',
      targetId: incidentId,
    });

    writeDatabase(data);

    // If autoInvestigate is true (the ExceptionOS standard loop)
    if (params.autoInvestigate !== false) {
      return db.runAutomatedInvestigation(incidentId);
    }

    return newIncident;
  },

  // THE FULL EXCEPTIONOS INVESTIGATION & AUTHORIZATION PIPELINE
  runAutomatedInvestigation: (incidentId: string) => {
    const data = readDatabase();
    const incidentIndex = data.incidents.findIndex((i) => i.id === incidentId);
    if (incidentIndex === -1) return null;

    const incident = data.incidents[incidentIndex];
    const asset = data.assets.find((a) => a.id === incident.assetId) || data.assets[0];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 1. Check SOP & Inventory
    const localInventory = data.inventory.find(
      (item) => item.warehouse === asset.siteName && item.compatibleAssetCodes.includes(asset.assetCode)
    );
    const remoteInventory = data.inventory.find(
      (item) => item.warehouse !== asset.siteName && item.compatibleAssetCodes.includes(asset.assetCode) && item.quantity > 0
    );

    const targetPart = remoteInventory || localInventory || data.inventory[0];
    const localQty = localInventory ? localInventory.quantity : 0;
    const remoteQty = remoteInventory ? remoteInventory.quantity : 0;

    incident.investigationNotes = [
      `Telemetry checked: Temperature ${incident.currentCondition.temperature}°C, Vibration ${incident.currentCondition.vibration}g outside operating envelope.`,
      `Maintenance history checked: Component reached service cycle threshold.`,
      `SOP retrieved (SOP-${asset.assetCode}-REPAIR): Immediate inspection and component replacement required.`,
      `Inventory verified: ${asset.siteName} has ${localQty} units in stock.`,
      remoteInventory
        ? `Compatible unit found at ${remoteInventory.warehouse} (${remoteQty} units available, estimated cost $${remoteInventory.unitCost}).`
        : `No alternative stock found in regional network.`,
    ];

    // Create Proposed Action & Authorization Request
    const authId = `auth-${incidentId.replace('INC-', '')}`;
    const proposedAction = {
      actionType: 'dispatch' as const,
      title: `Dispatch 1 × ${targetPart.name} from ${remoteInventory?.warehouse || 'Central Depot'} to ${asset.siteName}`,
      description: `Emergency dispatch of replacement ${targetPart.name} (${targetPart.partCode}) to mitigate equipment failure.`,
      partCode: targetPart.partCode,
      quantity: 1,
      sourceWarehouse: remoteInventory?.warehouse || 'Warehouse B',
      destinationSite: asset.siteName,
      distanceKm: 14,
      estimatedCost: targetPart.unitCost,
      requiresAuthorization: true,
    };

    incident.proposedAction = proposedAction;
    incident.status = 'AWAITING_AUTHORIZATION';
    incident.authorizationId = authId;
    incident.updatedAt = timeStr;

    // Create Authorization Record
    const newAuth: Authorization = {
      id: authId,
      incidentId: incident.id,
      incidentTitle: incident.title,
      proposedAction: proposedAction.title,
      reason: `${asset.siteName} inventory depleted. Urgent component replacement for ${asset.name}.`,
      affectedAsset: `${asset.name} (${asset.assetCode})`,
      fromLocation: proposedAction.sourceWarehouse,
      toLocation: proposedAction.destinationSite,
      distanceKm: proposedAction.distanceKm,
      estimatedCost: proposedAction.estimatedCost,
      requestedBy: 'ExceptionOS Autonomous Engine',
      requestedAt: timeStr,
      status: 'PENDING',
    };

    data.authorizations.unshift(newAuth);

    // Add Events
    data.incidentEvents.unshift(
      {
        id: `evt-${Date.now()}-2`,
        incidentId,
        timestamp: timeStr,
        title: 'Telemetry & history verified',
        description: `Telemetry confirmed critical anomaly. SOP retrieved for ${asset.name}.`,
        category: 'telemetry',
        actor: 'ExceptionOS AI Agent',
      },
      {
        id: `evt-${Date.now()}-3`,
        incidentId,
        timestamp: timeStr,
        title: 'Inventory queried & alternative found',
        description: `${asset.siteName} local stock: ${localQty}. Found ${remoteQty} units at ${proposedAction.sourceWarehouse}.`,
        category: 'inventory',
        actor: 'ExceptionOS AI Agent',
      },
      {
        id: `evt-${Date.now()}-4`,
        incidentId,
        timestamp: timeStr,
        title: 'Authorization requested',
        description: `Action requires supervisor sign-off: Dispatch ${targetPart.name} ($${proposedAction.estimatedCost}).`,
        category: 'authorization',
        actor: 'ExceptionOS AI Agent',
      }
    );

    // Audit Log
    data.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: timeStr,
      title: 'Authorization requested',
      description: `Authorization requested for ${incident.id}: Dispatch ${targetPart.name}`,
      category: 'Authorizations',
      actor: 'ExceptionOS Autonomous Engine',
      targetId: authId,
    });

    data.incidents[incidentIndex] = incident;
    writeDatabase(data);
    return incident;
  },

  // AUTHORIZATION DECISIONS
  approveAuthorization: (authId: string, approverName = 'Sarah Williams (Supervisor)') => {
    const data = readDatabase();
    const authIndex = data.authorizations.findIndex((a) => a.id === authId);
    if (authIndex === -1) return null;

    const auth = data.authorizations[authIndex];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    auth.status = 'APPROVED';
    auth.decidedBy = approverName;
    auth.decidedAt = timeStr;
    data.authorizations[authIndex] = auth;

    // Update Incident
    const incidentIndex = data.incidents.findIndex((i) => i.id === auth.incidentId);
    if (incidentIndex !== -1) {
      const incident = data.incidents[incidentIndex];
      incident.status = 'IN_PROGRESS';
      incident.updatedAt = timeStr;

      // Create Work Order
      const workOrderId = `WO-${2032 + data.workOrders.length}`;
      incident.workOrderId = workOrderId;

      const newWorkOrder: WorkOrder = {
        id: workOrderId,
        organizationId: incident.organizationId,
        incidentId: incident.id,
        assetId: incident.assetId,
        assetCode: incident.assetCode,
        assetName: incident.assetName,
        siteName: incident.siteName,
        title: `Execute recovery: ${auth.proposedAction}`,
        description: `Install replacement parts dispatched under ${auth.id}. Verify operating temperature and vibration return to baseline.`,
        assignedToUserId: 'usr-james',
        assignedToName: 'James Okoro',
        status: 'In Progress',
        priority: incident.severity,
        requiredParts: incident.proposedAction?.partCode
          ? [
              {
                partCode: incident.proposedAction.partCode,
                name: incident.proposedAction.title,
                quantity: 1,
                status: 'Dispatched',
              },
            ]
          : [],
        createdAt: timeStr,
        startedAt: timeStr,
      };

      data.workOrders.unshift(newWorkOrder);

      // Decrement inventory if applicable
      if (incident.proposedAction?.partCode) {
        const invItem = data.inventory.find(
          (inv) => inv.partCode === incident.proposedAction?.partCode && inv.warehouse === auth.fromLocation
        );
        if (invItem && invItem.quantity > 0) {
          invItem.quantity -= 1;
        }
      }

      // Add Events
      data.incidentEvents.unshift(
        {
          id: `evt-${Date.now()}-appr`,
          incidentId: incident.id,
          timestamp: timeStr,
          title: 'Authorization approved',
          description: `${approverName} approved: ${auth.proposedAction}. Dispatch initiated.`,
          category: 'authorization',
          actor: approverName,
        },
        {
          id: `evt-${Date.now()}-wo`,
          incidentId: incident.id,
          timestamp: timeStr,
          title: 'Work order created',
          description: `Work order ${workOrderId} issued to James Okoro.`,
          category: 'work_order',
          actor: 'ExceptionOS Orchestration',
        }
      );

      data.incidents[incidentIndex] = incident;
    }

    // Audit Log
    data.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: timeStr,
      title: 'Authorization approved',
      description: `${approverName} approved authorization ${authId} for ${auth.incidentId}`,
      category: 'Authorizations',
      actor: approverName,
      targetId: authId,
    });

    writeDatabase(data);
    return auth;
  },

  rejectAuthorization: (authId: string, approverName = 'Sarah Williams (Supervisor)', reason = 'Action rejected by supervisor') => {
    const data = readDatabase();
    const authIndex = data.authorizations.findIndex((a) => a.id === authId);
    if (authIndex === -1) return null;

    const auth = data.authorizations[authIndex];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    auth.status = 'REJECTED';
    auth.decidedBy = approverName;
    auth.decidedAt = timeStr;
    auth.rejectionReason = reason;
    data.authorizations[authIndex] = auth;

    // Update Incident
    const incidentIndex = data.incidents.findIndex((i) => i.id === auth.incidentId);
    if (incidentIndex !== -1) {
      const incident = data.incidents[incidentIndex];
      incident.status = 'ESCALATED';
      incident.updatedAt = timeStr;

      data.incidentEvents.unshift({
        id: `evt-${Date.now()}-rej`,
        incidentId: incident.id,
        timestamp: timeStr,
        title: 'Authorization rejected',
        description: `${approverName} rejected proposed action: "${reason}". Incident escalated for manual review.`,
        category: 'authorization',
        actor: approverName,
      });

      data.incidents[incidentIndex] = incident;
    }

    // Audit Log
    data.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: timeStr,
      title: 'Authorization rejected',
      description: `${approverName} rejected authorization ${authId} for ${auth.incidentId}. Reason: ${reason}`,
      category: 'Authorizations',
      actor: approverName,
      targetId: authId,
    });

    writeDatabase(data);
    return auth;
  },

  // WORK ORDERS
  getWorkOrders: () => readDatabase().workOrders,
  getWorkOrder: (id: string) => readDatabase().workOrders.find((w) => w.id === id),

  completeWorkOrder: (workOrderId: string, technicianName = 'James Okoro') => {
    const data = readDatabase();
    const woIndex = data.workOrders.findIndex((w) => w.id === workOrderId);
    if (woIndex === -1) return null;

    const wo = data.workOrders[woIndex];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    wo.status = 'Completed';
    wo.completedAt = timeStr;
    data.workOrders[woIndex] = wo;

    // Trigger incident state transition to AWAITING_VERIFICATION
    const incidentIndex = data.incidents.findIndex((i) => i.id === wo.incidentId);
    if (incidentIndex !== -1) {
      const incident = data.incidents[incidentIndex];
      incident.status = 'AWAITING_VERIFICATION';
      incident.updatedAt = timeStr;

      data.incidentEvents.unshift({
        id: `evt-${Date.now()}-comp`,
        incidentId: incident.id,
        timestamp: timeStr,
        title: 'Repair marked complete',
        description: `Technician ${technicianName} completed work order ${wo.id}. System entering verification phase.`,
        category: 'work_order',
        actor: technicianName,
      });

      data.incidents[incidentIndex] = incident;
    }

    // Audit Log
    data.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: timeStr,
      title: 'Work order completed',
      description: `${technicianName} completed ${workOrderId} for ${wo.assetName}`,
      category: 'Work Orders',
      actor: technicianName,
      targetId: workOrderId,
    });

    writeDatabase(data);
    return wo;
  },

  // INDEPENDENT VERIFICATION & RESOLUTION ENGINE
  verifyAndResolveIncident: (incidentId: string) => {
    const data = readDatabase();
    const incidentIndex = data.incidents.findIndex((i) => i.id === incidentId);
    if (incidentIndex === -1) return null;

    const incident = data.incidents[incidentIndex];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Independent Telemetry Verification
    // Normal operating range: Temperature <= 75°C, Vibration <= 0.15g
    const postTemp = 71; // Simulated real telemetry feedback
    const postVib = 0.12;
    const isPassing = postTemp <= 75 && postVib <= 0.15;

    incident.postRepairCondition = {
      temperature: postTemp,
      vibration: postVib,
      verifiedAt: timeStr,
      verifiedStatus: isPassing ? 'Verified' : 'Failed',
    };

    if (isPassing) {
      incident.status = 'RESOLVED';
      incident.resolvedAt = timeStr;
      incident.updatedAt = timeStr;

      // Update Asset Telemetry and Status in Database
      const assetIndex = data.assets.findIndex((a) => a.id === incident.assetId);
      if (assetIndex !== -1) {
        data.assets[assetIndex].status = 'Online';
        data.assets[assetIndex].telemetry.temperature = postTemp;
        data.assets[assetIndex].telemetry.vibration = postVib;
        data.assets[assetIndex].maintenanceHistory.unshift({
          date: 'Today',
          event: `Resolved ${incident.id}: Drive bearing replaced and verified.`,
        });
      }

      data.incidentEvents.unshift(
        {
          id: `evt-${Date.now()}-verif`,
          incidentId,
          timestamp: timeStr,
          title: 'Telemetry verified',
          description: `Independent telemetry test: Temperature 71°C (Normal), Vibration 0.12g (Normal). Passed operating criteria.`,
          category: 'verification',
          actor: 'Verification Agent',
        },
        {
          id: `evt-${Date.now()}-res`,
          incidentId,
          timestamp: timeStr,
          title: 'Incident closed & resolved',
          description: 'All criteria satisfied. Operational loop successfully closed.',
          category: 'resolution',
          actor: 'ExceptionOS Core',
        }
      );

      data.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeFormatted: timeStr,
        title: 'Incident resolved',
        description: `Incident ${incidentId} independently verified and resolved. Asset returned to Online status.`,
        category: 'Incidents',
        actor: 'Verification Agent',
        targetId: incidentId,
      });
    } else {
      incident.status = 'ESCALATED';
      incident.updatedAt = timeStr;

      data.incidentEvents.unshift({
        id: `evt-${Date.now()}-verif-fail`,
        incidentId,
        timestamp: timeStr,
        title: 'Verification failed',
        description: `Telemetry readings (Temp: ${postTemp}°C, Vib: ${postVib}g) remain outside acceptable limits. Escalated.`,
        category: 'verification',
        actor: 'Verification Agent',
      });
    }

    data.incidents[incidentIndex] = incident;
    writeDatabase(data);
    return incident;
  },

  // AUDIT LOGS
  getAuditLogs: (category?: string) => {
    let list = readDatabase().auditLogs;
    if (category && category !== 'All') {
      list = list.filter((l) => l.category.toLowerCase() === category.toLowerCase());
    }
    return list;
  },

  // AUTHORIZATIONS LIST
  getAuthorizations: () => readDatabase().authorizations,
};
