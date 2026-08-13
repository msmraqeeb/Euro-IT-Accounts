import { AppData, Client, Expense, Payment } from '../types';

const STORAGE_KEY = 'biztrack_data_v1';
const CPANEL_API_KEY = 'biztrack_cpanel_api_url';

// Clear legacy Supabase storage keys if present to prevent unwanted Supabase connections
if (typeof window !== 'undefined') {
  localStorage.removeItem('biztrack_sb_url');
  localStorage.removeItem('biztrack_sb_key');
}

const DEFAULT_DATA: AppData = {
  clients: [],
  payments: [],
  expenses: []
};

// Helper to get cPanel API URL from env or localStorage
export const getCpanelApiUrl = (): string | null => {
  const envUrl = import.meta.env.VITE_API_URL;
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
  return stored ? JSON.parse(stored) : DEFAULT_DATA;
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
          return {
            clients: normalizedClients,
            payments: json.data.payments || [],
            expenses: json.data.expenses || []
          };
        }
        throw new Error(json.message || "Failed to fetch from cPanel API");
      } catch (error: any) {
        console.error("cPanel API fetch error:", error);
        alert(`cPanel Connection Warning: Could not fetch data.\n\nError: ${error.message || 'Unknown error'}`);
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

  async importData(newData: AppData): Promise<void> {
    const apiUrl = getCpanelApiUrl();
    if (apiUrl) {
      for (const client of newData.clients) await this.addClient(client);
      for (const payment of newData.payments) await this.addPayment(payment);
      for (const expense of newData.expenses) await this.addExpense(expense);
      return;
    }

    saveLocalData(newData);
  },

  async clearData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }
};
