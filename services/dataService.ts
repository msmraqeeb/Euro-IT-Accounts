import { getSupabaseClient } from '../lib/supabaseClient';
import { AppData, Client, Expense, Payment } from '../types';

const STORAGE_KEY = 'biztrack_data_v1';
const CPANEL_API_KEY = 'biztrack_cpanel_api_url';

const DEFAULT_DATA: AppData = {
  clients: [],
  payments: [],
  expenses: []
};

// Helper to get cPanel API URL from env or localStorage
export const getCpanelApiUrl = (): string | null => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl as string;
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

    // 1. Try cPanel API first if configured
    if (apiUrl) {
      try {
        const res = await fetch(`${apiUrl}?action=fetchData`);
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
        alert(`Connection Warning: Could not fetch data from cPanel Database. \n\nError: ${error.message || 'Unknown error'}`);
      }
    }

    // 2. Fallback to Supabase if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const [clients, payments, expenses] = await Promise.all([
          supabase.from('clients').select('*'),
          supabase.from('payments').select('*'),
          supabase.from('expenses').select('*')
        ]);

        if (clients.error) throw clients.error;
        if (payments.error) throw payments.error;
        if (expenses.error) throw expenses.error;

        const normalizedClients = (clients.data || []).map((c: any) => ({
          ...c,
          isActive: c.isActive !== false
        }));

        return {
          clients: normalizedClients,
          payments: payments.data || [],
          expenses: expenses.data || []
        };
      } catch (error: any) {
        console.error("Supabase fetch error:", error);
      }
    }

    // 3. LocalStorage fallback
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

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from('clients').insert([client]);
      if (error) throw new Error(`Failed to save client: ${error.message}`);
    } else {
      const data = getLocalData();
      data.clients.push(client);
      saveLocalData(data);
    }
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

    const supabase = getSupabaseClient();
    if (supabase) {
      const { id, ...updates } = client;
      const { error } = await supabase.from('clients').update(updates).eq('id', id);
      if (error) throw new Error(`Failed to update client: ${error.message}`);
    } else {
      const data = getLocalData();
      data.clients = data.clients.map(c => c.id === client.id ? client : c);
      saveLocalData(data);
    }
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

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from('payments').insert([payment]);
      if (error) throw new Error(`Failed to save payment: ${error.message}`);
    } else {
      const data = getLocalData();
      data.payments.push(payment);
      saveLocalData(data);
    }
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

    const supabase = getSupabaseClient();
    if (supabase) {
      const { id, ...updates } = payment;
      const { error } = await supabase.from('payments').update(updates).eq('id', id);
      if (error) throw new Error(`Failed to update payment: ${error.message}`);
    } else {
      const data = getLocalData();
      data.payments = data.payments.map(p => p.id === payment.id ? payment : p);
      saveLocalData(data);
    }
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

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from('payments').delete().eq('id', id);
      if (error) throw new Error(`Failed to delete payment: ${error.message}`);
    } else {
      const data = getLocalData();
      data.payments = data.payments.filter(p => p.id !== id);
      saveLocalData(data);
    }
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

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from('expenses').insert([expense]);
      if (error) throw new Error(`Failed to save expense: ${error.message}`);
    } else {
      const data = getLocalData();
      data.expenses.push(expense);
      saveLocalData(data);
    }
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

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw new Error(`Failed to delete expense: ${error.message}`);
    } else {
      const data = getLocalData();
      data.expenses = data.expenses.filter(e => e.id !== id);
      saveLocalData(data);
    }
  },

  async importData(newData: AppData): Promise<void> {
    const apiUrl = getCpanelApiUrl();
    if (apiUrl) {
      for (const client of newData.clients) await this.addClient(client);
      for (const payment of newData.payments) await this.addPayment(payment);
      for (const expense of newData.expenses) await this.addExpense(expense);
      return;
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      if (newData.clients.length) await supabase.from('clients').upsert(newData.clients);
      if (newData.payments.length) await supabase.from('payments').upsert(newData.payments);
      if (newData.expenses.length) await supabase.from('expenses').upsert(newData.expenses);
    } else {
      saveLocalData(newData);
    }
  },

  async clearData(): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
};
