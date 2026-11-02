import { Request, Response, NextFunction } from 'express';

// Regular expressions for validation
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_REGEX = /^[+]?[0-9\s\-()]{7,25}$/;

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'email' | 'phone' | 'enum';
  enumValues?: readonly string[];
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  custom?: (value: any, body: any) => string | null;
}

export const validateRequest = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const errors: { field: string; message: string }[] = [];

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request payload: Body must be a valid JSON object',
      });
    }

    for (const rule of rules) {
      const value = body[rule.field];

      // Check required
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: rule.field,
          message: `${rule.field} is required`,
        });
        continue;
      }

      // If value is provided, check types and constraints
      if (value !== undefined && value !== null && value !== '') {
        // String type
        if (rule.type === 'string' && typeof value !== 'string') {
          errors.push({ field: rule.field, message: `${rule.field} must be a string` });
        }

        // Email type
        if (rule.type === 'email') {
          if (typeof value !== 'string' || !EMAIL_REGEX.test(value.trim())) {
            errors.push({ field: rule.field, message: `${rule.field} must be a valid email address` });
          }
        }

        // Phone type
        if (rule.type === 'phone') {
          if (typeof value !== 'string' || !PHONE_REGEX.test(value.trim())) {
            errors.push({ field: rule.field, message: `${rule.field} must be a valid phone number` });
          }
        }

        // Number type
        if (rule.type === 'number') {
          const num = Number(value);
          if (isNaN(num)) {
            errors.push({ field: rule.field, message: `${rule.field} must be a valid number` });
          } else {
            if (rule.min !== undefined && num < rule.min) {
              errors.push({ field: rule.field, message: `${rule.field} must be at least ${rule.min}` });
            }
            if (rule.max !== undefined && num > rule.max) {
              errors.push({ field: rule.field, message: `${rule.field} must not exceed ${rule.max}` });
            }
          }
        }

        // Boolean type
        if (rule.type === 'boolean' && typeof value !== 'boolean') {
          errors.push({ field: rule.field, message: `${rule.field} must be a boolean` });
        }

        // Enum type
        if (rule.type === 'enum' && rule.enumValues) {
          if (!rule.enumValues.includes(String(value))) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be one of: ${rule.enumValues.join(', ')}`,
            });
          }
        }

        // Min / Max length
        if (typeof value === 'string') {
          if (rule.minLength !== undefined && value.trim().length < rule.minLength) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be at least ${rule.minLength} characters long`,
            });
          }
          if (rule.maxLength !== undefined && value.trim().length > rule.maxLength) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must not exceed ${rule.maxLength} characters`,
            });
          }
        }

        // Custom validator
        if (rule.custom) {
          const customError = rule.custom(value, body);
          if (customError) {
            errors.push({ field: rule.field, message: customError });
          }
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: errors.map(e => e.message).join('; '),
        errors,
      });
    }

    next();
  };
};

// ==============================================================================
// ENTITY VALIDATION SCHEMAS
// ==============================================================================

export const validateDataCenter = validateRequest([
  { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
  { field: 'code', required: true, type: 'string', minLength: 2, maxLength: 20 },
  { field: 'city', required: true, type: 'string', minLength: 2 },
  { field: 'state', required: true, type: 'string', minLength: 2 },
  { field: 'totalRacks', type: 'number', min: 0 },
  { field: 'totalServers', type: 'number', min: 0 },
  { field: 'powerCapacityKw', type: 'number', min: 0 },
  { field: 'status', type: 'enum', enumValues: ['Active', 'Planned', 'Under Maintenance'] as const },
]);

export const validateRack = validateRequest([
  { field: 'rackNumber', required: true, type: 'string', minLength: 2 },
  { field: 'dataCenterId', required: true, type: 'string', minLength: 2 },
  { field: 'totalUnits', type: 'number', min: 1, max: 100 },
  { field: 'usedUnits', type: 'number', min: 0 },
  { field: 'maxPowerKw', type: 'number', min: 0 },
  { field: 'currentPowerKw', type: 'number', min: 0 },
  { field: 'status', type: 'enum', enumValues: ['Available', 'Full', 'Under Maintenance'] as const },
]);

export const validateServer = validateRequest([
  { field: 'assetTag', required: true, type: 'string', minLength: 2 },
  { field: 'hostname', required: true, type: 'string', minLength: 2 },
  { field: 'dataCenterId', required: true, type: 'string' },
  { field: 'rackId', required: true, type: 'string' },
  { field: 'ramGb', type: 'number', min: 1 },
  { field: 'storageTb', type: 'number', min: 0 },
  { field: 'status', type: 'enum', enumValues: ['Available', 'In Use', 'Under Maintenance', 'Not Working'] as const },
]);

export const validateClient = validateRequest([
  { field: 'name', required: true, type: 'string', minLength: 2 },
  { field: 'email', required: true, type: 'email' },
  { field: 'phone', type: 'phone' },
  { field: 'billingType', type: 'enum', enumValues: ['Monthly', 'Quarterly', 'Annual'] as const },
  { field: 'status', type: 'enum', enumValues: ['Active', 'Suspended', 'Pending'] as const },
  { field: 'slaTier', type: 'enum', enumValues: ['Standard', 'Premium', 'Mission Critical'] as const },
]);

export const validateAllocation = validateRequest([
  { field: 'serverId', required: true, type: 'string' },
  { field: 'clientId', required: true, type: 'string' },
  { field: 'purpose', type: 'string' },
  { field: 'bandwidthQuotaTb', type: 'number', min: 0 },
  { field: 'status', type: 'enum', enumValues: ['Active', 'Pending Termination', 'Terminated'] as const },
]);

export const validateMaintenance = validateRequest([
  { field: 'title', required: true, type: 'string', minLength: 3 },
  { field: 'dataCenterName', required: true, type: 'string' },
  { field: 'type', type: 'enum', enumValues: ['Preventive', 'Hardware Replacement', 'Firmware Update', 'Emergency Repair'] as const },
  { field: 'priority', type: 'enum', enumValues: ['Low', 'Medium', 'High', 'Critical'] as const },
  { field: 'status', type: 'enum', enumValues: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'] as const },
]);

export const validateOrganization = validateRequest([
  { field: 'name', required: true, type: 'string', minLength: 2 },
  { field: 'code', required: true, type: 'string', minLength: 2 },
  { field: 'email', required: true, type: 'email' },
  { field: 'status', type: 'enum', enumValues: ['Active', 'Inactive', 'Suspended'] as const },
]);

export const validateUser = validateRequest([
  { field: 'email', required: true, type: 'email' },
  { field: 'role', required: true, type: 'enum', enumValues: [
    'Admin', 'Super Admin', 'Operations Manager', 'Facility Operator',
    'Network Engineer', 'Technician', 'Compliance Auditor', 'Auditor',
    'Operator', 'Staff', 'User'
  ] as const },
  { field: 'status', type: 'enum', enumValues: ['Active', 'Inactive', 'Suspended', 'Invited'] as const },
]);

export const validateNotification = validateRequest([
  { field: 'title', required: true, type: 'string', minLength: 2 },
  { field: 'message', required: true, type: 'string', minLength: 2 },
  { field: 'priority', type: 'enum', enumValues: ['info', 'warning', 'critical'] as const },
]);

export const validateReport = validateRequest([
  { field: 'title', required: true, type: 'string', minLength: 2 },
  { field: 'type', required: true, type: 'enum', enumValues: ['Capacity', 'Maintenance', 'Server Usage', 'Client Allocation', 'Audit Log'] as const },
  { field: 'period', required: true, type: 'string' },
]);
