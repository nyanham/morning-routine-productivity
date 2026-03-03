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

  /**
   * Accepts either a value or a functional updater `(prev) => next`.
   * The updater form lets callers read the latest data without adding it
   * as a dependency — mirrors React's `setState(prev => ...)` pattern.
   */
  const setData = useCallback((dataOrUpdater: T | ((prev: T | null) => T)) => {
    setState((prev) => ({
      data:
        typeof dataOrUpdater === 'function'
          ? (dataOrUpdater as (prev: T | null) => T)(prev.data)
          : dataOrUpdater,
      loading: false,
      error: null,
    }));
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
  const asyncState = useAsyncState<CurrentUser>();
  const { setLoading, setData, setError } = asyncState;

  const fetch = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      setError('Not authenticated');
      return;
    }

    setLoading();
    try {
      const data = await api.users.me(token);
      setData(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch user'));
    }
  }, [getAccessToken, setLoading, setData, setError]);

  return { ...asyncState, fetch };
}

export function useUserProfile() {
  const { getAccessToken } = useAuthContext();
  const asyncState = useAsyncState<UserProfile>();
  const { setLoading, setData, setError } = asyncState;

  const fetch = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return;

    setLoading();
    try {
      const data = await api.users.getProfile(token);
      setData(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch profile'));
    }
  }, [getAccessToken, setLoading, setData, setError]);

  const update = useCallback(
    async (data: UserProfileUpdate) => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      const updated = await api.users.updateProfile(token, data);
      setData(updated);
      return updated;
    },
    [getAccessToken, setData]
  );

  return { ...asyncState, fetch, update };
}

export function useUserSettings() {
  const { getAccessToken } = useAuthContext();
  const asyncState = useAsyncState<UserSettings>();
  const { setLoading, setData, setError } = asyncState;

  const fetch = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return;

    setLoading();
    try {
      const data = await api.users.getSettings(token);
      setData(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch settings'));
    }
  }, [getAccessToken, setLoading, setData, setError]);

  const update = useCallback(
    async (data: UserSettingsUpdate) => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      const updated = await api.users.updateSettings(token, data);
      setData(updated);
      return updated;
    },
    [getAccessToken, setData]
  );

  return { ...asyncState, fetch, update };
}

export function useUserGoals() {
  const { getAccessToken } = useAuthContext();
  const asyncState = useAsyncState<UserGoal[]>();
  const { setLoading, setData, setError } = asyncState;

  const fetch = useCallback(
    async (activeOnly = false) => {
      const token = await getAccessToken();
      if (!token) return;

      setLoading();
      try {
        const data = await api.users.listGoals(token, activeOnly);
        setData(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to fetch goals'));
      }
    },
    [getAccessToken, setLoading, setData, setError]
  );

  const create = useCallback(
    async (data: UserGoalCreate) => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      const goal = await api.users.createGoal(token, data);
      setData((prev) => [...(prev || []), goal]);
      return goal;
    },
    [getAccessToken, setData]
  );

  const update = useCallback(
    async (goalId: string, data: UserGoalUpdate) => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      const updated = await api.users.updateGoal(token, goalId, data);
      setData((prev) => (prev || []).map((g) => (g.id === goalId ? updated : g)));
      return updated;
    },
    [getAccessToken, setData]
  );

  const remove = useCallback(
    async (goalId: string) => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      await api.users.deleteGoal(token, goalId);
      setData((prev) => (prev || []).filter((g) => g.id !== goalId));
    },
    [getAccessToken, setData]
  );

  return { ...asyncState, fetch, create, update, remove };
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
  const asyncState = useAsyncState<PaginatedResponse<MorningRoutine>>();
  const { setLoading, setData, setError } = asyncState;

  const fetch = useCallback(
    async (params: RoutinesParams = {}) => {
      const token = await getAccessToken();
      if (!token) return;

      setLoading();
      try {
        const data = await api.routines.list(token, params);
        setData(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to fetch routines'));
      }
    },
    [getAccessToken, setLoading, setData, setError]
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

  return { ...asyncState, fetch, create, update, remove };
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
  const asyncState = useAsyncState<PaginatedResponse<ProductivityEntry>>();
  const { setLoading, setData, setError } = asyncState;

  const fetch = useCallback(
    async (params: ProductivityParams = {}) => {
      const token = await getAccessToken();
      if (!token) return;

      setLoading();
      try {
        const data = await api.productivity.list(token, params);
        setData(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to fetch productivity data'));
      }
    },
    [getAccessToken, setLoading, setData, setError]
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

  return { ...asyncState, fetch, create, update, remove };
}

// ==========================================
// ANALYTICS HOOKS
// ==========================================

export function useAnalyticsSummary() {
  const { getAccessToken } = useAuthContext();
  const asyncState = useAsyncState<AnalyticsSummary>();
  const { setLoading, setData, setError } = asyncState;

  const fetch = useCallback(
    async (startDate?: string, endDate?: string) => {
      const token = await getAccessToken();
      if (!token) return;

      setLoading();
      try {
        const data = await api.analytics.summary(token, startDate, endDate);
        setData(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to fetch summary'));
      }
    },
    [getAccessToken, setLoading, setData, setError]
  );

  return { ...asyncState, fetch };
}

export function useChartData() {
  const { getAccessToken } = useAuthContext();
  const asyncState = useAsyncState<ChartDataPoint[]>();
  const { setLoading, setData, setError } = asyncState;

  const fetch = useCallback(
    async (startDate?: string, endDate?: string) => {
      const token = await getAccessToken();
      if (!token) return;

      setLoading();
      try {
        const data = await api.analytics.charts(token, startDate, endDate);
        setData(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to fetch chart data'));
      }
    },
    [getAccessToken, setLoading, setData, setError]
  );

  return { ...asyncState, fetch };
}

// ==========================================
// CSV IMPORT HOOK
// ==========================================

export function useCSVImport() {
  const { getAccessToken } = useAuthContext();
  const asyncState = useAsyncState<CSVImportResult>();
  const { setLoading, setData, setError } = asyncState;

  const importFile = useCallback(
    async (file: File) => {
      const token = await getAccessToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      setLoading();
      try {
        const result = await api.import.csv(token, file);
        setData(result);
        return result;
      } catch (err) {
        const message = getApiErrorMessage(err, 'Import failed');
        setError(message);
        throw err;
      }
    },
    [getAccessToken, setLoading, setData, setError]
  );

  return { ...asyncState, importFile };
}
