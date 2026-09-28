// Lightweight API client for the FinPilot backend.

const API_BASE_URL = "/api";

async function postJSON<T>(path: string, body: object): Promise<T> {
  const cleanPath = path.startsWith('/api') ? path.slice(4) : path;
  const url = `${API_BASE_URL}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `Request to ${path} failed with ${res.status}`);
  }

  return res.json();
}

export interface FinancialInputs {
  income: number;
  expenses: number;
  savings: number;
  debt: number;
}

export interface ScoreResponse {
  score: number;
  label: string;
  tone: 'success' | 'warning' | 'danger';
  breakdown: {
    savingsRateScore: number;
    expenseRatioScore: number;
    debtScore: number;
    cushionScore: number;
  };
  metrics: {
    savingsRate: number;
    expenseRatio: number;
    debtToIncome: number;
    monthsOfCushion: number;
  };
  topInsights: Insight[];
}

export interface FutureCostResponse {
  series: { year: number; label: string; value: number }[];
  summary: {
    presentCost: number;
    futureCost: number;
    totalIncrease: number;
    increasePercent: number;
    inflationRate: number;
    years: number;
  };
}

export interface InvestmentResponse {
  inputs: { goalAmount: number; years: number; expectedReturn: number };
  plan: {
    dailyInvestment: number;
    monthlyInvestment: number;
    monthlyRoundOffSavings: number;
    yearlyRoundOffSavings: number;
    totalMonthlyContribution: number;
    months: number;
  };
  growthSeries: { month: number; corpus: number }[];
}

export interface Insight {
  type: 'alert' | 'warning' | 'risk' | 'positive';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
}

// Existing Calculations & Public Tool API Endpoints
export const api = {
  getScore: (inputs: FinancialInputs) => postJSON<ScoreResponse>('/score', inputs),

  getFutureCost: (params: { cost: number; years: number; inflation: number }) =>
    postJSON<FutureCostResponse>('/future-cost', params),

  getInvestmentPlan: (params: {
    goalAmount: number;
    years: number;
    expectedReturn: number;
    monthlyExpenseTransactions?: number;
    avgRoundOff?: number;
  }) => postJSON<InvestmentResponse>('/investment', params),

  getInsights: (inputs: FinancialInputs) => postJSON<{ insights: Insight[] }>('/insights', inputs)
};

// Private Auth & Token Management API
export const authApi = {
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fp_token');
    }
    return null;
  },

  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fp_token', token);
    }
  },

  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fp_token');
    }
  },

  isAuthenticated: (): boolean => {
    return !!authApi.getToken();
  },

  login: async (credentials: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  register: async (userData: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  getProfile: async () => {
    const token = authApi.getToken();
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  }
};