-- ============================================================================
-- SCRIPT PARA LIMPAR DADOS DE TESTE - FINTOGETHER
-- ⚠️  Remove dados de usuários específicos ou dados de teste
-- ============================================================================

-- Este script permite limpar dados de forma mais seletiva
-- Útil quando você quer manter alguns usuários mas limpar dados de teste

BEGIN;

-- ============================================================================
-- OPÇÃO 1: LIMPAR DADOS DE UM USUÁRIO ESPECÍFICO
-- ============================================================================

-- Descomente e substitua 'seu-email@exemplo.com' pelo email do usuário que quer limpar
/*
DO $$
DECLARE
    target_user_id uuid;
    target_email text := 'seu-email@exemplo.com'; -- ALTERE AQUI
BEGIN
    -- Buscar o ID do usuário
    SELECT id INTO target_user_id FROM public.users WHERE email = target_email;

    IF target_user_id IS NULL THEN
        RAISE NOTICE 'Usuário com email % não encontrado', target_email;
        RETURN;
    END IF;

    RAISE NOTICE 'Limpando dados do usuário: % (ID: %)', target_email, target_user_id;

    -- Limpar na ordem correta (foreign keys)
    DELETE FROM public.transactions WHERE user_id = target_user_id;
    DELETE FROM public.recurring_rules WHERE user_id = target_user_id;
    DELETE FROM public.accounts WHERE user_id = target_user_id;
    DELETE FROM public.categories WHERE user_id = target_user_id AND is_system = false;

    -- Remover do casal se estiver em um
    UPDATE public.couples SET status = 'inactive'
    WHERE (partner_1_email = target_email OR partner_2_email = target_email)
    AND status = 'active';

    RAISE NOTICE 'Dados do usuário % limpos com sucesso!', target_email;
END$$;
*/

-- ============================================================================
-- OPÇÃO 2: LIMPAR APENAS TRANSAÇÕES E MANTER CONTAS/CATEGORIAS
-- ============================================================================

-- Descomente para limpar apenas transações (manter contas e categorias personalizadas)
/*
TRUNCATE TABLE public.transactions CASCADE;
TRUNCATE TABLE public.recurring_rules CASCADE;

RAISE NOTICE 'Transações e regras recorrentes removidas. Contas e categorias mantidas.';
*/

-- ============================================================================
-- OPÇÃO 3: LIMPAR DADOS DOS ÚLTIMOS X DIAS
-- ============================================================================

-- Descomente e ajuste o número de dias para manter apenas dados recentes
/*
DO $$
DECLARE
    days_to_keep integer := 30; -- ALTERE AQUI: manter últimos X dias
    cutoff_date date := CURRENT_DATE - days_to_keep;
BEGIN
    RAISE NOTICE 'Removendo transações anteriores a %', cutoff_date;

    DELETE FROM public.transactions
    WHERE transaction_date < cutoff_date;

    RAISE NOTICE 'Transações antigas removidas. Mantidas transações dos últimos % dias.', days_to_keep;
END$$;
*/

-- ============================================================================
-- OPÇÃO 4: RESET COMPLETO PARA DESENVOLVIMENTO (PADRÃO)
-- ============================================================================

-- Esta é a opção padrão que será executada
-- Remove todos os dados mas mantém estrutura e categorias do sistema

SET session_replication_role = replica;

-- Remover dados em ordem segura
DELETE FROM public.transactions;
DELETE FROM public.recurring_rules;
DELETE FROM public.accounts;
DELETE FROM public.categories WHERE is_system = false;
DELETE FROM public.couples;
DELETE FROM public.users;

SET session_replication_role = DEFAULT;

-- ============================================================================
-- LOG FINAL
-- ============================================================================
DO $$
DECLARE
    transactions_count integer;
    users_count integer;
    couples_count integer;
    accounts_count integer;
    categories_count integer;
    system_categories_count integer;
BEGIN
    SELECT COUNT(*) INTO transactions_count FROM public.transactions;
    SELECT COUNT(*) INTO users_count FROM public.users;
    SELECT COUNT(*) INTO couples_count FROM public.couples;
    SELECT COUNT(*) INTO accounts_count FROM public.accounts;
    SELECT COUNT(*) INTO categories_count FROM public.categories WHERE is_system = false;
    SELECT COUNT(*) INTO system_categories_count FROM public.categories WHERE is_system = true;

    RAISE NOTICE '✅ Limpeza de dados concluída!';
    RAISE NOTICE '';
    RAISE NOTICE 'Estado atual:';
    RAISE NOTICE '📊 Transações: %', transactions_count;
    RAISE NOTICE '👤 Usuários: %', users_count;
    RAISE NOTICE '💑 Casais: %', couples_count;
    RAISE NOTICE '🏦 Contas: %', accounts_count;
    RAISE NOTICE '📂 Categorias personalizadas: %', categories_count;
    RAISE NOTICE '🏷️ Categorias do sistema: %', system_categories_count;
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Pronto para novos dados de teste!';
END$$;

COMMIT;
