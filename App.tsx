import React, { useState, useEffect } from 'react';
import { ViewState, AppData, Client, Payment, Expense, User, UserRole } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Clients } from './components/Clients';
import { Expenses } from './components/Expenses';
import { Payments } from './components/Payments';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { Menu } from 'lucide-react';
import { dataService } from './services/dataService';

const AUTH_KEY = 'biztrack_auth_v1';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [data, setData] = useState<AppData>({ clients: [], payments: [], expenses: [] });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasConnectionError, setHasConnectionError] = useState(false);

  const loadData = async () => {
    try {
        setHasConnectionError(false);
        const fetchedData = await dataService.fetchData();
        setData(fetchedData);
    } catch (e) {
        setHasConnectionError(true);
        console.error("Critical Data Load Error:", e);
    }
  };

  // Initial Load
  useEffect(() => {
    const initApp = async () => {
      // Load User
      const storedUser = localStorage.getItem(AUTH_KEY);
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch(e) {
          console.error("Failed to parse stored user", e);
        }
      }

      // Load Data
      await loadData();
      setIsInitialized(true);
    };

    initApp();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    // Reload data on login to ensure freshness
    loadData();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_KEY);
    setCurrentView(ViewState.DASHBOARD);
  };

  const addClient = async (client: Client) => {
    const prevData = { ...data };
    // Optimistic Update
    setData(prev => ({ ...prev, clients: [...prev.clients, client] }));
    
    try {
      await dataService.addClient(client);
    } catch (error: any) {
      alert(error.message);
      setData(prevData); // Rollback
    }
  };

  const updateClient = async (updatedClient: Client) => {
    const prevData = { ...data };
    setData(prev => ({
      ...prev,
      clients: prev.clients.map(c => c.id === updatedClient.id ? updatedClient : c)
    }));

    try {
      await dataService.updateClient(updatedClient);
    } catch (error: any) {
      alert(error.message);
      setData(prevData); // Rollback
    }
  };

  const addPayment = async (payment: Payment) => {
    const prevData = { ...data };
    setData(prev => ({ ...prev, payments: [...prev.payments, payment] }));
    
    try {
      await dataService.addPayment(payment);
    } catch (error: any) {
      alert(error.message);
      setData(prevData); // Rollback
    }
  };

  const updatePayment = async (payment: Payment) => {
    const prevData = { ...data };
    setData(prev => ({
      ...prev,
      payments: prev.payments.map(p => p.id === payment.id ? payment : p)
    }));

    try {
      await dataService.updatePayment(payment);
    } catch (error: any) {
      alert(error.message);
      setData(prevData); // Rollback
    }
  };

  const deletePayment = async (id: string) => {
    const prevData = { ...data };
    setData(prev => ({ ...prev, payments: prev.payments.filter(p => p.id !== id) }));

    try {
      await dataService.deletePayment(id);
    } catch (error: any) {
      alert(error.message);
      setData(prevData); // Rollback
    }
  };

  const addExpense = async (expense: Expense) => {
    const prevData = { ...data };
    setData(prev => ({ ...prev, expenses: [...prev.expenses, expense] }));
    
    try {
      await dataService.addExpense(expense);
    } catch (error: any) {
      alert(error.message);
      setData(prevData); // Rollback
    }
  };

  const deleteExpense = async (id: string) => {
    const prevData = { ...data };
    setData(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
    
    try {
      await dataService.deleteExpense(id);
    } catch (error: any) {
      alert(error.message);
      setData(prevData); // Rollback
    }
  };

  const importData = async (newData: AppData) => {
    try {
      await dataService.importData(newData);
      await loadData();
    } catch (error: any) {
      alert("Import failed: " + error.message);
    }
  };

  const clearData = async () => {
    try {
      await dataService.clearData();
      setData({ clients: [], payments: [], expenses: [] });
    } catch (error: any) {
      alert("Clear failed: " + error.message);
    }
  };

  const renderContent = () => {
    if (!currentUser) return null;

    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard data={data} />;
      case ViewState.CLIENTS:
        return (
          <Clients 
            data={data} 
            onAddClient={addClient} 
            onUpdateClient={updateClient}
            onAddPayment={addPayment}
            userRole={currentUser.role}
          />
        );
      case ViewState.PAYMENTS:
        return (
          <Payments
            data={data}
            onAddPayment={addPayment}
            onUpdatePayment={updatePayment}
            onDeletePayment={deletePayment}
            userRole={currentUser.role}
          />
        );
      case ViewState.EXPENSES:
        return (
          <Expenses 
            data={data} 
            onAddExpense={addExpense}
            onDeleteExpense={deleteExpense}
            userRole={currentUser.role}
          />
        );
      case ViewState.REPORTS:
        return (
          <Reports data={data} userRole={currentUser.role} />
        );
      case ViewState.SETTINGS:
        // Protect Settings route
        if (currentUser.role !== UserRole.ADMIN) {
          return <Dashboard data={data} />;
        }
        return (
          <Settings 
            data={data}
            onImportData={importData}
            onClearData={clearData}
            userRole={currentUser.role}
            refreshData={loadData}
          />
        );
      default:
        return <Dashboard data={data} />;
    }
  };

  if (!isInitialized) return null;

  // Global Error Boundary for Connection Failure
  if (hasConnectionError) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
           <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Menu className="w-8 h-8 text-red-600" /> 
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">Cloud Connection Error</h1>
              <p className="text-slate-500 mb-6">
                 We couldn't connect to your Supabase database. This usually happens if the URL is wrong or the network is down.
              </p>
              <div className="flex flex-col gap-3">
                 <button 
                    onClick={() => loadData()}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                 >
                    Retry Connection
                 </button>
                 <button 
                    onClick={() => {
                        // Force navigate to settings via a temporary hack or just render settings
                        setHasConnectionError(false); // Clear error to allow rendering
                        setCurrentUser({ email: 'admin@email.com', name: 'Admin', role: UserRole.ADMIN }); // Force admin to access settings
                        setCurrentView(ViewState.SETTINGS);
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                 >
                    Check Settings
                 </button>
              </div>
           </div>
        </div>
     )
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div id="app-container" className="flex h-screen bg-slate-50 overflow-hidden print:!h-auto print:!overflow-visible print:!block">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        user={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative print:!h-auto print:!overflow-visible print:!block print:m-0 print:p-0">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10 print:hidden">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <img 
              src="https://euroitechnology.com/images/EuroIt.png" 
              alt="Euro IT Logo" 
              className="h-8 w-auto" 
            />
            <span className="font-bold text-slate-900">Euro IT Accounts</span>
          </div>
          <div className="w-8" /> {/* Spacer */}
        </div>

        <div id="main-scroll-container" className="flex-1 overflow-auto print:!overflow-visible print:!h-auto print:!block">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;