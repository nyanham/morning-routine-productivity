'use client';

import { useState, useCallback } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { api, getApiErrorMessage } from '@/lib/api';
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

// ==========================================
// GENERIC ASYNC STATE HOOK
// ==========================================

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useAsyncState<T>(initialData: T | null = null) {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const setLoading = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
  }, []);

  const setData = useCallback((data: T) => {
    setState({ data, loading: false, error: null });
  }, []);

  const setError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, loading: false, error }));
  }, []);

  return { ...state, setLoading, setData, setError };
}

// ==========================================
// USER HOOKS
// ==========================================

export function useCurrentUser() {
  const { getAccessToken } = useAuthContext();
  const state = useAsyncState<CurrentUser>();

  const fetch = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      state.setError('Not authenticated');
      return;
    }

    state.setLoading();
    try {
      const data = await api.users.me(token);
      state.setData(data);
    } catch (err) {
      state.setError(getApiErrorMessage(err, 'Failed to fetch user'));
    }
  }, [getAccessToken]);

  return { ...state, fetch };
}

export function useUserProfile() {
  const { getAccessToken } = useAuthContext();
  const state = useAsyncState<UserProfile>();

  const fetch = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return;

    state.setLoading();
    try {
      const data = await api.users.getProfile(token);
      state.setData(data);
    } catch (err) {
      state.setError(getApiErrorMessage(err, 'Failed to fetch profile'));
    }
  }, [getAccessToken]);

  const update = useCallback(
    async (data: UserProfileUpdate) => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      const updated = await api.users.updateProfile(token, data);
      state.setData(updated);
      return updated;
    },
    [getAccessToken]
  );

  return { ...state, fetch, update };
}

export function useUserSettings() {
  const { getAccessToken } = useAuthContext();
  const state = useAsyncState<UserSettings>();

  const fetch = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return;

    state.setLoading();
    try {
      const data = await api.users.getSettings(token);
      state.setData(data);
    } catch (err) {
      state.setError(getApiErrorMessage(err, 'Failed to fetch settings'));
    }
  }, [getAccessToken]);

  const update = useCallback(
    async (data: UserSettingsUpdate) => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      const updated = await api.users.updateSettings(token, data);
      state.setData(updated);
      return updated;
    },
    [getAccessToken]
  );

  return { ...state, fetch, update };
}

export function useUserGoals() {
  const { getAccessToken } = useAuthContext();
  const state = useAsyncState<UserGoal[]>();

  const fetch = useCallback(
    async (activeOnly = false) => {
      const token = await getAccessToken();
      if (!token) return;

      state.setLoading();
      try {
        const data = await api.users.listGoals(token, activeOnly);
        state.setData(data);
      } catch (err) {
        state.setError(getApiErrorMessage(err, 'Failed to fetch goals'));
      }
    },
    [getAccessToken]
  );

  const create = useCallback(
    async (data: UserGoalCreate) => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      const goal = await api.users.createGoal(token, data);
      state.setData([...(state.data || []), goal]);
      return goal;
    },
    [getAccessToken, state.data]
  );

  const update = useCallback(
    async (goalId: string, data: UserGoalUpdate) => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      const updated = await api.users.updateGoal(token, goalId, data);
      state.setData((state.data || []).map((g) => (g.id === goalId ? updated : g)));
      return updated;
    },
    [getAccessToken, state.data]
  );

  const remove = useCallback(
    async (goalId: string) => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      await api.users.deleteGoal(token, goalId);
      state.setData((state.data || []).filter((g) => g.id !== goalId));
    },
    [getAccessToken, state.data]
  );

  return { ...state, fetch, create, update, remove };
}

// ==========================================
// ROUTINES HOOKS
// ==========================================

interface RoutinesParams {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
}

export function useRoutines() {
  const { getAccessToken } = useAuthContext();
  const state = useAsyncState<PaginatedResponse<MorningRoutine>>();

  const fetch = useCallback(
    async (params: RoutinesParams = {}) => {
      const token = await getAccessToken();
      if (!token) return;

      state.setLoading();
      try {
        const data = await api.routines.list(token, params);
        state.setData(data);
      } catch (err) {
        state.setError(getApiErrorMessage(err, 'Failed to fetch routines'));
      }
    },
    [getAccessToken]
  );

  const create = useCallback(
    async (data: Omit<MorningRoutine, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      return await api.routines.create(token, data);
    },
    [getAccessToken]
  );

  const update = useCallback(
    async (id: string, data: Partial<MorningRoutine>) => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      return await api.routines.update(token, id, data);
    },
    [getAccessToken]
  );

  const remove = useCallback(
    async (id: string) => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      await api.routines.delete(token, id);
    },
    [getAccessToken]
  );

  return { ...state, fetch, create, update, remove };
}

// ==========================================
// PRODUCTIVITY HOOKS
// ==========================================

interface ProductivityParams {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
}

export function useProductivity() {
  const { getAccessToken } = useAuthContext();
  const state = useAsyncState<PaginatedResponse<ProductivityEntry>>();

  const fetch = useCallback(
    async (params: ProductivityParams = {}) => {
      const token = await getAccessToken();
      if (!token) return;

      state.setLoading();
      try {
        const data = await api.productivity.list(token, params);
        state.setData(data);
      } catch (err) {
        state.setError(getApiErrorMessage(err, 'Failed to fetch productivity data'));
      }
    },
    [getAccessToken]
  );

  const create = useCallback(
    async (data: Omit<ProductivityEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      return await api.productivity.create(token, data);
    },
    [getAccessToken]
  );

  const update = useCallback(
    async (id: string, data: Partial<ProductivityEntry>) => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      return await api.productivity.update(token, id, data);
    },
    [getAccessToken]
  );

  const remove = useCallback(
    async (id: string) => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      await api.productivity.delete(token, id);
    },
    [getAccessToken]
  );

  return { ...state, fetch, create, update, remove };
}

// ==========================================
// ANALYTICS HOOKS
// ==========================================

export function useAnalyticsSummary() {
  const { getAccessToken } = useAuthContext();
  const state = useAsyncState<AnalyticsSummary>();

  const fetch = useCallback(
    async (startDate?: string, endDate?: string) => {
      const token = await getAccessToken();
      if (!token) return;

      state.setLoading();
      try {
        const data = await api.analytics.summary(token, startDate, endDate);
        state.setData(data);
      } catch (err) {
        state.setError(getApiErrorMessage(err, 'Failed to fetch summary'));
      }
    },
    [getAccessToken]
  );

  return { ...state, fetch };
}

export function useChartData() {
  const { getAccessToken } = useAuthContext();
  const state = useAsyncState<ChartDataPoint[]>();

  const fetch = useCallback(
    async (startDate?: string, endDate?: string) => {
      const token = await getAccessToken();
      if (!token) return;

      state.setLoading();
      try {
        const data = await api.analytics.charts(token, startDate, endDate);
        state.setData(data);
      } catch (err) {
        state.setError(getApiErrorMessage(err, 'Failed to fetch chart data'));
      }
    },
    [getAccessToken]
  );

  return { ...state, fetch };
}

// ==========================================
// CSV IMPORT HOOK
// ==========================================

export function useCSVImport() {
  const { getAccessToken } = useAuthContext();
  const state = useAsyncState<CSVImportResult>();

  const importFile = useCallback(
    async (file: File) => {
      const token = await getAccessToken();
      if (!token) {
        state.setError('Not authenticated');
        return;
      }

      state.setLoading();
      try {
        const result = await api.import.csv(token, file);
        state.setData(result);
        return result;
      } catch (err) {
        const message = getApiErrorMessage(err, 'Import failed');
        state.setError(message);
        throw err;
      }
    },
    [getAccessToken]
  );

  return { ...state, importFile };
}
