# Environment Variables

> Every environment variable used across the frontend, backend, and
> infrastructure, in one place.

---

## Backend (`.env`)

| Variable            | Required | Default                            | Description                                                                        |
| ------------------- | :------: | ---------------------------------- | ---------------------------------------------------------------------------------- |
| `SUPABASE_URL`      |   Yes    |  —                                  | Supabase project URL (e.g. `https://xxxx.supabase.co`)                             |
| `SUPABASE_KEY`      |   Yes    |  —                                  | Supabase **service role** key (server-side only)                                   |
| `APP_NAME`          |    No    | `Morning Routine Productivity API` | Display name shown on `/docs`                                                      |
| `DEBUG`             |    No    | `false`                            | Enable debug-level logging                                                         |
| `ENVIRONMENT`       |    No    | `development`                      | `development`, `staging`, or `production`  — controls docs visibility and behaviour |
| `CORS_ORIGINS`      |    No    | `http://localhost:3000`            | Allowed origins (comma-separated or JSON array)                                    |
| `CORS_ORIGIN_REGEX` |    No    | `https://.*\.vercel\.app`          | Regex pattern for additional allowed origins (e.g. Vercel previews)                |

### Example

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJhbGciOi...
DEBUG=true
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000
```

---

## Frontend (`.env.local`)

| Variable                        | Required | Default                 | Description                                              |
| ------------------------------- | :------: | ----------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      |   Yes    |  —                       | Supabase project URL (public, embedded in client bundle) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` |   Yes    |  —                       | Supabase **anon** key (public, safe for the browser)     |
| `NEXT_PUBLIC_API_URL`           |    No    | `http://localhost:8000` | Backend API base URL                                     |

### Example

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Docker Compose

`docker-compose.yml` passes host env vars through to each container:

| Container  | Injected Variables                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| `frontend` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL` (set to `http://backend:8000/api`) |
| `backend`  | `SUPABASE_URL`, `SUPABASE_KEY`, `DEBUG=true`                                                                          |

Create a root `.env` file so Compose can interpolate the values:

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJhbGciOi...
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

---

## AWS SAM (`template.yaml`)

Parameters injected as Lambda environment variables:

| Parameter         | Maps To             | Default                   |
| ----------------- | ------------------- | ------------------------- |
| `Environment`     | `ENVIRONMENT`       | `development`             |
| `SupabaseUrl`     | `SUPABASE_URL`      |  —                         |
| `SupabaseKey`     | `SUPABASE_KEY`      |  —                         |
| `CorsOrigins`     | `CORS_ORIGINS`      | `http://localhost:3000`   |
| `CorsOriginRegex` | `CORS_ORIGIN_REGEX` | `https://.*\.vercel\.app` |

Values are supplied via `samconfig.toml` or `--parameter-overrides` at deploy
time. `SupabaseUrl` and `SupabaseKey` are marked `NoEcho: true` so they never
appear in CloudFormation console output.

---

## Security Reminders

- **Never** commit `.env`, `.env.local`, or any file containing real keys.
- The **service role key** (`SUPABASE_KEY`) bypasses RLS  — keep it server-side.
- The **anon key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is safe for the browser
  because RLS policies enforce access control.
- Rotate credentials periodically and after any suspected compromise.

---

## Related Docs

| Topic         | Link                                                                             |
| ------------- | -------------------------------------------------------------------------------- |
| Local setup   | [../01-Getting-Started/01-Local-Setup.md](../01-Getting-Started/01-Local-Setup.md)     |
| Configuration | [../01-Getting-Started/02-Configuration.md](../01-Getting-Started/02-Configuration.md) |
| Deployment    | [../07-Operations/01-Deployment.md](../07-Operations/01-Deployment.md)                 |
| Security      | [../07-Operations/04-Security.md](../07-Operations/04-Security.md)                     |
| Glossary      | [Glossary.md](04-Glossary.md)                                                       |
