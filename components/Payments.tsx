
import React, { useState } from 'react';
import { Payment, AppData, UserRole } from '../types';
import { Search, X, Calendar, Plus, Lock, Edit2, Trash2, CreditCard, FileText, ArrowRightLeft } from 'lucide-react';

interface PaymentsProps {
  data: AppData;
  onAddPayment: (payment: Payment) => void;
  onUpdatePayment: (payment: Payment) => void;
  onDeletePayment: (id: string) => void;
  userRole: UserRole;
}

export const Payments: React.FC<PaymentsProps> = ({ data, onAddPayment, onUpdatePayment, onDeletePayment, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Payment>>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    method: 'Cash',
    details: '',
    type: 'RECEIVED'
  });

  // Filter Active Clients for the Dropdown
  const activeClients = data.clients.filter(c => c.isActive !== false);

  const getClientName = (clientId: string) => {
    const client = data.clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  const filteredPayments = data.payments.filter(payment => {
    const clientName = getClientName(payment.clientId).toLowerCase();
    const desc = (payment.description || '').toLowerCase();
    const details = (payment.details || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return clientName.includes(search) || desc.includes(search) || details.includes(search);
  }).sort((a, b) => b.date.localeCompare(a.date));

  const handleOpenModal = (payment?: Payment) => {
    if (payment) {
      setFormData(payment);
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        clientId: activeClients.length > 0 ? activeClients[0].id : '',
        method: 'Cash',
        details: '',
        type: 'RECEIVED'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.amount || !formData.date) return;

    if (formData.id) {
      // Edit
      onUpdatePayment(formData as Payment);
    } else {
      // Add
      onAddPayment({
        id: crypto.randomUUID(),
        clientId: formData.clientId,
        amount: Number(formData.amount),
        date: formData.date,
        description: formData.description || 'Payment',
        method: formData.method || 'Cash',
        details: formData.details || '',
        type: formData.type || 'RECEIVED'
      });
    }
    setIsModalOpen(false);
  };

  const isAdmin = userRole === UserRole.ADMIN;

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-500 mt-1">Track and manage client payments</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Record Payment
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by client, description or details..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-semibold whitespace-nowrap">Date</th>
                <th className="p-4 font-semibold">Client</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Method</th>
                <th className="p-4 font-semibold">Details/Desc</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map(payment => (
                <tr key={payment.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4 text-slate-600 whitespace-nowrap">{payment.date}</td>
                  <td className="p-4 font-medium text-slate-900">{getClientName(payment.clientId)}</td>
                  <td className="p-4">
                     {payment.type === 'REFUND' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                          REFUND
                        </span>
                     ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                          RECEIVED
                        </span>
                     )}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                      {payment.method || 'Cash'}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    {payment.details && (
                      <div className="text-slate-900 font-medium mb-0.5">{payment.details}</div>
                    )}
                    <div className="text-slate-500">{payment.description}</div>
                  </td>
                  <td className={`p-4 text-right font-bold ${payment.type === 'REFUND' ? 'text-red-600' : 'text-green-600'}`}>
                    {payment.type === 'REFUND' && '-'}৳{payment.amount.toFixed(2)}
                  </td>
                  <td className="p-4 text-right">
                    {isAdmin ? (
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={() => handleOpenModal(payment)}
                          className="text-slate-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDeletePayment(payment.id)}
                          className="text-slate-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <Lock className="w-4 h-4 text-slate-200 opacity-0 group-hover:opacity-100 ml-auto" />
                    )}
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <span className="text-6xl mb-3 opacity-20 font-bold text-slate-400">৳</span>
                      <p>No payments found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                {formData.id ? 'Edit Payment' : 'Record New Payment'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client *</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  value={formData.clientId || ''}
                  onChange={e => setFormData({...formData, clientId: e.target.value})}
                  disabled={activeClients.length === 0}
                >
                  <option value="" disabled>Select a Client</option>
                  {activeClients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                  {/* Handle case where editing a payment for an inactive client */}
                  {formData.id && formData.clientId && !activeClients.find(c => c.id === formData.clientId) && (
                     <option value={formData.clientId} disabled>{getClientName(formData.clientId)} (Inactive)</option>
                  )}
                </select>
                {activeClients.length === 0 && (
                   <p className="text-xs text-red-500 mt-1">Add active clients before recording payments.</p>
                )}
              </div>
              
              {/* Type Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                    formData.type !== 'REFUND' 
                      ? 'bg-white text-green-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  onClick={() => setFormData({...formData, type: 'RECEIVED'})}
                >
                  Received (Income)
                </button>
                <button
                  type="button"
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                    formData.type === 'REFUND' 
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  onClick={() => setFormData({...formData, type: 'REFUND'})}
                >
                  Refund (Expense)
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    {formData.type === 'REFUND' ? 'Refund Amount (৳) *' : 'Amount Received (৳) *'}
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-lg ${formData.type === 'REFUND' ? 'text-red-500' : 'text-slate-400'}`}>৳</span>
                  <input 
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none text-lg font-semibold ${
                      formData.type === 'REFUND' 
                        ? 'border-red-200 text-red-600 focus:ring-red-500' 
                        : 'border-slate-300 text-slate-900 focus:ring-green-500'
                    }`}
                    value={formData.amount || ''}
                    onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Method</label>
                   <div className="relative">
                     <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <select
                       className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none appearance-none bg-white"
                       value={formData.method || 'Cash'}
                       onChange={e => setFormData({...formData, method: e.target.value})}
                     >
                       <option value="Cash">Cash</option>
                       <option value="bKash">bKash</option>
                       <option value="Bank Transfer">Bank Transfer</option>
                       <option value="Cheque">Cheque</option>
                       <option value="Card">Card</option>
                       <option value="Other">Other</option>
                     </select>
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                   <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input 
                      required
                      type="date"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Details</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="e.g. TrxID, Check No."
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    value={formData.details || ''}
                    onChange={e => setFormData({...formData, details: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. Invoice #1043"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  value={formData.description || ''}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
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
                  className={`px-6 py-2 text-white rounded-lg font-medium shadow-sm transition-colors ${
                    formData.type === 'REFUND' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                  disabled={activeClients.length === 0}
                >
                  {formData.type === 'REFUND' ? 'Confirm Refund' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
