
import React, { useState, useMemo, useEffect } from 'react';
import { AppData, UserRole } from '../types';
import { Calendar, Filter, CreditCard, Download, FileDown, Loader2 } from 'lucide-react';

interface ReportsProps {
  data: AppData;
  userRole: UserRole;
}

export const Reports: React.FC<ReportsProps> = ({ data }) => {
  // Default to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [selectedClientId, setSelectedClientId] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  // Load Logo as Base64 for PDF compatibility
  useEffect(() => {
    const loadImageAsBase64 = async (url: string) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn("Could not load logo for PDF CORS:", e);
        return null;
      }
    };

    // Updated Logo URL
    loadImageAsBase64('https://i.postimg.cc/59gXKDM0/Euro-IT-gold-Copy-1-06.png').then(base64 => {
      if (base64) setLogoBase64(base64);
    });
  }, []);

  const clients = useMemo(() => {
    return data.clients.sort((a, b) => a.name.localeCompare(b.name));
  }, [data.clients]);

  // Extract unique payment methods
  const methods = useMemo(() => {
    const unique = new Set(data.payments.map(p => p.method || 'Cash'));
    return Array.from(unique).sort();
  }, [data.payments]);

  // Filter Data
  const reportData = useMemo(() => {
    // 1. Filter Payments
    const filteredPayments = data.payments.filter(p => {
      const dateMatch = p.date >= startDate && p.date <= endDate;
      const clientMatch = selectedClientId === 'ALL' || p.clientId === selectedClientId;
      const methodMatch = methodFilter === 'ALL' || (p.method || 'Cash') === methodFilter;
      return dateMatch && clientMatch && methodMatch;
    }).sort((a, b) => a.date.localeCompare(b.date));

    // 2. Filter Expenses 
    // Only include expenses if Client is ALL AND Method is ALL (Expenses don't have methods/clients linked usually)
    const filteredExpenses = (selectedClientId === 'ALL' && methodFilter === 'ALL')
      ? data.expenses.filter(e => e.date >= startDate && e.date <= endDate).sort((a, b) => a.date.localeCompare(b.date))
      : [];

    // 3. Calculations
    const totalReceived = filteredPayments
      .filter(p => p.type !== 'REFUND')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalRefunded = filteredPayments
      .filter(p => p.type === 'REFUND')
      .reduce((sum, p) => sum + p.amount, 0);

    const netIncome = totalReceived - totalRefunded;

    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = netIncome - totalExpenses;

    // 4. Method Breakdown (Only relevant if Method Filter is ALL)
    const methodBreakdown: Record<string, number> = {};
    if (methodFilter === 'ALL') {
       filteredPayments.forEach(p => {
          const m = p.method || 'Cash';
          const amt = p.type === 'REFUND' ? -p.amount : p.amount;
          methodBreakdown[m] = (methodBreakdown[m] || 0) + amt;
       });
    }

    // Client Specific Totals (Contextual info not bound by date range, but filtered by client)
    let clientContext = null;
    if (selectedClientId !== 'ALL') {
      const client = data.clients.find(c => c.id === selectedClientId);
      if (client) {
        const allClientPayments = data.payments.filter(p => p.clientId === client.id);
        const allPaid = allClientPayments.reduce((acc, p) => p.type === 'REFUND' ? acc - p.amount : acc + p.amount, 0);
        clientContext = {
          name: client.name,
          company: client.company,
          totalBilled: client.totalBilled || 0,
          totalPaidAllTime: allPaid,
          currentDue: (client.totalBilled || 0) - allPaid
        };
      }
    }

    return {
      payments: filteredPayments,
      expenses: filteredExpenses,
      totalReceived,
      totalRefunded,
      netIncome,
      totalExpenses,
      netProfit,
      clientContext,
      methodBreakdown
    };
  }, [data, startDate, endDate, selectedClientId, methodFilter]);

  const getClientName = (id: string) => {
    return data.clients.find(c => c.id === id)?.name || 'Unknown';
  };

  const handleExportCSV = () => {
    const csvRows = [];
    // Headers
    csvRows.push(['Date', 'Description', 'Type', 'Method', 'Debit (Out)', 'Credit (In)'].join(','));

    // Payments
    reportData.payments.forEach(p => {
      const clientName = getClientName(p.clientId);
      // Escape quotes in description for CSV
      const cleanDesc = (p.description || '').replace(/"/g, '""');
      const desc = `"${clientName}${cleanDesc ? ` - ${cleanDesc}` : ''}"`; 
      const type = p.type === 'REFUND' ? 'Refund' : 'Payment';
      const debit = p.type === 'REFUND' ? p.amount.toFixed(2) : '0.00';
      const credit = p.type !== 'REFUND' ? p.amount.toFixed(2) : '0.00';
      
      csvRows.push([
        p.date,
        desc,
        type,
        p.method || 'Cash',
        debit,
        credit
      ].join(','));
    });

    // Expenses
    if (selectedClientId === 'ALL' && methodFilter === 'ALL') {
      reportData.expenses.forEach(e => {
        const cleanDesc = e.description.replace(/"/g, '""');
        const desc = `"${cleanDesc} (${e.category})"`;
        csvRows.push([
          e.date,
          desc,
          'Expense',
          '-',
          e.amount.toFixed(2),
          '0.00'
        ].join(','));
      });
    }
    
    // Totals row
    csvRows.push(['', 'TOTALS', '', '', 
      (reportData.totalRefunded + (methodFilter === 'ALL' ? reportData.totalExpenses : 0)).toFixed(2), 
      reportData.totalReceived.toFixed(2)
    ].join(','));

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${startDate}_${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('printable-report');
    if (!element) return;
    
    setIsGeneratingPdf(true);

    // Options for html2pdf
    const opt = {
      margin: [10, 10, 10, 10], // top, left, bottom, right in mm
      filename: `EuroIT_Report_${startDate}_to_${endDate}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true, logging: false }, // Scale 3 for sharper text
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if ((window as any).html2pdf) {
       // Small timeout to allow any pending renders/images to stabilize
       setTimeout(() => {
          (window as any).html2pdf().set(opt).from(element).save().then(() => {
              setIsGeneratingPdf(false);
          }).catch((err: any) => {
              console.error(err);
              setIsGeneratingPdf(false);
              alert('Failed to generate PDF. Please try again.');
          });
       }, 500);
    } else {
       setIsGeneratingPdf(false);
       alert('PDF Generator library not loaded. Please refresh the page.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen print:p-0 print:m-0 print:max-w-none print:min-h-0">
      {/* Header - Screen Only */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financial Reports</h1>
          <p className="text-slate-500 mt-1">Generate statements by date, client, or payment method</p>
        </div>
        <div className="flex gap-2">
            <button 
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
            <button 
              id="btn-download-pdf"
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-wait"
            >
              {isGeneratingPdf ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                 <FileDown className="w-5 h-5" />
              )}
              {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
            </button>
        </div>
      </div>

      {/* Filters - Screen Only */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end print:hidden">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="date" 
              className="pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">End Date</label>
          <div className="relative">
             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="date" 
              className="pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">Filter by Client</label>
          <div className="relative">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              className="pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full bg-white appearance-none"
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
            >
              <option value="ALL">All Clients</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">Payment Method</label>
          <div className="relative">
             <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              className="pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full bg-white appearance-none"
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
            >
              <option value="ALL">All Methods</option>
              {methods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Printable Report Content */}
      <div id="printable-report" className="report-container bg-white rounded-xl shadow-sm border border-slate-200 print:border print:border-slate-300 print:overflow-visible print:shadow-none print:w-full font-sans">
        
        {/* Report Header */}
        <div className="p-8 border-b border-slate-200 bg-slate-50 print:bg-white print:border-b-2 print:border-black">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
               <div className="bg-white p-2 rounded-lg border border-slate-200 print:border-none print:p-0">
                  {logoBase64 ? (
                    <img 
                      src={logoBase64}
                      alt="Euro IT Logo" 
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    // Graceful Fallback Text Logo if image fails - Simplified for PDF compatibility
                    <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        border: '2px solid #cbd5e1', 
                        borderRadius: '4px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: '#ffffff'
                    }}>
                       <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', display: 'block' }}>EURO</span>
                       <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', display: 'block' }}>IT</span>
                    </div>
                  )}
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-black uppercase tracking-tight" style={{ color: '#000000' }}>Euro IT Accounts</h2>
                  <p className="text-sm text-black" style={{ color: '#000000' }}>Financial Statement</p>
                  <p className="text-xs text-slate-600 mt-1" style={{ color: '#475569' }}>{methodFilter !== 'ALL' ? `Filtered by: ${methodFilter}` : 'Consolidated Report'}</p>
               </div>
            </div>
            
            {/* STATEMENT PERIOD BOX - PDF SAFE */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  padding: '10px 16px',
                  textAlign: 'center',
                  minWidth: '200px'
              }}>
                <div style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#000000',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    fontFamily: 'Arial, sans-serif'
                }}>
                    STATEMENT PERIOD
                </div>
                <div style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#000000',
                    fontFamily: 'Arial, sans-serif'
                }}>
                  {startDate} <span style={{ margin: '0 4px', fontWeight: 'normal' }}>to</span> {endDate}
                </div>
              </div>
            </div>

          </div>

          {reportData.clientContext && (
             <div className="mt-6 p-4 bg-white border border-slate-200 rounded-lg print:border-black print:mt-4 shadow-sm print:shadow-none">
                <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-2 print:border-slate-300">
                    <h3 className="font-bold text-lg text-black" style={{ color: '#000000' }}>{reportData.clientContext.name}</h3>
                    <span className="text-sm text-slate-600">{reportData.clientContext.company}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                   <div>
                      <p className="text-slate-500 text-xs uppercase">Project Value</p>
                      <p className="font-bold text-black">৳{reportData.clientContext.totalBilled.toLocaleString()}</p>
                   </div>
                   <div>
                      <p className="text-slate-500 text-xs uppercase">Total Paid (All Time)</p>
                      <p className="font-bold text-green-700">৳{reportData.clientContext.totalPaidAllTime.toLocaleString()}</p>
                   </div>
                   <div>
                      <p className="text-slate-500 text-xs uppercase">Current Due</p>
                      <p className="font-bold text-red-600">৳{reportData.clientContext.currentDue.toLocaleString()}</p>
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x border-b border-slate-200 print:grid-cols-4 print:border-b-2 print:border-black">
           <div className="p-6 text-center md:text-left print:p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-1">
                {methodFilter !== 'ALL' ? `Received (${methodFilter})` : 'Total Income'}
              </p>
              <p className="text-2xl font-bold text-green-600">৳{reportData.totalReceived.toLocaleString()}</p>
           </div>
           <div className="p-6 text-center md:text-left print:p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-1">Refunds</p>
              <p className="text-2xl font-bold text-red-500">৳{reportData.totalRefunded.toLocaleString()}</p>
           </div>
           {selectedClientId === 'ALL' && methodFilter === 'ALL' && (
             <div className="p-6 text-center md:text-left print:p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-1">Expenses</p>
                <p className="text-2xl font-bold text-orange-600">৳{reportData.totalExpenses.toLocaleString()}</p>
             </div>
           )}
           <div className="p-6 text-center md:text-left print:p-4 bg-slate-50 print:bg-white">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-1">
                {methodFilter !== 'ALL' ? `Net Balance` : 'Net Profit'}
              </p>
              <p className={`text-2xl font-bold ${reportData.netProfit >= 0 ? 'text-black' : 'text-red-600'}`} style={{ color: reportData.netProfit >= 0 ? '#000000' : '#dc2626' }}>
                ৳{reportData.netProfit.toLocaleString()}
              </p>
           </div>
        </div>

        {/* Method Breakdown (Shown only when viewing ALL methods) */}
        {methodFilter === 'ALL' && Object.keys(reportData.methodBreakdown).length > 0 && (
          <div className="p-6 bg-slate-50/50 border-b border-slate-200 print:bg-white print:border-b-2 print:border-black print:p-4">
             <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">Balance by Payment Method</h3>
             <div className="flex flex-wrap gap-4 print:gap-2">
                {Object.entries(reportData.methodBreakdown).map(([method, amount]) => (
                   <div key={method} className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm print:border-black print:shadow-none print:px-3 print:py-1">
                      <span className="text-xs text-slate-500 block mb-0.5 print:text-black">{method}</span>
                      <span className="font-bold text-black" style={{ color: '#000000' }}>৳{amount.toLocaleString()}</span>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* Transaction Table */}
        <div className="p-6 print:p-4">
          <h3 className="text-lg font-bold text-slate-900 mb-4 px-2 print:mb-2 print:px-0" style={{ color: '#000000' }}>Detailed Transactions</h3>
          <table className="w-full text-left text-sm print:text-xs border-collapse">
             <thead>
               <tr className="border-b-2 border-slate-200 text-slate-500 print:text-black print:border-black">
                 <th className="p-3 font-bold w-28 print:p-2" style={{ color: '#000000' }}>Date</th>
                 <th className="p-3 font-bold print:p-2" style={{ color: '#000000' }}>Description / Client</th>
                 <th className="p-3 font-bold print:p-2" style={{ color: '#000000' }}>Type</th>
                 <th className="p-3 font-bold print:p-2" style={{ color: '#000000' }}>Method</th>
                 <th className="p-3 font-bold text-right print:p-2" style={{ color: '#000000' }}>Debit (Exp)</th>
                 <th className="p-3 font-bold text-right print:p-2" style={{ color: '#000000' }}>Credit (Inc)</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 print:divide-slate-300">
               {/* Payments */}
               {reportData.payments.map((p, idx) => (
                 <tr key={p.id} className={`break-inside-avoid ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50 print:bg-gray-50'}`}>
                   <td className="p-3 text-slate-600 print:text-black print:p-2">{p.date}</td>
                   <td className="p-3 print:p-2">
                     <div className="font-bold text-black" style={{ color: '#000000' }}>{getClientName(p.clientId)}</div>
                     {p.description && <div className="text-xs text-slate-500 print:text-slate-700">{p.description}</div>}
                   </td>
                   <td className="p-3 print:p-2">
                     <span className={`text-xs px-2 py-0.5 rounded border ${p.type === 'REFUND' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'} print:border-none print:px-0 print:bg-transparent print:text-black print:font-semibold`}>
                       {p.type === 'REFUND' ? 'REFUND' : 'PAYMENT'}
                     </span>
                   </td>
                   <td className="p-3 text-slate-500 print:text-black print:p-2">{p.method}</td>
                   <td className="p-3 text-right font-medium text-slate-400 print:text-black print:p-2">
                     {p.type === 'REFUND' ? `৳${p.amount.toLocaleString()}` : '-'}
                   </td>
                   <td className="p-3 text-right font-bold text-black print:p-2" style={{ color: '#000000' }}>
                     {p.type !== 'REFUND' ? `৳${p.amount.toLocaleString()}` : '-'}
                   </td>
                 </tr>
               ))}

               {/* Expenses */}
               {selectedClientId === 'ALL' && methodFilter === 'ALL' && reportData.expenses.map(e => (
                 <tr key={e.id} className="bg-orange-50/30 break-inside-avoid print:bg-white border-l-4 border-l-orange-200 print:border-l-0">
                   <td className="p-3 text-slate-600 print:text-black print:p-2">{e.date}</td>
                   <td className="p-3 print:p-2">
                     <div className="font-medium text-black" style={{ color: '#000000' }}>{e.description}</div>
                     <div className="text-xs text-slate-500 print:text-slate-700">Category: {e.category}</div>
                   </td>
                   <td className="p-3 print:p-2"><span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700 print:bg-transparent print:text-black print:px-0 print:font-semibold">EXPENSE</span></td>
                   <td className="p-3 text-slate-500 print:text-black print:p-2">-</td>
                   <td className="p-3 text-right font-medium text-orange-600 print:text-black print:p-2">৳{e.amount.toLocaleString()}</td>
                   <td className="p-3 text-right text-slate-400 print:text-black print:p-2">-</td>
                 </tr>
               ))}

               {reportData.payments.length === 0 && reportData.expenses.length === 0 && (
                 <tr>
                   <td colSpan={6} className="p-8 text-center text-slate-400 border border-slate-200 border-dashed rounded mt-4">
                     No transactions found for this period.
                   </td>
                 </tr>
               )}
             </tbody>
             <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-bold print:bg-white print:border-t-2 print:border-black">
               <tr>
                 <td colSpan={4} className="p-3 text-right print:p-2" style={{ color: '#000000' }}>TOTAL</td>
                 <td className="p-3 text-right text-red-600 print:text-black print:p-2">৳{(reportData.totalRefunded + (methodFilter === 'ALL' ? reportData.totalExpenses : 0)).toLocaleString()}</td>
                 <td className="p-3 text-right text-green-600 print:text-black print:p-2">৳{reportData.totalReceived.toLocaleString()}</td>
               </tr>
             </tfoot>
          </table>
        </div>

        {/* Signature Line for Print */}
        <div className="hidden print:flex mt-16 px-8 pb-8 justify-between items-end">
          <div className="text-center">
             <div className="w-48 border-t border-black mb-2"></div>
             <p className="text-xs font-medium" style={{ color: '#000000' }}>Prepared By</p>
          </div>
          <div className="text-center">
             <div className="w-48 border-t border-black mb-2"></div>
             <p className="text-xs font-medium" style={{ color: '#000000' }}>Authorized Signature</p>
          </div>
        </div>

        {/* Footer for Print */}
        <div className="hidden print:block mt-4 pt-4 border-t border-slate-300 px-6 pb-6">
          <div className="flex justify-between text-[10px] text-slate-500">
             <p>Generated by Euro IT Accounts System</p>
             <p>Printed on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
