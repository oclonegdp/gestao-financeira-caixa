import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, Calendar, CreditCard, Tag, FileText, Plus, Repeat } from 'lucide-react';
import { Transaction, Category, TransactionType, PaymentMethod } from '../types/database.types';

interface TransactionFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (transaction: Omit<Transaction, 'id'> & { id?: string }) => void;
  editingTransaction?: Transaction | null;
  categories?: Category[];
  dict?: any;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen = true,
  onClose = () => {},
  onSave = (_tx: any) => {},
  editingTransaction,
  categories = [],
  dict,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [notes, setNotes] = useState('');
  const [tagsString, setTagsString] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setDescription(editingTransaction.description);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setNotes(editingTransaction.notes || '');
      setTagsString(editingTransaction.tags ? editingTransaction.tags.join(', ') : '');
      setIsRecurring(editingTransaction.isRecurring || false);
    } else {
      // Defaults for new transaction
      setType('expense');
      setAmount('');
      setDescription('');
      const defaultCat = categories.find(c => c.type === 'expense');
      setCategory(defaultCat ? defaultCat.name : '');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('credit_card');
      setNotes('');
      setTagsString('');
      setIsRecurring(false);
    }
    setErrors({});
  }, [editingTransaction, isOpen, categories]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter(c => c.type === type);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const defaultCat = categories.find(c => c.type === newType);
    if (defaultCat) {
      setCategory(defaultCat.name);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      errs.amount = 'Please enter a valid amount greater than 0';
    }
    if (!description.trim()) {
      errs.description = 'Description is required';
    }
    if (!category) {
      errs.category = 'Please select a category';
    }
    if (!date) {
      errs.date = 'Please select a date';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const tagsArr = tagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onSave({
      id: editingTransaction?.id,
      type,
      amount: parseFloat(parseFloat(amount).toFixed(2)),
      description: description.trim(),
      category,
      date,
      paymentMethod,
      status: 'completed',
      notes: notes.trim() || undefined,
      tags: tagsArr.length > 0 ? tagsArr : undefined,
      isRecurring,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100">
            {editingTransaction 
              ? (dict?.form?.title || dict?.transactionForm?.title || 'Edit Transaction') 
              : (dict?.form?.title || dict?.transactionForm?.title || 'Record New Transaction')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Income vs Expense Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              - {dict?.form?.expenseOption || dict?.transactionForm?.expenseOption || 'Expense'}
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              + {dict?.form?.incomeOption || dict?.transactionForm?.incomeOption || 'Income'}
            </button>
          </div>

          {/* Amount & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {dict?.form?.amount || dict?.transactionForm?.amountLabel || 'Amount ($)'} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
              {errors.amount && <p className="text-rose-400 text-[11px] mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Date <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              {errors.date && <p className="text-rose-400 text-[11px] mt-1">{errors.date}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {dict?.form?.description || dict?.transactionForm?.descriptionLabel || 'Description'} <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder={dict?.form?.descriptionPlaceholder || dict?.transactionForm?.descriptionPlaceholder || 'e.g. Grocery Store, Client Invoice #102...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            {errors.description && <p className="text-rose-400 text-[11px] mt-1">{errors.description}</p>}
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">{dict?.form?.category || dict?.transactionForm?.categoryLabel || 'Category'}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-rose-400 text-[11px] mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="crypto">Crypto</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Tags & Recurring */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Tags <span className="text-slate-500 font-normal">(comma separated)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Work, Food, Essential"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-2 pb-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded text-emerald-500 bg-slate-950 border-slate-800 focus:ring-emerald-500 h-4 w-4"
              />
              <label htmlFor="isRecurring" className="text-slate-300 font-medium cursor-pointer">
                Recurring
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Notes / Receipts Memo</label>
            <textarea
              rows={2}
              placeholder="Optional notes or details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              {editingTransaction ? 'Update Transaction' : (dict?.form?.submit || dict?.transactionForm?.saveButton || 'Save Transaction')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
