export type Role = 'ADMIN' | 'ANALYST' | 'VIEWER';
export type RecordType = 'INCOME' | 'EXPENSE';

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE';
  slug: string;
};

export type AuthData = {
  token: string;
  user: User;
};

export type RecordItem = {
  id: string;
  amount: string;
  type: RecordType;
  category: string;
  date: string;
  notes?: string | null;
  slug: string;
  createdBy: string;
};

export type RecordResult = {
  items: RecordItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type Summary = {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  recordCount: number;
};

export type CategoryBreakdown = {
  category: string;
  totalAmount: number;
  count: number;
};

export type Trend = {
  month: number;
  income: number;
  expenses: number;
};

export type RecentItem = {
  id: string;
  amount: string;
  type: RecordType;
  category: string;
  date: string;
  notes: string | null;
  userName: string;
};

export type UsersResult = {
  items: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
