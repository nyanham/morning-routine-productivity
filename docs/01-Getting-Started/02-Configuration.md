# Configuration

All environment variables, where they live, and how they are used across environments.

---

## Environment files

The project uses separate `.env` files for each service. All are gitignored.

```
morning-routine-productivity/
├── .env.example              ↁEDocker Compose (root-level template)
├── frontend/
━E  ├── .env.example          ↁEFrontend template
━E  └── .env.local            ↁEYour local frontend values (gitignored)
└── backend/
    ├── .env.example          ↁEBackend template
    └── .env                  ↁEYour local backend values (gitignored)
```

> Copy the `.example` file, rename it, and fill in your values. Never commit real credentials.

---

## Frontend variables

Set in `frontend/.env.local` (local) or in the Vercel dashboard (production).

| Variable                        | Required | Default | Description                                            |
| ------------------------------- | -------- | ------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      |  E      | Supabase project URL                                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      |  E      | Supabase anonymous (public) key                        |
| `NEXT_PUBLIC_API_URL`           | Yes      |  E      | Backend API base URL (`http://localhost:8000` locally) |

All frontend variables are prefixed with `NEXT_PUBLIC_` so Next.js exposes them to the browser bundle. Do **not** put secrets here.

---

## Backend variables

Set in `backend/.env` (local) or injected via SAM parameters / Lambda environment (production).

| Variable            | Required | Default                   | Description                                                         |
| ------------------- | -------- | ------------------------- | ------------------------------------------------------------------- |
| `SUPABASE_URL`      | Yes      |  E                        | Supabase project URL                                                |
| `SUPABASE_KEY`      | Yes      |  E                        | Supabase **service role** key (secret  Enever expose to the client) |
| `ENVIRONMENT`       | No       | `development`             | `development`, `staging`, or `production`                           |
| `DEBUG`             | No       | `false`                   | Enable debug-level logging                                          |
| `CORS_ORIGINS`      | No       | `http://localhost:3000`   | Allowed origins  Ecomma-separated or JSON array                     |
| `CORS_ORIGIN_REGEX` | No       | `https://.*\.vercel\.app` | Regex for wildcard origin matching (e.g. Vercel preview deploys)    |
| `KAGGLE_USERNAME`   | No       |  E                        | Kaggle username (only for the dataset download script)              |
| `KAGGLE_KEY`        | No       |  E                        | Kaggle API key (only for the dataset download script)               |

### CORS origins format

The `CORS_ORIGINS` variable accepts two formats:

```bash
# Comma-separated (simpler)
CORS_ORIGINS=http://localhost:3000,https://my-app.vercel.app

# JSON array (also supported)
CORS_ORIGINS=["http://localhost:3000","https://my-app.vercel.app"]
```

For Vercel preview deploys (which have dynamic subdomains), use `CORS_ORIGIN_REGEX`:

```bash
CORS_ORIGIN_REGEX=https://.*\.vercel\.app
```

---

## Docker Compose variables

When using `docker-compose up`, the root `.env` file feeds variables to both services. Copy from the template:

```bash
cp .env.example .env
```

Contents:

```env
# Supabase (shared)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key

# API URL (Docker internal networking)
NEXT_PUBLIC_API_URL=http://backend:8000/api
```

> Inside Docker Compose, the frontend reaches the backend via the service name `backend`, not `localhost`.

---

## AWS Lambda / SAM variables

When deploying the backend to Lambda, variables are set as SAM parameters in `backend/samconfig.toml` or passed via `--parameter-overrides`:

| SAM Parameter     | Maps to env var     | Description                 |
| ----------------- | ------------------- | --------------------------- |
| `Environment`     | `ENVIRONMENT`       | Deployment environment name |
| `SupabaseUrl`     | `SUPABASE_URL`      | Supabase project URL        |
| `SupabaseKey`     | `SUPABASE_KEY`      | Supabase service role key   |
| `CorsOrigins`     | `CORS_ORIGINS`      | Allowed CORS origins        |
| `CorsOriginRegex` | `CORS_ORIGIN_REGEX` | Regex for wildcard CORS     |

Example override on deploy:

```bash
sam deploy --parameter-overrides \
  "SupabaseUrl=https://abc.supabase.co" \
  "SupabaseKey=eyJ..." \
  "CorsOrigins=https://my-app.vercel.app" \
  "Environment=production"
```

---

## How settings are loaded

The backend uses Pydantic `BaseSettings` (in `backend/app/core/config.py`) to load and validate environment variables at startup:

- Locally: values come from `backend/.env`.
- On Lambda: values are injected as environment variables by the SAM template.
- Unknown variables are silently ignored (`extra = "ignore"`).
- Settings are cached via `@lru_cache` so they are only parsed once per process.

---

## Security reminders

- **Never commit** `.env`, `.env.local`, or any file containing real keys.
- Use the **anon key** for the frontend and the **service role key** for the backend only.
- In production, store secrets with your platform's secrets manager (Vercel Environment Variables, AWS Systems Manager Parameter Store, etc.).
- Apply least-privilege IAM policies when deploying to AWS.

---

## Related Docs

| Topic            | Link                                               |
| ---------------- | -------------------------------------------------- |
| Running services | [Running-Services.md](03-Running-Services.md)      |
| Deployment       | [Deployment.md](../07-Operations/01-Deployment.md) |
