import { Request, Response, NextFunction } from 'express';
import { supabase, isSupabaseConfigured } from '../config/supabase';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  fullName?: string;
  role: string;
  assignedDataCenter?: string;
  isDemo?: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Unauthenticated request - leave req.user undefined for requireAuth to handle
      return next();
    }

    const token = authHeader.split(' ')[1].trim();
    if (!token) {
      return next();
    }

    // Role passed from frontend context or header during session
    const headerRole = (req.headers['x-user-role'] as string) || 'Admin';

    // 1. Check for local/dev/demo session tokens
    if (token.startsWith('demo-token-') || token.startsWith('local-token-') || token.startsWith('supa-session-')) {
      const userId = token.replace(/^(demo-token-|local-token-|supa-session-)/, '');
      let detectedRole = headerRole;
      if (userId === 'usr-admin' || userId === 'admin') detectedRole = 'Super Admin';
      else if (userId === 'usr-operations' || userId === 'operations') detectedRole = 'Operations Manager';
      else if (userId === 'usr-engineer' || userId === 'engineer') detectedRole = 'Network Engineer';
      else if (userId === 'usr-auditor' || userId === 'auditor') detectedRole = 'Compliance Auditor';
      else if (userId === 'usr-staff' || userId === 'staff') detectedRole = 'Staff';

      req.user = {
        id: userId || 'usr-session',
        email: (req.headers['x-user-email'] as string) || `${userId}@bharatdc.in`,
        fullName: 'Authenticated User',
        role: detectedRole,
        isDemo: true,
      };
      return next();
    }

    // 2. Check with Supabase Auth for production JWTs
    if (isSupabaseConfigured()) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        // Token is invalid/expired - leave req.user undefined and let requireAuth guard protected routes
        return next();
      }

      // Fetch user profile role if available
      let role = user.user_metadata?.role || headerRole;
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('role, full_name, assigned_data_center')
          .eq('email', user.email || '')
          .maybeSingle();

        if (profile?.role) {
          role = profile.role;
        }
      } catch {
        // Fallback to metadata role
      }

      req.user = {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name,
        role: role || 'Staff',
        assignedDataCenter: user.user_metadata?.assigned_data_center,
      };
      return next();
    }

    // 3. Fallback token mode
    req.user = {
      id: token,
      email: 'user@bharatdc.in',
      fullName: 'Authenticated User',
      role: headerRole,
    };
    return next();
  } catch (error: any) {
    console.error('[AuthMiddleware] Error:', error?.message || error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed: Invalid credentials',
    });
  }
};
