# Contributing to Morning Routine & Productivity Tracker

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

Please be respectful and constructive in all interactions. We're all here to learn and build something great together.

## Getting Started

### Prerequisites

- Node.js 22+
- Python 3.10+
- Poetry (Python package manager)
- Git

### Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/morning-routine-productivity.git
   cd morning-routine-productivity
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/morning-routine-productivity.git
   ```

4. **Set up Frontend**

   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

5. **Set up Backend**

   ```bash
   cd ../backend
   poetry install
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

6. **Set up Pre-commit Hooks**

   ```bash
   cd ..
   # Activate backend virtual environment
   # Windows:
   backend\.venv\Scripts\Activate.ps1
   # Linux/Mac:
   source backend/.venv/bin/activate

   # Install pre-commit hooks
   pre-commit install
   pre-commit install --hook-type commit-msg
   ```

7. **Set up Database**
   - Create a Supabase project at <https://supabase.com>
   - Run the SQL scripts in `/database` folder

## Development Workflow

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/add-dark-mode`)
- `fix/` - Bug fixes (e.g., `fix/login-redirect`)
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests

### Creating a Branch

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create your branch
git checkout -b feature/your-feature-name
```

### Running the Application

**Frontend:**

```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

**Backend:**

```bash
cd backend
poetry run uvicorn app.main:app --reload
# Runs on http://localhost:8000
```

## Coding Standards

### Frontend (TypeScript/React)

- Use functional components with hooks
- Use TypeScript strict mode
- Follow ESLint configuration
- Use Tailwind CSS for styling
- Keep components small and focused

```typescript
// ✅ Good
const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return (
    <div className="p-4 rounded-lg shadow">
      <h2>{user.name}</h2>
    </div>
  );
};

// ❌ Avoid
function UserCard(props) {
  return <div style={{padding: 16}}>{props.user.name}</div>
}
```

### Backend (Python/FastAPI)

- Follow PEP 8 style guide
- Use type hints everywhere
- Use Pydantic models for validation
- Keep functions focused and small
- Use Ruff for linting and formatting

```python
# ✅ Good
async def get_user(user_id: str) -> UserResponse:
    """Get user by ID."""
    user = await user_service.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ❌ Avoid
def get_user(id):
    user = user_service.get(id)
    return user
```

### Running Linters

**Using Pre-commit (Recommended):**

```bash
# Run all checks on staged files
pre-commit run

# Run all checks on all files
pre-commit run --all-files
```

**Frontend:**

```bash
cd frontend
npm run lint
npm run format:check
npm run typecheck
```

**Backend:**

```bash
cd backend
poetry run ruff check .
poetry run ruff format --check .
```

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting (no code change)
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance tasks

### Examples

```
feat(dashboard): add weekly summary chart
fix(auth): resolve token refresh loop
docs(readme): update setup instructions
chore(deps): update fastapi to 0.115.0
```

## Pull Request Process

1. **Update your branch**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all checks locally**

   ```bash
   # Run pre-commit on all files
   pre-commit run --all-files

   # Build frontend
   cd frontend && npm run build

   # Run backend tests
   cd ../backend && poetry run pytest
   ```

3. **Push your branch**

   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create Pull Request**
   - Use the PR template
   - Link related issues
   - Add screenshots for UI changes
   - Request reviews

5. **Address Review Feedback**
   - Make requested changes
   - Push additional commits
   - Re-request review when ready

### PR Checklist

- [ ] Code follows project style
- [ ] Self-reviewed the code
- [ ] Added/updated tests
- [ ] Updated documentation
- [ ] No new warnings
- [ ] All checks pass

## Questions?

Feel free to open an issue for any questions or concerns!
