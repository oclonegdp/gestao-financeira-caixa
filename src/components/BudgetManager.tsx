import React, { useState } from 'react';
import { Target, AlertTriangle, CheckCircle, Edit2, Save, X, PlusCircle } from 'lucide-react';
import { Category, CategoryBudget } from '../types/database.types';

interface BudgetManagerProps {
  categories: Category[];
  budgets: CategoryBudget[];
  onUpdateCategoryBudget: (categoryName: string, newBudget: number) => void;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  categories = [],
  budgets = [],
  onUpdateCategoryBudget,
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const startEdit = (catName: string, currentBudget: number) => {
    setEditingCategory(catName);
    setEditAmount(currentBudget.toString());
  };

  const saveEdit = (catName: string) => {
    const val = parseFloat(editAmount);
    if (!isNaN(val) && val >= 0) {
      onUpdateCategoryBudget(catName, val);
    }
    setEditingCategory(null);
  };

  const totalBudgeted = budgets.reduce((acc, b) => acc + b.budget, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 mb-1">
              <Target className="h-5 w-5" />
              <h2 className="text-base font-bold text-slate-100">Monthly Expense Category Budgets</h2>
            </div>
            <p className="text-xs text-slate-400">
              Set target monthly spending caps to control outflows and prevent budget overruns.
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block">Total Budget Cap:</span>
              <span className="font-bold text-slate-100 text-sm">{formatCurrency(totalBudgeted)}</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-slate-400 block">Total Spent:</span>
              <span className={`font-bold text-sm ${totalSpent > totalBudgeted ? 'text-rose-400' : 'text-emerald-400'}`}>
                {formatCurrency(totalSpent)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((item) => {
          const percent = item.budget > 0 ? Math.round((item.spent / item.budget) * 100) : 0;
          const remaining = item.budget - item.spent;
          const isOver = item.spent > item.budget;
          const isNear = percent >= 80 && !isOver;

          return (
            <div 
              key={item.category} 
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all shadow-xs"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: item.color || '#10b981' }} 
                  />
                  <h3 className="text-sm font-bold text-slate-100">{item.category}</h3>
                </div>

                {editingCategory === item.category ? (
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-slate-100 font-mono"
                    />
                    <button
                      onClick={() => saveEdit(item.category)}
                      className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(item.category, item.budget)}
                    className="flex items-center space-x-1 text-[11px] font-medium text-slate-400 hover:text-emerald-400 bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-700/60 transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit Cap</span>
                  </button>
                )}
              </div>

              {/* Numbers */}
              <div className="flex items-baseline justify-between text-xs mb-2">
                <span className="text-slate-400">
                  Spent: <strong className="text-slate-200">{formatCurrency(item.spent)}</strong>
                </span>
                <span className="text-slate-400">
                  Limit: <strong className="text-slate-200">{formatCurrency(item.budget)}</strong>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOver ? 'bg-rose-500' : isNear ? 'bg-amber-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, percent)}%` }}
                />
              </div>

              {/* Footer Status Pill */}
              <div className="flex items-center justify-between text-[11px]">
                <span className={`font-semibold ${isOver ? 'text-rose-400' : isNear ? 'text-amber-400' : 'text-slate-400'}`}>
                  {percent}% used
                </span>

                <div className="flex items-center space-x-1">
                  {isOver ? (
                    <span className="inline-flex items-center text-rose-400 font-semibold space-x-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{formatCurrency(Math.abs(remaining))} over</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-emerald-400 font-medium space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>{formatCurrency(remaining)} left</span>
                    </span>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
