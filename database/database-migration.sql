-- MIGRAÇÃO COMPLETA - FINTOGETHER
-- ⚠️  ATENÇÃO: REMOVE COMPLETAMENTE TUDO DO BANCO!
-- Este script destrói TODAS as tabelas, funções, tipos, políticas, etc.

BEGIN;

-- ============================================================================
-- LIMPEZA TOTAL DO BANCO - DESTROI TUDO NO SCHEMA PUBLIC
-- ============================================================================

SET session_replication_role = replica;

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

SET session_replication_role = DEFAULT;

-- ============================================================================
-- CRIAÇÃO DE TIPOS ENUM
-- ============================================================================
CREATE TYPE transaction_type AS ENUM ('receita', 'despesa');
CREATE TYPE privacy_level AS ENUM ('privado', 'casal');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'cancelled');

-- ============================================================================
-- TABELAS PRINCIPAIS
-- ============================================================================

-- USERS
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  couple_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- COUPLES
CREATE TABLE public.couples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text DEFAULT 'Nosso Casal',
  partner_1_email text NOT NULL,
  partner_2_email text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  partner_1_accepted boolean DEFAULT false,
  partner_2_accepted boolean DEFAULT false,
  shared_budget_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT different_partners CHECK (partner_1_email != partner_2_email),
  CONSTRAINT unique_couple UNIQUE (partner_1_email, partner_2_email)
);

-- ACCOUNTS
CREATE TABLE public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  couple_id uuid REFERENCES public.couples(id) ON DELETE SET NULL,
  name text NOT NULL,
  type text CHECK (type IN ('checking', 'savings', 'investment', 'cash', 'credit_card')),
  bank_name text,
  initial_balance numeric(15,2) DEFAULT 0,
  current_balance numeric(15,2) DEFAULT 0,
  credit_limit numeric(15,2) DEFAULT 0,
  is_shared boolean DEFAULT false,
  is_active boolean DEFAULT true,
  color text DEFAULT '#3B82F6',
  icon text DEFAULT '🏦',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  couple_id uuid REFERENCES public.couples(id) ON DELETE SET NULL,
  name text NOT NULL,
  type transaction_type NOT NULL,
  icon text DEFAULT '💰',
  color text DEFAULT '#3B82F6',
  is_system boolean DEFAULT false,
  is_active boolean DEFAULT true,
  parent_category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- TRANSACTIONS
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  couple_id uuid REFERENCES public.couples(id) ON DELETE SET NULL,
  account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  amount numeric(15,2) NOT NULL CHECK (amount > 0),
  type transaction_type NOT NULL,
  privacy privacy_level DEFAULT 'privado',
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  status transaction_status DEFAULT 'completed',
  payment_method text,
  location text,
  receipt_url text,
  tags text[] DEFAULT '{}',
  installments integer DEFAULT 1 CHECK (installments > 0),
  installment_number integer DEFAULT 1 CHECK (installment_number > 0),
  parent_transaction_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL,
  recurring_rule_id uuid,
  special_type text DEFAULT 'simples' CHECK (special_type IN ('simples', 'parcela', 'assinado')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RECURRING RULES
CREATE TABLE public.recurring_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  couple_id uuid REFERENCES public.couples(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  amount numeric(15,2) NOT NULL CHECK (amount > 0),
  type transaction_type NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  payment_method text,
  location text,
  tags text[] DEFAULT '{}',
  privacy privacy_level DEFAULT 'privado',
  frequency text CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')) NOT NULL,
  interval_count integer DEFAULT 1 CHECK (interval_count > 0),
  start_date date NOT NULL,
  end_date date,
  max_occurrences integer,
  next_execution_date date NOT NULL,
  execution_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.users
  ADD CONSTRAINT fk_users_couple_id FOREIGN KEY (couple_id)
  REFERENCES public.couples(id) ON DELETE SET NULL;

ALTER TABLE public.transactions
  ADD CONSTRAINT fk_transactions_recurring_rule_id FOREIGN KEY (recurring_rule_id)
  REFERENCES public.recurring_rules(id) ON DELETE SET NULL;

-- ============================================================================
-- ÍNDICES
-- ============================================================================
CREATE INDEX idx_transactions_user_date_status ON public.transactions(user_id, transaction_date DESC, status);
CREATE INDEX idx_transactions_couple_privacy_date ON public.transactions(couple_id, privacy, transaction_date DESC) WHERE couple_id IS NOT NULL;
CREATE INDEX idx_categories_user_type ON public.categories(user_id, type);
CREATE INDEX idx_accounts_user ON public.accounts(user_id);
CREATE INDEX idx_recurring_rules_active_user ON public.recurring_rules(is_active, user_id, next_execution_date);

-- ============================================================================
-- RLS + POLÍTICAS
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_rules ENABLE ROW LEVEL SECURITY;

-- Políticas otimizadas com scalar subqueries para melhor performance
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (id = (SELECT auth.uid()));
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (id = (SELECT auth.uid()));
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can view their couples" ON public.couples FOR SELECT USING (
  partner_1_email = (SELECT email FROM public.users WHERE id = (SELECT auth.uid())) OR
  partner_2_email = (SELECT email FROM public.users WHERE id = (SELECT auth.uid()))
);

CREATE POLICY "Users can insert couples" ON public.couples FOR INSERT WITH CHECK (
  partner_1_email = (SELECT email FROM public.users WHERE id = (SELECT auth.uid())) OR
  partner_2_email = (SELECT email FROM public.users WHERE id = (SELECT auth.uid()))
);

CREATE POLICY "Users can update their couples" ON public.couples FOR UPDATE USING (
  partner_1_email = (SELECT email FROM public.users WHERE id = (SELECT auth.uid())) OR
  partner_2_email = (SELECT email FROM public.users WHERE id = (SELECT auth.uid()))
);

CREATE POLICY "Users can delete their couples" ON public.couples FOR DELETE USING (
  partner_1_email = (SELECT email FROM public.users WHERE id = (SELECT auth.uid())) OR
  partner_2_email = (SELECT email FROM public.users WHERE id = (SELECT auth.uid()))
);

CREATE POLICY "Users can view own accounts" ON public.accounts FOR SELECT USING (
  user_id = (SELECT auth.uid()) OR
  (is_shared = true AND couple_id IN (SELECT couple_id FROM public.users WHERE id = (SELECT auth.uid())))
);

CREATE POLICY "Users can insert own accounts" ON public.accounts FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can update own accounts" ON public.accounts FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can delete own accounts" ON public.accounts FOR DELETE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view own or system categories" ON public.categories FOR SELECT USING (
  user_id = (SELECT auth.uid()) OR
  is_system = true OR
  couple_id IN (SELECT couple_id FROM public.users WHERE id = (SELECT auth.uid()))
);

CREATE POLICY "Users can insert own categories" ON public.categories FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can update own categories" ON public.categories FOR UPDATE USING (user_id = (SELECT auth.uid()) AND is_system = false);
CREATE POLICY "Users can delete own categories" ON public.categories FOR DELETE USING (user_id = (SELECT auth.uid()) AND is_system = false);

CREATE POLICY "Users can view own or shared transactions" ON public.transactions FOR SELECT USING (
  user_id = (SELECT auth.uid()) OR
  (privacy = 'casal' AND couple_id IN (SELECT couple_id FROM public.users WHERE id = (SELECT auth.uid()) AND couple_id IS NOT NULL))
);

CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view own recurring rules" ON public.recurring_rules FOR SELECT USING (
  user_id = (SELECT auth.uid()) OR
  couple_id IN (SELECT couple_id FROM public.users WHERE id = (SELECT auth.uid()))
);

CREATE POLICY "Users can insert own recurring rules" ON public.recurring_rules FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can update own recurring rules" ON public.recurring_rules FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can delete own recurring rules" ON public.recurring_rules FOR DELETE USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- FUNÇÃO DE SINCRONIZAÇÃO DE USUÁRIOS (com search_path fixo)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- FUNÇÕES AUXILIARES (com search_path fixo para segurança)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_default_category_id(transaction_type transaction_type)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN (
    SELECT id FROM public.categories
    WHERE name = 'Sem Categoria'
      AND type = transaction_type
      AND is_system = true
      AND is_active = true
    LIMIT 1
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_user_exists(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_exists boolean;
  auth_user record;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = user_uuid) INTO user_exists;
  IF user_exists THEN RETURN true; END IF;

  SELECT * FROM auth.users WHERE id = user_uuid INTO auth_user;
  IF NOT FOUND THEN RETURN false; END IF;

  INSERT INTO public.users (id, email, full_name, avatar_url, created_at, updated_at)
  VALUES (
    auth_user.id,
    auth_user.email,
    COALESCE(auth_user.raw_user_meta_data->>'full_name', auth_user.raw_user_meta_data->>'name'),
    COALESCE(auth_user.raw_user_meta_data->>'avatar_url', auth_user.raw_user_meta_data->>'picture'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    updated_at = NOW();

  RETURN true;
END;
$$;

-- ============================================================================
-- SEED DE CATEGORIAS PADRÃO
-- ============================================================================
INSERT INTO public.categories (id, name, type, icon, color, is_system, is_active)
VALUES
  -- Categorias "Sem Categoria" obrigatórias
  ('00000000-0000-0000-0000-000000000001', 'Sem Categoria', 'receita', '📥', '#6B7280', true, true),
  ('00000000-0000-0000-0000-000000000002', 'Sem Categoria', 'despesa', '📤', '#6B7280', true, true),

  -- Categorias de RECEITAS padrão
  ('10000000-0000-0000-0000-000000000001', 'Salário', 'receita', '💼', '#059669', true, true),
  ('10000000-0000-0000-0000-000000000002', 'Freelance', 'receita', '💻', '#10b981', true, true),
  ('10000000-0000-0000-0000-000000000003', 'Investimentos', 'receita', '📈', '#34d399', true, true),
  ('10000000-0000-0000-0000-000000000004', 'Aluguel', 'receita', '🏠', '#6ee7b7', true, true),
  ('10000000-0000-0000-0000-000000000005', 'Prêmios', 'receita', '🎁', '#a7f3d0', true, true),
  ('10000000-0000-0000-0000-000000000006', 'Vendas', 'receita', '🛒', '#047857', true, true),
  ('10000000-0000-0000-0000-000000000007', 'Outros', 'receita', '💰', '#065f46', true, true),

  -- Categorias de DESPESAS padrão
  ('20000000-0000-0000-0000-000000000001', 'Alimentação', 'despesa', '🍔', '#e11d48', true, true),
  ('20000000-0000-0000-0000-000000000002', 'Transporte', 'despesa', '🚗', '#f43f5e', true, true),
  ('20000000-0000-0000-0000-000000000003', 'Moradia', 'despesa', '🏡', '#fb7185', true, true),
  ('20000000-0000-0000-0000-000000000004', 'Saúde', 'despesa', '🏥', '#fda4af', true, true),
  ('20000000-0000-0000-0000-000000000005', 'Educação', 'despesa', '📚', '#fecdd3', true, true),
  ('20000000-0000-0000-0000-000000000006', 'Lazer', 'despesa', '🎮', '#be185d', true, true),
  ('20000000-0000-0000-0000-000000000007', 'Vestuário', 'despesa', '👕', '#9f1239', true, true),
  ('20000000-0000-0000-0000-000000000008', 'Beleza', 'despesa', '💅', '#881337', true, true),
  ('20000000-0000-0000-0000-000000000009', 'Pets', 'despesa', '🐾', '#fb923c', true, true),
  ('20000000-0000-0000-0000-000000000010', 'Contas', 'despesa', '📄', '#ea580c', true, true),
  ('20000000-0000-0000-0000-000000000011', 'Outros', 'despesa', '💸', '#dc2626', true, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TRIGGER PARA SINCRONIZAR couple_id NA TABELA USERS QUANDO CASAL É ATIVADO
-- ============================================================================
CREATE OR REPLACE FUNCTION public.sync_users_couple_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Quando um casal se torna ativo, atualizar couple_id nos users
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
    -- Atualizar ambos os parceiros
    UPDATE public.users
    SET couple_id = NEW.id, updated_at = NOW()
    WHERE email IN (NEW.partner_1_email, NEW.partner_2_email);
  END IF;

  -- Quando um casal se torna inativo, remover couple_id dos users
  IF NEW.status = 'inactive' AND OLD.status = 'active' THEN
    UPDATE public.users
    SET couple_id = NULL, updated_at = NOW()
    WHERE couple_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_users_couple_id_trigger ON public.couples;
CREATE TRIGGER sync_users_couple_id_trigger
AFTER INSERT OR UPDATE ON public.couples
FOR EACH ROW EXECUTE FUNCTION public.sync_users_couple_id();

COMMIT;
