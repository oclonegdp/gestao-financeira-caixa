import ptBRJson from '../locales/pt-BR.json';
import enUSJson from '../locales/en-US.json';

export type Locale = 'pt-BR' | 'en-US';

export const jsonDictionaries = {
  'pt-BR': ptBRJson,
  'en-US': enUSJson,
};

export const dictionaries = {
  'pt-BR': {
    appName: ptBRJson.title,
    appSubtitle: ptBRJson.subtitle,
    summary: {
      totalIncome: ptBRJson.summary.income,
      totalExpenses: ptBRJson.summary.expense,
      cashBalance: ptBRJson.summary.balance,
      savingsRate: 'Taxa de Economia',
      netSavings: 'Economia Líquida',
    },
    transactionForm: {
      title: ptBRJson.form.title,
      typeLabel: ptBRJson.form.type,
      incomeOption: ptBRJson.form.incomeOption,
      expenseOption: ptBRJson.form.expenseOption,
      amountLabel: ptBRJson.form.amount,
      categoryLabel: ptBRJson.form.category,
      categoryPlaceholder: ptBRJson.form.categoryPlaceholder,
      descriptionLabel: ptBRJson.form.description,
      descriptionPlaceholder: ptBRJson.form.descriptionPlaceholder,
      saveButton: ptBRJson.form.submit,
      savingButton: ptBRJson.form.submitting,
      successMessage: 'Lançamento registrado com sucesso!',
      errorMessage: 'Erro ao registrar lançamento.',
    },
    transactionList: {
      searchPlaceholder: ptBRJson.list.searchPlaceholder,
      filterAll: ptBRJson.list.all,
      filterIncome: ptBRJson.list.incomes,
      filterExpense: ptBRJson.list.expenses,
      colDate: ptBRJson.list.date,
      colType: ptBRJson.list.typeHeader,
      colCategory: ptBRJson.list.categoryHeader,
      colDescription: ptBRJson.list.descriptionHeader,
      colAmount: ptBRJson.list.amountHeader,
      emptyState: ptBRJson.list.empty,
      typeIncome: 'Entrada',
      typeExpense: 'Saída',
    },
    budgetManager: {
      title: 'Orçamentos Mensais por Categoria',
      description: 'Defina limites de gastos para controlar suas saídas e evitar ultrapassar o orçado.',
      totalBudgetCap: 'Limite Total do Orçamento',
      totalSpent: 'Total Gasto',
      editLimit: 'Editar Limite',
      save: 'Salvar',
      cancel: 'Cancelar',
      spent: 'Gasto',
      limit: 'Limite',
      over: 'ultrapassou',
      left: 'restante',
      percentUsed: '% usado',
    },
    common: {
      loading: 'Carregando dados do painel financeiro...',
      errorTitle: 'Ocorreu um erro no carregamento',
      errorDescription: 'Não foi possível recuperar os dados financeiros do servidor.',
      retry: 'Tentar Novamente',
    }
  },
  'en-US': {
    appName: enUSJson.title,
    appSubtitle: enUSJson.subtitle,
    summary: {
      totalIncome: enUSJson.summary.income,
      totalExpenses: enUSJson.summary.expense,
      cashBalance: enUSJson.summary.balance,
      savingsRate: 'Savings Rate',
      netSavings: 'Net Savings',
    },
    transactionForm: {
      title: enUSJson.form.title,
      typeLabel: enUSJson.form.type,
      incomeOption: enUSJson.form.incomeOption,
      expenseOption: enUSJson.form.expenseOption,
      amountLabel: enUSJson.form.amount,
      categoryLabel: enUSJson.form.category,
      categoryPlaceholder: enUSJson.form.categoryPlaceholder,
      descriptionLabel: enUSJson.form.description,
      descriptionPlaceholder: enUSJson.form.descriptionPlaceholder,
      saveButton: enUSJson.form.submit,
      savingButton: enUSJson.form.submitting,
      successMessage: 'Transaction registered successfully!',
      errorMessage: 'Error registering transaction.',
    },
    transactionList: {
      searchPlaceholder: enUSJson.list.searchPlaceholder,
      filterAll: enUSJson.list.all,
      filterIncome: enUSJson.list.incomes,
      filterExpense: enUSJson.list.expenses,
      colDate: enUSJson.list.date,
      colType: enUSJson.list.typeHeader,
      colCategory: enUSJson.list.categoryHeader,
      colDescription: enUSJson.list.descriptionHeader,
      colAmount: enUSJson.list.amountHeader,
      emptyState: enUSJson.list.empty,
      typeIncome: 'Income',
      typeExpense: 'Expense',
    },
    budgetManager: {
      title: 'Monthly Expense Category Budgets',
      description: 'Set target monthly spending caps to control outflows and prevent budget overruns.',
      totalBudgetCap: 'Total Budget Cap',
      totalSpent: 'Total Spent',
      editLimit: 'Edit Cap',
      save: 'Save',
      cancel: 'Cancel',
      spent: 'Spent',
      limit: 'Limit',
      over: 'over',
      left: 'left',
      percentUsed: '% used',
    },
    common: {
      loading: 'Loading financial dashboard data...',
      errorTitle: 'An error occurred during loading',
      errorDescription: 'Could not retrieve financial data from server.',
      retry: 'Try Again',
    }
  }
};

export function getDictionary(locale: Locale = 'pt-BR') {
  return dictionaries[locale] || dictionaries['pt-BR'];
}

export function formatCurrency(amount: number, locale: Locale = 'pt-BR'): string {
  const currencyMap: Record<Locale, string> = {
    'pt-BR': 'BRL',
    'en-US': 'USD'
  };

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyMap[locale] || 'BRL',
  }).format(amount);
}
