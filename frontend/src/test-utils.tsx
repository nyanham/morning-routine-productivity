/**
 * Test utilities for frontend tests.
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Mock AuthContext
const mockAuthContext = {
  user: null,
  session: null,
  loading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  getAccessToken: jest.fn().mockResolvedValue('mock-token'),
};

// Mock Auth Provider
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Custom render with providers
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  };

  return render(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };


// Test data factories
export const createMockRoutine = (overrides = {}) => ({
  id: 'routine-123',
  user_id: 'user-456',
  date: '2024-01-15',
  wake_time: '06:30',
  sleep_duration_hours: 7.5,
  exercise_minutes: 30,
  meditation_minutes: 15,
  breakfast_quality: 'good',
  morning_mood: 7,
  screen_time_before_bed: 30,
  caffeine_intake: 200,
  water_intake_ml: 500,
  created_at: '2024-01-15T06:30:00Z',
  updated_at: '2024-01-15T06:30:00Z',
  ...overrides,
});

export const createMockProductivity = (overrides = {}) => ({
  id: 'productivity-123',
  user_id: 'user-456',
  date: '2024-01-15',
  routine_id: 'routine-123',
  productivity_score: 8,
  tasks_completed: 5,
  tasks_planned: 6,
  focus_hours: 4.5,
  distractions_count: 3,
  energy_level: 7,
  stress_level: 4,
  notes: 'Productive day!',
  created_at: '2024-01-15T18:00:00Z',
  updated_at: '2024-01-15T18:00:00Z',
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: 'user-456',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockAnalyticsSummary = (overrides = {}) => ({
  total_entries: 30,
  avg_productivity: 7.5,
  avg_sleep_hours: 7.2,
  avg_morning_mood: 6.8,
  total_exercise_minutes: 450,
  total_meditation_minutes: 225,
  avg_focus_hours: 4.2,
  avg_tasks_completion_rate: 0.85,
  ...overrides,
});
