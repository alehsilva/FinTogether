// Interface para dados do usuário básico
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  created_at?: string;
  updated_at?: string;
}

// Interface para dados do casal (couples)
export interface CoupleData {
  id: string;
  name: string;
  partner_1_email: string;
  partner_2_email: string;
  status: 'active' | 'inactive' | 'pending';
  partner_1_accepted?: boolean;
  partner_2_accepted?: boolean;
  shared_budget_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Interface para convite de pareamento (se usada futuramente)
export interface PairingInvite {
  id: string;
  sender_email: string;
  receiver_email: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
  expires_at: string;
}

// Tipos auxiliares usados na UI (Configurações/Header)
export interface PartnerData {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
}

export interface Partner {
  name: string;
  avatar_url: string;
  email: string;
}
