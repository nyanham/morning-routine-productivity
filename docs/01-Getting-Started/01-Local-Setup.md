# Local Setup

Step-by-step instructions to get the full development environment running on your machine.

---

## Prerequisites

### Required software

| Software    | Version | Purpose                      | Install                                                           |
| ----------- | ------- | ---------------------------- | ----------------------------------------------------------------- |
| **Node.js** | 22+ LTS | Frontend runtime             | [nodejs.org](https://nodejs.org/)                                 |
| **npm**     | 10+     | Package management           | Bundled with Node.js                                              |
| **Python**  | 3.12+   | Backend runtime              | [python.org](https://www.python.org/downloads/)                   |
| **Poetry**  | 1.7+    | Python dependency management | [python-poetry.org](https://python-poetry.org/docs/#installation) |
| **Git**     | 2.40+   | Version control              | [git-scm.com](https://git-scm.com/downloads)                      |

### Accounts

| Service      | Required | Purpose                     |
| ------------ | -------- | --------------------------- |
| **Supabase** | Yes      | Database and authentication |
| **GitHub**   | Yes      | Source control              |
| **Vercel**   | Optional | Frontend deployment         |
| **AWS**      | Optional | Backend deployment (Lambda) |

---

## 1. Clone the repository

```bash
git clone https://github.com/nyanham/morning-routine-productivity.git
cd morning-routine-productivity
```

---

## 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com) (free tier works).
2. Wait for the project to initialize (~2 minutes).
3. Open **SQL Editor** and run the contents of `database/schema.sql`.
4. Go to **Settings ↁEAPI** and copy these three values:
   - **Project URL**  Ee.g. `https://abc123.supabase.co`
   - **anon (public) key**  Eused by the frontend
   - **service_role key**  Eused by the backend (keep this secret)

---

## 3. Set up the frontend

```bash
cd frontend
npm install
```

Create the local environment file:

```bash
cp .env.example .env.local
```

Edit `frontend/.env.local` with the values from Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 4. Set up the backend

```bash
cd ../backend
poetry install
```

Create the local environment file:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
ENVIRONMENT=development
DEBUG=true
```

---

## 5. Set up pre-commit hooks (recommended)

Pre-commit hooks run linting, formatting, and type checks automatically on every commit.

```bash
cd ..  # back to project root

# Activate the Python virtual environment
# Windows
backend\.venv\Scripts\Activate.ps1
# macOS / Linux
source backend/.venv/bin/activate

# Install hooks
pip install pre-commit
pre-commit install
pre-commit install --hook-type commit-msg
```

Verify the hooks are working:

```bash
pre-commit run --all-files
```

---

## 6. Verify everything works

Start both services (see [Running-Services.md](./03-Running-Services.md) for full details):

```bash
# Terminal 1  EBackend
cd backend
poetry run uvicorn app.main:app --reload
```

```bash
# Terminal 2  EFrontend
cd frontend
npm run dev
```

| Check           | URL                                                      | Expected             |
| --------------- | -------------------------------------------------------- | -------------------- |
| Frontend        | [http://localhost:3000](http://localhost:3000)           | Landing / login page |
| Swagger docs    | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive API docs |
| Health endpoint | [http://localhost:8000/](http://localhost:8000/)         | JSON response        |

---

## Troubleshooting

### "Poetry not found"

Make sure Poetry is on your `PATH`:

```bash
# macOS / Linux
export PATH="$HOME/.local/bin:$PATH"

# Or reinstall
curl -sSL https://install.python-poetry.org | python3 -
```

### "Module not found" in the frontend

Clear the Next.js cache and reinstall:

```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

### "Supabase connection failed"

1. Verify your `.env` / `.env.local` values match the Supabase dashboard.
2. Confirm the Supabase project is active (not paused).
3. Make sure you ran `database/schema.sql` in the SQL Editor.

### Pre-commit hooks failing

```bash
# Update hooks to latest versions
pre-commit autoupdate

# Run manually to see detailed errors
pre-commit run --all-files
```

---

## Related Docs

| Topic            | Link                                          |
| ---------------- | --------------------------------------------- |
| Configuration    | [Configuration.md](02-Configuration.md)       |
| Running services | [Running-Services.md](03-Running-Services.md) |
