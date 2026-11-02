import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const cleanEnvVal = (val?: string): string => {
  if (!val) return '';
  let cleaned = val.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
};

export const getSupabaseConfig = () => {
  const url = cleanEnvVal(
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const key = cleanEnvVal(
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  return { url, key };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return Boolean(
    url &&
    key &&
    url.startsWith('http') &&
    !url.includes('placeholder') &&
    !url.includes('your-project-ref')
  );
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  const { url, key } = getSupabaseConfig();
  if (supabaseInstance && isSupabaseConfigured()) {
    return supabaseInstance;
  }

  if (isSupabaseConfigured()) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log(`[Supabase] Client initialized successfully for ${new URL(url).hostname}`);
      return supabaseInstance;
    } catch (err) {
      console.error('[Supabase] Initialization error:', err);
    }
  }

  // Fallback dummy client if credentials are missing
  console.warn('[Supabase] Warning: SUPABASE_URL or Key not provided in .env. Running in unconfigured mode.');
  supabaseInstance = createClient(
    url || 'https://placeholder.supabase.co',
    key || 'placeholder-key',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
  return supabaseInstance;
};

export const supabase = getSupabaseClient();
