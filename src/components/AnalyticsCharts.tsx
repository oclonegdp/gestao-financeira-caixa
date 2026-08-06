import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { Transaction, Category } from '../types/database.types';
import { PieChart as PieIcon, BarChart3, TrendingUp, CreditCard } from 'lucide-react';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  categories: Category[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  categories,
}) => {
  
  // 1. Prepare timeline cashflow data (grouped by date)
  const cashflowData = useMemo(() => {
    const map: Record<string, { date: string; Income: number; Expense: number }> = {};

    // Sort transactions by date asc
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

    sorted.forEach((tx) => {
      if (!map[tx.date]) {
        map[tx.date] = { date: tx.date, Income: 0, Expense: 0 };
      }
      if (tx.type === 'income') {
        map[tx.date].Income += tx.amount;
      } else {
        map[tx.date].Expense += tx.amount;
      }
    });

    return Object.values(map);
  }, [transactions]);

  // 2. Prepare Category Expense PieChart data
  const categoryPieData = useMemo(() => {
    const map: Record<string, number> = {};

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });

    const categoryColors: Record<string, string> = {
      'Housing & Rent': '#6366f1',
      'Groceries & Dining': '#f43f5e',
      'Transportation': '#ec4899',
      'Utilities & Bills': '#eab308',
      'Entertainment & Tech': '#a855f7',
      'Health & Fitness': '#14b8a6',
      'Shopping & Apparel': '#f97316',
      'Travel & Leisure': '#3b82f6',
    };

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name] || '#64748b',
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // 3. Payment Method Breakdown Data
  const paymentMethodData = useMemo(() => {
    const map: Record<string, number> = {};

    transactions.forEach(t => {
      const pmLabel = t.paymentMethod.replace('_', ' ').toUpperCase();
      map[pmLabel] = (map[pmLabel] || 0) + t.amount;
    });

    return Object.entries(map).map(([method, amount]) => ({
      method,
      amount,
    }));
  }, [transactions]);

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center space-x-2 text-emerald-400 mb-1">
          <BarChart3 className="h-5 w-5" />
          <h2 className="text-base font-bold text-slate-100">Financial Analytics & Visualization</h2>
        </div>
        <p className="text-xs text-slate-400">
          Visual analysis of cash flows, expense category distribution, and spending channels.
        </p>
      </div>

      {/* Main Cash Flow Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Income vs. Expense Trend</h3>
            <p className="text-xs text-slate-400">Daily financial cash flow activity</p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <div className="flex items-center space-x-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Income</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500" />
              <span className="text-slate-300">Expense</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashflowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v}`} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
                formatter={(val: number) => [`$${val.toFixed(2)}`, '']}
              />
              <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="Expense" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Pie Chart Category Allocation + Payment Method BarChart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Expense Allocation Donut */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Expense Allocation by Category</h3>
              <p className="text-xs text-slate-400">Share of total monthly spend</p>
            </div>
            <PieIcon className="h-5 w-5 text-slate-500" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
                  formatter={(val: number) => [`$${val.toFixed(2)}`, 'Spent']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Legend list */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-xs">
            {categoryPieData.map((cat) => (
              <div key={cat.name} className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-slate-300 font-medium truncate">{cat.name}:</span>
                <span className="text-slate-100 font-bold ml-auto">{formatCurrency(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Payment Channel Volume</h3>
                <p className="text-xs text-slate-400">Total transaction amount by method</p>
              </div>
              <CreditCard className="h-5 w-5 text-slate-500" />
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentMethodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="method" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v}`} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
                    formatter={(val: number) => [`$${val.toFixed(2)}`, 'Volume']}
                  />
                  <Bar dataKey="amount" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex justify-between">
            <span>Primary Method: <strong>Credit Card</strong></span>
            <span>Total Tracked Volume: <strong>{formatCurrency(paymentMethodData.reduce((a, b) => a + b.amount, 0))}</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
};
