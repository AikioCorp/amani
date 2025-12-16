import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const DEBUG = import.meta.env.DEV === true;

if (!supabaseUrl || !supabaseAnonKey) {
  // Ne pas crasher silencieusement: log explicite
  // eslint-disable-next-line no-console
  console.error('[Supabase] Missing env vars VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  throw new Error('Missing Supabase environment variables. Please check your .env file');
}

// Configuration de l'instance Supabase avec des options de persistance de session
// IMPORTANT: protéger l'accès à window pour les builds SSR et créer un singleton pour éviter plusieurs instances
const isBrowser = typeof window !== 'undefined';
const safeStorage = isBrowser ? window.localStorage : undefined;

// Debug fetch wrapper (dev only) pour tracer toutes les requêtes effectuées par le client Supabase
const baseFetch: typeof fetch = (isBrowser && window.fetch) ? window.fetch.bind(window) : fetch;
const debugFetch: typeof fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const method = init?.method || 'GET';
  const url = typeof input === 'string' ? input : (input as URL).toString();
  const start = Date.now();
  try {
    const res = await baseFetch(input as any, init);
    const ms = Date.now() - start;
    // eslint-disable-next-line no-console
    console.log(`[Supabase][HTTP] ${method} ${url} -> ${res.status} ${res.statusText} (${ms}ms)`);
    if (!res.ok) {
      try {
        const text = await res.clone().text();
        // eslint-disable-next-line no-console
        console.warn('[Supabase][HTTP] Response body (truncated):', text.slice(0, 500));
      } catch {}
    }
    return res;
  } catch (e) {
    const ms = Date.now() - start;
    // eslint-disable-next-line no-console
    console.error(`[Supabase][HTTP] ${method} ${url} -> network error after ${ms}ms`, e);
    throw e;
  }
};

// Utiliser un storageKey spécifique à l'app pour éviter les conflits entre plusieurs clients
const authOptions = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  storage: safeStorage,
  storageKey: 'amani-finance-auth'
} as const;

// Singleton côté navigateur pour éviter le warning "Multiple GoTrueClient instances"
let clientInstance: SupabaseClient<Database>;
if (isBrowser) {
  const w = window as unknown as { __amani_supabase?: SupabaseClient<Database> };
  if (!w.__amani_supabase) {
    // eslint-disable-next-line no-console
    console.log('[Supabase] Initializing client (browser). URL:', supabaseUrl);
    w.__amani_supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: authOptions,
      global: {
        headers: {
          'X-Client-Info': 'amani-finance/1.0.0'
        },
        fetch: DEBUG ? debugFetch : baseFetch,
      }
    });
  }
  clientInstance = w.__amani_supabase;
} else {
  // En environnement non-navigateur, créer une instance isolée
  // eslint-disable-next-line no-console
  console.log('[Supabase] Initializing client (non-browser). URL:', supabaseUrl);
  clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: authOptions,
    global: {
      headers: {
        'X-Client-Info': 'amani-finance/1.0.0'
      },
      fetch: DEBUG ? debugFetch : baseFetch,
    }
  });
}

export const supabase = clientInstance;

// Outil de diagnostic rapide pour vérifier la connectivité et les permissions
export const supabaseHealthCheck = async (label = 'health-check') => {
  // eslint-disable-next-line no-console
  console.group(`[Supabase][${label}]`);
  // eslint-disable-next-line no-console
  console.log('URL:', supabaseUrl);
  try {
    const t0 = Date.now();
    const sessionRes = await clientInstance.auth.getSession();
    // eslint-disable-next-line no-console
    console.log('auth.getSession():', sessionRes);
    // quick read test (si RLS bloque, il y aura une erreur)
    const t1 = Date.now();
    const { data, error } = await clientInstance
      .from('profiles')
      .select('id')
      .limit(1);
    // eslint-disable-next-line no-console
    console.log(`test select profiles: ${Date.now() - t1}ms`, { data, error });
    // eslint-disable-next-line no-console
    console.log(`total elapsed: ${Date.now() - t0}ms`);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Health check error:', e);
  } finally {
    // eslint-disable-next-line no-console
    console.groupEnd();
  }
};

export const isSupabaseDebug = DEBUG;

// Helper functions for common operations
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Attacher des helpers de diagnostic au window (dev seulement)
if (isBrowser && DEBUG) {
  try {
    const w = window as unknown as any;
    w.__amani_diag = {
      health: supabaseHealthCheck,
      getSession: () => supabase.auth.getSession(),
      me: () => supabase.auth.getUser(),
      profiles: (limit = 5) => supabase.from('profiles').select('id, email, first_name, last_name, roles').limit(limit),
      contents: (limit = 3) => supabase.from('contents').select('id, title, status').limit(limit),
      url: supabaseUrl,
    };
    // eslint-disable-next-line no-console
    console.log('[Supabase] Debug helpers available at window.__amani_diag');
  } catch {}
}
