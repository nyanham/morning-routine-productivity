# Frontend Documentation

This document provides comprehensive documentation for the Next.js frontend application, including components, hooks, state management, and routing.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Routing (App Router)](#routing-app-router)
- [Components](#components)
  - [Layout Components](#layout-components)
  - [UI Components](#ui-components)
  - [Chart Components](#chart-components)
- [State Management](#state-management)
  - [Auth Context](#auth-context)
- [Custom Hooks](#custom-hooks)
- [API Client](#api-client)
- [TypeScript Types](#typescript-types)
- [Styling](#styling)
- [Testing](#testing)

---

## 🔍 Overview

### Technology Stack

| Technology   | Version | Purpose                         |
| ------------ | ------- | ------------------------------- |
| Next.js      | 16.x    | React framework with App Router |
| React        | 19.x    | UI library                      |
| TypeScript   | 5.7.x   | Type safety                     |
| Tailwind CSS | 4.x     | Utility-first styling           |
| Recharts     | 2.x     | Data visualization              |
| Lucide React | 0.5.x   | Icons                           |
| Supabase JS  | 2.x     | Auth & database client          |

### Key Features

- **Server-Side Rendering (SSR)** - Initial page loads rendered on server
- **App Router** - File-based routing with layouts
- **React Server Components** - Improved performance
- **TypeScript Strict Mode** - Full type safety
- **Responsive Design** - Desktop and tablet optimized

---

## 📁 Project Structure

```
frontend/src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout (providers, global styles)
│   ├── page.tsx                 # Landing page (/)
│   ├── globals.css              # Global CSS imports
│   ├── auth/                    # Authentication pages
│   │   ├── login/
│   │   │   └── page.tsx        # Login page (/auth/login)
│   │   └── signup/
│   │       └── page.tsx        # Signup page (/auth/signup)
│   └── dashboard/              # Protected dashboard area
│       ├── page.tsx            # Dashboard home (/dashboard)
│       ├── entry/
│       │   └── page.tsx        # Data entry (/dashboard/entry)
│       ├── import/
│       │   └── page.tsx        # CSV import (/dashboard/import)
│       └── settings/
│           └── page.tsx        # Settings (/dashboard/settings)
├── components/                  # Reusable components
│   ├── charts/                 # Recharts visualizations
│   │   ├── index.ts           # Chart exports
│   │   ├── ProductivityChart.tsx
│   │   ├── RoutineBarChart.tsx
│   │   └── SleepDistributionChart.tsx
│   ├── layout/                 # Layout components
│   │   └── DashboardLayout.tsx
│   └── ui/                     # UI primitives
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── StatsCard.tsx
│       └── ...
├── contexts/                   # React contexts
│   └── AuthContext.tsx        # Authentication state
├── hooks/                      # Custom React hooks
│   ├── useApi.ts              # API interaction hooks
│   └── useAuth.ts             # Auth utilities (if separate)
├── lib/                        # Utilities and clients
│   ├── api.ts                 # API client functions
│   ├── utils.ts               # Helper functions
│   └── supabase/
│       ├── client.ts          # Browser Supabase client
│       └── server.ts          # Server Supabase client
├── types/                      # TypeScript definitions
│   └── index.ts               # All type exports
└── __tests__/                  # Jest test files
    ├── components/
    ├── hooks/
    └── lib/
```

---

## 🗺️ Routing (App Router)

### Route Map

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                              ROUTE STRUCTURE                                   │
└────────────────────────────────────────────────────────────────────────────────┘

/                           → Landing page (public)
├── /auth                   → Auth layout
│   ├── /login             → Login page (public)
│   └── /signup            → Signup page (public)
└── /dashboard             → Dashboard layout (protected)
    ├── /                  → Dashboard home
    ├── /entry            → Manual data entry
    ├── /import           → CSV import
    └── /settings         → User settings
```

### Route Protection

Protected routes use the `RequireAuth` wrapper from AuthContext:

```tsx
// app/dashboard/page.tsx
import { RequireAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
```

### Root Layout

```tsx
// app/layout.tsx
import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

---

## 🧩 Components

### Layout Components

#### DashboardLayout

Provides the common layout for all dashboard pages including sidebar navigation.

```tsx
// components/layout/DashboardLayout.tsx

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function DashboardLayout({
  children,
  title,
  description,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r">
        <nav>
          <NavLink href="/dashboard" icon={Home}>
            Dashboard
          </NavLink>
          <NavLink href="/dashboard/entry" icon={Plus}>
            New Entry
          </NavLink>
          <NavLink href="/dashboard/import" icon={Upload}>
            Import
          </NavLink>
          <NavLink href="/dashboard/settings" icon={Settings}>
            Settings
          </NavLink>
        </nav>
        <UserMenu />
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {title && <h1>{title}</h1>}
        {description && <p>{description}</p>}
        {children}
      </main>
    </div>
  );
}
```

**Usage:**

```tsx
// app/dashboard/page.tsx
<DashboardLayout title="Dashboard" description="Your productivity overview">
  <DashboardContent />
</DashboardLayout>
```

---

### UI Components

#### StatsCard

Displays a single metric with icon, value, and optional trend.

```tsx
// components/ui/StatsCard.tsx

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {description && (
            <p className="text-xs text-slate-400">{description}</p>
          )}
        </div>
        <div className="p-3 bg-primary-100 rounded-full">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
      </div>
      {trend && (
        <div
          className={`mt-2 text-sm ${
            trend.direction === "up" ? "text-green-500" : "text-red-500"
          }`}
        >
          {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
}
```

**Usage:**

```tsx
<StatsCard
  title="Avg Productivity"
  value="7.5"
  icon={Target}
  description="Last 7 days"
  trend={{ value: 12, direction: "up" }}
/>
```

---

### Chart Components

All chart components use Recharts and follow consistent patterns.

#### ProductivityChart

Line chart showing productivity score over time.

```tsx
// components/charts/ProductivityChart.tsx

interface ProductivityChartProps {
  data: Array<{
    date: string;
    productivity_score: number;
    energy_level: number;
    morning_mood: number;
  }>;
  height?: number;
}

export function ProductivityChart({
  data,
  height = 300,
}: ProductivityChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 10]} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="productivity_score"
          stroke="#3b82f6"
          name="Productivity"
        />
        <Line
          type="monotone"
          dataKey="energy_level"
          stroke="#22c55e"
          name="Energy"
        />
        <Line
          type="monotone"
          dataKey="morning_mood"
          stroke="#f59e0b"
          name="Mood"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

#### RoutineBarChart

Bar chart showing exercise and meditation minutes.

```tsx
// components/charts/RoutineBarChart.tsx

interface RoutineBarChartProps {
  data: Array<{
    date: string;
    exercise_minutes: number;
    meditation_minutes: number;
    sleep_duration_hours: number;
  }>;
}

export function RoutineBarChart({ data }: RoutineBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="exercise_minutes" fill="#3b82f6" name="Exercise (min)" />
        <Bar
          dataKey="meditation_minutes"
          fill="#22c55e"
          name="Meditation (min)"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

#### SleepDistributionChart

Pie chart showing sleep duration distribution.

```tsx
// components/charts/SleepDistributionChart.tsx

interface SleepDistributionChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export function SleepDistributionChart({ data }: SleepDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          dataKey="value"
          label
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

---

## 📊 State Management

### Auth Context

Manages authentication state globally using React Context.

```tsx
// contexts/AuthContext.tsx

interface AuthContextType {
  user: User | null; // Current user object
  session: Session | null; // Supabase session
  loading: boolean; // Auth loading state
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN") {
        router.push("/dashboard");
      } else if (event === "SIGNED_OUT") {
        router.push("/auth/login");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ... signIn, signUp, signOut, getAccessToken implementations

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}

// Protected route wrapper
export function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/auth/login?returnUrl=${pathname}`);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return fallback || <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
```

---

## 🪝 Custom Hooks

### useApi.ts

Collection of hooks for API interactions with loading/error states.

#### Generic Pattern

```tsx
// Generic async state hook
function useAsyncState<T>(initialData: T | null = null) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: string | null;
  }>({
    data: initialData,
    loading: false,
    error: null,
  });

  const setLoading = () =>
    setState((prev) => ({ ...prev, loading: true, error: null }));
  const setData = (data: T) => setState({ data, loading: false, error: null });
  const setError = (error: string) =>
    setState((prev) => ({ ...prev, loading: false, error }));

  return { ...state, setLoading, setData, setError };
}
```

#### useRoutines

```tsx
import { getApiErrorMessage } from '@/lib/api';

export function useRoutines() {
  const { getAccessToken } = useAuthContext();
  const state = useAsyncState<PaginatedResponse<MorningRoutine>>();

  const fetch = useCallback(
    async (params?: {
      page?: number;
      pageSize?: number;
      startDate?: string;
      endDate?: string;
    }) => {
      const token = await getAccessToken();
      if (!token) return;

      state.setLoading();
      try {
        const data = await api.routines.list(token, params);
        state.setData(data);
      } catch (err) {
        state.setError(
          getApiErrorMessage(err, "Failed to fetch routines"),
        );
      }
    },
    [getAccessToken],
  );

  const create = useCallback(
    async (data: MorningRoutineCreate) => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return api.routines.create(token, data);
    },
    [getAccessToken],
  );

  const update = useCallback(
    async (id: string, data: Partial<MorningRoutine>) => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return api.routines.update(token, id, data);
    },
    [getAccessToken],
  );

  const remove = useCallback(
    async (id: string) => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return api.routines.delete(token, id);
    },
    [getAccessToken],
  );

  return { ...state, fetch, create, update, remove };
}
```

#### useProductivity

Similar pattern for productivity entries.

```tsx
export function useProductivity() {
  const { getAccessToken } = useAuthContext();
  const state = useAsyncState<PaginatedResponse<ProductivityEntry>>();

  const fetch = useCallback(
    async (params) => {
      /* ... */
    },
    [getAccessToken],
  );
  const create = useCallback(
    async (data) => {
      /* ... */
    },
    [getAccessToken],
  );
  const update = useCallback(
    async (id, data) => {
      /* ... */
    },
    [getAccessToken],
  );
  const remove = useCallback(
    async (id) => {
      /* ... */
    },
    [getAccessToken],
  );

  return { ...state, fetch, create, update, remove };
}
```

#### useAnalyticsSummary

```tsx
export function useAnalyticsSummary() {
  const { getAccessToken } = useAuthContext();
  const state = useAsyncState<AnalyticsSummary>();

  const fetch = useCallback(
    async (startDate?: string, endDate?: string) => {
      const token = await getAccessToken();
      if (!token) return;

      state.setLoading();
      try {
        const data = await api.analytics.summary(token, { startDate, endDate });
        state.setData(data);
      } catch (err) {
        state.setError(
          getApiErrorMessage(err, "Failed to fetch analytics"),
        );
      }
    },
    [getAccessToken],
  );

  return { ...state, fetch };
}
```

#### useChartData

```tsx
export function useChartData() {
  const { getAccessToken } = useAuthContext();
  const state = useAsyncState<ChartDataPoint[]>();

  const fetch = useCallback(
    async (startDate?: string, endDate?: string) => {
      const token = await getAccessToken();
      if (!token) return;

      state.setLoading();
      try {
        const data = await api.analytics.charts(token, { startDate, endDate });
        state.setData(data);
      } catch (err) {
        state.setError(
          getApiErrorMessage(err, "Failed to fetch chart data"),
        );
      }
    },
    [getAccessToken],
  );

  return { ...state, fetch };
}
```

---

## 🔗 API Client

### lib/api.ts

```tsx
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Custom error class
export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
    this.name = "ApiError";
  }
}

/**
 * Safely extract an error message from any caught value.
 *
 * Uses the `name` property instead of `instanceof` because
 * Next.js Turbopack/webpack can duplicate class identities
 * across chunk boundaries, making `instanceof` unreliable.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (
    err &&
    typeof err === "object" &&
    "name" in err &&
    (err as { name: string }).name === "ApiError" &&
    "detail" in err
  ) {
    return (err as ApiError).detail;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

// Generic fetch wrapper
export async function apiClient<T>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: unknown;
    token?: string;
  } = {},
): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // Network error, CORS blocked, or similar — fetch() itself threw.
    console.error(`[API] ${method} ${endpoint} network error:`, err);
    throw err;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const detail = error.detail || `API request failed (${response.status})`;
    console.error(`[API] ${method} ${endpoint} → ${response.status}:`, detail);
    throw new ApiError(response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// API namespace
export const api = {
  users: {
    me: (token) => apiClient("/api/users/me", { token }),
    getProfile: (token) => apiClient("/api/users/me/profile", { token }),
    updateProfile: (token, data) =>
      apiClient("/api/users/me/profile", {
        method: "PATCH",
        body: data,
        token,
      }),
    // ... more user endpoints
  },

  routines: {
    list: (token, params) =>
      apiClient(`/api/routines${buildQueryParams(params)}`, { token }),
    get: (token, id) => apiClient(`/api/routines/${id}`, { token }),
    create: (token, data) =>
      apiClient("/api/routines", { method: "POST", body: data, token }),
    update: (token, id, data) =>
      apiClient(`/api/routines/${id}`, {
        method: "PUT",
        body: data,
        token,
      }),
    delete: (token, id) =>
      apiClient(`/api/routines/${id}`, { method: "DELETE", token }),
  },

  productivity: {
    // Similar pattern
  },

  analytics: {
    summary: (token, params) =>
      apiClient(`/api/analytics/summary${buildQueryParams(params)}`, {
        token,
      }),
    charts: (token, params) =>
      apiClient(`/api/analytics/charts${buildQueryParams(params)}`, {
        token,
      }),
  },

  import: {
    csv: async (token: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/api/import/csv`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(response.status, error.detail);
      }

      return response.json();
    },
  },
};
```

---

## 📝 TypeScript Types

### types/index.ts

```tsx
// ==========================================
// USER TYPES
// ==========================================

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: "male" | "female" | "non_binary" | "prefer_not_to_say" | null;
  timezone: string;
  locale: string;
  bio: string | null;
  occupation: string | null;
  is_active: boolean;
  email_verified: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: "light" | "dark" | "system";
  accent_color: string;
  compact_mode: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  weekly_summary_email: boolean;
  reminder_time: string;
  profile_visibility: "public" | "private" | "friends";
  default_date_range: number;
  default_chart_type: "line" | "bar" | "area";
  time_format: "12h" | "24h";
  date_format: string;
  measurement_system: "metric" | "imperial";
}

export interface UserGoal {
  id: string;
  user_id: string;
  goal_type: GoalType;
  target_value: number;
  target_unit: string | null;
  is_active: boolean;
  reminder_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type GoalType =
  | "sleep_duration"
  | "wake_time"
  | "exercise_minutes"
  | "meditation_minutes"
  | "water_intake"
  | "caffeine_limit"
  | "productivity_score"
  | "focus_hours"
  | "tasks_completed"
  | "stress_level_max"
  | "screen_time_limit";

export interface CurrentUser {
  profile: UserProfile;
  settings: UserSettings;
  goals: UserGoal[];
}

// ==========================================
// ROUTINE TYPES
// ==========================================

export interface MorningRoutine {
  id: string;
  user_id: string;
  date: string;
  wake_time: string;
  sleep_duration_hours: number;
  exercise_minutes: number;
  meditation_minutes: number;
  breakfast_quality: "poor" | "fair" | "good" | "excellent";
  morning_mood: number;
  screen_time_before_bed: number;
  caffeine_intake: number;
  water_intake_ml: number;
  created_at: string;
  updated_at: string;
}

export type MorningRoutineCreate = Omit<
  MorningRoutine,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export type MorningRoutineUpdate = Partial<MorningRoutineCreate>;

// ==========================================
// PRODUCTIVITY TYPES
// ==========================================

export interface ProductivityEntry {
  id: string;
  user_id: string;
  date: string;
  routine_id: string | null;
  productivity_score: number;
  tasks_completed: number;
  tasks_planned: number;
  focus_hours: number;
  distractions_count: number;
  energy_level: number;
  stress_level: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ==========================================
// ANALYTICS TYPES
// ==========================================

export interface AnalyticsSummary {
  avg_productivity_score: number;
  avg_sleep_duration: number;
  avg_morning_mood: number;
  avg_energy_level: number;
  avg_stress_level: number;
  total_exercise_minutes: number;
  total_meditation_minutes: number;
  total_tasks_completed: number;
  total_focus_hours: number;
  current_streak: number;
  longest_streak: number;
  total_entries: number;
}

export interface ChartDataPoint {
  date: string;
  productivity_score: number | null;
  energy_level: number | null;
  morning_mood: number | null;
  sleep_duration_hours: number | null;
  stress_level: number | null;
  exercise_minutes: number | null;
  meditation_minutes: number | null;
}

// ==========================================
// COMMON TYPES
// ==========================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CSVImportResult {
  imported_count: number;
  failed_count: number;
  errors: string[];
}
```

---

## 🎨 Styling

### Tailwind CSS Configuration

```tsx
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### Common Class Patterns

```tsx
// Card container
<div className="bg-white rounded-xl shadow-sm p-6">

// Page header
<h1 className="text-2xl font-bold text-slate-900">

// Form input
<input className="w-full px-4 py-2 border border-slate-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary-500">

// Primary button
<button className="px-6 py-2 bg-primary-600 text-white rounded-lg
                   hover:bg-primary-700 transition-colors">

// Error text
<p className="text-sm text-red-500">
```

---

## 🧪 Testing

### Jest Configuration

```tsx
// jest.config.ts
import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default createJestConfig(config);
```

### Test Patterns

```tsx
// Component test
import { render, screen } from "@testing-library/react";
import StatsCard from "@/components/ui/StatsCard";
import { Target } from "lucide-react";

describe("StatsCard", () => {
  it("renders title and value", () => {
    render(<StatsCard title="Test" value="123" icon={Target} />);

    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
  });
});

// Hook test
import { renderHook, act } from "@testing-library/react";
import { useRoutines } from "@/hooks/useApi";

describe("useRoutines", () => {
  it("initializes with null data", () => {
    const { result } = renderHook(() => useRoutines());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
```

### Running Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific file
npm test -- StatsCard.test.tsx

# Watch mode
npm test -- --watch
```

---

## 🔗 Related Documentation

- [System Flows](./SYSTEM_FLOWS.md) - How frontend integrates with backend
- [API Reference](./API.md) - API endpoints the frontend consumes
- [Architecture](./ARCHITECTURE.md) - Overall system design
- [Development Guide](./DEVELOPMENT.md) - Setup and contribution
