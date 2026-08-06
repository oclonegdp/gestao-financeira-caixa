import React, { useState, useEffect, useMemo } from 'react';
import { 
  loadTransactions, 
  saveTransactions, 
  loadCategories, 
  saveCategories, 
  filterAndSortTransactions,
  computeFinancialSummary,
  getCategoryBudgets
} from './actions/transactions';
import { Transaction, Category, FilterOptions, CategoryBudget } from './types/database.types';
import { Header } from './components/Header';
import { FinancialSummary } from './components/FinancialSummary';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { BudgetManager } from './components/BudgetManager';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { jsonDictionaries, Locale } from './lib/i18n';
import { supabase } from './lib/supabase/client';

const LoginPage = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
    <LoginForm />
  </div>
);

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) throw error;
      
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <form className="w-full max-w-xs space-y-4 bg-slate-800 p-6 rounded-lg" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-center text-emerald-500 mb-6">Login</h2>
        
        {error && <p className="text-red-400 text-center">{error}</p>}
        
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
          
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default function App() {
  const [locale, setLocale] = useState<Locale>('pt-BR');
  const dict = jsonDictionaries[locale] || jsonDictionaries['pt-BR'];

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'transactions' | 'budgets' | 'analytics'>('summary');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

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

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const loadedTx = loadTransactions();
    const loadedCat = loadCategories();
    setTransactions(loadedTx);
    setCategories(loadedCat);

    import('./actions/transactions').then(({ fetchSupabaseTransactions }) => {
      fetchSupabaseTransactions().then((remoteTx) => {
        if (remoteTx && remoteTx.length > 0) {
          setTransactions(remoteTx);
        }
      });
    });
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="text-white">Loading...</div></div>;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

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
