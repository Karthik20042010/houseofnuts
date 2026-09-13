import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || "https://iyjkliphvakkefgziqde.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5amtsaXBodmFra2VmZ3ppcWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NTY2NzUsImV4cCI6MjA5MjMzMjY3NX0.DDUXktPJRMaxc3uKYMApk1a2c1Anvo5yPUSRemGohbc";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});
