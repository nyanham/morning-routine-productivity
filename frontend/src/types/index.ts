// Morning Routine & Productivity Types

// ============================================
// USER PROFILE
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  display_name?: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
  timezone: string;
  locale: string;
  bio?: string;
  occupation?: string;
  is_active: boolean;
  email_verified: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface UserProfileUpdate {
  full_name?: string;
  display_name?: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
  timezone?: string;
  locale?: string;
  bio?: string;
  occupation?: string;
  onboarding_completed?: boolean;
}

// ============================================
// USER SETTINGS
// ============================================

export interface UserSettings {
  id: string;
  user_id: string;
  // Appearance
  theme: 'light' | 'dark' | 'system';
  accent_color: string;
  compact_mode: boolean;
  // Notifications
  email_notifications: boolean;
  push_notifications: boolean;
  weekly_summary_email: boolean;
  reminder_time: string;
  // Privacy
  profile_visibility: 'public' | 'private' | 'friends';
  show_streak_publicly: boolean;
  allow_data_analytics: boolean;
  // Dashboard Preferences
  default_date_range: number;
  default_chart_type: 'line' | 'bar' | 'area';
  show_weekend_markers: boolean;
  start_week_on: 'monday' | 'sunday';
  // Units & Formats
  time_format: '12h' | '24h';
  date_format: string;
  measurement_system: 'metric' | 'imperial';
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface UserSettingsUpdate {
  theme?: 'light' | 'dark' | 'system';
  accent_color?: string;
  compact_mode?: boolean;
  email_notifications?: boolean;
  push_notifications?: boolean;
  weekly_summary_email?: boolean;
  reminder_time?: string;
  profile_visibility?: 'public' | 'private' | 'friends';
  show_streak_publicly?: boolean;
  allow_data_analytics?: boolean;
  default_date_range?: number;
  default_chart_type?: 'line' | 'bar' | 'area';
  show_weekend_markers?: boolean;
  start_week_on?: 'monday' | 'sunday';
  time_format?: '12h' | '24h';
  date_format?: string;
  measurement_system?: 'metric' | 'imperial';
}

// ============================================
// USER GOALS
// ============================================

export type GoalType =
  | 'sleep_duration'
  | 'wake_time'
  | 'exercise_minutes'
  | 'meditation_minutes'
  | 'water_intake'
  | 'caffeine_limit'
  | 'productivity_score'
  | 'focus_hours'
  | 'tasks_completed'
  | 'stress_level_max'
  | 'screen_time_limit';

export interface UserGoal {
  id: string;
  user_id: string;
  goal_type: GoalType;
  target_value: number;
  target_unit?: string;
  is_active: boolean;
  reminder_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserGoalCreate {
  goal_type: GoalType;
  target_value: number;
  target_unit?: string;
  is_active?: boolean;
  reminder_enabled?: boolean;
}

export interface UserGoalUpdate {
  target_value?: number;
  target_unit?: string;
  is_active?: boolean;
  reminder_enabled?: boolean;
}

// ============================================
// COMBINED USER DATA
// ============================================

export interface CurrentUser {
  profile: UserProfile;
  settings: UserSettings;
  goals: UserGoal[];
}

// ============================================
// LEGACY USER TYPE (for compatibility)
// ============================================

export interface User {
  id: string;
  email: string;
  created_at: string;
  full_name?: string;
}

export interface MorningRoutine {
  id: string;
  user_id: string;
  date: string;
  wake_time: string;
  sleep_duration_hours: number;
  exercise_minutes: number;
  meditation_minutes: number;
  breakfast_quality: 'poor' | 'fair' | 'good' | 'excellent';
  morning_mood: number; // 1-10 scale
  screen_time_before_bed: number; // minutes
  caffeine_intake: number; // mg or cups
  water_intake_ml: number;
  created_at: string;
  updated_at: string;
}

export interface ProductivityEntry {
  id: string;
  user_id: string;
  date: string;
  routine_id?: string;
  productivity_score: number; // 1-10 scale
  tasks_completed: number;
  tasks_planned: number;
  focus_hours: number;
  distractions_count: number;
  energy_level: number; // 1-10 scale
  stress_level: number; // 1-10 scale
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyData {
  routine: MorningRoutine;
  productivity: ProductivityEntry;
}

export interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

export interface CSVImportResult {
  success: boolean;
  imported_count: number;
  failed_count: number;
  errors: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface AnalyticsSummary {
  /** Average productivity score. `null` when no data is available for the period. */
  avg_productivity: number | null;
  /** Average sleep duration in hours. `null` when no data is available. */
  avg_sleep: number | null;
  /** Average exercise duration in minutes. `null` when no data is available. */
  avg_exercise: number | null;
  total_entries: number;
  best_day: string;
  worst_day: string;
  /** Overall productivity trend. `null` when insufficient data to determine a trend. */
  productivity_trend: 'up' | 'down' | 'stable' | null;
}
