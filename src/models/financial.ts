// ===============================================
// MODELOS FINANCEIROS - SISTEMA PARA CASAIS
// ===============================================

// Interface para transações financeiras expandida
export interface Transaction {
  id: string;
  user_id: string;
  couple_id: string | null;
  account_id: string | null;
  category_id: string;
  title: string;
  description: string | null;
  amount: number;
  type: 'receita' | 'despesa' | 'transferencia';
  privacy: 'casal' | 'privado';
  transaction_date: string;
  due_date: string | null;
  status: 'pending' | 'completed' | 'cancelled';
  payment_method: string | null;
  location: string | null;
  receipt_url: string | null;
  tags: string[] | null;
  installments: number;
  installment_number: number;
  parent_transaction_id: string | null;
  recurring_rule_id: string | null;
  special_type: 'simples' | 'parcela' | 'assinado';
  created_at: string;
  updated_at: string;
}

// Interface para transação simplificada (para formulários)
export interface TransactionForm {
  title: string;
  amount: number;
  type: 'receita' | 'despesa';
  privacy: 'casal' | 'privado';
  category_id: string;
  account_id: string | null;
  transaction_date: string;
  description?: string;
  payment_method?: string;
  location?: string;
  tags?: string[];
  special_type: 'simples' | 'parcela' | 'assinado';
  installments?: number;
  installment_number?: number;
  parent_transaction_id?: string;
  recurring_rule_id?: string;
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

// Interface para categorias hierárquicas
export interface Category {
  id: string;
  user_id: string | null;
  couple_id: string | null;
  name: string;
  type: 'receita' | 'despesa';
  icon: string;
  color: string;
  is_system: boolean;
  is_active: boolean;
  parent_category_id: string | null;
  created_at: string;
  // Campos calculados
  subcategories?: Category[];
  parent_category?: Category;
}

// Interface para contas bancárias
export interface Account {
  id: string;
  user_id: string;
  couple_id: string | null;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'cash' | 'credit_card';
  bank_name: string | null;
  initial_balance: number;
  current_balance: number;
  credit_limit: number;
  is_shared: boolean;
  is_active: boolean;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

// Interface para metas financeiras expandida
export interface FinancialGoal {
  id: string;
  user_id: string | null;
  couple_id: string | null;
  title: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  category: string | null;
  priority: 'baixa' | 'media' | 'alta';
  is_shared: boolean;
  auto_transfer: boolean;
  auto_transfer_amount: number | null;
  auto_transfer_frequency: string | null;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  completed_at: string | null;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
  // Campos calculados
  progress_percentage: number;
  days_remaining?: number;
  monthly_required?: number;
  contributions?: GoalContribution[];
}

// Interface para contribuições de metas
export interface GoalContribution {
  id: string;
  goal_id: string;
  user_id: string;
  transaction_id: string | null;
  amount: number;
  contribution_date: string;
  type: 'manual' | 'automatic' | 'transfer';
  notes: string | null;
  created_at: string;
  // Campos calculados
  user_name?: string;
}

// Interface para orçamentos
export interface Budget {
  id: string;
  user_id: string | null;
  couple_id: string | null;
  category_id: string | null;
  name: string;
  amount: number;
  spent_amount: number;
  period_type: 'mensal' | 'anual' | 'semanal';
  start_date: string;
  end_date: string;
  is_shared: boolean;
  alert_percentage: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  // Campos calculados
  remaining_amount: number;
  usage_percentage: number;
  category?: Category;
}

// Interface para resumo financeiro expandido
export interface FinancialSummary {
  // Saldos individuais do usuário principal (user1)
  individual_balance: number;
  individual_income: number;
  individual_expenses: number;

  // Saldos do usuário 1 (quando em casal)
  user1_balance: number;
  user1_income: number;
  user1_expenses: number;

  // Saldos do usuário 2 (quando em casal)
  user2_balance: number;
  user2_income: number;
  user2_expenses: number;

  // Saldos do casal
  couple_balance: number;
  couple_income: number;
  couple_expenses: number;

  // Totais consolidados
  total_balance: number;
  total_income: number;
  total_expenses: number;

  // Saldos previstos (incluindo transações pendentes)
  projected_balance: number;
  projected_income: number;
  projected_expenses: number;
  individual_projected_balance: number;
  individual_projected_income: number;
  individual_projected_expenses: number;
  couple_projected_balance: number;
  couple_projected_income: number;
  couple_projected_expenses: number;

  // Estatísticas
  transactions_count: number;
  goals_count: number;
  active_budgets_count: number;

  // Período
  month: string;
  year: number;
  period: string;

  // Comparações
  previous_month_comparison?: {
    income_change: number;
    expense_change: number;
    balance_change: number;
  };
}

// Interface para estatísticas por categoria
export interface CategorySummary {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  total_amount: number;
  transaction_count: number;
  percentage_of_total: number;
  trend: 'up' | 'down' | 'stable';
}

// Interface para dados do dashboard
export interface DashboardData {
  summary: FinancialSummary;
  recent_transactions: Transaction[];
  category_breakdown: CategorySummary[];
  goals: FinancialGoal[];
  budgets: Budget[];
  accounts: Account[];
}

// Interface para filtros de transações
export interface TransactionFilters {
  start_date?: string;
  end_date?: string;
  type?: 'receita' | 'despesa' | 'transferencia';
  privacy?: 'casal' | 'privado';
  category_ids?: string[];
  account_ids?: string[];
  min_amount?: number;
  max_amount?: number;
  search_term?: string;
  tags?: string[];
  status?: 'pending' | 'completed' | 'cancelled';
}

// Interface para regras de recorrência
export interface RecurringRule {
  id: string;
  user_id: string;
  couple_id: string | null;
  title: string;
  description: string | null;
  amount: number;
  type: 'receita' | 'despesa';
  category_id: string | null;
  account_id: string | null;
  payment_method: string | null;
  location: string | null;
  tags: string[] | null;
  privacy: 'privado' | 'casal';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval_count: number;
  start_date: string;
  end_date: string | null;
  max_occurrences: number | null;
  next_execution_date: string;
  execution_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Interface para preferências do usuário
export interface UserFinancialPreferences {
  default_currency: string;
  default_account_id?: string;
  auto_categorize: boolean;
  notification_settings: {
    budget_alerts: boolean;
    goal_milestones: boolean;
    payment_reminders: boolean;
    weekly_summary: boolean;
  };
  privacy_settings: {
    default_privacy: 'casal' | 'privado';
    shared_threshold?: number; // Valor acima do qual deve ser compartilhado
  };
}
