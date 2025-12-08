
import React from 'react';
import { LayoutDashboard, Users, Receipt, PieChart, LogOut, Settings, CreditCard, FileBarChart } from 'lucide-react';
import { ViewState, User, UserRole } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  user: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isMobileOpen, setIsMobileOpen, user, onLogout }) => {
  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.CLIENTS, label: 'Clients', icon: Users },
    { id: ViewState.PAYMENTS, label: 'Payments', icon: CreditCard },
    { id: ViewState.EXPENSES, label: 'Expenses', icon: Receipt },
    { id: ViewState.REPORTS, label: 'Reports', icon: FileBarChart },
  ];

  if (user.role === UserRole.ADMIN) {
    navItems.push({ id: ViewState.SETTINGS, label: 'Settings', icon: Settings });
  }

  const handleNavClick = (view: ViewState) => {
    setView(view);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden print:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out print:hidden
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 p-6 border-b border-slate-800">
            <div className="bg-white p-1 rounded-lg">
                <img 
                  src="https://i.postimg.cc/59gXKDM0/Euro-IT-gold-Copy-1-06.png" 
                  alt="Euro IT Logo" 
                  className="w-8 h-8 object-contain" 
                />
            </div>
            <span className="text-xl font-bold tracking-tight">Euro IT Accounts</span>
          </div>

          <nav className="flex-1 mt-6 px-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors text-sm font-medium
                  ${currentView === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
