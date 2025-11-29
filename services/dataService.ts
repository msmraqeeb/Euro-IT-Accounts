
import { getSupabaseClient } from '../lib/supabaseClient';
import { AppData, Client, Expense, Payment } from '../types';

const STORAGE_KEY = 'biztrack_data_v1';

const DEFAULT_DATA: AppData = {
  clients: [],
  payments: [],
  expenses: []
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

        // Normalize clients to have isActive defaults if missing (backward compatibility)
        const normalizedClients = (clients.data || []).map((c: any) => ({
             ...c,
             isActive: c.isActive !== false // Default to true if null/undefined
        }));

        return {
          clients: normalizedClients,
          payments: payments.data || [],
          expenses: expenses.data || []
        };
      } catch (error: any) {
        console.error("Supabase fetch error:", error);
        alert(`Connection Warning: Could not fetch data from cloud. \n\nError: ${error.message || 'Unknown error'}\n\nTip: Check if Row Level Security (RLS) is disabled in your Supabase Table settings.`);
        // Fallback to local data but normalized
        const local = getLocalData();
        local.clients = local.clients.map(c => ({...c, isActive: c.isActive !== false}));
        return local;
      }
    }
    
    const local = getLocalData();
    // Normalize existing local data
    local.clients = local.clients.map(c => ({...c, isActive: c.isActive !== false}));
    return local;
  },

  async addClient(client: Client): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from('clients').insert([client]);
      if (error) {
        console.error("Supabase write error", error);
        throw new Error(`Failed to save client: ${error.message} (Check RLS Policies)`);
      }
    } else {
      const data = getLocalData();
      data.clients.push(client);
      saveLocalData(data);
    }
  },

  async updateClient(client: Client): Promise<void> {
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
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from('payments').insert([payment]);
      if (error) throw new Error(`Failed to save payment: ${error.message} (Check RLS Policies)`);
    } else {
      const data = getLocalData();
      data.payments.push(payment);
      saveLocalData(data);
    }
  },

  async updatePayment(payment: Payment): Promise<void> {
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
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from('expenses').insert([expense]);
      if (error) throw new Error(`Failed to save expense: ${error.message} (Check RLS Policies)`);
    } else {
      const data = getLocalData();
      data.expenses.push(expense);
      saveLocalData(data);
    }
  },

  async deleteExpense(id: string): Promise<void> {
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
    const supabase = getSupabaseClient();
    if (supabase) {
      if (newData.clients.length) {
        const { error } = await supabase.from('clients').upsert(newData.clients);
        if (error) throw error;
      }
      if (newData.payments.length) {
        const { error } = await supabase.from('payments').upsert(newData.payments);
        if (error) throw error;
      }
      if (newData.expenses.length) {
        const { error } = await supabase.from('expenses').upsert(newData.expenses);
        if (error) throw error;
      }
    } else {
      saveLocalData(newData);
    }
  },

  async clearData(): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      // Hack to delete all by condition that is always true if ID is not null
      const { error: e1 } = await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const { error: e2 } = await supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const { error: e3 } = await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (e1 || e2 || e3) throw new Error("Failed to clear some cloud data. Check RLS.");
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
};
