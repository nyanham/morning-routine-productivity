import type {
  MorningRoutine,
  ProductivityEntry,
  PaginatedResponse,
  AnalyticsSummary,
  ChartDataPoint,
  CSVImportResult,
  CurrentUser,
  UserProfile,
  UserSettings,
  UserGoal,
  UserProfileUpdate,
  UserSettingsUpdate,
  UserGoalCreate,
  UserGoalUpdate,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
}

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, token } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(response.status, error.detail || 'API request failed');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Helper for building query params
function buildQueryParams(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// API endpoints
export const api = {
  // ==========================================
  // USER ENDPOINTS
  // ==========================================
  users: {
    me: (token: string) => apiClient<CurrentUser>('/api/users/me', { token }),

    getProfile: (token: string) => apiClient<UserProfile>('/api/users/me/profile', { token }),

    updateProfile: (token: string, data: UserProfileUpdate) =>
      apiClient<UserProfile>('/api/users/me/profile', {
        method: 'PATCH',
        body: data,
        token,
      }),

    getSettings: (token: string) => apiClient<UserSettings>('/api/users/me/settings', { token }),

    updateSettings: (token: string, data: UserSettingsUpdate) =>
      apiClient<UserSettings>('/api/users/me/settings', {
        method: 'PATCH',
        body: data,
        token,
      }),

    listGoals: (token: string, activeOnly = false) =>
      apiClient<UserGoal[]>(`/api/users/me/goals${activeOnly ? '?active_only=true' : ''}`, {
        token,
      }),

    createGoal: (token: string, data: UserGoalCreate) =>
      apiClient<UserGoal>('/api/users/me/goals', {
        method: 'POST',
        body: data,
        token,
      }),

    updateGoal: (token: string, goalId: string, data: UserGoalUpdate) =>
      apiClient<UserGoal>(`/api/users/me/goals/${goalId}`, {
        method: 'PATCH',
        body: data,
        token,
      }),

    deleteGoal: (token: string, goalId: string) =>
      apiClient<void>(`/api/users/me/goals/${goalId}`, {
        method: 'DELETE',
        token,
      }),
  },

  // ==========================================
  // ROUTINES ENDPOINTS
  // ==========================================
  routines: {
    list: (
      token: string,
      params: {
        page?: number;
        pageSize?: number;
        startDate?: string;
        endDate?: string;
      } = {}
    ) => {
      const queryParams = buildQueryParams({
        page: params.page,
        page_size: params.pageSize,
        start_date: params.startDate,
        end_date: params.endDate,
      });
      return apiClient<PaginatedResponse<MorningRoutine>>(`/api/routines${queryParams}`, { token });
    },

    get: (token: string, id: string) => apiClient<MorningRoutine>(`/api/routines/${id}`, { token }),

    create: (
      token: string,
      data: Omit<MorningRoutine, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    ) =>
      apiClient<MorningRoutine>('/api/routines', {
        method: 'POST',
        body: data,
        token,
      }),

    update: (token: string, id: string, data: Partial<MorningRoutine>) =>
      apiClient<MorningRoutine>(`/api/routines/${id}`, {
        method: 'PUT',
        body: data,
        token,
      }),

    delete: (token: string, id: string) =>
      apiClient<void>(`/api/routines/${id}`, { method: 'DELETE', token }),
  },

  // ==========================================
  // PRODUCTIVITY ENDPOINTS
  // ==========================================
  productivity: {
    list: (
      token: string,
      params: {
        page?: number;
        pageSize?: number;
        startDate?: string;
        endDate?: string;
      } = {}
    ) => {
      const queryParams = buildQueryParams({
        page: params.page,
        page_size: params.pageSize,
        start_date: params.startDate,
        end_date: params.endDate,
      });
      return apiClient<PaginatedResponse<ProductivityEntry>>(`/api/productivity${queryParams}`, {
        token,
      });
    },

    get: (token: string, id: string) =>
      apiClient<ProductivityEntry>(`/api/productivity/${id}`, { token }),

    create: (
      token: string,
      data: Omit<ProductivityEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    ) =>
      apiClient<ProductivityEntry>('/api/productivity', {
        method: 'POST',
        body: data,
        token,
      }),

    update: (token: string, id: string, data: Partial<ProductivityEntry>) =>
      apiClient<ProductivityEntry>(`/api/productivity/${id}`, {
        method: 'PUT',
        body: data,
        token,
      }),

    delete: (token: string, id: string) =>
      apiClient<void>(`/api/productivity/${id}`, { method: 'DELETE', token }),
  },

  // ==========================================
  // ANALYTICS ENDPOINTS
  // ==========================================
  analytics: {
    summary: (token: string, startDate?: string, endDate?: string) => {
      const queryParams = buildQueryParams({
        start_date: startDate,
        end_date: endDate,
      });
      return apiClient<AnalyticsSummary>(`/api/analytics/summary${queryParams}`, { token });
    },

    charts: (token: string, startDate?: string, endDate?: string) => {
      const queryParams = buildQueryParams({
        start_date: startDate,
        end_date: endDate,
      });
      return apiClient<ChartDataPoint[]>(`/api/analytics/charts${queryParams}`, { token });
    },
  },

  // ==========================================
  // CSV IMPORT ENDPOINT
  // ==========================================
  import: {
    csv: async (token: string, file: File): Promise<CSVImportResult> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/import/csv`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiError(response.status, error.detail || 'Import failed');
      }

      return response.json();
    },
  },
};
