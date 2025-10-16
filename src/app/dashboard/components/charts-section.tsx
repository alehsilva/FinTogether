'use client';

import { ReceitasCard } from './receitas-card';
import { DespesasCard } from './despesas-card';
import { SaldoComparativoCard } from './saldo-comparativo-card';
import type { FinancialSummary, Transaction } from '@/models/financial';

interface ChartsSectionProps {
  selectedView: 'nosso' | 'meu';
  summary: FinancialSummary | null;
  loading?: boolean;
  transactions?: Transaction[];
  currentUserId?: string;
  partnerEmail?: string;
  selectedMonth?: string;
  selectedYear?: number;
}

export function ChartsSection({
  selectedView,
  summary,
  loading = false,
  transactions = [],
  currentUserId,
  partnerEmail,
  selectedMonth,
  selectedYear,
}: ChartsSectionProps) {
  const formatValue = (value: number) =>
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
      value
    );

  // Função para converter mês string para número
  const monthToNumber = (month: string) => {
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    return months.indexOf(month);
  };

  // Filtrar transações para o mês específico selecionado
  const getFilteredTransactionsForMonth = () => {
    if (!transactions || !selectedMonth || !selectedYear) return [];

    const selectedMonthNumber = monthToNumber(selectedMonth);

    return transactions.filter((transaction) => {
      const txDate = new Date(transaction.transaction_date);
      const txMonth = txDate.getMonth();
      const txYear = txDate.getFullYear();

      // Filtrar por mês E ano específicos (não acumulativo)
      return txMonth === selectedMonthNumber && txYear === selectedYear;
    });
  };

  // Filtrar transações baseado na view selecionada para o mês específico
  const getViewFilteredTransactions = () => {
    const monthFiltered = getFilteredTransactionsForMonth();

    return monthFiltered.filter((tx) => {
      if (selectedView === 'nosso') {
        // View "nosso": mostrar TODAS as transações do casal (independente de quem criou)
        // Como estamos no contexto de casal, mostrar tudo
        return true;
      } else {
        // View "meu": apenas transações que EU criei
        return tx.user_id === currentUserId;
      }
    });
  };

  const monthTransactions = getViewFilteredTransactions();

  const calculateCompletedContributions = () => {
    if (!currentUserId || selectedView !== 'nosso' || monthTransactions.length === 0) {
      return null;
    }

    // Usar transações do mês específico que estão completadas
    const completedMonthTransactions = monthTransactions.filter(t =>
      t.status === 'completed'
    );

    const userIncome = completedMonthTransactions
      .filter(t => t.user_id === currentUserId && t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0);

    const partnerIncome = completedMonthTransactions
      .filter(t => t.user_id !== currentUserId && t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = userIncome + partnerIncome;

    const userExpenses = completedMonthTransactions
      .filter(t => t.user_id === currentUserId && t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0);

    const partnerExpenses = completedMonthTransactions
      .filter(t => t.user_id !== currentUserId && t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = userExpenses + partnerExpenses;

    return {
      income: {
        userAmount: userIncome,
        partnerAmount: partnerIncome,
        userPercentage: totalIncome > 0 ? Math.round((userIncome / totalIncome) * 100) : 0,
        partnerPercentage: totalIncome > 0 ? Math.round((partnerIncome / totalIncome) * 100) : 0,
      },
      expenses: {
        userAmount: userExpenses,
        partnerAmount: partnerExpenses,
        userPercentage: totalExpenses > 0 ? Math.round((userExpenses / totalExpenses) * 100) : 0,
        partnerPercentage:
          totalExpenses > 0 ? Math.round((partnerExpenses / totalExpenses) * 100) : 0,
      },
    };
  };

  const completedContributions = calculateCompletedContributions();
  const partnerName = partnerEmail
    ? partnerEmail.split('@')[0].split('.')[0].charAt(0).toUpperCase() +
    partnerEmail.split('@')[0].split('.')[0].slice(1)
    : 'Parceiro';

  const getReceitas = () => {
    // Calcular receitas baseado nas transações do mês específico
    const monthIncomeTransactions = monthTransactions.filter(
      tx => tx.type === 'receita' && tx.status === 'completed'
    );

    const receitas = monthIncomeTransactions.reduce((sum, tx) => sum + tx.amount, 0);



    // Para receitas: calcular porcentagem em relação às receitas como um "indicador de eficiência"
    // Se receitas > 0, mostra 100%. Se não há receitas, mostra 0%
    // Alternativamente, poderia ser porcentagem de uma meta mensal
    const porcentagem = receitas > 0 ? 100 : 0;

    return { valor: receitas, porcentagem };
  }; const getDespesas = () => {
    // Calcular despesas baseado nas transações do mês específico
    const monthExpenseTransactions = monthTransactions.filter(
      tx => tx.type === 'despesa' && tx.status === 'completed'
    );

    const despesas = monthExpenseTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Calcular receitas para comparação
    const monthIncomeTransactions = monthTransactions.filter(
      tx => tx.type === 'receita' && tx.status === 'completed'
    );
    const receitas = monthIncomeTransactions.reduce((sum, tx) => sum + tx.amount, 0);



    // Para despesas: mostrar qual porcentagem das receitas está sendo gasta
    // Isso sim faz sentido financeiro: "gastei X% da minha renda"
    let porcentagem = 0;
    if (receitas > 0) {
      const calculatedPercentage = (despesas / receitas) * 100;
      // Usar até 2 casas decimais para mostrar precisão real
      porcentagem = Math.round(calculatedPercentage * 100) / 100;
    }

    return { valor: despesas, porcentagem };
  };

  const receitas = getReceitas();
  const despesas = getDespesas();

  // Preparar dados para comparação entre usuários
  const receitasComparison = completedContributions
    ? {
      userAmount: completedContributions.income.userAmount,
      partnerAmount: completedContributions.income.partnerAmount,
      userPercentage: completedContributions.income.userPercentage,
      partnerPercentage: completedContributions.income.partnerPercentage,
      partnerName,
    }
    : undefined;

  const despesasComparison = completedContributions
    ? {
      userAmount: completedContributions.expenses.userAmount,
      partnerAmount: completedContributions.expenses.partnerAmount,
      userPercentage: completedContributions.expenses.userPercentage,
      partnerPercentage: completedContributions.expenses.partnerPercentage,
      partnerName,
    }
    : undefined;

  return (
    <div className="flex flex-col gap-4">
      {/* Receitas e Despesas - Lado a lado no topo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card de Receitas */}
        <ReceitasCard
          valor={receitas.valor}
          porcentagem={receitas.porcentagem}
          loading={loading}
          comparison={receitasComparison}
          showComparison={selectedView === 'nosso' && !!receitasComparison && (receitasComparison.userAmount + receitasComparison.partnerAmount > 0)}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />

        {/* Card de Despesas */}
        <DespesasCard
          valor={despesas.valor}
          porcentagem={despesas.porcentagem}
          loading={loading}
          comparison={despesasComparison}
          showComparison={selectedView === 'nosso' && !!despesasComparison && (despesasComparison.userAmount + despesasComparison.partnerAmount > 0)}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </div>

      {/* Card Comparativo - Largura total embaixo */}
      {(receitas.valor > 0 || despesas.valor > 0) && (
        <SaldoComparativoCard
          receitas={receitas}
          despesas={despesas}
          loading={loading}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      )}
    </div>
  );
}
