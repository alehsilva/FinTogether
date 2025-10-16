-- ============================================================================
-- SCRIPT PARA LIMPAR APENAS OS DADOS DAS TABELAS - FINTOGETHER
-- ⚠️  ATENÇÃO: Remove TODOS os dados mas mantém a estrutura das tabelas
-- ============================================================================

-- Este script limpa todos os dados sem destruir as tabelas, índices ou políticas
-- Use este script quando quiser limpar os dados para testes sem recriar tudo

BEGIN;

-- Desabilitar verificações de integridade referencial temporariamente
SET session_replication_role = replica;

-- ============================================================================
-- LIMPEZA DOS DADOS DAS TABELAS (ordem importante devido às foreign keys)
-- ============================================================================

-- 1. Limpar transações (depende de várias tabelas)
TRUNCATE TABLE public.transactions CASCADE;

-- 2. Limpar regras recorrentes (pode ter referência de transações)
TRUNCATE TABLE public.recurring_rules CASCADE;

-- 3. Limpar contas (referenciadas por transações)
TRUNCATE TABLE public.accounts CASCADE;

-- 4. Limpar categorias personalizadas (manter apenas as do sistema)
DELETE FROM public.categories WHERE is_system = false;

-- 5. Limpar casais
TRUNCATE TABLE public.couples CASCADE;

-- 6. Limpar usuários (mas manter estrutura de auth)
-- Nota: Isso não remove os usuários do auth.users, apenas da nossa tabela
TRUNCATE TABLE public.users CASCADE;

-- ============================================================================
-- REATIVAR VERIFICAÇÕES DE INTEGRIDADE REFERENCIAL
-- ============================================================================
SET session_replication_role = DEFAULT;

-- ============================================================================
-- RESETAR SEQUÊNCIAS (se houver)
-- ============================================================================
-- Como usamos UUID, não há sequências para resetar neste projeto

-- ============================================================================
-- LOG DE CONFIRMAÇÃO
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Limpeza concluída com sucesso!';
    RAISE NOTICE 'Dados removidos:';
    RAISE NOTICE '- Todas as transações';
    RAISE NOTICE '- Todas as regras recorrentes';
    RAISE NOTICE '- Todas as contas';
    RAISE NOTICE '- Categorias personalizadas (categorias do sistema mantidas)';
    RAISE NOTICE '- Todos os casais';
    RAISE NOTICE '- Todos os usuários (perfis app, não auth)';
    RAISE NOTICE '';
    RAISE NOTICE 'Estrutura mantida:';
    RAISE NOTICE '- Tabelas e esquemas';
    RAISE NOTICE '- Índices e constraints';
    RAISE NOTICE '- Políticas RLS';
    RAISE NOTICE '- Funções e triggers';
    RAISE NOTICE '- Categorias padrão do sistema';
END$$;

COMMIT;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================
DO $$
DECLARE
    transaction_count integer;
    user_count integer;
    couple_count integer;
    account_count integer;
    custom_category_count integer;
    system_category_count integer;
BEGIN
    SELECT COUNT(*) INTO transaction_count FROM public.transactions;
    SELECT COUNT(*) INTO user_count FROM public.users;
    SELECT COUNT(*) INTO couple_count FROM public.couples;
    SELECT COUNT(*) INTO account_count FROM public.accounts;
    SELECT COUNT(*) INTO custom_category_count FROM public.categories WHERE is_system = false;
    SELECT COUNT(*) INTO system_category_count FROM public.categories WHERE is_system = true;

    RAISE NOTICE 'Verificação pós-limpeza:';
    RAISE NOTICE 'Transações: % (deve ser 0)', transaction_count;
    RAISE NOTICE 'Usuários: % (deve ser 0)', user_count;
    RAISE NOTICE 'Casais: % (deve ser 0)', couple_count;
    RAISE NOTICE 'Contas: % (deve ser 0)', account_count;
    RAISE NOTICE 'Categorias personalizadas: % (deve ser 0)', custom_category_count;
    RAISE NOTICE 'Categorias do sistema: % (deve ser > 0)', system_category_count;
END$$;
