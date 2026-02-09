# Morning Routine & Productivity Tracker

[![CI](https://github.com/nyanham/morning-routine-productivity/actions/workflows/ci.yml/badge.svg)](https://github.com/nyanham/morning-routine-productivity/actions/workflows/ci.yml)
[![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit)](https://github.com/pre-commit/pre-commit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.12-green.svg)](https://www.python.org/)

A full-stack application for tracking morning routines and analyzing productivity data with beautiful visualizations.

## 📸 Screenshots

<div align="center">

### Dashboard Overview

![Dashboard](docs/images/dashboard.png)
_Interactive dashboard with productivity charts and statistics_

### Data Entry

![Entry Form](docs/images/entry-form.png)
_Log your morning routine and daily productivity metrics_

### Analytics & Charts

![Analytics](docs/images/analytics.png)
_Visualize trends and correlations between habits and productivity_

</div>

> **Note:** Screenshots will be added once the UI is finalized. You can see the live demo at the deployment URL.

## ✨ Features

- 📊 **Interactive Dashboard** - Visualize your productivity trends with Recharts
- 📁 **CSV Import** - Bulk import historical data
- ✏️ **Manual Entry** - Log daily routines and productivity metrics
- 👥 **Multi-user Support** - Secure user authentication
- 🔐 **Row-Level Security** - Data isolation per user
- 📱 **Responsive Design** - Works on desktop and tablet

## 🛠️ Tech Stack

| Layer          | Technology                                     |
| -------------- | ---------------------------------------------- |
| **Frontend**   | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **Backend**    | FastAPI, Python 3.12, Pydantic                 |
| **Database**   | Supabase (PostgreSQL)                          |
| **Auth**       | Supabase Auth (JWT)                            |
| **Charts**     | Recharts                                       |
| **Deployment** | Vercel (Frontend), AWS Lambda (Backend)        |

## 📁 Project Structure

```
morning-routine-productivity/
├── .github/                  # GitHub configuration
│   ├── workflows/           # CI/CD pipelines
│   ├── ISSUE_TEMPLATE/      # Issue templates
│   └── dependabot.yml       # Dependency updates
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities & API client
│   │   └── types/           # TypeScript types
│   └── public/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── core/            # Config & auth
│   │   ├── models/          # Pydantic models
│   │   └── services/        # Business logic
│   └── scripts/             # Utility scripts
├── database/                 # SQL migrations
├── docs/                     # Documentation
└── docker-compose.yml        # Local development
```

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 22+ (LTS)
- [Python](https://www.python.org/) 3.12+
- [Poetry](https://python-poetry.org/) (recommended) or pip
- [Supabase](https://supabase.com/) account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/morning-routine-productivity.git
cd morning-routine-productivity
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the scripts in `/database` folder
3. Copy your project URL and keys from **Settings > API**

### 3. Set Up Frontend

```bash
cd frontend
npm install
```

Copy environment template and edit:

```bash
cp frontend/.env.example frontend/.env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 4. Set Up Backend

```bash
cd backend
poetry install
```

Copy environment template and edit:

```bash
cp backend/.env.example backend/.env
```

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_role_key
```

### 5. Set Up Pre-commit Hooks (Recommended)

```bash
# Windows
backend\.venv\Scripts\Activate.ps1
# Linux/Mac
source backend/.venv/bin/activate

# Install hooks
pre-commit install
pre-commit install --hook-type commit-msg

# Run hooks manually
pre-commit run --all-files
```

### 6. Run the Application

```bash
# Terminal 1 - Backend
cd backend
poetry run uvicorn app.main:app --reload
# API running at http://localhost:8000

# Terminal 2 - Frontend
cd frontend
npm run dev
# App running at http://localhost:3000
```

## 🐳 Docker (Alternative)

```bash
# Copy environment file
cp .env.example .env
# Edit .env with your Supabase credentials

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📊 API Documentation

Once the backend is running, visit:

- **Swagger UI**: <http://localhost:8000/docs>
- **ReDoc**: <http://localhost:8000/redoc>

### Main Endpoints

| Method | Endpoint                 | Description               |
| ------ | ------------------------ | ------------------------- |
| `GET`  | `/api/users/me`          | Get current user          |
| `GET`  | `/api/routines`          | List morning routines     |
| `POST` | `/api/routines`          | Create routine entry      |
| `GET`  | `/api/productivity`      | List productivity entries |
| `POST` | `/api/productivity`      | Create productivity entry |
| `POST` | `/api/import/csv`        | Import CSV data           |
| `GET`  | `/api/analytics/summary` | Get analytics summary     |
| `GET`  | `/api/analytics/charts`  | Get chart data            |

## 🧪 Testing & Linting

### Running Tests

```bash
# Backend
cd backend
poetry run pytest -v

# Frontend
cd frontend
npm test
```

### Test Structure

```
backend/tests/
├── conftest.py             # Fixtures and mocks
├── api/                    # API endpoint tests
│   ├── test_main.py        # Health endpoints
│   ├── test_routines.py    # Routines CRUD
│   ├── test_productivity.py
│   └── test_analytics.py
├── models/
│   └── test_models.py      # Pydantic validation
└── services/
    ├── test_routine_service.py
    └── test_productivity_service.py

frontend/src/
├── __tests__/
│   ├── components/         # Component tests
│   │   └── StatsCard.test.tsx
│   └── lib/                # Utility tests
│       ├── api.test.ts
│       └── utils.test.ts
└── test-utils.tsx          # Test helpers & factories
```

### Pre-commit (Recommended)

```bash
# Run all checks on staged files
pre-commit run

# Run all checks on all files
pre-commit run --all-files
```

### Linting

```bash
# Frontend
cd frontend
npm run lint          # ESLint
npm run format        # Prettier
npm run typecheck     # TypeScript

# Backend
cd backend
poetry run ruff check .   # Linting
poetry run ruff format .  # Formatting
```

## 🚢 Deployment

### Frontend (Vercel)

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variables
4. Deploy!

### Backend (AWS Lambda via SAM)

The backend deploys to AWS Lambda using the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) and the Mangum adapter.

**Prerequisites:** AWS CLI configured, SAM CLI installed.

```bash
cd backend

# Build the Lambda package
sam build

# Deploy (first time — interactive guided setup)
sam deploy --guided

# Deploy (subsequent — uses samconfig.toml defaults)
sam deploy

# Deploy to a specific environment
sam deploy --config-env staging
sam deploy --config-env prod
```

**Required environment variables** (set via SAM parameters or AWS console):

| Variable       | Description                               |
| -------------- | ----------------------------------------- |
| `SUPABASE_URL` | Supabase project URL                      |
| `SUPABASE_KEY` | Supabase service role key                 |
| `CORS_ORIGINS` | Comma-separated allowed origins           |
| `ENVIRONMENT`  | `development`, `staging`, or `production` |

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for the full deployment guide.

### Other Backend Options

- **Docker** — Use the included `Dockerfile` for container-based hosting
- **Railway / Render** — Deploy the Docker image or connect the repo directly

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend as a Service
- [Vercel](https://vercel.com) - Frontend hosting
- [FastAPI](https://fastapi.tiangolo.com) - Python web framework
- [Next.js](https://nextjs.org) - React framework

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/nyanham">Rafael Jyo Kondo</a>
</p>
