import { Request, Response, NextFunction } from 'express';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { toCamelCase } from '../utils/mapping';

// Standard development accounts configuration
interface DevAccount {
  username: string;
  email: string;
  fullName: string;
  role: string;
  devPass: string;
  assignedDataCenter: string;
}

const DEV_ACCOUNTS: Record<string, DevAccount> = {
  admin: {
    username: 'admin',
    email: 'admin@bharatdc.local',
    fullName: 'Rajesh Verma',
    role: 'Super Admin',
    devPass: 'admin123',
    assignedDataCenter: 'MUM-1',
  },
  operations: {
    username: 'operations',
    email: 'operations@bharatdc.local',
    fullName: 'Pooja Kashyap',
    role: 'Operations Manager',
    devPass: 'operations123',
    assignedDataCenter: 'DEL-2',
  },
  engineer: {
    username: 'engineer',
    email: 'engineer@bharatdc.local',
    fullName: 'Amit Pathak',
    role: 'Network Engineer',
    devPass: 'engineer123',
    assignedDataCenter: 'BLR-1',
  },
  auditor: {
    username: 'auditor',
    email: 'auditor@bharatdc.local',
    fullName: 'Suresh Menon',
    role: 'Compliance Auditor',
    devPass: 'auditor123',
    assignedDataCenter: 'HYD-1',
  },
  staff: {
    username: 'staff',
    email: 'staff@bharatdc.local',
    fullName: 'Kavita Rao',
    role: 'Staff',
    devPass: 'staff123',
    assignedDataCenter: 'MUM-1',
  },
};

export const authController = {
  // Login endpoint supporting Username or Email
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      let bodyData = req.body || {};
      if (typeof bodyData === 'string') {
        try {
          bodyData = JSON.parse(bodyData);
        } catch {}
      }
      const rawIdentifier = (bodyData.email || bodyData.username || bodyData.identifier || '').trim();
      const password = (bodyData.password || '').trim();
      const facility = bodyData.facility || 'MUM-1';

      if (!rawIdentifier || !password) {
        return res.status(400).json({
          success: false,
          error: 'Please enter both username/email and password.',
        });
      }

      const lowerId = rawIdentifier.toLowerCase();
      let resolvedEmail = rawIdentifier;
      let matchedDevAccount: DevAccount | null = null;

      // 1. Check if input is one of the dev usernames or emails
      if (DEV_ACCOUNTS[lowerId]) {
        matchedDevAccount = DEV_ACCOUNTS[lowerId];
        resolvedEmail = matchedDevAccount.email;
      } else {
        const found = Object.values(DEV_ACCOUNTS).find(
          acc =>
            acc.email.toLowerCase() === lowerId ||
            acc.email.replace('.local', '.in').toLowerCase() === lowerId ||
            acc.email.replace('.local', '.com').toLowerCase() === lowerId ||
            `${acc.username}@bharatdc.in`.toLowerCase() === lowerId
        );
        if (found) {
          matchedDevAccount = found;
          resolvedEmail = found.email;
        }
      }

      // 2. Validate Dev Account credentials if matched
      if (matchedDevAccount && password === matchedDevAccount.devPass) {
        let dbUser: any = null;
        if (isSupabaseConfigured()) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .ilike('email', resolvedEmail)
            .maybeSingle();
          if (data) dbUser = toCamelCase(data);
        }

        const userObj = {
          id: dbUser?.id || `usr-${matchedDevAccount.username}`,
          email: matchedDevAccount.email,
          username: matchedDevAccount.username,
          fullName: matchedDevAccount.fullName,
          name: matchedDevAccount.fullName,
          role: matchedDevAccount.role,
          assignedDataCenter: dbUser?.assignedDataCenter || matchedDevAccount.assignedDataCenter || facility,
          status: 'Active',
          lastLogin: new Date().toISOString(),
          phone: dbUser?.phone || '+91 22 2400 9001',
        };

        return res.json({
          success: true,
          user: userObj,
          token: `supa-session-${userObj.id}`,
        });
      }

      // 3. Authenticate with Supabase Auth if configured
      if (isSupabaseConfigured()) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: resolvedEmail,
          password: password,
        });

        if (!authError && authData.user) {
          // Fetch linked profile from database users table
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('email', resolvedEmail)
            .maybeSingle();

          const roleFromMeta = authData.user.user_metadata?.role || 'Staff';
          const nameFromMeta = authData.user.user_metadata?.full_name || resolvedEmail.split('@')[0];

          const userData = userProfile
            ? toCamelCase(userProfile)
            : {
                id: authData.user.id,
                email: authData.user.email,
                fullName: nameFromMeta,
                name: nameFromMeta,
                role: roleFromMeta,
                assignedDataCenter: facility,
                status: 'Active',
                lastLogin: new Date().toISOString(),
              };

          return res.json({
            success: true,
            user: userData,
            token: authData.session?.access_token || `supa-token-${authData.user.id}`,
          });
        }

        // Check if user exists in database table directly
        const { data: matchedUser } = await supabase
          .from('users')
          .select('*')
          .or(`email.ilike.${resolvedEmail},id.eq.${rawIdentifier}`)
          .maybeSingle();

        if (matchedUser) {
          // Valid database user found
          const userObj = toCamelCase(matchedUser);
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', matchedUser.id);

          return res.json({
            success: true,
            user: userObj,
            token: `supa-session-${matchedUser.id}`,
          });
        }
      }

      // If credentials do not match
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password.',
      });
    } catch (err: any) {
      console.error('[AuthController] Login error:', err);
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password.',
      });
    }
  },

  // Get current user profile
  getMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const token = authHeader.replace('Bearer ', '');

      if (isSupabaseConfigured() && !token.startsWith('supa-session-') && !token.startsWith('demo-')) {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .maybeSingle();

          return res.json({
            success: true,
            user: userProfile ? toCamelCase(userProfile) : {
              id: user.id,
              email: user.email,
              fullName: user.user_metadata?.full_name || 'Staff User',
              role: user.user_metadata?.role || 'Staff',
              status: 'Active',
            },
          });
        }
      }

      // Look up user from database or dev accounts
      const candidateId = token.replace(/^(supa-session-|demo-token-|local-token-|demo-)/, '');
      
      if (isSupabaseConfigured()) {
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(candidateId);
          let query = supabase.from('profiles').select('*');
          if (isUuid) {
            query = query.eq('id', candidateId);
          } else {
            query = query.ilike('email', `%${candidateId}%`);
          }
          const { data: dbUser } = await query.maybeSingle();
          if (dbUser) {
            return res.json({
              success: true,
              user: toCamelCase(dbUser),
            });
          }
        } catch (dbErr) {
          console.warn('[AuthController] getMe db lookup error:', dbErr);
        }
      }

      // Check for dev/session account tokens
      const matchedAccount = Object.values(DEV_ACCOUNTS).find(
        a => a.username === candidateId || `usr-${a.username}` === candidateId || a.email.toLowerCase() === candidateId.toLowerCase()
      );
      if (matchedAccount) {
        return res.json({
          success: true,
          user: {
            id: `usr-${matchedAccount.username}`,
            email: matchedAccount.email,
            username: matchedAccount.username,
            fullName: matchedAccount.fullName,
            name: matchedAccount.fullName,
            role: matchedAccount.role,
            assignedDataCenter: matchedAccount.assignedDataCenter,
            status: 'Active',
            phone: '+91 22 2400 9001',
          },
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Session invalid or expired',
      });
    } catch (err) {
      return next(err);
    }
  },

  // Logout endpoint
  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (isSupabaseConfigured()) {
        try {
          await supabase.auth.signOut();
        } catch {
          // Ignore signOut error
        }
      }
      return res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (err) {
      return next(err);
    }
  },
};
