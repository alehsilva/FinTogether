import { createClient } from './supabase/client';
import type { Database } from '@/models/database';

export const supabase = createClient();

export { createClient as createBrowserClient } from './supabase/client';
