# Running Services

All the ways to start the application: local processes, Docker Compose, and AWS Lambda (local emulation).

---

## Option 1  ELocal processes (recommended for development)

This is the fastest feedback loop. Both services reload on file changes.

### Start the backend

```bash
cd backend
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Start the frontend

In a **second terminal**:

```bash
cd frontend
npm run dev
```

### Access points

| Service     | URL                                                        |
| ----------- | ---------------------------------------------------------- |
| Frontend    | [http://localhost:3000](http://localhost:3000)             |
| Backend API | [http://localhost:8000](http://localhost:8000)             |
| Swagger UI  | [http://localhost:8000/docs](http://localhost:8000/docs)   |
| ReDoc       | [http://localhost:8000/redoc](http://localhost:8000/redoc) |

---

## Option 2  EDocker Compose

Runs both services in containers. Useful for testing the full stack without installing runtimes locally.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose installed.
- A root-level `.env` file (see [Configuration.md](./02-Configuration.md#docker-compose-variables)).

### Start

```bash
# Copy the template and fill in your values
cp .env.example .env

# Start all services (detached)
docker-compose up -d
```

### Common commands

```bash
# View logs (follow mode)
docker-compose logs -f

# View logs for one service
docker-compose logs -f backend

# Rebuild after dependency changes
docker-compose up -d --build

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Access points

Same as local  E`http://localhost:3000` (frontend) and `http://localhost:8000` (backend).

### How networking works

Inside Docker Compose, the frontend container reaches the backend via the service name:

```
NEXT_PUBLIC_API_URL=http://backend:8000/api
```

From your browser, you still use `localhost` because Docker maps the container ports.

---

## Option 3  EAWS SAM local (Lambda emulation)

SAM CLI can emulate the Lambda + API Gateway environment on your machine. This is useful to test the exact runtime that runs in production.

### Prerequisites

- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) installed.
- Docker running (SAM uses it to build and run the Lambda container).

### Start the local API

```bash
cd backend

# Build the Lambda package
sam build

# Start the emulated API Gateway
sam local start-api --env-vars .env.json
```

Create a `backend/.env.json` for SAM local if needed:

```json
{
  "MorningRoutineFunction": {
    "SUPABASE_URL": "https://your-project.supabase.co",
    "SUPABASE_KEY": "your-service-role-key",
    "ENVIRONMENT": "development",
    "CORS_ORIGINS": "http://localhost:3000"
  }
}
```

### Invoke a single function

```bash
sam local invoke MorningRoutineFunction -e events/get-routines.json
```

> SAM local start-api has cold starts on every request. For day-to-day development, Option 1 (uvicorn) is faster.

---

## Running backend scripts

### Download the sample dataset (optional)

```bash
cd backend
poetry run python scripts/download_dataset.py
```

Requires `KAGGLE_USERNAME` and `KAGGLE_KEY` in `backend/.env`.

### Import CSV data via the API

Once the backend is running, you can import the sample CSVs through the `/api/import/csv` endpoint or use the frontend's import UI.

---

## Quick reference

| Goal                      | Command                                                  |
| ------------------------- | -------------------------------------------------------- |
| Start backend (dev)       | `cd backend && poetry run uvicorn app.main:app --reload` |
| Start frontend (dev)      | `cd frontend && npm run dev`                             |
| Start everything (Docker) | `docker-compose up -d`                                   |
| Stop Docker services      | `docker-compose down`                                    |
| Rebuild Docker images     | `docker-compose up -d --build`                           |
| SAM local API             | `cd backend && sam build && sam local start-api`         |
| Run backend tests         | `cd backend && poetry run pytest -v`                     |
| Run frontend tests        | `cd frontend && npm test`                                |
| Lint backend              | `cd backend && poetry run ruff check .`                  |
| Lint frontend             | `cd frontend && npm run lint`                            |

---

## Related Docs

| Topic           | Link                                                           |
| --------------- | -------------------------------------------------------------- |
| System overview | [System-Overview.md](../02-Architecture/01-System-Overview.md) |
| Testing         | [Testing-Strategy.md](../08-Testing/01-Testing-Strategy.md)    |
| Deployment      | [Deployment.md](../07-Operations/01-Deployment.md)             |
