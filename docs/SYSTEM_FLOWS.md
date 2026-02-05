# System Flows Documentation

This document provides detailed flow diagrams, step-by-step explanations, and code examples with real parameter values for every user action in the Morning Routine & Productivity Tracker application.

---

## 📚 Table of Contents

- [Authentication Flows](#authentication-flows)
  - [User Registration](#1-user-registration-flow)
  - [User Login](#2-user-login-flow)
  - [User Logout](#3-user-logout-flow)
  - [Session Refresh](#4-session-refresh-flow)
- [Data Entry Flows](#data-entry-flows)
  - [Create Morning Routine](#5-create-morning-routine-entry)
  - [Create Productivity Entry](#6-create-productivity-entry)
  - [Update Entry](#7-update-existing-entry)
  - [Delete Entry](#8-delete-entry)
- [Data Retrieval Flows](#data-retrieval-flows)
  - [View Dashboard](#9-view-dashboard)
  - [View Entry List](#10-view-entry-list-with-pagination)
- [Import/Export Flows](#importexport-flows)
  - [CSV Import](#11-csv-data-import)
- [Settings Flows](#settings-flows)
  - [Update Profile](#12-update-user-profile)
  - [Update Settings](#13-update-user-settings)
  - [Manage Goals](#14-manage-user-goals)

---

## 🔐 Authentication Flows

### 1. User Registration Flow

**User Story:** As a new user, I want to create an account so that I can start tracking my routines.

#### Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Frontend<br/>/auth/signup
    participant AC as AuthContext
    participant SA as Supabase Auth
    participant DB as PostgreSQL
    participant D as Dashboard

    U->>FE: Fill signup form
    Note over U,FE: email: "john@example.com"<br/>password: "SecurePass123!"<br/>fullName: "John Doe"

    FE->>AC: signUp(email, password, fullName)
    AC->>SA: supabase.auth.signUp({...})

    SA->>SA: Validate credentials
    SA->>DB: INSERT INTO auth.users
    Note over DB: id: "550e8400-e29b-41d4-a716-446655440000"

    DB-->>DB: TRIGGER: on_auth_user_created
    Note over DB: Creates user_profile<br/>Creates user_settings

    SA-->>AC: Return session + user
    Note over AC: access_token: "eyJhbGc..."<br/>refresh_token: "v1.MjE0..."<br/>expires_in: 3600

    AC->>AC: setUser(user)<br/>setSession(session)
    AC-->>FE: onAuthStateChange(SIGNED_IN)
    FE->>D: router.push(/dashboard)
```

#### Step-by-Step Breakdown

| Step | Component   | Action                   | Example Data                                                                      |
| ---- | ----------- | ------------------------ | --------------------------------------------------------------------------------- |
| 1    | User        | Fills registration form  | `email: "john@example.com"`, `password: "SecurePass123!"`, `fullName: "John Doe"` |
| 2    | Frontend    | Calls AuthContext signUp | Form data passed to context                                                       |
| 3    | AuthContext | Calls Supabase Auth API  | `supabase.auth.signUp({...})`                                                     |
| 4    | Supabase    | Validates & creates user | Checks email format, password strength                                            |
| 5    | PostgreSQL  | Trigger fires            | Creates profile + settings                                                        |
| 6    | Supabase    | Returns session          | JWT tokens + user object                                                          |
| 7    | AuthContext | Updates state            | `setUser()`, `setSession()`                                                       |
| 8    | Frontend    | Redirects                | Navigate to `/dashboard`                                                          |

#### Code Flow with Parameter Examples

**Step 1-2: Frontend Form Submission**

```typescript
// File: frontend/src/app/auth/signup/page.tsx

const [formData, setFormData] = useState({
  email: "",
  password: "",
  fullName: "",
});

// Example values when user submits:
// formData = {
//   email: "john@example.com",
//   password: "SecurePass123!",
//   fullName: "John Doe"
// }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    await signUp(formData.email, formData.password, formData.fullName);
    // Success: AuthContext handles redirect automatically
  } catch (error) {
    setError("Registration failed. Please try again.");
  }
};
```

**Step 3: AuthContext signUp Function**

```typescript
// File: frontend/src/contexts/AuthContext.tsx

const signUp = useCallback(
  async (email: string, password: string, fullName?: string) => {
    // Called with: signUp("john@example.com", "SecurePass123!", "John Doe")

    const { data, error } = await supabase.auth.signUp({
      email: "john@example.com",
      password: "SecurePass123!",
      options: {
        data: {
          full_name: "John Doe", // Stored in raw_user_meta_data
        },
      },
    });

    if (error) throw error;

    // data.user = {
    //   id: "550e8400-e29b-41d4-a716-446655440000",
    //   email: "john@example.com",
    //   user_metadata: { full_name: "John Doe" },
    //   created_at: "2024-01-15T10:30:00Z"
    // }

    // data.session = {
    //   access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    //   refresh_token: "v1.MjE0NTY3ODkwMTIzNDU2Nzg5...",
    //   expires_in: 3600,
    //   expires_at: 1705316400,
    //   token_type: "bearer"
    // }
  },
  [supabase],
);
```

**Step 4-5: Database Trigger**

```sql
-- File: database/schema.sql
-- Trigger automatically fires when user is created in auth.users

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- NEW.id = '550e8400-e29b-41d4-a716-446655440000'
    -- NEW.email = 'john@example.com'
    -- NEW.raw_user_meta_data->>'full_name' = 'John Doe'

    -- Step 5a: Create user profile
    INSERT INTO user_profiles (id, email, full_name)
    VALUES (
        '550e8400-e29b-41d4-a716-446655440000',
        'john@example.com',
        'John Doe'
    );
    -- Result: user_profiles row created with default values

    -- Step 5b: Create default settings
    INSERT INTO user_settings (user_id)
    VALUES ('550e8400-e29b-41d4-a716-446655440000');
    -- Result: user_settings row with all defaults (theme='system', etc.)

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Step 6-8: Auth State Change & Redirect**

```typescript
// File: frontend/src/contexts/AuthContext.tsx

// This listener fires when sign up succeeds
supabase.auth.onAuthStateChange(async (event, session) => {
  // event = 'SIGNED_IN'
  // session = { access_token: "eyJ...", user: {...}, ... }

  setSession(session);
  setUser(session?.user ?? null);
  setLoading(false);

  if (event === "SIGNED_IN") {
    // User just signed up/in, redirect to dashboard
    if (pathname?.startsWith("/auth")) {
      router.push("/dashboard");
      // User now sees: http://localhost:3000/dashboard
    }
  }
});
```

#### Validation Rules

| Field      | Validation                     | Error Message                                |
| ---------- | ------------------------------ | -------------------------------------------- |
| `email`    | Valid email format, unique     | "Invalid email" / "Email already registered" |
| `password` | Min 6 chars (Supabase default) | "Password should be at least 6 characters"   |
| `fullName` | Optional, max 100 chars        | -                                            |

---

### 2. User Login Flow

**User Story:** As a returning user, I want to log in to access my data.

#### Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Frontend<br/>/auth/login
    participant AC as AuthContext
    participant SA as Supabase Auth
    participant D as Dashboard

    U->>FE: Enter credentials
    Note over U,FE: email: "john@example.com"<br/>password: "SecurePass123!"

    FE->>AC: signIn(email, password)
    AC->>SA: signInWithPassword({...})

    SA->>SA: Verify credentials
    SA->>SA: Generate JWT tokens

    SA-->>AC: Return session
    Note over AC: access_token (1hr expiry)<br/>refresh_token (long-lived)

    AC->>AC: setUser(user)<br/>setSession(session)
    AC-->>FE: onAuthStateChange(SIGNED_IN)
    FE->>D: router.push(/dashboard)
```

#### Step-by-Step Breakdown

| Step | Component   | Action                  | Example Data                             |
| ---- | ----------- | ----------------------- | ---------------------------------------- |
| 1    | User        | Enters email & password | `"john@example.com"`, `"SecurePass123!"` |
| 2    | Frontend    | Calls signIn            | Passes credentials to AuthContext        |
| 3    | AuthContext | Calls Supabase          | `signInWithPassword({...})`              |
| 4    | Supabase    | Verifies credentials    | Checks against auth.users                |
| 5    | Supabase    | Generates tokens        | Creates JWT access + refresh tokens      |
| 6    | AuthContext | Stores session          | Saves to state, localStorage             |
| 7    | Frontend    | Redirects               | Navigate to `/dashboard` or `returnUrl`  |

#### Code Flow with Parameter Examples

**Step 1-2: Login Form**

```typescript
// File: frontend/src/app/auth/login/page.tsx

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    // Called with actual values:
    await signIn("john@example.com", "SecurePass123!");

    // Success: redirect handled by AuthContext
    // Check for returnUrl parameter
    const params = new URLSearchParams(window.location.search);
    const returnUrl = params.get("returnUrl") || "/dashboard";
    // If user came from /dashboard/settings, returnUrl = '/dashboard/settings'
  } catch (err) {
    setError("Invalid email or password");
  } finally {
    setLoading(false);
  }
};
```

**Step 3-5: AuthContext signIn & Supabase Response**

```typescript
// File: frontend/src/contexts/AuthContext.tsx

const signIn = useCallback(
  async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "john@example.com",
      password: "SecurePass123!",
    });

    if (error) throw error;

    // Successful response:
    // data = {
    //   user: {
    //     id: "550e8400-e29b-41d4-a716-446655440000",
    //     email: "john@example.com",
    //     user_metadata: { full_name: "John Doe" },
    //     last_sign_in_at: "2024-01-15T14:30:00Z"
    //   },
    //   session: {
    //     access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzA1MzIwMDAwLCJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20ifQ.signature",
    //     refresh_token: "v1.MjE0NTY3ODkwLXJlZnJlc2g...",
    //     expires_in: 3600,
    //     expires_at: 1705320000,
    //     token_type: "bearer"
    //   }
    // }
  },
  [supabase],
);
```

**JWT Token Structure (Decoded)**

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "aud": "authenticated",
    "exp": 1705320000,
    "iat": 1705316400,
    "iss": "https://your-project.supabase.co/auth/v1",
    "sub": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "role": "authenticated"
  }
}
```

---

### 3. User Logout Flow

**User Story:** As a logged-in user, I want to sign out securely.

#### Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Dashboard
    participant AC as AuthContext
    participant SA as Supabase Auth
    participant L as Login Page

    U->>FE: Click logout button
    FE->>AC: signOut()
    AC->>SA: supabase.auth.signOut()

    SA->>SA: Invalidate session
    SA->>SA: Clear tokens

    SA-->>AC: Success
    AC->>AC: setUser(null)<br/>setSession(null)
    AC-->>FE: onAuthStateChange(SIGNED_OUT)
    FE->>L: router.push(/auth/login)
```

#### Code Flow with Parameter Examples

```typescript
// File: frontend/src/contexts/AuthContext.tsx

const signOut = useCallback(async () => {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;

  // After signOut:
  // - localStorage tokens cleared automatically by Supabase client
  // - Session invalidated on server
  // - onAuthStateChange fires with 'SIGNED_OUT'
}, [supabase]);

// Triggered automatically after signOut:
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT") {
    // session = null
    setSession(null);
    setUser(null);
    router.push("/auth/login");
  }
});
```

---

### 4. Session Refresh Flow

**User Story:** As a logged-in user, my session should automatically refresh before expiring.

#### Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    participant SC as Supabase Client
    participant SA as Supabase Auth
    participant AC as AuthContext

    Note over SC: access_token expires in < 60s

    SC->>SA: POST /auth/v1/token?grant_type=refresh_token
    Note over SC,SA: refresh_token: "v1.MjE0NTY3..."

    SA->>SA: Validate refresh token
    SA->>SA: Generate new access token

    SA-->>SC: New session
    Note over SC: new access_token<br/>same refresh_token<br/>new expires_at

    SC-->>AC: onAuthStateChange(TOKEN_REFRESHED)
    AC->>AC: setSession(newSession)
```

#### Code Flow

```typescript
// This happens automatically via Supabase client
// No manual code needed, but here's what happens:

// 1. Supabase client checks token expiry before each request
// 2. If expires_at - now < 60 seconds, auto-refresh triggers

// Example refresh response:
// {
//   access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.NEW_TOKEN...",
//   refresh_token: "v1.MjE0NTY3ODkwLXJlZnJlc2g...",  // Same as before
//   expires_in: 3600,
//   expires_at: 1705323600,  // 1 hour from now
//   token_type: "bearer"
// }
```

---

## ✍️ Data Entry Flows

### 5. Create Morning Routine Entry

**User Story:** As a user, I want to log my morning routine so I can track my habits.

#### Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Entry Page
    participant H as useRoutines Hook
    participant API as API Client
    participant BE as FastAPI Backend
    participant SV as RoutineService
    participant DB as PostgreSQL

    U->>FE: Fill routine form
    Note over U,FE: date: "2024-01-15"<br/>wake_time: "06:30"<br/>sleep_duration: 7.5<br/>mood: 8

    U->>FE: Click Submit
    FE->>H: routines.create(data)
    H->>H: getAccessToken()

    H->>API: api.routines.create(token, data)
    API->>BE: POST /api/routines
    Note over API,BE: Authorization: Bearer eyJ...<br/>Content-Type: application/json

    BE->>BE: get_current_user(token)
    BE->>BE: Pydantic validation

    BE->>SV: RoutineService.create(data)
    SV->>SV: Add user_id to payload

    SV->>DB: INSERT INTO morning_routines
    Note over DB: RLS: user_id = auth.uid()

    DB-->>SV: Return created row
    SV-->>BE: Return routine dict
    BE-->>API: 201 Created + JSON
    API-->>H: MorningRoutine object
    H-->>FE: Update state
    FE->>FE: Show success toast
    FE->>FE: Redirect to dashboard
```

#### Step-by-Step Breakdown

| Step | Component  | Action             | Example Data                   |
| ---- | ---------- | ------------------ | ------------------------------ |
| 1    | User       | Fills the form     | See form data below            |
| 2    | User       | Clicks Submit      | Triggers form submission       |
| 3    | Hook       | Gets access token  | `"eyJhbGciOiJI..."`            |
| 4    | API Client | Makes POST request | `/api/routines` with JSON body |
| 5    | Backend    | Validates token    | Extracts user_id from JWT      |
| 6    | Backend    | Validates data     | Pydantic model validation      |
| 7    | Service    | Adds user context  | Adds `user_id` to payload      |
| 8    | Database   | Inserts row        | RLS validates ownership        |
| 9    | Backend    | Returns response   | `201 Created` with routine     |
| 10   | Frontend   | Updates UI         | Success toast, redirect        |

#### Code Flow with Parameter Examples

**Step 1: Form Data Structure**

```typescript
// File: frontend/src/app/dashboard/entry/page.tsx

interface FormData {
  date: string;
  wake_time: string;
  sleep_duration_hours: number;
  exercise_minutes: number;
  meditation_minutes: number;
  breakfast_quality: "poor" | "fair" | "good" | "excellent";
  morning_mood: number;
  caffeine_intake: number;
  water_intake_ml: number;
  screen_time_before_bed: number;
}

// Example filled form:
const formData: FormData = {
  date: "2024-01-15",
  wake_time: "06:30",
  sleep_duration_hours: 7.5,
  exercise_minutes: 30,
  meditation_minutes: 15,
  breakfast_quality: "good",
  morning_mood: 8,
  caffeine_intake: 200, // mg
  water_intake_ml: 500, // ml
  screen_time_before_bed: 30, // minutes
};
```

**Step 2-3: Form Submission & Hook Call**

```typescript
// File: frontend/src/app/dashboard/entry/page.tsx

const routines = useRoutines();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSaving(true);
  setError(null);

  try {
    // Prepare routine data (subset of form)
    const routineData = {
      date: "2024-01-15",
      wake_time: "06:30",
      sleep_duration_hours: 7.5,
      exercise_minutes: 30,
      meditation_minutes: 15,
      breakfast_quality: "good",
      morning_mood: 8,
      caffeine_intake: 200,
      water_intake_ml: 500,
      screen_time_before_bed: 30,
    };

    const created = await routines.create(routineData);
    // created = { id: "routine-uuid", ...routineData, user_id: "...", created_at: "..." }

    setSuccess(true);
    router.push("/dashboard");
  } catch (err) {
    setError(err instanceof ApiError ? err.detail : "Failed to save");
  } finally {
    setSaving(false);
  }
};
```

**Step 3: useRoutines Hook**

```typescript
// File: frontend/src/hooks/useApi.ts

export function useRoutines() {
  const { getAccessToken } = useAuthContext();

  const create = useCallback(
    async (data: MorningRoutineCreate) => {
      // Step 3a: Get the JWT token
      const token = await getAccessToken();
      // token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

      if (!token) throw new Error("Not authenticated");

      // Step 3b: Call API client
      return api.routines.create(token, data);
    },
    [getAccessToken],
  );

  return { create /* ... other methods */ };
}
```

**Step 4: API Client Request**

```typescript
// File: frontend/src/lib/api.ts

export const api = {
  routines: {
    create: (
      token: string,
      data: Omit<
        MorningRoutine,
        "id" | "user_id" | "created_at" | "updated_at"
      >,
    ) =>
      apiClient<MorningRoutine>("/api/routines", {
        method: "POST",
        body: data,
        token,
      }),
  },
};

// Actual HTTP request sent:
// POST http://localhost:8000/api/routines
// Headers:
//   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
//   Content-Type: application/json
// Body:
// {
//   "date": "2024-01-15",
//   "wake_time": "06:30",
//   "sleep_duration_hours": 7.5,
//   "exercise_minutes": 30,
//   "meditation_minutes": 15,
//   "breakfast_quality": "good",
//   "morning_mood": 8,
//   "caffeine_intake": 200,
//   "water_intake_ml": 500,
//   "screen_time_before_bed": 30
// }
```

**Step 5: Backend Authentication**

```python
# File: backend/app/core/auth.py

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase),
) -> dict:
    # credentials.credentials = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

    # Verify JWT with Supabase
    user = supabase.auth.get_user(credentials.credentials)

    # user.user = {
    #   id: "550e8400-e29b-41d4-a716-446655440000",
    #   email: "john@example.com",
    #   ...
    # }

    return {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "john@example.com",
        "user_metadata": {"full_name": "John Doe"},
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    }
```

**Step 6: Pydantic Validation**

```python
# File: backend/app/models/routine.py

class MorningRoutineCreate(MorningRoutineBase):
    """Schema for creating a new morning routine."""
    pass

class MorningRoutineBase(BaseModel):
    date: date                                    # "2024-01-15" -> date(2024, 1, 15)
    wake_time: str                               # "06:30"
    sleep_duration_hours: float = Field(ge=0, le=24)  # 7.5 (0-24 range)
    exercise_minutes: int = Field(default=0, ge=0)    # 30 OK
    meditation_minutes: int = Field(default=0, ge=0)  # 15 OK
    breakfast_quality: BreakfastQuality = "good"      # "good" (enum value)
    morning_mood: int = Field(ge=1, le=10)           # 8 (1-10 range)
    screen_time_before_bed: int = Field(default=0, ge=0)  # 30 OK
    caffeine_intake: int = Field(default=0, ge=0)    # 200 OK
    water_intake_ml: int = Field(default=0, ge=0)    # 500 OK

# If validation fails, Pydantic raises ValidationError
# Example: morning_mood = 11 -> ValidationError("ensure this value is less than or equal to 10")
```

**Step 7-8: Service Layer & Database Insert**

```python
# File: backend/app/services/routine_service.py

class RoutineService:
    def __init__(self, supabase: Client, user_id: str):
        self.supabase = supabase
        self.user_id = "550e8400-e29b-41d4-a716-446655440000"
        self.table = "morning_routines"

    def create(self, data: MorningRoutineCreate) -> dict:
        # Convert Pydantic model to dict
        payload = data.model_dump()
        # payload = {
        #   "date": date(2024, 1, 15),
        #   "wake_time": "06:30",
        #   "sleep_duration_hours": 7.5,
        #   ...
        # }

        # Add user context
        payload["user_id"] = "550e8400-e29b-41d4-a716-446655440000"
        payload["date"] = "2024-01-15"  # Convert date to ISO string

        # Execute insert (RLS ensures user can only insert for themselves)
        response = self.supabase.table("morning_routines").insert(payload).execute()

        # SQL executed:
        # INSERT INTO morning_routines
        #   (user_id, date, wake_time, sleep_duration_hours, exercise_minutes,
        #    meditation_minutes, breakfast_quality, morning_mood,
        #    screen_time_before_bed, caffeine_intake, water_intake_ml)
        # VALUES
        #   ('550e8400-...', '2024-01-15', '06:30', 7.5, 30,
        #    15, 'good', 8, 30, 200, 500)
        # RETURNING *

        return response.data[0]
        # Returns:
        # {
        #   "id": "routine-123e4567-e89b-12d3-a456-426614174000",
        #   "user_id": "550e8400-e29b-41d4-a716-446655440000",
        #   "date": "2024-01-15",
        #   "wake_time": "06:30:00",
        #   "sleep_duration_hours": 7.5,
        #   "exercise_minutes": 30,
        #   "meditation_minutes": 15,
        #   "breakfast_quality": "good",
        #   "morning_mood": 8,
        #   "screen_time_before_bed": 30,
        #   "caffeine_intake": 200,
        #   "water_intake_ml": 500,
        #   "created_at": "2024-01-15T10:30:00Z",
        #   "updated_at": "2024-01-15T10:30:00Z"
        # }
```

**Step 9: API Route Handler**

```python
# File: backend/app/api/routines.py

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_routine(
    data: MorningRoutineCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """Create a new morning routine entry."""
    # current_user["id"] = "550e8400-..."
    # data = MorningRoutineCreate(date=..., wake_time=..., ...)

    service = RoutineService(supabase, current_user["id"])
    return service.create(data)

    # HTTP Response:
    # Status: 201 Created
    # Body: { "id": "routine-123e...", "date": "2024-01-15", ... }
```

#### Validation Error Examples

| Error Case     | Input                      | HTTP Status | Error Response                                                                                                      |
| -------------- | -------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------- |
| Invalid mood   | `morning_mood: 15`         | 422         | `{"detail": [{"loc": ["body", "morning_mood"], "msg": "ensure this value is less than or equal to 10"}]}`           |
| Negative sleep | `sleep_duration_hours: -1` | 422         | `{"detail": [{"loc": ["body", "sleep_duration_hours"], "msg": "ensure this value is greater than or equal to 0"}]}` |
| Invalid date   | `date: "not-a-date"`       | 422         | `{"detail": [{"loc": ["body", "date"], "msg": "invalid date format"}]}`                                             |
| Duplicate date | Same user, same date       | 409         | `{"detail": "Routine for this date already exists"}`                                                                |

---

### 6. Create Productivity Entry

**User Story:** As a user, I want to log my daily productivity to correlate with my morning routine.

#### Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Entry Page
    participant H as useProductivity Hook
    participant API as API Client
    participant BE as FastAPI Backend
    participant SV as ProductivityService
    participant DB as PostgreSQL

    U->>FE: Fill productivity form
    Note over U,FE: date: "2024-01-15"<br/>productivity_score: 8<br/>tasks_completed: 12<br/>energy_level: 7

    FE->>H: productivity.create(data)
    H->>API: POST /api/productivity

    API->>BE: Request with JWT
    BE->>BE: Validate token & data

    BE->>SV: ProductivityService.create()
    SV->>DB: INSERT INTO productivity_entries

    DB-->>SV: Return created row
    SV-->>BE: Return entry
    BE-->>API: 201 Created
    API-->>FE: Update state
```

#### Code Flow with Parameter Examples

**Form Data Structure**

```typescript
// Example productivity entry data:
const productivityData = {
  date: "2024-01-15",
  routine_id: "routine-123e4567-e89b-12d3-a456-426614174000", // Optional link
  productivity_score: 8, // 1-10 scale
  tasks_completed: 12,
  tasks_planned: 15,
  focus_hours: 6.5,
  distractions_count: 5,
  energy_level: 7, // 1-10 scale
  stress_level: 4, // 1-10 scale
  notes: "Great productive day! Finished the main feature.",
};
```

**API Request**

```typescript
// POST http://localhost:8000/api/productivity
// Headers: Authorization: Bearer eyJ...
// Body:
{
  "date": "2024-01-15",
  "routine_id": "routine-123e4567-e89b-12d3-a456-426614174000",
  "productivity_score": 8,
  "tasks_completed": 12,
  "tasks_planned": 15,
  "focus_hours": 6.5,
  "distractions_count": 5,
  "energy_level": 7,
  "stress_level": 4,
  "notes": "Great productive day! Finished the main feature."
}
```

**Response**

```json
{
  "id": "prod-789e0123-e45b-67d8-a901-234567890abc",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2024-01-15",
  "routine_id": "routine-123e4567-e89b-12d3-a456-426614174000",
  "productivity_score": 8,
  "tasks_completed": 12,
  "tasks_planned": 15,
  "focus_hours": 6.5,
  "distractions_count": 5,
  "energy_level": 7,
  "stress_level": 4,
  "notes": "Great productive day! Finished the main feature.",
  "created_at": "2024-01-15T18:00:00Z",
  "updated_at": "2024-01-15T18:00:00Z"
}
```

---

### 7. Update Existing Entry

**User Story:** As a user, I want to correct or update a previous entry.

#### Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Entry List
    participant M as Edit Modal
    participant H as useRoutines Hook
    participant API as API Client
    participant BE as FastAPI Backend
    participant DB as PostgreSQL

    U->>FE: Click edit on entry
    FE->>M: Open modal with current data
    Note over M: Pre-filled form<br/>morning_mood: 7

    U->>M: Change morning_mood to 8
    U->>M: Click Save

    M->>H: routines.update(id, { morning_mood: 8 })
    H->>API: PUT /api/routines/{id}

    API->>BE: Request with partial update
    BE->>DB: UPDATE morning_routines SET...
    Note over DB: WHERE id = ? AND user_id = auth.uid()

    DB-->>BE: Return updated row
    BE-->>API: 200 OK + updated data
    API-->>M: Close modal
    FE->>FE: Refresh list
```

#### Code Flow with Parameter Examples

**Update Request**

```typescript
// File: frontend/src/hooks/useApi.ts

const update = useCallback(
  async (id: string, data: Partial<MorningRoutine>) => {
    const token = await getAccessToken();
    if (!token) throw new Error("Not authenticated");

    // Example: Update only the mood
    // id = "routine-123e4567-e89b-12d3-a456-426614174000"
    // data = { morning_mood: 8 }

    return api.routines.update(token, id, data);
  },
  [getAccessToken],
);

// HTTP Request:
// PUT http://localhost:8000/api/routines/routine-123e4567-e89b-12d3-a456-426614174000
// Headers: Authorization: Bearer eyJ...
// Body: { "morning_mood": 8 }
```

**Backend Handler**

```python
# File: backend/app/api/routines.py

@router.put("/{routine_id}")
async def update_routine(
    routine_id: str,  # "routine-123e4567-e89b-12d3-a456-426614174000"
    data: MorningRoutineUpdate,  # { morning_mood: 8 }
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    service = RoutineService(supabase, current_user["id"])
    entry = service.update(routine_id, data)

    # SQL executed:
    # UPDATE morning_routines
    # SET morning_mood = 8, updated_at = NOW()
    # WHERE id = 'routine-123e4567-...'
    # AND user_id = '550e8400-...'  -- RLS enforced
    # RETURNING *

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine not found",
        )

    return entry
```

**Response**

```json
{
  "id": "routine-123e4567-e89b-12d3-a456-426614174000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2024-01-15",
  "wake_time": "06:30:00",
  "sleep_duration_hours": 7.5,
  "morning_mood": 8,
  "updated_at": "2024-01-15T19:30:00Z"
}
```

---

### 8. Delete Entry

**User Story:** As a user, I want to delete incorrect entries.

#### Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Entry List
    participant CD as Confirm Dialog
    participant H as useRoutines Hook
    participant API as API Client
    participant BE as FastAPI Backend
    participant DB as PostgreSQL

    U->>FE: Click delete button
    FE->>CD: Show confirmation
    Note over CD: "Delete entry for Jan 15?"

    U->>CD: Click Confirm
    CD->>H: routines.remove(id)
    H->>API: DELETE /api/routines/{id}

    API->>BE: Request with JWT
    BE->>DB: DELETE FROM morning_routines
    Note over DB: WHERE id = ? AND user_id = auth.uid()

    DB-->>BE: Rows affected: 1
    BE-->>API: 204 No Content
    API-->>FE: Remove from list
    FE->>FE: Show success toast
```

#### Code Flow with Parameter Examples

**Delete Request**

```typescript
// File: frontend/src/hooks/useApi.ts

const remove = useCallback(
  async (id: string) => {
    const token = await getAccessToken();
    // id = "routine-123e4567-e89b-12d3-a456-426614174000"

    return api.routines.delete(token, id);
  },
  [getAccessToken],
);

// HTTP Request:
// DELETE http://localhost:8000/api/routines/routine-123e4567-e89b-12d3-a456-426614174000
// Headers: Authorization: Bearer eyJ...
// Response: 204 No Content (empty body)
```

**Backend Handler**

```python
# File: backend/app/api/routines.py

@router.delete("/{routine_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_routine(
    routine_id: str,  # "routine-123e4567-e89b-12d3-a456-426614174000"
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    service = RoutineService(supabase, current_user["id"])
    deleted = service.delete(routine_id)

    # SQL executed:
    # DELETE FROM morning_routines
    # WHERE id = 'routine-123e4567-...'
    # AND user_id = '550e8400-...'  -- RLS enforced

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine not found",
        )

    # Response: HTTP 204 No Content
```

**Cascade Behavior**

```sql
-- When routine is deleted, linked productivity entries have routine_id set to NULL
-- Foreign key: ON DELETE SET NULL

-- Before delete:
-- productivity_entries: { id: "prod-789...", routine_id: "routine-123e..." }

-- After delete:
-- productivity_entries: { id: "prod-789...", routine_id: NULL }
```

---

## 📊 Data Retrieval Flows

### 9. View Dashboard

**User Story:** As a user, I want to see my productivity overview on the dashboard.

#### Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Dashboard Page
    participant RA as RequireAuth
    participant H1 as useRoutines
    participant H2 as useProductivity
    participant H3 as useAnalyticsSummary
    participant H4 as useChartData
    participant API as API Client
    participant BE as FastAPI Backend

    U->>FE: Navigate to /dashboard
    FE->>RA: Check authentication

    alt Not Authenticated
        RA->>FE: Redirect to /auth/login
    else Authenticated
        RA->>FE: Render dashboard
    end

    par Parallel Data Fetching
        FE->>H1: routines.fetch()
        H1->>API: GET /api/routines
        API->>BE: Request
        BE-->>API: Paginated routines
        API-->>H1: Data
    and
        FE->>H2: productivity.fetch()
        H2->>API: GET /api/productivity
        API->>BE: Request
        BE-->>API: Paginated productivity
        API-->>H2: Data
    and
        FE->>H3: summary.fetch()
        H3->>API: GET /api/analytics/summary
        API->>BE: Request
        BE-->>API: Summary stats
        API-->>H3: Data
    and
        FE->>H4: chartData.fetch()
        H4->>API: GET /api/analytics/charts
        API->>BE: Request
        BE-->>API: Chart data points
        API-->>H4: Data
    end

    FE->>FE: Render StatsCards
    FE->>FE: Render Charts
```

#### Code Flow with Parameter Examples

**Dashboard Page Setup**

```typescript
// File: frontend/src/app/dashboard/page.tsx

function DashboardContent() {
  const routines = useRoutines();
  const productivity = useProductivity();
  const summary = useAnalyticsSummary();
  const chartData = useChartData();

  // Fetch data on mount
  useEffect(() => {
    const endDate = new Date().toISOString().split('T')[0];  // "2024-01-15"
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];  // "2024-01-08"

    // Parallel fetch all data
    routines.fetch({ startDate, endDate, page: 1, pageSize: 10 });
    productivity.fetch({ startDate, endDate, page: 1, pageSize: 10 });
    summary.fetch(startDate, endDate);
    chartData.fetch(startDate, endDate);
  }, []);

  return (
    <DashboardLayout>
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard
          title="Avg Productivity"
          value={summary.data?.avg_productivity_score?.toFixed(1) || '-'}
          icon={Target}
        />
        {/* ... more cards */}
      </div>

      {/* Charts */}
      <ProductivityChart data={chartData.data || []} />
      <RoutineBarChart data={routines.data?.data || []} />
    </DashboardLayout>
  );
}
```

**Analytics Summary Response**

```json
// GET /api/analytics/summary?start_date=2024-01-08&end_date=2024-01-15
{
  "avg_productivity_score": 7.5,
  "avg_sleep_duration": 7.2,
  "avg_morning_mood": 6.8,
  "avg_energy_level": 7.0,
  "avg_stress_level": 4.5,
  "total_exercise_minutes": 210,
  "total_meditation_minutes": 90,
  "total_tasks_completed": 85,
  "total_focus_hours": 42.5,
  "current_streak": 7,
  "longest_streak": 14,
  "total_entries": 7
}
```

**Chart Data Response**

```json
// GET /api/analytics/charts?start_date=2024-01-08&end_date=2024-01-15
[
  {
    "date": "2024-01-08",
    "productivity_score": 7,
    "energy_level": 6,
    "morning_mood": 7,
    "sleep_duration_hours": 7.0,
    "stress_level": 5,
    "exercise_minutes": 30,
    "meditation_minutes": 10
  },
  {
    "date": "2024-01-09",
    "productivity_score": 8,
    "energy_level": 7,
    "morning_mood": 8,
    "sleep_duration_hours": 7.5,
    "stress_level": 4,
    "exercise_minutes": 45,
    "meditation_minutes": 15
  }
]
```

---

### 10. View Entry List with Pagination

**User Story:** As a user, I want to browse my historical entries.

#### Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Entry List
    participant H as useRoutines Hook
    participant API as API Client
    participant BE as FastAPI Backend
    participant DB as PostgreSQL

    U->>FE: View entry list
    FE->>H: routines.fetch({ page: 1, pageSize: 10 })
    H->>API: GET /api/routines?page=1&page_size=10

    API->>BE: Request
    BE->>DB: SELECT * FROM morning_routines
    Note over DB: WHERE user_id = auth.uid()<br/>ORDER BY date DESC<br/>LIMIT 10 OFFSET 0

    DB-->>BE: Return rows + count
    BE-->>API: Paginated response
    API-->>FE: Render list

    Note over FE: Shows entries 1-10 of 45

    U->>FE: Click Page 2
    FE->>H: routines.fetch({ page: 2, pageSize: 10 })
    H->>API: GET /api/routines?page=2&page_size=10

    API->>BE: Request
    BE->>DB: SELECT ... LIMIT 10 OFFSET 10
    DB-->>BE: Return rows
    BE-->>API: Page 2 data
    API-->>FE: Update list
```

#### Code Flow with Parameter Examples

**Pagination Request**

```typescript
// File: frontend/src/hooks/useApi.ts

const fetch = useCallback(
  async (params?: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const token = await getAccessToken();

    // Example: params = { page: 2, pageSize: 10, startDate: "2024-01-01" }
    const data = await api.routines.list(token, params);
    state.setData(data);
  },
  [getAccessToken],
);

// HTTP Request:
// GET http://localhost:8000/api/routines?page=2&page_size=10&start_date=2024-01-01
```

**Paginated Response**

```json
{
  "data": [
    {
      "id": "routine-11...",
      "date": "2024-01-05",
      "wake_time": "06:30:00",
      "sleep_duration_hours": 7.5,
      "morning_mood": 7
    },
    {
      "id": "routine-12...",
      "date": "2024-01-04",
      "wake_time": "07:00:00",
      "sleep_duration_hours": 8.0,
      "morning_mood": 8
    }
  ],
  "total": 45,
  "page": 2,
  "page_size": 10,
  "total_pages": 5
}
```

**Service Layer Pagination**

```python
# File: backend/app/services/routine_service.py

def list(
    self,
    page: int = 1,      # 2
    page_size: int = 10,
    start_date: date | None = None,  # date(2024, 1, 1)
    end_date: date | None = None,
) -> PaginatedResponse[MorningRoutine]:
    query = (
        self.supabase.table(self.table)
        .select("*", count="exact")
        .eq("user_id", self.user_id)  # "550e8400-..."
        .order("date", desc=True)
    )

    if start_date:
        query = query.gte("date", "2024-01-01")
    if end_date:
        query = query.lte("date", "2024-01-15")

    # Pagination calculation
    offset = (2 - 1) * 10  # = 10
    query = query.range(10, 19)  # Rows 10-19

    response = query.execute()
    total = response.count  # 45

    return PaginatedResponse(
        data=response.data,
        total=45,
        page=2,
        page_size=10,
        total_pages=5,  # ceil(45 / 10) = 5
    )
```

---

## 📥 Import/Export Flows

### 11. CSV Data Import

**User Story:** As a user, I want to import my historical data from a CSV file.

#### Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Import Page
    participant H as useImport Hook
    participant API as API Client
    participant BE as FastAPI Backend
    participant PD as Pandas
    participant DB as PostgreSQL

    U->>FE: Select CSV file
    Note over FE: routines_data.csv<br/>25 rows

    U->>FE: Click Upload
    FE->>H: import.upload(file)
    H->>API: POST /api/import/csv
    Note over API: Content-Type: multipart/form-data

    API->>BE: Upload file
    BE->>BE: Validate file type (.csv)
    BE->>PD: pd.read_csv(file)

    PD-->>BE: DataFrame (25 rows)

    loop For each row
        BE->>BE: Add user_id
        BE->>BE: Validate data
        BE->>DB: INSERT INTO table

        alt Success
            DB-->>BE: Row inserted
        else Error
            BE->>BE: Log error, continue
        end
    end

    BE-->>API: Import result
    Note over API: imported: 23<br/>failed: 2

    API-->>FE: Show results
    FE->>FE: Display summary
```

#### Code Flow with Parameter Examples

**CSV File Structure**

```csv
date,wake_time,sleep_duration_hours,exercise_minutes,meditation_minutes,breakfast_quality,morning_mood
2024-01-01,06:30,7.5,30,15,good,7
2024-01-02,07:00,8.0,45,20,excellent,8
2024-01-03,06:45,6.5,0,10,fair,5
2024-01-04,INVALID,7.0,30,15,good,7
2024-01-05,06:30,7.5,30,15,good,15
```

**Frontend Upload**

```typescript
// File: frontend/src/app/dashboard/import/page.tsx

const handleUpload = async () => {
  if (!file) return;

  setUploading(true);
  try {
    const result = await importData.upload(file);
    // result = {
    //   imported_count: 3,
    //   failed_count: 2,
    //   errors: [
    //     "Row 4: Invalid time format for wake_time",
    //     "Row 5: morning_mood must be between 1 and 10"
    //   ]
    // }

    setResult(result);
  } catch (err) {
    setError("Upload failed");
  } finally {
    setUploading(false);
  }
};
```

**Backend Import Handler**

```python
# File: backend/app/api/import_data.py

@router.post("/csv", response_model=CSVImportResult)
async def import_csv(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    # Validate file type
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    # Parse CSV
    content = await file.read()
    df = pd.read_csv(io.BytesIO(content))
    # df.columns = ['date', 'wake_time', 'sleep_duration_hours', ...]
    # df.shape = (5, 7)

    imported_count = 0
    failed_count = 0
    errors = []

    user_id = current_user["id"]  # "550e8400-..."

    for idx, row in df.iterrows():
        try:
            # Convert row to dict and add user_id
            row_dict = row.to_dict()
            row_dict["user_id"] = user_id

            # Row 0: {'date': '2024-01-01', 'wake_time': '06:30', ...}
            # Row 3: {'date': '2024-01-04', 'wake_time': 'INVALID', ...}

            # Remove NaN values
            row_dict = {k: v for k, v in row_dict.items() if pd.notna(v)}

            # Insert into database
            supabase.table("morning_routines").insert(row_dict).execute()
            imported_count += 1

        except Exception as e:
            failed_count += 1
            errors.append(f"Row {idx + 1}: {str(e)}")
            # errors = ["Row 4: Invalid time format for wake_time"]

    return CSVImportResult(
        imported_count=3,
        failed_count=2,
        errors=[
            "Row 4: Invalid time format for wake_time",
            "Row 5: morning_mood must be between 1 and 10"
        ]
    )
```

**Import Result UI**

```typescript
// Display import results
<div className="bg-white rounded-lg p-6">
  <h3 className="text-lg font-semibold mb-4">Import Results</h3>

  <div className="flex gap-4 mb-4">
    <div className="text-green-600">
      {result.imported_count} imported successfully
    </div>
    <div className="text-red-600">
      {result.failed_count} failed
    </div>
  </div>

  {result.errors.length > 0 && (
    <div className="bg-red-50 p-4 rounded">
      <h4 className="font-medium mb-2">Errors:</h4>
      <ul className="list-disc pl-5 text-sm">
        {result.errors.map((err, i) => (
          <li key={i}>{err}</li>
        ))}
      </ul>
    </div>
  )}
</div>
```

---

## ⚙️ Settings Flows

### 12. Update User Profile

**User Story:** As a user, I want to update my profile information.

#### Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Settings Page
    participant H as useUserProfile Hook
    participant API as API Client
    participant BE as FastAPI Backend
    participant DB as PostgreSQL

    U->>FE: Navigate to settings
    FE->>H: profile.fetch()
    H->>API: GET /api/users/me/profile
    API->>BE: Request
    BE->>DB: SELECT * FROM user_profiles
    DB-->>BE: Profile data
    BE-->>API: Profile JSON
    API-->>FE: Display in form

    U->>FE: Edit fields
    Note over FE: full_name: "John Smith"<br/>bio: "Updated bio"

    U->>FE: Click Save
    FE->>H: profile.update(changes)
    H->>API: PATCH /api/users/me/profile

    API->>BE: Partial update
    BE->>DB: UPDATE user_profiles SET...
    DB-->>BE: Updated row
    BE-->>API: Updated profile
    API-->>FE: Show success
```

#### Code Flow with Parameter Examples

**Current Profile Data**

```json
// GET /api/users/me/profile
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "full_name": "John Doe",
  "display_name": "John",
  "avatar_url": null,
  "date_of_birth": "1990-05-15",
  "gender": "male",
  "timezone": "America/New_York",
  "locale": "en-US",
  "bio": "Productivity enthusiast",
  "occupation": "Software Engineer",
  "is_active": true,
  "email_verified": true,
  "onboarding_completed": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-10T00:00:00Z"
}
```

**Update Request**

```typescript
// PATCH /api/users/me/profile
// Only send changed fields
{
  "full_name": "John Smith",
  "bio": "Software engineer focused on productivity tools"
}
```

**Update Response**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "full_name": "John Smith",
  "bio": "Software engineer focused on productivity tools",
  "updated_at": "2024-01-15T14:30:00Z"
}
```

---

### 13. Update User Settings

**User Story:** As a user, I want to customize my app preferences.

#### Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Settings Page
    participant H as useUserSettings Hook
    participant API as API Client
    participant BE as FastAPI Backend
    participant DB as PostgreSQL

    U->>FE: Open Settings tab
    FE->>H: settings.fetch()
    H->>API: GET /api/users/me/settings
    API-->>FE: Current settings

    U->>FE: Toggle theme to dark
    U->>FE: Change time format to 12h

    FE->>H: settings.update({ theme: "dark", time_format: "12h" })
    H->>API: PATCH /api/users/me/settings

    API->>BE: Partial update
    BE->>DB: UPDATE user_settings SET...
    DB-->>BE: Updated row
    BE-->>API: Updated settings

    API-->>FE: Apply changes
    FE->>FE: Switch to dark theme
```

#### Code Flow with Parameter Examples

**Current Settings**

```json
// GET /api/users/me/settings
{
  "id": "settings-uuid",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "theme": "system",
  "accent_color": "blue",
  "compact_mode": false,
  "email_notifications": true,
  "push_notifications": true,
  "weekly_summary_email": true,
  "reminder_time": "07:00:00",
  "profile_visibility": "private",
  "default_date_range": 30,
  "default_chart_type": "line",
  "time_format": "24h",
  "date_format": "YYYY-MM-DD",
  "measurement_system": "metric"
}
```

**Update Request**

```typescript
// PATCH /api/users/me/settings
{
  "theme": "dark",
  "time_format": "12h",
  "default_date_range": 7
}
```

---

### 14. Manage User Goals

**User Story:** As a user, I want to set and track personal goals.

#### Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Goals Section
    participant H as useUserGoals Hook
    participant API as API Client
    participant BE as FastAPI Backend
    participant DB as PostgreSQL

    rect rgb(100, 130, 100)
        Note over U,DB: CREATE GOAL
        U->>FE: Click "Add Goal"
        FE->>FE: Show goal form

        U->>FE: Set goal
        Note over FE: type: "sleep_duration"<br/>target: 8<br/>unit: "hours"

        FE->>H: goals.create(data)
        H->>API: POST /api/users/me/goals
        API->>BE: Create request
        BE->>DB: INSERT INTO user_goals
        DB-->>API: Created goal
        API-->>FE: Add to list
    end

    rect rgb(130, 130, 100)
        Note over U,DB: UPDATE GOAL
        U->>FE: Edit target to 8.5
        FE->>H: goals.update(id, { target_value: 8.5 })
        H->>API: PATCH /api/users/me/goals/{id}
        API-->>FE: Updated goal
    end

    rect rgb(130, 100, 100)
        Note over U,DB: DELETE GOAL
        U->>FE: Click delete
        FE->>H: goals.remove(id)
        H->>API: DELETE /api/users/me/goals/{id}
        API-->>FE: Remove from list
    end
```

#### Code Flow with Parameter Examples

**Create Goal Request**

```json
// POST /api/users/me/goals
{
  "goal_type": "sleep_duration",
  "target_value": 8.0,
  "target_unit": "hours",
  "reminder_enabled": true
}
```

**Create Goal Response**

```json
{
  "id": "goal-456e7890-f12b-34c5-d678-901234567890",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "goal_type": "sleep_duration",
  "target_value": 8.0,
  "target_unit": "hours",
  "is_active": true,
  "reminder_enabled": true,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

**Available Goal Types**

| Goal Type            | Example Target | Unit         |
| -------------------- | -------------- | ------------ |
| `sleep_duration`     | 8.0            | hours        |
| `wake_time`          | 06:30          | time         |
| `exercise_minutes`   | 30             | minutes      |
| `meditation_minutes` | 15             | minutes      |
| `water_intake`       | 2000           | ml           |
| `caffeine_limit`     | 400            | mg           |
| `productivity_score` | 8              | score (1-10) |
| `focus_hours`        | 6              | hours        |
| `tasks_completed`    | 10             | count        |
| `stress_level_max`   | 5              | score (1-10) |
| `screen_time_limit`  | 60             | minutes      |

**Update Goal Request**

```json
// PATCH /api/users/me/goals/goal-456e7890...
{
  "target_value": 8.5,
  "is_active": true
}
```

**Deactivate Goal**

```json
// PATCH /api/users/me/goals/goal-456e7890...
{
  "is_active": false
}
// Goal remains in database but excluded from active goals list
```

---

## 📚 Related Documentation

- [API Reference](./API.md) - Endpoint details and examples
- [Architecture](./ARCHITECTURE.md) - System design overview
- [Database Schema](./DATABASE.md) - Data models and constraints
- [Frontend Guide](./FRONTEND.md) - Component and hook details
- [Development Guide](./DEVELOPMENT.md) - Setup and contribution
