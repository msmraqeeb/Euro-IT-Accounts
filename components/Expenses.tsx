import React, { useState, useMemo } from 'react';
import { Expense, AppData, UserRole } from '../types';
import { Plus, Search, Filter, X, Receipt, Lock, Tag } from 'lucide-react';

interface ExpensesProps {
  data: AppData;
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  userRole: UserRole;
}

export const Expenses: React.FC<ExpensesProps> = ({ data, onAddExpense, onDeleteExpense, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Expense>>({
    date: new Date().toISOString().split('T')[0],
    category: ''
  });

  // Calculate unique categories from existing data for the filter
  const uniqueCategories = useMemo(() => {
    const cats = new Set(data.expenses.map(e => e.category));
    return Array.from(cats).sort();
  }, [data.expenses]);

  const filteredExpenses = data.expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.category) return;

    onAddExpense({
      id: crypto.randomUUID(),
      amount: Number(formData.amount),
      category: formData.category,
      date: formData.date || new Date().toISOString().split('T')[0],
      description: formData.description
    });
    setIsModalOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: '',
      amount: undefined,
      description: ''
    });
  };

  const isAdmin = userRole === UserRole.ADMIN;

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Expenses</h1>
          <p className="text-slate-500 mt-1">Track business spending and receipts</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Log Expense
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search expenses by description or category..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <select
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-slate-700"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4 text-slate-600 whitespace-nowrap">{expense.date}</td>
                  <td className="p-4 font-medium text-slate-900">{expense.description}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {expense.category}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-slate-900">
                    ৳{expense.amount.toFixed(2)}
                  </td>
                  <td className="p-4 text-right">
                    {isAdmin ? (
                      <button 
                        onClick={() => onDeleteExpense(expense.id)}
                        className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete expense"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    ) : (
                      <Lock className="w-4 h-4 text-slate-200 opacity-0 group-hover:opacity-100 ml-auto" />
                    )}
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Receipt className="w-12 h-12 mb-3 opacity-20" />
                      <p>No expenses found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Log New Expense</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (৳) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">৳</span>
                  <input 
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg font-semibold"
                    value={formData.amount || ''}
                    onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Office Chairs"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.description || ''}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                   <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required
                        type="text"
                        placeholder="e.g. Travel"
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        list="category-suggestions"
                      />
                      <datalist id="category-suggestions">
                        {uniqueCategories.map(cat => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                   </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input 
                    required
                    type="date"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                 <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};