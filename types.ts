
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CLIENTS = 'CLIENTS',
  PAYMENTS = 'PAYMENTS',
  EXPENSES = 'EXPENSES',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER'
}

export interface User {
  email: string;
  name: string;
  role: UserRole;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
  createdAt: number;
  isActive?: boolean;
  totalBilled?: number; // Total Project Value
}

export interface Payment {
  id: string;
  clientId: string;
  amount: number;
  date: string; // ISO Date string YYYY-MM-DD
  description?: string;
  method?: string;
  details?: string;
  type?: 'RECEIVED' | 'REFUND'; // Transaction type
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string; // ISO Date string YYYY-MM-DD
  description: string;
}

export interface AppData {
  clients: Client[];
  payments: Payment[];
  expenses: Expense[];
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  recentTransactions: Array<Payment | Expense>;
}