# Frontend Tests

> How the Next.js / React test suite is set up, which utilities are available,
> and what each test file covers.

---

## Configuration

### `jest.config.ts`

```ts
const config: Config = {
  testEnvironment: "jsdom",
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  setupFilesAfterSetup: ["<rootDir>/jest.setup.ts"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/layout.tsx",
    "!src/**/types/**",
  ],
  coverageThresholds: {
    global: { branches: 5, functions: 5, lines: 5, statements: 5 },
  },
};
```

| Setting                    | Purpose                                               |
| -------------------------- | ----------------------------------------------------- |
| `testEnvironment: "jsdom"` | Simulates a browser DOM                               |
| `moduleNameMapper`         | Resolves the `@/` import alias                        |
| `collectCoverageFrom`      | Includes `.ts/.tsx`, excludes type files and layouts  |
| Coverage thresholds (5 %)  | Low starting bar  Eintended to rise as coverage grows |

### Running

```bash
cd frontend

npm test              # Run all tests
npm test -- --watch   # Re-run on file change
npm test -- --coverage # With coverage report
```

---

## Global Setup (`jest.setup.ts`)

The setup file runs before every test file and installs:

| Mock / Polyfill                                                   | Why                                                                |
| ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`) | Components call Next.js routing hooks that don't exist in jsdom    |
| `next/image`                                                      | Renders a plain `<img>` element instead of Next.js optimised image |
| `process.env.NEXT_PUBLIC_*`                                       | Provides deterministic env vars (`http://localhost:8000`, etc.)    |
| `window.matchMedia`                                               | Prevents "matchMedia is not a function" in responsive code         |
| `ResizeObserver`                                                  | Stub for components / chart libraries that observe size changes    |
| `IntersectionObserver`                                            | Stub for lazy-loading or visibility-driven code                    |

---

## Test Utilities (`src/test-utils.tsx`)

A custom `render` function wraps every component under test in a
`MockAuthProvider`, providing deterministic auth state.

```tsx
import { render } from "@/test-utils";

render(<Dashboard />);
// The component sees: user = mockUser, isAuthenticated = true
```

### Data Factories

| Factory                                  | Returns             | Key Fields                                                |
| ---------------------------------------- | ------------------- | --------------------------------------------------------- |
| `createMockRoutine(overrides?)`          | `MorningRoutine`    | `wake_up_time`, `mood_score`, `sleep_duration`, …         |
| `createMockProductivity(overrides?)`     | `ProductivityEntry` | `productivity_score`, `tasks_completed`, `focus_hours`, … |
| `createMockUser(overrides?)`             | `User`              | `id`, `email`, `created_at`                               |
| `createMockAnalyticsSummary(overrides?)` | `AnalyticsSummary`  | `total_routines`, `avg_mood`, `avg_sleep_duration`, …     |

Each factory provides sensible defaults and accepts partial overrides:

```ts
const entry = createMockProductivity({ productivity_score: 3 });
```

---

## Test Files

### `__tests__/lib/api.test.ts`  EAPI Client

**`ApiError`** (5 tests):

| Test                         | What It Checks                        |
| ---------------------------- | ------------------------------------- |
| Create with message & status | Constructor stores both               |
| Default status is 500        | Omitting `status` falls back to 500   |
| `instanceof Error`           | Class extends `Error` correctly       |
| Message format               | Includes status in serialised message |

**`apiClient`** (10 tests):

| Test           | What It Checks                                      |
| -------------- | --------------------------------------------------- |
| GET request    | Calls `fetch` with `GET`, returns parsed JSON       |
| POST request   | Sends JSON body with `Content-Type` header          |
| PUT request    | Same as POST with `PUT` method                      |
| DELETE request | No body, correct method                             |
| PATCH request  | Sends JSON body with `PATCH` method                 |
| Auth headers   | Token appended as `Bearer` when provided            |
| No auth header | No `Authorization` header when token is `undefined` |
| 204 response   | Returns `null` instead of parsing empty body        |
| Error response | Throws `ApiError` with status and error body        |
| Custom headers | Merged into the request                             |

All tests stub `global.fetch` via `jest.fn()`  Eno network calls.

### `__tests__/lib/utils.test.ts`  EUtility Functions

| Utility                    | # Tests | Notes                                       |
| -------------------------- | ------: | ------------------------------------------- |
| `cn()`                     |       4 | Merges Tailwind classes, resolves conflicts |
| `formatDate()`             |       4 | ISO ↁEhuman, invalid ↁE"Invalid Date"       |
| `formatTime()`             |       4 | `"07:30"` ↁE`"7:30 AM"`, edge cases         |
| `calculatePercentage()`    |       4 | Division, zero total, rounding, zero value  |
| `getProductivityColor()`   |       3 | Low / medium / high ↁETailwind classes      |
| `getProductivityBgColor()` |       3 | Same tiers, background colour classes       |

### `__tests__/components/StatsCard.test.tsx`  EComponent Test

| Test                    | What It Checks                                |
| ----------------------- | --------------------------------------------- |
| Renders title and value | DOM contains both strings                     |
| Renders subtitle        | Optional subtitle prop appears                |
| Renders icon            | Custom icon element present                   |
| Renders positive trend  | Trend arrow is up, green styling              |
| Renders negative trend  | Trend arrow is down, red styling              |
| Renders neutral trend   | Trend value shown without directional styling |

Uses `@testing-library/react` queries (`getByText`, `getByTestId`) and
the custom `render` from `test-utils.tsx`.

---

## Writing a New Frontend Test

1. **Create the file** under `src/__tests__/` mirroring the source path:
   - `src/components/Foo.tsx` ↁE`src/__tests__/components/Foo.test.tsx`
2. **Import `render`** from `@/test-utils` (not from `@testing-library/react`
   directly) to get the auth context wrapper.
3. **Use factories** for mock data instead of inlining large objects.
4. **Prefer user-visible queries**  E`getByText`, `getByRole`, `getByLabelText`
    Eover `getByTestId`.
5. **Mock `fetch`** at the global level when testing components that call
   the API.

```tsx
import { render, screen } from "@/test-utils";
import { MyComponent } from "@/components/MyComponent";

describe("MyComponent", () => {
  it("shows greeting", () => {
    render(<MyComponent name="Ada" />);
    expect(screen.getByText("Hello, Ada")).toBeInTheDocument();
  });
});
```

---

## Related Docs

| Topic             | Link                                                             |
| ----------------- | ---------------------------------------------------------------- |
| Testing strategy  | [Testing-Strategy.md](01-Testing-Strategy.md)                       |
| Backend tests     | [Backend-Tests.md](02-Backend-Tests.md)                             |
| Linting & quality | [Linting-and-Quality.md](04-Linting-and-Quality.md)                 |
| UI structure      | [../04-Frontend/01-UI-Structure.md](../04-Frontend/01-UI-Structure.md) |
| Hooks reference   | [../04-Frontend/03-Hooks.md](../04-Frontend/03-Hooks.md)               |
