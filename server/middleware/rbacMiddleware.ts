import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  OPERATIONS_MANAGER: 'Operations Manager',
  FACILITY_OPERATOR: 'Facility Operator',
  NETWORK_ENGINEER: 'Network Engineer',
  TECHNICIAN: 'Technician',
  COMPLIANCE_AUDITOR: 'Compliance Auditor',
  AUDITOR: 'Auditor',
  OPERATOR: 'Operator',
  STAFF: 'Staff',
  USER: 'User',
} as const;

export const ROLE_GROUPS = {
  ADMINS: ['Super Admin', 'Admin'],
  OPS: ['Super Admin', 'Admin', 'Operations Manager', 'Facility Operator'],
  INFRASTRUCTURE: ['Super Admin', 'Admin', 'Operations Manager', 'Facility Operator', 'Network Engineer', 'Technician'],
  AUDIT_READ: ['Super Admin', 'Admin', 'Operations Manager', 'Facility Operator', 'Network Engineer', 'Technician', 'Compliance Auditor', 'Auditor', 'Operator', 'Staff', 'User'],
};

/**
 * Enforces that a request has a verified authenticated user context.
 * Returns HTTP 401 Unauthorized if not authenticated.
 */
export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a valid Authorization Bearer token.',
    });
  }
  return next();
};

/**
 * Enforces Role-Based Access Control (RBAC).
 * Returns HTTP 403 Forbidden if the user's role does not meet the requirement.
 */
export const requireRole = (allowedRoles: readonly string[] | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required before verifying role permissions.',
      });
    }

    const userRole = req.user.role || 'Staff';

    // Super Admin / Admin always bypasses role restrictions
    if (userRole === 'Super Admin' || userRole === 'Admin') {
      return next();
    }

    // Check if the user's role matches any of the allowed roles
    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: `Access Denied: Role '${userRole}' does not have sufficient permissions for this operation.`,
      requiredRoles: allowedRoles,
      userRole,
    });
  };
};
