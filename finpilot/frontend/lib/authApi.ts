// Auth utilities — token storage + typed API calls for auth, expenses, chat.
// Uses the same /api proxy rewrite as lib/api.ts (next.config.js).

const BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('fp_token') : null;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {})
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `Request failed with ${res.status}`);
  }
  return res.json();
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  note: string;
}

export interface ExpenseListResponse {
  expenses: Expense[];
  total: number;
  byCategory: Record<string, number>;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface FinancialContextForChat {
  income: number;
  expenses: number;
  savings: number;
  debt: number;
  score?: number;
}

// ── Auth ───────────────────────────────────────────────────────────────────

export const authApi = {
  register: async (name: string, email: string, password: string) => {
    const data = await request<{ token: string; user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    localStorage.setItem('fp_token', data.token);
    localStorage.setItem('fp_user', JSON.stringify(data.user));
    return data;
  },

  login: async (email: string, password: string) => {
    const data = await request<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('fp_token', data.token);
    localStorage.setItem('fp_user', JSON.stringify(data.user));
    return data;
  },

  logout: () => {
    localStorage.removeItem('fp_token');
    localStorage.removeItem('fp_user');
  },
  
  getToken: (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fp_token');
  }, 

  getStoredUser: (): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('fp_user');
    return raw ? JSON.parse(raw) : null;
  },

  isLoggedIn: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('fp_token');
  }
};

// ── Expenses ───────────────────────────────────────────────────────────────

export const expenseApi = {
  getAll: (params?: { month?: number; year?: number; category?: string }) => {
    const qs = new URLSearchParams();
    if (params?.month) qs.set('month', String(params.month));
    if (params?.year) qs.set('year', String(params.year));
    if (params?.category && params.category !== 'all') qs.set('category', params.category);
    const query = qs.toString() ? `?${qs}` : '';
    return request<ExpenseListResponse>(`/expenses${query}`);
  },

  create: (data: { title: string; amount: number; category: string; date?: string; note?: string }) =>
    request<{ expense: Expense }>('/expenses', { method: 'POST', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request<{ message: string }>(`/expenses/${id}`, { method: 'DELETE' })
};

// ── Chat ───────────────────────────────────────────────────────────────────

export const chatApi = {
  send: (messages: ChatMessage[], financialContext?: FinancialContextForChat) =>
    request<{ reply: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, financialContext })
    })
};
