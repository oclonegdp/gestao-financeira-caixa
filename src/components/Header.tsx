import React from 'react';
import { 
  Wallet, 
  Plus, 
  Download, 
  Upload, 
  RotateCcw, 
  TrendingUp, 
  PieChart as PieIcon,
  List,
  Target
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'summary' | 'transactions' | 'budgets' | 'analytics';
  setActiveTab: (tab: 'summary' | 'transactions' | 'budgets' | 'analytics') => void;
  onOpenAddModal: () => void;
  onResetData: () => void;
  onExportCSV: () => void;
  totalBalance: number;
  currentLocale?: string;
  onLocaleChange?: (locale: string) => void;
  dict?: any;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onResetData,
  onExportCSV,
  totalBalance,
  currentLocale = 'pt-BR',
  onLocaleChange = (_locale: string) => {},
  dict,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          
          {/* Brand & App Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Wallet className="h-5 w-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-100">
                  {dict?.title || dict?.appName || 'Gestão Financeira & Caixa'}
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-400">{dict?.subtitle || dict?.appSubtitle || 'Controle de produções caseiras e fluxo diário'}</p>
            </div>
          </div>

          {/* Balance Pill, Language Switcher & Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => onLocaleChange('pt-BR')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  currentLocale.startsWith('pt') ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                PT
              </button>
              <button
                onClick={() => onLocaleChange('en-US')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  currentLocale.startsWith('en') ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3.5 py-1.5 flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-medium">Net Balance:</span>
              <span className={`text-sm font-bold ${totalBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <button
              id="export-csv-btn"
              onClick={onExportCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title="Export Transactions to CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              id="reset-data-btn"
              onClick={onResetData}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title="Reset Sample Demo Data"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            <button
              id="add-transaction-header-btn"
              onClick={onOpenAddModal}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="flex items-center space-x-1 border-t border-slate-800/80 pt-2 pb-1 overflow-x-auto no-scrollbar">
          <button
            id="tab-summary"
            onClick={() => setActiveTab('summary')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'summary'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Financial Summary</span>
          </button>

          <button
            id="tab-transactions"
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <List className="h-4 w-4" />
            <span>Transaction List</span>
          </button>

          <button
            id="tab-budgets"
            onClick={() => setActiveTab('budgets')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'budgets'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Target className="h-4 w-4" />
            <span>Budget Limits</span>
          </button>

          <button
            id="tab-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <PieIcon className="h-4 w-4" />
            <span>Analytics & Charts</span>
          </button>
        </div>
      </div>
    </header>
  );
};
