import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  ArrowUpDown, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit3, 
  CreditCard, 
  Tag, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { Transaction, Category, FilterOptions, PaymentMethod } from '../types/database.types';

interface TransactionListProps {
  transactions?: Transaction[];
  initialTransactions?: Transaction[];
  categories?: Category[];
  filters?: FilterOptions;
  setFilters?: React.Dispatch<React.SetStateAction<FilterOptions>>;
  onOpenAddModal?: () => void;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onExportCSV?: () => void;
  dict?: any;
}

const defaultFilters: FilterOptions = {
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
};

const ITEMS_PER_PAGE = 8;

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions: providedTransactions,
  initialTransactions = [],
  categories = [],
  filters: providedFilters,
  setFilters: providedSetFilters,
  onOpenAddModal = () => {},
  onEditTransaction = (_tx: Transaction) => {},
  onDeleteTransaction = (_id: string) => {},
  onExportCSV = () => {},
  dict,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(defaultFilters);
  const filters = providedFilters || localFilters;
  const setFilters = providedSetFilters || setLocalFilters;

  const rawList = providedTransactions || initialTransactions;

  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Apply basic local filtering if standalone
  const filteredList = useMemo(() => {
    let result = [...rawList];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        t =>
          t.description?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q)
      );
    }
    if (filters.type && filters.type !== 'all') {
      result = result.filter(t => t.type === filters.type);
    }
    return result;
  }, [rawList, filters.search, filters.type]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, currentPage]);

  const handleResetFilters = () => {
    setFilters({
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
    setCurrentPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getPaymentMethodLabel = (pm: PaymentMethod) => {
    switch (pm) {
      case 'credit_card': return 'Credit Card';
      case 'debit_card': return 'Debit Card';
      case 'bank_transfer': return 'Bank Transfer';
      case 'cash': return 'Cash';
      case 'crypto': return 'Crypto';
      default: return 'Other';
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Search & Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={dict?.list?.searchPlaceholder || dict?.transactionList?.searchPlaceholder || 'Search description, tags, notes, category...'}
              value={filters.search}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, search: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-9 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 transition-all"
            />
            {filters.search && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Type Switchers */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['all', 'income', 'expense'] as const).map((type) => {
              const labelMap: Record<string, string> = {
                all: dict?.list?.all || dict?.transactionList?.filterAll || 'All',
                income: dict?.list?.incomes || dict?.transactionList?.filterIncome || 'Incomes',
                expense: dict?.list?.expenses || dict?.transactionList?.filterExpense || 'Expenses',
              };
              return (
                <button
                  key={type}
                  onClick={() => {
                    setFilters(prev => ({ ...prev, type }));
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    filters.type === type
                      ? 'bg-slate-800 text-emerald-400 shadow-xs border border-slate-700/80'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {labelMap[type]}
                </button>
              );
            })}
          </div>

          {/* Toggle Advanced Filters Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                showAdvancedFilters || filters.category !== 'all' || filters.startDate || filters.endDate
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span className="hidden sm:inline">Add New</span>
            </button>
          </div>

        </div>

        {/* Expandable Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            
            {/* Category Select */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, category: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Payment Method Select */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Payment Method</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, paymentMethod: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Methods</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="crypto">Crypto</option>
              </select>
            </div>

            {/* Date Start */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">From Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, startDate: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Date End */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">To Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, endDate: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Sort Controls */}
            <div className="sm:col-span-2 md:col-span-4 flex items-center justify-between pt-2">
              <div className="flex items-center space-x-3">
                <span className="text-slate-400 font-medium">Sort By:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="description">Description</option>
                  <option value="category">Category</option>
                </select>

                <button
                  onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 hover:text-white flex items-center space-x-1 cursor-pointer"
                >
                  <ArrowUpDown className="h-3 w-3" />
                  <span className="uppercase">{filters.sortOrder}</span>
                </button>
              </div>

              <button
                onClick={handleResetFilters}
                className="text-slate-400 hover:text-emerald-400 underline text-xs cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Transaction Table / List View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Table Header Info Bar */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <strong className="text-slate-200">{filteredList.length}</strong> matching transaction{filteredList.length !== 1 ? 's' : ''}
          </div>

          <button
            onClick={onExportCSV}
            className="text-slate-300 hover:text-emerald-400 flex items-center space-x-1 font-medium cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download CSV</span>
          </button>
        </div>

        {paginatedTransactions.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No transactions match your search criteria</p>
            <p className="text-xs text-slate-500">Try adjusting your filters or add a new transaction.</p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">{dict?.list?.date || dict?.transactionList?.colDate || 'Date'}</th>
                  <th className="py-3 px-4">{dict?.list?.descriptionHeader || dict?.transactionList?.colDescription || 'Description'}</th>
                  <th className="py-3 px-4">{dict?.list?.categoryHeader || dict?.transactionList?.colCategory || 'Category'}</th>
                  <th className="py-3 px-4">{dict?.list?.typeHeader || dict?.transactionList?.colType || 'Payment'}</th>
                  <th className="py-3 px-4 text-right">{dict?.list?.amountHeader || dict?.transactionList?.colAmount || 'Amount'}</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {paginatedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors group">
                    
                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono whitespace-nowrap">
                      {tx.date}
                    </td>

                    {/* Description & Notes & Tags */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-200 flex items-center space-x-1.5">
                        <span>{tx.description}</span>
                        {tx.isRecurring && (
                          <span className="px-1.5 py-0.2 text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-md">
                            Recurring
                          </span>
                        )}
                      </div>
                      {tx.notes && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{tx.notes}</p>
                      )}
                      {tx.tags && tx.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tx.tags.map((t, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded-md">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700/60">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span>{tx.category}</span>
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                      <div className="flex items-center space-x-1.5">
                        <CreditCard className="h-3.5 w-3.5 text-slate-500" />
                        <span>{getPaymentMethodLabel(tx.paymentMethod)}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-sm font-bold">
                      <span className={tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
                          title="Edit transaction"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete transaction"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/40 text-xs">
            <span className="text-slate-400">
              Page <strong className="text-slate-200">{currentPage}</strong> of <strong className="text-slate-200">{totalPages}</strong>
            </span>

            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
