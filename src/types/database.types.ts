export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'crypto' | 'other';

export type TransactionStatus = 'completed' | 'pending' | 'recurring';

// Supabase Generated Database Interface for PostgREST & Supabase Client
export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: TransactionType;
          category: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: TransactionType;
          category: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          type?: TransactionType;
          category?: string;
          description?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      transaction_type: TransactionType;
    };
  };
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  iconName: string;
  monthlyBudget?: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string; // ISO date string YYYY-MM-DD
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  user_id?: string;
  created_at?: string;
}

export interface FilterOptions {
  search: string;
  type: 'all' | 'income' | 'expense';
  category: string;
  paymentMethod: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  sortBy: 'date' | 'amount' | 'description' | 'category';
  sortOrder: 'asc' | 'desc';
}

export interface FinancialSummaryData {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  incomeChangePercentage: number;
  expenseChangePercentage: number;
  savingsChangePercentage: number;
  topExpenseCategory: { name: string; amount: number; percentage: number };
  budgetStatus: { totalBudget: number; usedBudget: number; remaining: number };
}

export interface CategoryBudget {
  category: string;
  budget: number;
  spent: number;
  color: string;
}
