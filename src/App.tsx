import React, { useState, useEffect, useMemo } from 'react';
import { 
  loadTransactions, 
  saveTransactions, 
  loadCategories, 
  saveCategories, 
  getInitialMockTransactions,
  filterAndSortTransactions,
  computeFinancialSummary,
  getCategoryBudgets,
  DEFAULT_CATEGORIES
} from './actions/transactions';
import { Transaction, Category, FilterOptions, CategoryBudget } from './types/database.types';
import { Header } from './components/Header';
import { FinancialSummary } from './components/FinancialSummary';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { BudgetManager } from './components/BudgetManager';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { jsonDictionaries, Locale } from './lib/i18n';

export default function App() {
  const [locale, setLocale] = useState<Locale>('pt-BR');
  const dict = jsonDictionaries[locale] || jsonDictionaries['pt-BR'];

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'transactions' | 'budgets' | 'analytics'>('summary');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Filters State
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    type: 'all',
    category: 'all',
    paymentMethod: 'all',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Load initial data on mount
  useEffect(() => {
    const loadedTx = loadTransactions();
    const loadedCat = loadCategories();
    setTransactions(loadedTx);
    setCategories(loadedCat);

    // Attempt Supabase fetch if configured
    import('./actions/transactions').then(({ fetchSupabaseTransactions }) => {
      fetchSupabaseTransactions().then((remoteTx) => {
        if (remoteTx && remoteTx.length > 0) {
          setTransactions(remoteTx);
        }
      });
    });
  }, []);

  // Filtered transactions for list view
  const filteredTransactions = useMemo(() => {
    return filterAndSortTransactions(transactions, filters);
  }, [transactions, filters]);

  // Financial summary calculated over all transactions
  const financialSummary = useMemo(() => {
    return computeFinancialSummary(transactions, categories);
  }, [transactions, categories]);

  // Budget data
  const categoryBudgets = useMemo(() => {
    return getCategoryBudgets(transactions, categories);
  }, [transactions, categories]);

  // Save changes to localStorage whenever transactions change
  const handleSaveTransaction = (txData: Omit<Transaction, 'id'> & { id?: string }) => {
    let updated: Transaction[];
    if (txData.id) {
      // Edit existing
      updated = transactions.map((t) => (t.id === txData.id ? ({ ...txData, id: txData.id } as Transaction) : t));
    } else {
      // Add new
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      } as Transaction;
      updated = [newTx, ...transactions];
    }

    setTransactions(updated);
    saveTransactions(updated);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction record?')) {
      const updated = transactions.filter((t) => t.id !== id);
      setTransactions(updated);
      saveTransactions(updated);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all transaction records to sample demo data?')) {
      const initial = getInitialMockTransactions();
      setTransactions(initial);
      saveTransactions(initial);
      setCategories(DEFAULT_CATEGORIES);
      saveCategories(DEFAULT_CATEGORIES);
    }
  };

  const handleUpdateCategoryBudget = (categoryName: string, newBudget: number) => {
    const updated = categories.map((c) =>
      c.name === categoryName ? { ...c, monthlyBudget: newBudget } : c
    );
    setCategories(updated);
    saveCategories(updated);
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method', 'Status', 'Recurring', 'Notes', 'Tags'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.date,
      t.type,
      `"${t.category}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      t.paymentMethod,
      t.status,
      t.isRecurring ? 'Yes' : 'No',
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      `"${(t.tags || []).join(';')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Header & Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
        onResetData={handleResetData}
        onExportCSV={handleExportCSV}
        totalBalance={financialSummary.totalBalance}
        currentLocale={locale}
        onLocaleChange={(loc) => setLocale(loc as Locale)}
        dict={dict}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'summary' && (
          <FinancialSummary
            summary={financialSummary}
            recentTransactions={transactions}
            budgets={categoryBudgets}
            onNavigateToTransactions={() => setActiveTab('transactions')}
            onNavigateToBudgets={() => setActiveTab('budgets')}
            onOpenAddModal={handleOpenAddModal}
            dict={dict}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionList
            transactions={filteredTransactions}
            categories={categories}
            filters={filters}
            setFilters={setFilters}
            onOpenAddModal={handleOpenAddModal}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onExportCSV={handleExportCSV}
            dict={dict}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetManager
            categories={categories}
            budgets={categoryBudgets}
            onUpdateCategoryBudget={handleUpdateCategoryBudget}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsCharts
            transactions={transactions}
            categories={categories}
          />
        )}

      </main>

      {/* Add / Edit Transaction Modal */}
      <TransactionForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        categories={categories}
        dict={dict}
      />

    </div>
  );
}
