import { z } from 'zod';
import { Transaction, Category, FilterOptions, FinancialSummaryData, CategoryBudget } from '../types/database.types';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase/client';

const transactionSchema = z.object({
  amount: z.coerce.number().positive({ message: 'O valor deve ser maior que zero' }),
  type: z.enum(['income', 'expense'], { message: 'Tipo inválido' }),
  category: z.string().min(2, { message: 'Informe a categoria' }),
  description: z.string().optional(),
});

export type ActionResponse = {
  success: boolean;
  message: string;
};

export async function createTransaction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const supabase = getSupabaseClient();
  
  const rawData = {
    amount: formData.get('amount'),
    type: formData.get('type'),
    category: formData.get('category'),
    description: formData.get('description'),
  };

  const validation = transactionSchema.safeParse(rawData);
  if (!validation.success) {
    const issue = validation.error.issues?.[0];
    return { success: false, message: issue ? issue.message : 'Dados inválidos' };
  }

    if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('createTransaction: No authenticated user found');
        return { success: false, message: 'Usuário não autenticado. Faça login novamente.' };
      }

      const { error: insertError } = await (supabase.from('transactions') as any).insert({
        user_id: user.id,
        amount: validation.data.amount,
        type: validation.data.type,
        category: validation.data.category,
        description: validation.data.description || null,
      });

      if (insertError) {
        console.error('Supabase insert error:', insertError.message);
        return { success: false, message: `Erro ao registrar: ${insertError.message}` };
      }
      return { success: true, message: 'Lançamento registrado com sucesso!' };
    } catch (err) {
      console.error('Unexpected error during Supabase insert:', err);
      // Fall through to local save
    }
  }

  try {
    const currentTxs = loadTransactions();
    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      amount: validation.data.amount,
      type: validation.data.type,
      category: validation.data.category,
      description: validation.data.description || validation.data.category,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'bank_transfer',
      status: 'completed',
    };
    saveTransactions([newTx, ...currentTxs]);
    return { success: true, message: 'Lançamento registrado com sucesso!' };
  } catch {
    return { success: false, message: 'Erro ao salvar o lançamento.' };
  }
}

export const DEFAULT_CATEGORIES: Category[] = [
  // Income categories
  { id: 'cat-inc-1', name: 'Salary', type: 'income', color: '#10b981', iconName: 'Briefcase' },
  { id: 'cat-inc-2', name: 'Freelance', type: 'income', color: '#06b6d4', iconName: 'Laptop' },
  { id: 'cat-inc-3', name: 'Investments', type: 'income', color: '#8b5cf6', iconName: 'TrendingUp' },
  { id: 'cat-inc-4', name: 'Side Business', type: 'income', color: '#f59e0b', iconName: 'Store' },
  { id: 'cat-inc-5', name: 'Other Income', type: 'income', color: '#64748b', iconName: 'PlusCircle' },

  // Expense categories
  { id: 'cat-exp-1', name: 'Housing & Rent', type: 'expense', color: '#6366f1', iconName: 'Home', monthlyBudget: 1800 },
  { id: 'cat-exp-2', name: 'Groceries & Dining', type: 'expense', color: '#f43f5e', iconName: 'Utensils', monthlyBudget: 650 },
  { id: 'cat-exp-3', name: 'Transportation', type: 'expense', color: '#ec4899', iconName: 'Car', monthlyBudget: 350 },
  { id: 'cat-exp-4', name: 'Utilities & Bills', type: 'expense', color: '#eab308', iconName: 'Zap', monthlyBudget: 250 },
  { id: 'cat-exp-5', name: 'Entertainment & Tech', type: 'expense', color: '#a855f7', iconName: 'Tv', monthlyBudget: 300 },
  { id: 'cat-exp-6', name: 'Health & Fitness', type: 'expense', color: '#14b8a6', iconName: 'HeartPulse', monthlyBudget: 200 },
  { id: 'cat-exp-7', name: 'Shopping & Apparel', type: 'expense', color: '#f97316', iconName: 'ShoppingBag', monthlyBudget: 400 },
  { id: 'cat-exp-8', name: 'Travel & Leisure', type: 'expense', color: '#3b82f6', iconName: 'Plane', monthlyBudget: 500 },
];

const STORAGE_KEY_TRANSACTIONS = 'finance_app_transactions_v1';
const STORAGE_KEY_CATEGORIES = 'finance_app_categories_v1';

// Generate realistic mock data for current and recent months
export const getInitialMockTransactions = (): Transaction[] => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  const formatDate = (daysAgo: number) => {
    const d = new Date(year, month, today.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'tx-101',
      amount: 4850.00,
      type: 'income',
      category: 'Salary',
      description: 'TechCorp Monthly Salary',
      date: formatDate(1),
      paymentMethod: 'bank_transfer',
      status: 'completed',
      notes: 'Direct deposit for current pay cycle',
      tags: ['Work', 'Salary', 'Primary'],
      isRecurring: true,
    },
    {
      id: 'tx-102',
      amount: 1420.00,
      type: 'expense',
      category: 'Housing & Rent',
      description: 'Apartment Monthly Rent',
      date: formatDate(3),
      paymentMethod: 'bank_transfer',
      status: 'completed',
      notes: 'Paid via automated bank draft',
      tags: ['Fixed', 'Housing'],
      isRecurring: true,
    },
    {
      id: 'tx-103',
      amount: 184.50,
      type: 'expense',
      category: 'Groceries & Dining',
      description: 'Whole Foods Market',
      date: formatDate(2),
      paymentMethod: 'credit_card',
      status: 'completed',
      notes: 'Weekly fresh produce & household items',
      tags: ['Essential', 'Food'],
    },
    {
      id: 'tx-104',
      amount: 850.00,
      type: 'income',
      category: 'Freelance',
      description: 'UI/UX Design Project Milestone',
      date: formatDate(5),
      paymentMethod: 'bank_transfer',
      status: 'completed',
      notes: 'Client payment for mobile app wireframes',
      tags: ['Freelance', 'Design'],
    },
    {
      id: 'tx-105',
      amount: 65.00,
      type: 'expense',
      category: 'Transportation',
      description: 'Shell Gas Station - Refill',
      date: formatDate(4),
      paymentMethod: 'debit_card',
      status: 'completed',
      tags: ['Commute', 'Car'],
    },
    {
      id: 'tx-106',
      amount: 112.30,
      type: 'expense',
      category: 'Utilities & Bills',
      description: 'Power & Electric Utility',
      date: formatDate(6),
      paymentMethod: 'credit_card',
      status: 'completed',
      tags: ['Bills', 'Utilities'],
      isRecurring: true,
    },
    {
      id: 'tx-107',
      amount: 79.99,
      type: 'expense',
      category: 'Entertainment & Tech',
      description: 'Fiber Internet Service',
      date: formatDate(8),
      paymentMethod: 'credit_card',
      status: 'completed',
      tags: ['Sub', 'Home'],
      isRecurring: true,
    },
    {
      id: 'tx-108',
      amount: 235.00,
      type: 'income',
      category: 'Investments',
      description: 'Quarterly Dividend Payout',
      date: formatDate(10),
      paymentMethod: 'bank_transfer',
      status: 'completed',
      tags: ['Passive', 'Stocks'],
    },
    {
      id: 'tx-109',
      amount: 145.80,
      type: 'expense',
      category: 'Groceries & Dining',
      description: 'Bistro Italian Restaurant',
      date: formatDate(7),
      paymentMethod: 'credit_card',
      status: 'completed',
      notes: 'Dinner with friends',
      tags: ['Social', 'Dining'],
    },
    {
      id: 'tx-110',
      amount: 89.00,
      type: 'expense',
      category: 'Health & Fitness',
      description: 'Equinox Gym Membership',
      date: formatDate(12),
      paymentMethod: 'credit_card',
      status: 'completed',
      tags: ['Health', 'Monthly'],
      isRecurring: true,
    },
    {
      id: 'tx-111',
      amount: 199.99,
      type: 'expense',
      category: 'Shopping & Apparel',
      description: 'Nordstrom - New Running Shoes',
      date: formatDate(11),
      paymentMethod: 'credit_card',
      status: 'completed',
      tags: ['Clothing', 'Personal'],
    },
    {
      id: 'tx-112',
      amount: 450.00,
      type: 'income',
      category: 'Side Business',
      description: 'Digital Product Sales',
      date: formatDate(14),
      paymentMethod: 'crypto',
      status: 'completed',
      tags: ['E-commerce', 'Online'],
    },
    {
      id: 'tx-113',
      amount: 450.00,
      type: 'expense',
      category: 'Travel & Leisure',
      description: 'Weekend Flight Booking',
      date: formatDate(15),
      paymentMethod: 'credit_card',
      status: 'completed',
      notes: 'Roundtrip flight tickets',
      tags: ['Vacation', 'Travel'],
    },
    {
      id: 'tx-114',
      amount: 4850.00,
      type: 'income',
      category: 'Salary',
      description: 'TechCorp Monthly Salary (Previous)',
      date: formatDate(32),
      paymentMethod: 'bank_transfer',
      status: 'completed',
      tags: ['Work', 'Salary'],
    },
    {
      id: 'tx-115',
      amount: 1420.00,
      type: 'expense',
      category: 'Housing & Rent',
      description: 'Apartment Monthly Rent (Previous)',
      date: formatDate(33),
      paymentMethod: 'bank_transfer',
      status: 'completed',
      tags: ['Fixed', 'Housing'],
    },
  ];
};

// Supabase Async API Integration
export const fetchSupabaseTransactions = async (): Promise<Transaction[] | null> => {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await (client.from('transactions') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch notice:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data.map((row) => ({
        id: row.id,
        amount: Number(row.amount),
        type: row.type,
        category: row.category,
        description: row.description || '',
        date: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        paymentMethod: 'bank_transfer',
        status: 'completed',
        user_id: row.user_id,
        created_at: row.created_at,
      }));
    }
    return [];
  } catch (err) {
    console.error('Error in fetchSupabaseTransactions', err);
    return null;
  }
};

export const syncToSupabaseTransaction = async (tx: Transaction, userId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await (client.from('transactions') as any).upsert({
      id: tx.id.startsWith('tx-') ? undefined : tx.id,
      user_id: userId,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      description: tx.description,
    });
    if (error) {
      console.warn('Supabase sync warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to sync to Supabase', err);
    return false;
  }
};

// Store Operations
export const loadTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load transactions from localStorage', err);
    return [];
  }
};

export const saveTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save transactions to localStorage', err);
  }
};

export const loadCategories = (): Category[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
};

export const saveCategories = (categories: Category[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save categories', err);
  }
};

export const filterAndSortTransactions = (
  transactions: Transaction[],
  filters: FilterOptions
): Transaction[] => {
  return transactions.filter((tx) => {
    // Search matching
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchCat = tx.category.toLowerCase().includes(q);
      const matchNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
      const matchTags = tx.tags ? tx.tags.some(t => t.toLowerCase().includes(q)) : false;
      if (!matchDesc && !matchCat && !matchNotes && !matchTags) return false;
    }

    // Type filter
    if (filters.type !== 'all' && tx.type !== filters.type) return false;

    // Category filter
    if (filters.category && filters.category !== 'all' && tx.category !== filters.category) return false;

    // Payment method filter
    if (filters.paymentMethod && filters.paymentMethod !== 'all' && tx.paymentMethod !== filters.paymentMethod) return false;

    // Date range
    if (filters.startDate && tx.date < filters.startDate) return false;
    if (filters.endDate && tx.date > filters.endDate) return false;

    // Amount range
    if (filters.minAmount && tx.amount < parseFloat(filters.minAmount)) return false;
    if (filters.maxAmount && tx.amount > parseFloat(filters.maxAmount)) return false;

    return true;
  }).sort((a, b) => {
    let comparison = 0;
    if (filters.sortBy === 'date') {
      comparison = a.date.localeCompare(b.date);
    } else if (filters.sortBy === 'amount') {
      comparison = a.amount - b.amount;
    } else if (filters.sortBy === 'description') {
      comparison = a.description.localeCompare(b.description);
    } else if (filters.sortBy === 'category') {
      comparison = a.category.localeCompare(b.category);
    }

    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });
};

export const computeFinancialSummary = (
  transactions: Transaction[],
  categories: Category[]
): FinancialSummaryData => {
  let totalIncome = 0;
  let totalExpenses = 0;

  const categoryTotals: Record<string, number> = {};

  transactions.forEach((tx) => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else if (tx.type === 'expense') {
      totalExpenses += tx.amount;
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    }
  });

  const totalBalance = totalIncome - totalExpenses;
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

  // Find top expense category
  let topExpenseCategory = { name: 'None', amount: 0, percentage: 0 };
  let maxExp = 0;
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > maxExp) {
      maxExp = amt;
      topExpenseCategory = {
        name: cat,
        amount: amt,
        percentage: totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0,
      };
    }
  });

  // Calculate budget stats
  const totalBudget = categories
    .filter(c => c.type === 'expense' && c.monthlyBudget)
    .reduce((sum, c) => sum + (c.monthlyBudget || 0), 0);

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    incomeChangePercentage: 8.5,
    expenseChangePercentage: -3.2,
    savingsChangePercentage: 12.4,
    topExpenseCategory,
    budgetStatus: {
      totalBudget,
      usedBudget: totalExpenses,
      remaining: totalBudget - totalExpenses,
    },
  };
};

export const getCategoryBudgets = (
  transactions: Transaction[],
  categories: Category[]
): CategoryBudget[] => {
  const expenseCategories = categories.filter(c => c.type === 'expense');
  const monthSpending: Record<string, number> = {};

  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      monthSpending[t.category] = (monthSpending[t.category] || 0) + t.amount;
    });

  return expenseCategories.map(cat => ({
    category: cat.name,
    budget: cat.monthlyBudget || 500,
    spent: monthSpending[cat.name] || 0,
    color: cat.color,
  }));
};
