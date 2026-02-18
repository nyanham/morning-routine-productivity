# Styling

> Tailwind CSS v4 configuration, design tokens, and component classes.

---

## Stack

| Layer          | Technology                | File                        |
| -------------- | ------------------------- | --------------------------- |
| Utility engine | Tailwind CSS 4.x          | `postcss.config.js`         |
| Theme tokens   | `@theme` directive        | `src/app/globals.css`       |
| Legacy config  | JS config (v3)            | `tailwind.config.js`        |
| Class merging  | `clsx` + `tailwind-merge` | `src/lib/utils.ts`          |
| Font           | Inter                     | Google Fonts (preconnected) |

> **Note:** The project defines colours in **both** `tailwind.config.js` (v3
> format) and `globals.css` `@theme` (v4 format). The `@theme` block is the
> source of truth at runtime for Tailwind v4.

---

## Design Tokens

### Colours

Defined in `globals.css` via the `@theme` directive:

```css
@theme {
  /* Primary  EBlue */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb; /* ↁEmain brand colour */
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;

  /* Accent  EPurple / Fuchsia */
  --color-accent-50: #fdf4ff;
  --color-accent-100: #fae8ff;
  --color-accent-200: #f5d0fe;
  --color-accent-300: #f0abfc;
  --color-accent-400: #e879f9;
  --color-accent-500: #d946ef;
  --color-accent-600: #c026d3;
  --color-accent-700: #a21caf;
  --color-accent-800: #86198f;
  --color-accent-900: #701a75;
}
```

In templates, use them as regular Tailwind classes:

```html
<button class="bg-primary-600 hover:bg-primary-700 text-white">Save</button>
<span class="text-accent-500">Highlight</span>
```

### Background Gradient

The `<body>` uses a subtle top-to-bottom gradient:

```css
:root {
  --foreground-rgb: 15, 23, 42; /* slate-900 */
  --background-start-rgb: 248, 250, 252; /* slate-50  */
  --background-end-rgb: 241, 245, 249; /* slate-100 */
}
```

### Typography

| Property    | Value                                                |
| ----------- | ---------------------------------------------------- |
| Font family | Inter, system-ui, sans-serif                         |
| Loading     | Google Fonts with `preconnect`                       |
| Base layer  | `@layer base { html { font-family: 'Inter', ... } }` |

---

## Component Classes

Reusable class bundles are defined in the `@layer components` block inside
`globals.css`. Use them directly in JSX:

### `.btn-primary`

```css
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700
         rounded-lg px-4 py-2 font-medium text-white transition-colors;
}
```

```tsx
<button className="btn-primary">Save Changes</button>
<Link href="/auth/signup" className="btn-primary px-8 py-3 text-lg">Get Started</Link>
```

### `.btn-secondary`

```css
.btn-secondary {
  @apply rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-800
         transition-colors hover:bg-slate-300;
}
```

### `.card`

```css
.card {
  @apply rounded-xl border border-slate-200 bg-white p-6 shadow-sm;
}
```

Used by `StatsCard`, all chart components, and the CSV preview table.

### `.input`

```css
.input {
  @apply focus:ring-primary-500 focus:border-primary-500
         w-full rounded-lg border border-slate-300 px-4 py-2
         transition-all outline-none focus:ring-2;
}
```

### `.label`

```css
.label {
  @apply mb-1 block text-sm font-medium text-slate-700;
}
```

---

## Utility: `cn()`

> Source: `src/lib/utils.ts`

Combines `clsx` (conditional class composition) with `tailwind-merge`
(deduplicates conflicting Tailwind utilities):

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Usage:**

```tsx
<Link
  className={cn(
    'flex items-center gap-3 rounded-lg px-4 py-3 transition-colors',
    isActive
      ? 'bg-primary-600 text-white'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  )}
>
```

---

## Colour Utility Helpers

> Source: `src/lib/utils.ts`

Two functions map a numeric productivity score (1 E0) to semantic colours:

```typescript
// Returns a text colour class
getProductivityColor(score: number): string
// score >= 8 ↁE'text-green-600'
// score >= 6 ↁE'text-yellow-600'
// score >= 4 ↁE'text-orange-600'
// else       ↁE'text-red-600'

// Returns a background colour class
getProductivityBgColor(score: number): string
// score >= 8 ↁE'bg-green-100'
// ...etc
```

---

## Common Patterns

### Page Headers

```tsx
<h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
<p className="mt-1 text-slate-500">Your productivity overview</p>
```

### Grid Layouts

```tsx
{/* Stats cards  E4 columns on desktop */}
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
  <StatsCard ... />
</div>

{/* Charts  E2 columns on desktop */}
<div className="mt-8 grid gap-6 lg:grid-cols-2">
  <ProductivityChart data={...} />
  <RoutineBarChart data={...} />
</div>
```

### Form Groups

```tsx
<div className="space-y-4">
  <div>
    <label className="label">Email</label>
    <input className="input" type="email" />
  </div>
  <div>
    <label className="label">Password</label>
    <input className="input" type="password" />
  </div>
  <button className="btn-primary w-full">Sign In</button>
</div>
```

### Error Text

```tsx
{
  error && <p className="text-sm text-red-500">{error}</p>;
}
```

---

## Chart Colour Palette

Charts use a consistent hand-picked palette across all visualisations:

| Variable         | Hex               | Usage                   |
| ---------------- | ----------------- | ----------------------- |
| Primary blue     | `#3b82f6`         | Productivity score line |
| Emerald          | `#10b981`         | Energy level line       |
| Amber            | `#f59e0b`         | Morning mood line       |
| Indigo           | `#6366f1`         | Sleep duration bars     |
| Green            | `#22c55e`         | Exercise bars           |
| Purple           | `#a855f7`         | Meditation bars         |
| Red ↁEBlue (pie) | 5-colour gradient | Sleep distribution      |

---

## Responsive Breakpoints

The project uses Tailwind's default breakpoints:

| Prefix | Min-width | Typical use                     |
| ------ | --------- | ------------------------------- |
| `sm`   | 640px     |  E                              |
| `md`   | 768px     | 2-column grids                  |
| `lg`   | 1024px    | 4-column stats, 2-column charts |
| `xl`   | 1280px    | Max-width containers            |

The dashboard layout has a **fixed 256px sidebar** (`w-64`), so the primary
content area effectively starts at `md` + sidebar width. The landing page uses
`max-w-7xl` centred containers.

---

## Related Docs

| Topic         | Link                                                                             |
| ------------- | -------------------------------------------------------------------------------- |
| Components    | [Components.md](02-Components.md)                                                   |
| UI structure  | [UI-Structure.md](01-UI-Structure.md)                                               |
| Configuration | [../01-Getting-Started/02-Configuration.md](../01-Getting-Started/02-Configuration.md) |
