
import React, { useState, useMemo } from 'react';
import { AppData } from '../types';
import { generateFinancialInsight } from '../services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { TrendingUp, TrendingDown, Sparkles, Loader2, ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon, AlertCircle } from 'lucide-react';

interface DashboardProps {
  data: AppData;
}

const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#1E40AF'];

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const stats = useMemo(() => {
    // Calculate Income (Received - Refunds)
    const totalIncome = data.payments.reduce((sum, p) => {
      if (p.type === 'REFUND') return sum - p.amount;
      return sum + p.amount;
    }, 0);

    const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const margin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // Calculate Total Outstanding Due
    const totalDue = data.clients.reduce((sum, client) => {
      const clientPayments = data.payments.filter(p => p.clientId === client.id);
      const paid = clientPayments.reduce((acc, p) => {
        return p.type === 'REFUND' ? acc - p.amount : acc + p.amount;
      }, 0);
      const billed = client.totalBilled || 0;
      const due = billed - paid;
      return sum + (due > 0 ? due : 0);
    }, 0);

    return { totalIncome, totalExpenses, netProfit, margin, totalDue };
  }, [data]);

  const chartData = useMemo(() => {
    // Group by month (last 6 months)
    const months: Record<string, { name: string; income: number; expense: number }> = {};
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = {
        name: d.toLocaleString('default', { month: 'short' }),
        income: 0,
        expense: 0
      };
    }

    data.payments.forEach(p => {
      const key = p.date.substring(0, 7);
      if (months[key]) {
        if (p.type === 'REFUND') {
          months[key].income -= p.amount;
        } else {
          months[key].income += p.amount;
        }
      }
    });

    data.expenses.forEach(e => {
      const key = e.date.substring(0, 7);
      if (months[key]) months[key].expense += e.amount;
    });

    return Object.values(months);
  }, [data]);

  const expenseCategoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    data.expenses.forEach(e => {
      const cat = e.category as string;
      categories[cat] = (categories[cat] || 0) + e.amount;
    });
    return Object.keys(categories).map(name => ({ name, value: categories[name] }));
  }, [data]);

  const handleGenerateInsight = async () => {
    setLoadingInsight(true);
    const result = await generateFinancialInsight(data);
    setInsight(result);
    setLoadingInsight(false);
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-2">Financial overview and business metrics</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider">Total Revenue</h3>
            <div className="p-2 bg-green-50 rounded-full">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">৳{stats.totalIncome.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider">Total Expenses</h3>
            <div className="p-2 bg-red-50 rounded-full">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">৳{stats.totalExpenses.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider">Net Profit</h3>
            <div className="p-2 bg-blue-50 rounded-full w-9 h-9 flex items-center justify-center">
              <span className="text-xl font-bold text-blue-600 leading-none">৳</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-900">৳{stats.netProfit.toLocaleString()}</p>
            {stats.netProfit > 0 ? (
                <span className="text-sm font-medium text-green-600 flex items-center">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    Good
                </span>
            ) : (
                <span className="text-sm font-medium text-red-600 flex items-center">
                    <ArrowDownRight className="w-3 h-3 mr-1" />
                    Loss
                </span>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider">Total Outstanding</h3>
            <div className="p-2 bg-orange-50 rounded-full">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">৳{stats.totalDue.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Pending payments</p>
        </div>
      </div>

      {/* AI Insight Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              <h2 className="text-xl font-bold">AI Financial Advisor</h2>
            </div>
            {!insight && !loadingInsight && (
              <button 
                onClick={handleGenerateInsight}
                className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                Analyze Finances
              </button>
            )}
          </div>
          
          {loadingInsight ? (
            <div className="flex items-center gap-3 py-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-200" />
              <p className="text-blue-100">Analyzing your transaction data...</p>
            </div>
          ) : insight ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-blue-50 leading-relaxed">{insight}</p>
              <button 
                onClick={() => setInsight(null)}
                className="mt-3 text-xs text-blue-200 hover:text-white underline"
              >
                Clear Insight
              </button>
            </div>
          ) : (
            <p className="text-blue-100 max-w-2xl">
              Get intelligent insights about your business finances using Gemini AI. 
              Identify spending patterns and find opportunities to increase your profit margin.
            </p>
          )}
        </div>
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-400 opacity-20 rounded-full blur-3xl"></div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Income vs Expenses (6 Months)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="income" name="Income" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expense" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Expense Distribution</h3>
          <div className="h-80 w-full flex items-center justify-center">
             {expenseCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
             ) : (
                <div className="text-center text-slate-400">
                  <PieChartIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No expenses recorded yet</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
