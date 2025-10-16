import { ReactNode } from 'react';

// Interface para itens de navegação
export interface NavItem {
  title: string;
  icon: string;
  href?: string;
  children?: NavItem[];
}

// Interface para propriedades de componentes de layout
export interface DashboardLayoutProps {
  children: ReactNode;
}

export interface SidebarProps {
  className?: string;
}

// Interface para propriedades dos componentes da logo
export interface FinTogetherLogoProps {
  size?: number;
  className?: string;
}

// Interface para configurações de tema
export interface ThemeConfig {
  primary_color: string;
  secondary_color: string;
  dark_mode: boolean;
}

// Interface para notificações
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

// Interface para mensagens de sistema
export interface SystemMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
