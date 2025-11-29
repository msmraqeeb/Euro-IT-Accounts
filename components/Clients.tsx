
import React, { useState } from 'react';
import { Client, Payment, AppData, UserRole } from '../types';
import { Plus, Search, Mail, Phone, Building, X, Users, Edit2, CheckCircle, XCircle, MoreHorizontal, Power, Briefcase } from 'lucide-react';

interface ClientsProps {
  data: AppData;
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onAddPayment: (payment: Payment) => void;
  userRole: UserRole;
}

export const Clients: React.FC<ClientsProps> = ({ data, onAddClient, onUpdateClient, onAddPayment, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  
  // New Client Form State
  const [formData, setFormData] = useState<Partial<Client>>({});
  
  // Payment Form State
  const [paymentData, setPaymentData] = useState<Partial<Payment>>({ 
    amount: 0, 
    date: new Date().toISOString().split('T')[0],
    method: 'Cash',
    details: '',
    type: 'RECEIVED'
  });

  const filteredClients = data.clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'ACTIVE') return matchesSearch && (client.isActive !== false);
    if (statusFilter === 'INACTIVE') return matchesSearch && (client.isActive === false);
    
    return matchesSearch;
  }).sort((a, b) => {
    // Priority 1: Status (Active first)
    const aActive = a.isActive !== false;
    const bActive = b.isActive !== false;
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;

    // Priority 2: Alphabetical
    return a.name.localeCompare(b.name);
  });

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (formData.id) {
       onUpdateClient(formData as Client);
    } else {
       onAddClient({
        id: crypto.randomUUID(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        company: formData.company || '',
        notes: formData.notes || '',
        createdAt: Date.now(),
        isActive: true,
        totalBilled: formData.totalBilled || 0
      });
    }
    setIsModalOpen(false);
    setFormData({});
  };

  const handleToggleStatus = (client: Client) => {
    if (userRole !== UserRole.ADMIN) return;
    onUpdateClient({
      ...client,
      isActive: client.isActive === false ? true : false
    });
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !paymentData.amount) return;

    onAddPayment({
      id: crypto.randomUUID(),
      clientId: selectedClient.id,
      amount: Number(paymentData.amount),
      date: paymentData.date || new Date().toISOString().split('T')[0],
      description: paymentData.description || 'Payment',
      method: paymentData.method || 'Cash',
      details: paymentData.details || '',
      type: paymentData.type || 'RECEIVED'
    });
    setIsPaymentModalOpen(false);
    setPaymentData({ 
      amount: 0, 
      date: new Date().toISOString().split('T')[0],
      method: 'Cash',
      details: '',
      type: 'RECEIVED'
    });
  };

  const openEdit = (client: Client) => {
    setFormData(client);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setFormData({ isActive: true, totalBilled: 0 });
    setIsModalOpen(true);
  };

  const openPayment = (client: Client) => {
    setSelectedClient(client);
    setPaymentData({ 
      amount: 0, 
      date: new Date().toISOString().split('T')[0],
      method: 'Cash',
      details: '',
      type: 'RECEIVED'
    });
    setIsPaymentModalOpen(true);
  };

  const getClientFinancials = (clientId: string) => {
    const clientPayments = data.payments.filter(p => p.clientId === clientId);
    const received = clientPayments.filter(p => p.type !== 'REFUND').reduce((sum, p) => sum + p.amount, 0);
    const refunded = clientPayments.filter(p => p.type === 'REFUND').reduce((sum, p) => sum + p.amount, 0);
    const netPaid = received - refunded;
    const client = data.clients.find(c => c.id === clientId);
    const billed = client?.totalBilled || 0;
    const due = billed - netPaid;
    
    return { netPaid, due, billed };
  };

  const isAdmin = userRole === UserRole.ADMIN;

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500 mt-1">Manage client profiles and payments</p>
        </div>
        {isAdmin && (
          <button 
            onClick={openNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add Client
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search clients by name, company, or email..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                statusFilter === status 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Client Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-semibold">Client Name</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Company</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Project Value</th>
                <th className="p-4 font-semibold text-right">Paid</th>
                <th className="p-4 font-semibold text-right">Due</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.map(client => {
                const financials = getClientFinancials(client.id);
                return (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{client.name}</div>
                          {client.notes && <div className="text-xs text-slate-400 truncate max-w-[150px]">{client.notes}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {client.email}
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-700">
                      {client.company ? (
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {client.company}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">--</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(client)}
                        disabled={!isAdmin}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                          client.isActive !== false 
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        } ${!isAdmin ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                      >
                        {client.isActive !== false ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right text-sm text-slate-500">
                      ৳{financials.billed.toLocaleString()}
                    </td>
                    <td className="p-4 text-right text-sm font-medium text-green-600">
                      ৳{financials.netPaid.toLocaleString()}
                    </td>
                    <td className="p-4 text-right text-sm font-bold text-orange-600">
                      {financials.due > 0 ? `৳${financials.due.toLocaleString()}` : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="p-4 text-right">
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openPayment(client)}
                            disabled={client.isActive === false}
                            className={`p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors ${client.isActive === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Record Payment"
                          >
                            <span className="font-bold text-lg leading-none">৳</span>
                          </button>
                          <button 
                            onClick={() => openEdit(client)}
                            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                            title="Edit Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                      <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No clients found</h3>
                    <p className="text-slate-500">
                      {statusFilter !== 'ALL' 
                        ? `No ${statusFilter.toLowerCase()} clients match your search.` 
                        : 'Try adjusting your search or add a new client.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                {formData.id ? 'Edit Client' : 'Add New Client'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveClient} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                <input 
                  required
                  type="email" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.email || ''}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.phone || ''}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.company || ''}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Value / Total Billed (৳)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                  <input 
                    type="number" 
                    min="0"
                    className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.totalBilled || 0}
                    onChange={e => setFormData({...formData, totalBilled: parseFloat(e.target.value)})}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Total amount you expect to receive from this client.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea 
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  value={formData.notes || ''}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              
              {/* Status Toggle in Edit Mode */}
              {formData.id && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Power className={`w-5 h-5 ${formData.isActive !== false ? 'text-green-600' : 'text-slate-400'}`} />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-900 block">Client Status</span>
                    <span className="text-xs text-slate-500">Inactive clients are hidden from payment selection.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.isActive !== false}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              )}

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
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Record Payment</h2>
                <p className="text-sm text-slate-500">For {selectedClient.name}</p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-6 space-y-4">
              {/* Transaction Type Selection */}
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                    paymentData.type !== 'REFUND' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  onClick={() => setPaymentData({...paymentData, type: 'RECEIVED'})}
                >
                  Received (Income)
                </button>
                <button
                  type="button"
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                    paymentData.type === 'REFUND' 
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  onClick={() => setPaymentData({...paymentData, type: 'REFUND'})}
                >
                  Refund (Expense)
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {paymentData.type === 'REFUND' ? 'Refund Amount (৳) *' : 'Amount Received (৳) *'}
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-lg ${paymentData.type === 'REFUND' ? 'text-red-500' : 'text-slate-400'}`}>৳</span>
                  <input 
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none text-lg font-semibold ${
                      paymentData.type === 'REFUND' 
                        ? 'border-red-200 text-red-600 focus:ring-red-500' 
                        : 'border-slate-300 text-slate-900 focus:ring-blue-500'
                    }`}
                    value={paymentData.amount || ''}
                    onChange={e => setPaymentData({...paymentData, amount: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Method</label>
                   <select
                       className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                       value={paymentData.method}
                       onChange={e => setPaymentData({...paymentData, method: e.target.value})}
                     >
                       <option value="Cash">Cash</option>
                       <option value="bKash">bKash</option>
                       <option value="Bank Transfer">Bank Transfer</option>
                       <option value="Cheque">Cheque</option>
                       <option value="Card">Card</option>
                       <option value="Other">Other</option>
                     </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                   <input 
                      required
                      type="date"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={paymentData.date}
                      onChange={e => setPaymentData({...paymentData, date: e.target.value})}
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Details</label>
                <input 
                  type="text"
                  placeholder="e.g. TrxID, Check No."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={paymentData.details || ''}
                  onChange={e => setPaymentData({...paymentData, details: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. Invoice #1043"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={paymentData.description || ''}
                  onChange={e => setPaymentData({...paymentData, description: e.target.value})}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                 <button 
                  type="button" 
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`px-6 py-2 text-white rounded-lg font-medium shadow-sm transition-colors ${
                    paymentData.type === 'REFUND' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {paymentData.type === 'REFUND' ? 'Confirm Refund' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
