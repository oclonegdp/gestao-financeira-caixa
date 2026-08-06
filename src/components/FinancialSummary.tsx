import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  AlertCircle, 
  CheckCircle2, 
  PieChart as PieChartIcon,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { FinancialSummaryData, Transaction, CategoryBudget } from '../types/database.types';

interface FinancialSummaryProps {
  summary?: FinancialSummaryData;
  transactions?: any[];
  recentTransactions?: Transaction[];
  budgets?: CategoryBudget[];
  onNavigateToTransactions?: () => void;
  onNavigateToBudgets?: () => void;
  onOpenAddModal?: () => void;
  dict?: any;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  summary: providedSummary,
  transactions: providedTransactions,
  recentTransactions = [],
  budgets = [],
  onNavigateToTransactions = () => {},
  onNavigateToBudgets = () => {},
  onOpenAddModal = () => {},
  dict,
}) => {
  // Compute totals if transactions prop is passed directly
  const computedFromTransactions = React.useMemo(() => {
    const list = providedTransactions || [];
    let income = 0;
    let expense = 0;
    list.forEach((tx: any) => {
      const val = Number(tx.amount) || 0;
      if (tx.type === 'income') income += val;
      else if (tx.type === 'expense') expense += val;
    });
    return { income, expense, balance: income - expense };
  }, [providedTransactions]);

  const summary: FinancialSummaryData = providedSummary || {
    totalBalance: computedFromTransactions.balance,
    totalIncome: computedFromTransactions.income,
    totalExpenses: computedFromTransactions.expense,
    netSavings: computedFromTransactions.balance,
    savingsRate: computedFromTransactions.income > 0 ? Math.max(0, Math.round((computedFromTransactions.balance / computedFromTransactions.income) * 100)) : 0,
    incomeChangePercentage: 8.5,
    expenseChangePercentage: -3.2,
    savingsChangePercentage: 12.4,
    topExpenseCategory: { name: 'General', amount: computedFromTransactions.expense, percentage: 100 },
    budgetStatus: { totalBudget: 5000, usedBudget: computedFromTransactions.expense, remaining: 5000 - computedFromTransactions.expense },
  };
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const budgetUsagePercent = summary.budgetStatus.totalBudget > 0 
    ? Math.min(100, Math.round((summary.budgetStatus.usedBudget / summary.budgetStatus.totalBudget) * 100))
    : 0;

  return (
    <div className="space-y-6">
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Net Balance Card */}
        <div id="summary-card-balance" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">{dict?.summary?.balance || dict?.summary?.cashBalance || 'Total Net Balance'}</span>
            <div className="p-2 rounded-xl bg-slate-800 text-emerald-400">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 tracking-tight">
            {formatCurrency(summary.totalBalance)}
          </div>
          <div className="mt-3 flex items-center text-xs space-x-1.5 text-slate-400">
            <span className="inline-flex items-center text-emerald-400 font-medium">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              +{summary.incomeChangePercentage}%
            </span>
            <span>vs previous month</span>
          </div>
        </div>

        {/* Total Income Card */}
        <div id="summary-card-income" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90">{dict?.summary?.income || dict?.summary?.totalIncome || 'Total Income'}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">
            {formatCurrency(summary.totalIncome)}
          </div>
          <div className="mt-3 flex items-center text-xs text-slate-400">
            <span className="text-slate-300 font-medium">Inflows recorded:</span>
            <span className="ml-1 text-slate-100 font-bold">
              {recentTransactions.filter(t => t.type === 'income').length}
            </span>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div id="summary-card-expenses" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400/90">{dict?.summary?.expense || dict?.summary?.totalExpenses || 'Total Expenses'}</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-400 tracking-tight">
            {formatCurrency(summary.totalExpenses)}
          </div>
          <div className="mt-3 flex items-center text-xs text-slate-400 truncate">
            <span>Top:</span>
            <span className="ml-1 font-semibold text-slate-200 truncate">{summary.topExpenseCategory.name}</span>
            <span className="ml-1 text-rose-400 font-medium">({summary.topExpenseCategory.percentage}%)</span>
          </div>
        </div>

        {/* Net Savings & Savings Rate */}
        <div id="summary-card-savings" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-400/90">Savings Rate</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <PiggyBank className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-bold text-sky-400 tracking-tight">
              {summary.savingsRate}%
            </div>
            <span className="text-xs text-slate-400">({formatCurrency(summary.netSavings)})</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-sky-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, summary.savingsRate)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Budget Health Banner + Smart Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Overall Monthly Budget Progress */}
        <div id="summary-budget-status" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <PieChartIcon className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">Monthly Spending Budget</h3>
              </div>
              <button 
                onClick={onNavigateToBudgets}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-0.5 cursor-pointer"
              >
                <span>Manage</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Spent / Budget Limit:</span>
                <span className="font-bold text-slate-200">
                  {formatCurrency(summary.budgetStatus.usedBudget)} / {formatCurrency(summary.budgetStatus.totalBudget)}
                </span>
              </div>

              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetUsagePercent >= 100 
                      ? 'bg-rose-500' 
                      : budgetUsagePercent > 80 
                      ? 'bg-amber-500' 
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${budgetUsagePercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">{budgetUsagePercent}% budget used</span>
                <span className={`font-semibold ${
                  summary.budgetStatus.remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {summary.budgetStatus.remaining >= 0 
                    ? `${formatCurrency(summary.budgetStatus.remaining)} remaining`
                    : `${formatCurrency(Math.abs(summary.budgetStatus.remaining))} over budget`
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              {budgetUsagePercent <= 80 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Spending is on track within budget limits.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <span>Approaching budget limit for this month.</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Smart Financial Insights */}
        <div id="summary-smart-insights" className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 mb-3">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-base font-bold text-slate-100">Smart Financial Summary & Tips</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-slate-800/50 border border-slate-800 rounded-xl space-y-1">
                <div className="text-xs font-semibold text-emerald-400">Savings Pace</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your net savings rate is currently <strong className="text-slate-100">{summary.savingsRate}%</strong>. Saving over 20% of net income puts you in a strong position for emergency funds and wealth building.
                </p>
              </div>

              <div className="p-4 bg-slate-800/50 border border-slate-800 rounded-xl space-y-1">
                <div className="text-xs font-semibold text-sky-400">Category Concentration</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your largest expense category is <strong className="text-slate-100">{summary.topExpenseCategory.name}</strong>, accounting for <strong className="text-slate-100">{summary.topExpenseCategory.percentage}%</strong> of total monthly expenses.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Need to record a new receipt or paycheck?</span>
            <button
              onClick={onOpenAddModal}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer"
            >
              <span>+ Record Transaction</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Recent Transactions Preview */}
      <div id="summary-recent-transactions" className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Latest activity across your accounts</p>
          </div>

          <button
            onClick={onNavigateToTransactions}
            className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <span>View All Transactions</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No transactions found. Add a transaction to get started!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recentTransactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    tx.type === 'income' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">{tx.description}</div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="font-medium text-slate-300">{tx.category}</span>
                      <span>•</span>
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span className="capitalize">{tx.paymentMethod.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-xs font-bold ${
                    tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                  <span className="text-[10px] text-slate-500 capitalize">{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
