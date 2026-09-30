export interface ToolDefinition {
  type: 'function';
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required?: string[];
  };
}

export const EXCEPTIONOS_TOOLS: ToolDefinition[] = [
  {
    type: 'function',
    name: 'get_asset',
    description: 'Look up asset details, type, status, and plant site location by asset code or name (e.g., "Machine 7", "M-007").',
    parameters: {
      type: 'object',
      properties: {
        asset_identifier: {
          type: 'string',
          description: 'Name or asset code, e.g. "Machine 7" or "M-007"',
        },
      },
      required: ['asset_identifier'],
    },
  },
  {
    type: 'function',
    name: 'get_telemetry',
    description: 'Query live sensor telemetry (temperature, vibration, pressure, runtime hours) for an asset.',
    parameters: {
      type: 'object',
      properties: {
        asset_code: {
          type: 'string',
          description: 'Asset code, e.g. "M-007" or "Machine 7"',
        },
      },
      required: ['asset_code'],
    },
  },
  {
    type: 'function',
    name: 'get_maintenance_history',
    description: 'Fetch recent maintenance logs, previous component replacements, and failure history for an asset.',
    parameters: {
      type: 'object',
      properties: {
        asset_code: {
          type: 'string',
          description: 'Asset code, e.g. "M-007"',
        },
      },
      required: ['asset_code'],
    },
  },
  {
    type: 'function',
    name: 'search_sop',
    description: 'Search Standard Operating Procedures (SOPs) for troubleshooting steps, diagnosis rules, and recovery guidelines.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Symptom or asset type, e.g. "overheating and vibration" or "bearing replacement"',
        },
      },
      required: ['query'],
    },
  },
  {
    type: 'function',
    name: 'check_inventory',
    description: 'Check stock levels for a replacement part or component in the local site warehouse.',
    parameters: {
      type: 'object',
      properties: {
        part_name: {
          type: 'string',
          description: 'Part name or category, e.g. "bearing" or "B-204"',
        },
        site_id: {
          type: 'string',
          description: 'Site name or id, e.g. "Plant A"',
        },
      },
      required: ['part_name'],
    },
  },
  {
    type: 'function',
    name: 'find_nearby_part',
    description: 'Search remote warehouses, regional distribution centers, and supplier hubs for compatible replacement parts.',
    parameters: {
      type: 'object',
      properties: {
        part_name: {
          type: 'string',
          description: 'Part name or SKU, e.g. "bearing" or "B-204"',
        },
      },
      required: ['part_name'],
    },
  },
  {
    type: 'function',
    name: 'create_work_order',
    description: 'Generate and schedule an operational maintenance work order assigned to a certified technician.',
    parameters: {
      type: 'object',
      properties: {
        asset_code: {
          type: 'string',
          description: 'Asset code, e.g. "M-007"',
        },
        title: {
          type: 'string',
          description: 'Brief work order title, e.g. "Replace drive bearing B-204 and recalibrate"',
        },
        technician_name: {
          type: 'string',
          description: 'Assigned technician name, e.g. "James Okoro"',
        },
      },
      required: ['asset_code', 'title'],
    },
  },
  {
    type: 'function',
    name: 'authorize_dispatch',
    description: 'Record explicit human authorization to approve an emergency courier dispatch or consequential expense.',
    parameters: {
      type: 'object',
      properties: {
        action_name: {
          type: 'string',
          description: 'Description of the consequential action approved by the supervisor',
        },
        authorized_by: {
          type: 'string',
          description: 'Name or role of person granting authorization, e.g. "Supervisor (Sarah Williams)"',
        },
      },
      required: ['action_name'],
    },
  },
  {
    type: 'function',
    name: 'dispatch_part',
    description: 'Execute physical dispatch and shipping of a component. WARNING: Consequential action. Requires explicit authorization first.',
    parameters: {
      type: 'object',
      properties: {
        part_sku: {
          type: 'string',
          description: 'Part code or SKU, e.g. "B-204"',
        },
        from_location: {
          type: 'string',
          description: 'Source warehouse, e.g. "Warehouse B"',
        },
        to_location: {
          type: 'string',
          description: 'Destination plant, e.g. "Plant A"',
        },
      },
      required: ['part_sku', 'from_location', 'to_location'],
    },
  },
  {
    type: 'function',
    name: 'verify_resolution',
    description: 'Independently query hardware sensors to verify that temperature and vibration have returned to baseline operating limits.',
    parameters: {
      type: 'object',
      properties: {
        asset_code: {
          type: 'string',
          description: 'Asset code to verify, e.g. "M-007" or "Machine 7"',
        },
      },
      required: ['asset_code'],
    },
  },
];
