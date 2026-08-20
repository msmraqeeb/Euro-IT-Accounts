import { AppData, Client, Expense, Payment, AppUser, UserRole } from '../types';

const STORAGE_KEY = 'biztrack_data_v1';
const CPANEL_API_KEY = 'biztrack_cpanel_api_url';

// Clear legacy Supabase storage keys if present to prevent unwanted Supabase connections
if (typeof window !== 'undefined') {
  localStorage.removeItem('biztrack_sb_url');
  localStorage.removeItem('biztrack_sb_key');
}

export const DEFAULT_USERS: AppUser[] = [
  {
    id: 'user_msmraqeeb',
    name: 'Shakil Mahmud',
    email: 'msmraqeeb@gmail.com',
    password: 'msm039raqeeb',
    role: UserRole.ADMIN,
    createdAt: 1771449600000
  },
  {
    id: 'user_admin',
    name: 'Admin User',
    email: 'admin@email.com',
    password: '123456',
    role: UserRole.ADMIN,
    createdAt: 1764000000000
  },
  {
    id: 'user_euroit',
    name: 'Euro IT Admin',
    email: 'euroitofficial@gmail.com',
    password: '3uroIT2026',
    role: UserRole.ADMIN,
    createdAt: 1764000000000
  },
  {
    id: 'user_viewer',
    name: 'Viewer User',
    email: 'viewer@email.com',
    password: '123456',
    role: UserRole.VIEWER,
    createdAt: 1764000000000
  }
];

const DEFAULT_DATA: AppData = {
  clients: [],
  payments: [],
  expenses: [],
  users: DEFAULT_USERS
};

// Helper to get cPanel API URL from env or localStorage
export const getCpanelApiUrl = (): string | null => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '' && !envUrl.includes('your-domain.com')) {
    return envUrl.trim();
  }
  return localStorage.getItem(CPANEL_API_KEY);
};


export const saveCpanelApiUrl = (url: string) => {
  localStorage.setItem(CPANEL_API_KEY, url);
};

export const clearCpanelApiUrl = () => {
  localStorage.removeItem(CPANEL_API_KEY);
};

// Helper to get local data
const getLocalData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return { ...DEFAULT_DATA, users: [...DEFAULT_USERS] };
  try {
    const parsed = JSON.parse(stored);
    if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
      parsed.users = [...DEFAULT_USERS];
    } else {
      // Ensure super admins are always preserved
      for (const defUser of DEFAULT_USERS) {
        if (!parsed.users.some((u: AppUser) => u.email.toLowerCase() === defUser.email.toLowerCase())) {
          parsed.users.push(defUser);
        }
      }
    }
    return parsed;
  } catch {
    return { ...DEFAULT_DATA, users: [...DEFAULT_USERS] };
  }
};

// Helper to save local data
const saveLocalData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const dataService = {
  async fetchData(): Promise<AppData> {
    const apiUrl = getCpanelApiUrl();

    if (apiUrl) {
      try {
        const res = await fetch(`${apiUrl}?action=fetchData`, { cache: 'no-store' });
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          const normalizedClients = (json.data.clients || []).map((c: any) => ({
            ...c,
            isActive: c.isActive !== false
          }));

          let users: AppUser[] = json.data.users || [];
          if (!users || users.length === 0) {
            users = [...DEFAULT_USERS];
          } else {
            // Ensure super admins exist
            for (const defUser of DEFAULT_USERS) {
              if (!users.some(u => u.email.toLowerCase() === defUser.email.toLowerCase())) {
                users.push(defUser);
              }
            }
          }

          return {
            clients: normalizedClients,
            payments: json.data.payments || [],
            expenses: json.data.expenses || [],
            users
          };
        }
        throw new Error(json.message || "Failed to fetch from cPanel API");
      } catch (error: any) {
        console.error("cPanel API fetch error:", error);
      }
    }

    // Fallback to local data
    const local = getLocalData();
    local.clients = local.clients.map(c => ({...c, isActive: c.isActive !== false}));
    return local;
  },

  async addClient(client: Client): Promise<void> {
    const apiUrl = getCpanelApiUrl();
    if (apiUrl) {
      const res = await fetch(`${apiUrl}?action=saveClient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
      });
      const json = await res.json();
      if (json.status !== 'success') throw new Error(json.message || 'Failed to save client to cPanel');
      return;
    }

    const data = getLocalData();
    data.clients.push(client);
    saveLocalData(data);
  },

  async updateClient(client: Client): Promise<void> {
    const apiUrl = getCpanelApiUrl();
    if (apiUrl) {
      const res = await fetch(`${apiUrl}?action=saveClient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
      });
      const json = await res.json();
      if (json.status !== 'success') throw new Error(json.message || 'Failed to update client');
      return;
    }

    const data = getLocalData();
    data.clients = data.clients.map(c => c.id === client.id ? client : c);
    saveLocalData(data);
  },

  async addPayment(payment: Payment): Promise<void> {
    const apiUrl = getCpanelApiUrl();
    if (apiUrl) {
      const res = await fetch(`${apiUrl}?action=savePayment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment)
      });
      const json = await res.json();
      if (json.status !== 'success') throw new Error(json.message || 'Failed to save payment');
      return;
    }

    const data = getLocalData();
    data.payments.push(payment);
    saveLocalData(data);
  },

  async updatePayment(payment: Payment): Promise<void> {
    const apiUrl = getCpanelApiUrl();
    if (apiUrl) {
      const res = await fetch(`${apiUrl}?action=savePayment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment)
      });
      const json = await res.json();
      if (json.status !== 'success') throw new Error(json.message || 'Failed to update payment');
      return;
    }

    const data = getLocalData();
    data.payments = data.payments.map(p => p.id === payment.id ? payment : p);
    saveLocalData(data);
  },

  async deletePayment(id: string): Promise<void> {
    const apiUrl = getCpanelApiUrl();
    if (apiUrl) {
      const res = await fetch(`${apiUrl}?action=deletePayment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const json = await res.json();
      if (json.status !== 'success') throw new Error(json.message || 'Failed to delete payment');
      return;
    }

    const data = getLocalData();
    data.payments = data.payments.filter(p => p.id !== id);
    saveLocalData(data);
  },

  async addExpense(expense: Expense): Promise<void> {
    const apiUrl = getCpanelApiUrl();
    if (apiUrl) {
      const res = await fetch(`${apiUrl}?action=saveExpense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      });
      const json = await res.json();
      if (json.status !== 'success') throw new Error(json.message || 'Failed to save expense');
      return;
    }

    const data = getLocalData();
    data.expenses.push(expense);
    saveLocalData(data);
  },

  async deleteExpense(id: string): Promise<void> {
    const apiUrl = getCpanelApiUrl();
    if (apiUrl) {
      const res = await fetch(`${apiUrl}?action=deleteExpense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const json = await res.json();
      if (json.status !== 'success') throw new Error(json.message || 'Failed to delete expense');
      return;
    }

    const data = getLocalData();
    data.expenses = data.expenses.filter(e => e.id !== id);
    saveLocalData(data);
  },

  async saveUser(user: AppUser): Promise<void> {
    const apiUrl = getCpanelApiUrl();
    if (apiUrl) {
      try {
        const res = await fetch(`${apiUrl}?action=saveUser`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
        const json = await res.json();
        if (json.status !== 'success') throw new Error(json.message || 'Failed to save user');
      } catch (err) {
        console.warn('API saveUser warning, saving locally:', err);
      }
    }

    const data = getLocalData();
    const existingIndex = (data.users || []).findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIndex >= 0) {
      data.users![existingIndex] = { ...data.users![existingIndex], ...user };
    } else {
      data.users = [...(data.users || []), user];
    }
    saveLocalData(data);
  },

  async deleteUser(id: string): Promise<void> {
    const apiUrl = getCpanelApiUrl();
    if (apiUrl) {
      try {
        const res = await fetch(`${apiUrl}?action=deleteUser`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        const json = await res.json();
        if (json.status !== 'success') throw new Error(json.message || 'Failed to delete user');
      } catch (err) {
        console.warn('API deleteUser warning, deleting locally:', err);
      }
    }

    const data = getLocalData();
    data.users = (data.users || []).filter(u => u.id !== id);
    saveLocalData(data);
  },

  async getUsers(): Promise<AppUser[]> {
    const data = await this.fetchData();
    return data.users && data.users.length > 0 ? data.users : DEFAULT_USERS;
  },

  async importData(newData: AppData): Promise<void> {
    const apiUrl = getCpanelApiUrl();
    if (apiUrl) {
      for (const client of newData.clients) await this.addClient(client);
      for (const payment of newData.payments) await this.addPayment(payment);
      for (const expense of newData.expenses) await this.addExpense(expense);
      if (newData.users) {
        for (const user of newData.users) await this.saveUser(user);
      }
      return;
    }

    saveLocalData(newData);
  },

  async clearData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }
};

