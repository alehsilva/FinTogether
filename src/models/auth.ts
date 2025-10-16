import type { User } from '@supabase/supabase-js';

// Interface para usuário autenticado (estende User do Supabase)
export interface AuthUser extends User {
  coupleId?: string;
  partnerEmail?: string;
  partnerName?: string | null;
  partnerAvatarUrl?: string | null;
  coupleName?: string;
  isUser1?: boolean;
  sharedBudgetEnabled?: boolean;
}
