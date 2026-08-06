import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  // 1. TODOS OS HOOKS DEVEM SER DECLARADOS NO TOPO
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

  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // 2. useEffect DECLARATIONS
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setAuthLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
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

  // 3. useMemo CALCULATIONS
  const filteredTransactions = useMemo(() => {
    return filterAndSortTransactions(transactions, filters);
  }, [transactions, filters]);

  const financialSummary = useMemo(() => {
    return computeFinancialSummary(transactions, categories);
  }, [transactions, categories]);

  const categoryBudgets = useMemo(() => {
    return getCategoryBudgets(transactions, categories);
  }, [transactions, categories]);

  // 4. HANDLER FUNCTIONS
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao fazer login');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const handleSaveTransaction = (txData: Omit<Transaction, 'id'> & { id?: string }) => {
    let updated: Transaction[];
    if (txData.id) {
      updated = transactions.map((t) => (t.id === txData.id ? ({ ...txData, id: txData.id } as Transaction) : t));
    } else {
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

  // 5. CONDITIONAL RETURNS AFTER ALL HOOKS
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-2xl border border-slate-800">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white">Gestão Financeira & Caixa</h1>
            <p className="text-sm text-slate-400 mt-1">Faça login para acessar o painel</p>
          </div>

          {authError && (
            <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-500 focus:outline-none"
            >
              Entrar no Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
        onExportCSV={handleExportCSV}
        onLogout={handleLogout}
        totalBalance={financialSummary.totalBalance}
        currentLocale={locale}
        onLocaleChange={(loc) => setLocale(loc as Locale)}
        dict={dict}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Content Area */}
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

export default App;
