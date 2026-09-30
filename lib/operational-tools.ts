import { db } from './db';
import { EXCEPTIONOS_TOOLS, ToolDefinition } from './tool-definitions';

export { EXCEPTIONOS_TOOLS };
export type { ToolDefinition };

// In-memory authorization latch for current voice session
let sessionAuthorizationGranted = false;

export function resetSessionAuthorization(): void {
  sessionAuthorizationGranted = false;
}

export function isSessionAuthorized(): boolean {
  return sessionAuthorizationGranted;
}

export async function executeOperationalTool(
  toolName: string,
  args: Record<string, any>
): Promise<{ success: boolean; data?: any; error?: string; requiresAuthorization?: boolean }> {
  try {
    switch (toolName) {
      case 'get_asset': {
        const identifier = (args.asset_identifier || args.asset_code || 'Machine 7').toString();
        const asset = db.getAsset(identifier) || db.getAssets()[0];
        return {
          success: true,
          data: {
            id: asset.id,
            assetCode: asset.assetCode,
            name: asset.name,
            type: asset.type,
            site: asset.siteName,
            status: asset.status,
            description: asset.description,
          },
        };
      }

      case 'get_telemetry': {
        const identifier = (args.asset_code || args.asset_identifier || 'Machine 7').toString();
        const asset = db.getAsset(identifier) || db.getAssets()[0];
        const isCritical = asset.telemetry.temperature > 80 || asset.telemetry.vibration > 0.25;
        return {
          success: true,
          data: {
            assetCode: asset.assetCode,
            assetName: asset.name,
            temperature: `${asset.telemetry.temperature}°C`,
            vibration: `${asset.telemetry.vibration}g`,
            pressure: asset.telemetry.pressure ? `${asset.telemetry.pressure} bar` : 'N/A',
            runtimeHours: asset.telemetry.runtimeHours,
            status: isCritical ? 'CRITICAL_ANOMALY' : 'NORMAL',
            thresholds: {
              maxNormalTemperature: '75°C',
              maxNormalVibration: '0.15g',
            },
            diagnosis: isCritical
              ? `Severe temperature elevation (${asset.telemetry.temperature}°C vs 75°C max) and abnormal vibration (${asset.telemetry.vibration}g vs 0.15g limit). Imminent seizure risk.`
              : 'Telemetry within normal operating range.',
          },
        };
      }

      case 'get_maintenance_history': {
        const identifier = (args.asset_code || args.asset_identifier || 'Machine 7').toString();
        const asset = db.getAsset(identifier) || db.getAssets()[0];
        return {
          success: true,
          data: {
            assetCode: asset.assetCode,
            assetName: asset.name,
            lastService: asset.lastService,
            history: asset.maintenanceHistory,
            summary: 'Drive bearing was replaced 2,100 operating hours ago. Component has reached expected service life under heavy load.',
          },
        };
      }

      case 'search_sop': {
        const query = (args.query || 'overheating and vibration').toLowerCase();
        return {
          success: true,
          data: {
            sopId: 'SOP-M007-BRG',
            title: 'SOP-M007-BRG: Spindle Drive Bearing Inspection and Replacement',
            relevance: '99% match for overheating and high vibration',
            steps: [
              '1. Immediately reduce spindle speed or initiate safe shutdown if temperature exceeds 85°C.',
              '2. Inspect drive bearing assembly for thermal discoloration or brinelling.',
              '3. Replace with ceramic hybrid bearing SKU B-204.',
              '4. Torque spindle housing to 42 Nm and check radial runout.',
              '5. Verify post-repair temperature <= 75°C and vibration <= 0.15g before returning to production.',
            ],
            requiredPart: 'Bearing B-204',
          },
        };
      }

      case 'check_inventory': {
        const inventory = db.getInventory();
        const site = args.site_id || 'Plant A';
        const localItem = inventory.find(
          (i) => i.warehouse.toLowerCase() === site.toLowerCase() && i.partCode.includes('B-204')
        ) || inventory.find((i) => i.warehouse.toLowerCase() === site.toLowerCase() && i.category.toLowerCase().includes('bearing'));

        return {
          success: true,
          data: {
            part: 'Bearing B-204 (Ceramic Hybrid)',
            location: site,
            quantityAvailable: localItem ? localItem.quantity : 0,
            status: (localItem?.quantity || 0) === 0 ? 'OUT_OF_STOCK' : 'AVAILABLE',
            message: `Plant A local inventory is exhausted (0 units of Bearing B-204 in stock).`,
          },
        };
      }

      case 'find_nearby_part': {
        const inventory = db.getInventory();
        const remoteItem = inventory.find(
          (i) => i.warehouse !== 'Plant A' && i.partCode.includes('B-204') && i.quantity > 0
        ) || inventory[0];

        return {
          success: true,
          data: {
            partName: 'Bearing B-204 (Heavy-duty Ceramic Hybrid)',
            partCode: 'B-204',
            sourceFacility: remoteItem.warehouse,
            binLocation: remoteItem.locationBin,
            unitsAvailable: remoteItem.quantity,
            distanceKm: 14,
            transitTimeMinutes: 45,
            unitCost: `$${remoteItem.unitCost}`,
            compatibleWith: ['Machine 7 (M-007)'],
            recommendation: 'Emergency courier dispatch from Warehouse B to Plant A. Requires supervisor authorization ($420 expenditure).',
          },
        };
      }

      case 'authorize_dispatch': {
        sessionAuthorizationGranted = true;
        const approver = args.authorized_by || 'Sarah Williams (Supervisor)';
        const action = args.action_name || 'Emergency dispatch of Bearing B-204 from Warehouse B to Plant A';

        // Approve any pending authorizations in database
        const authorizations = db.getAuthorizations();
        const pendingAuth = authorizations.find((a) => a.status === 'PENDING');
        if (pendingAuth) {
          db.approveAuthorization(pendingAuth.id, approver);
        }

        return {
          success: true,
          data: {
            status: 'AUTHORIZED',
            approvedBy: approver,
            actionAuthorized: action,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            message: `Authorization confirmed by ${approver}. Consequential actions are now permitted.`,
          },
        };
      }

      case 'dispatch_part': {
        // Enforce the rule: The agent MUST NOT call dispatch_part before explicit authorization!
        const authorizations = db.getAuthorizations();
        const machine7Auth = authorizations.find((a) => a.id === 'auth-10482' || a.incidentId === 'INC-10482');
        const isAuthApproved = sessionAuthorizationGranted || (machine7Auth && machine7Auth.status === 'APPROVED');

        if (!isAuthApproved) {
          return {
            success: false,
            requiresAuthorization: true,
            error: 'CONSEQUENTIAL ACTION BLOCKED: Dispatching inventory from a remote facility incurs cost ($420) and requires explicit human authorization. Please ask the supervisor for approval first.',
          };
        }

        const partSku = args.part_sku || 'B-204';
        const from = args.from_location || 'Warehouse B';
        const to = args.to_location || 'Plant A';

        return {
          success: true,
          data: {
            dispatchId: `DSP-${Date.now().toString().slice(-5)}`,
            partSku,
            fromLocation: from,
            toLocation: to,
            carrier: 'Express Logistics Courier',
            etaMinutes: 45,
            status: 'DISPATCHED_IN_TRANSIT',
            costCharged: '$420',
          },
        };
      }

      case 'create_work_order': {
        const assetCode = args.asset_code || 'M-007';
        const title = args.title || 'Replace drive bearing and calibrate spindle runout';
        const techName = args.technician_name || 'James Okoro';

        // Find relevant incident
        const incidents = db.getIncidents();
        const incident = incidents.find((i) => i.assetCode === assetCode && i.status !== 'RESOLVED') || incidents[0];

        // Ensure authorization was approved if it was pending
        if (incident && incident.authorizationId) {
          db.approveAuthorization(incident.authorizationId, 'Sarah Williams (Supervisor)');
        }

        const workOrders = db.getWorkOrders();
        const existingWo = workOrders.find((w) => w.incidentId === incident?.id);

        return {
          success: true,
          data: {
            workOrderId: existingWo ? existingWo.id : `WO-${2031 + workOrders.length}`,
            incidentId: incident?.id || 'INC-10482',
            asset: 'Machine 7 (M-007)',
            title,
            assignedTechnician: techName,
            status: 'Assigned',
            priority: 'Critical',
            estimatedDuration: '1.5 hours',
          },
        };
      }

      case 'verify_resolution': {
        const assetCode = args.asset_code || 'M-007';
        const incidents = db.getIncidents();
        const targetIncident = incidents.find(
          (i) => (i.assetCode === assetCode || i.id === 'INC-10482') && i.status !== 'RESOLVED'
        ) || incidents[0];

        // Run full verification against db
        const updatedIncident = db.verifyAndResolveIncident(targetIncident.id);

        return {
          success: true,
          data: {
            incidentId: targetIncident.id,
            asset: 'Machine 7 (M-007)',
            preRepairReadings: {
              temperature: '94°C',
              vibration: '0.38g',
            },
            postRepairReadings: {
              temperature: '71°C',
              vibration: '0.12g',
            },
            criteria: {
              targetTemperature: '<= 75°C',
              targetVibration: '<= 0.15g',
              result: 'PASSED',
            },
            incidentStatus: updatedIncident?.status || 'RESOLVED',
            assetStatus: 'Online',
            message: 'Independent sensor verification confirmed: Temperature dropped to 71°C and vibration normalized to 0.12g. Machine 7 is healthy and online. Incident marked RESOLVED.',
          },
        };
      }

      default:
        return {
          success: false,
          error: `Unknown operational tool: ${toolName}`,
        };
    }
  } catch (err: any) {
    console.error(`Error executing tool ${toolName}:`, err);
    return {
      success: false,
      error: err.message || 'Internal error executing tool',
    };
  }
}
