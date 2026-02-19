# Quickstart

Get the app running locally in under 10 minutes.

---

## Prerequisites

| Tool                   | Minimum version | Install                                         |
| ---------------------- | --------------- | ----------------------------------------------- |
| Node.js                | 22 LTS          | [nodejs.org](https://nodejs.org/)               |
| Python                 | 3.12+           | [python.org](https://www.python.org/)           |
| Poetry _(recommended)_ | latest          | [python-poetry.org](https://python-poetry.org/) |
| Supabase account       | free tier       | [supabase.com](https://supabase.com/)           |

---

## 1. Clone the repo

```bash
git clone https://github.com/nyanham/morning-routine-productivity.git
cd morning-routine-productivity
```

## 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the scripts in the `database/` folder.
3. Copy your **Project URL**, **Anon Key**, and **Service Role Key** from **Settings ↁEAPI**.

## 3. Configure the frontend

```bash
cd frontend
npm install
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 4. Configure the backend

```bash
cd ../backend
poetry install        # or: pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env`:

```env
SUPABASE_URL=<your_supabase_url>
SUPABASE_KEY=<your_service_role_key>
```

## 5. (Optional) Set up pre-commit hooks

```bash
# Activate the virtual environment first
# Windows
backend\.venv\Scripts\Activate.ps1
# macOS / Linux
source backend/.venv/bin/activate

pre-commit install
pre-commit install --hook-type commit-msg
```

## 6. Start the services

Open **two terminals**:

```bash
# Terminal 1  — Backend
cd backend
poetry run uvicorn app.main:app --reload
# ↁEhttp://localhost:8000
```

```bash
# Terminal 2  — Frontend
cd frontend
npm run dev
# ↁEhttp://localhost:3000
```

## Docker alternative

If you prefer containers:

```bash
cp .env.example .env   # edit with your Supabase credentials
docker-compose up -d
```

## Verify it works

| Check          | URL                                                                   |
| -------------- | --------------------------------------------------------------------- |
| Frontend       | [http://localhost:3000](http://localhost:3000)                        |
| Backend health | [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI) |

---

## Related Docs

| Topic           | Link                                                           |
| --------------- | -------------------------------------------------------------- |
| Project map     | [Project-Map.md](03-Project-Map.md)                            |
| Configuration   | [Configuration.md](../01-Getting-Started/02-Configuration.md)  |
| System overview | [System-Overview.md](../02-Architecture/01-System-Overview.md) |
