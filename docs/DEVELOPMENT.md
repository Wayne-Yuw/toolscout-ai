# Development Guide

## Project Structure Overview

```
toolscout-ai/
├── frontend/              # Next.js frontend
│   ├── src/
│   │   ├── app/          # Next.js 15 App Router pages
│   │   ├── components/   # Reusable React components
│   │   ├── lib/          # Utility functions and API client
│   │   ├── types/        # TypeScript type definitions
│   │   └── styles/       # Global styles
│   └── public/           # Static assets
│
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/         # API route handlers
│   │   ├── core/        # Core configuration (config, database)
│   │   ├── models/      # SQLAlchemy database models
│   │   ├── schemas/     # Pydantic schemas for validation
│   │   ├── services/    # Business logic layer
│   │   └── main.py      # FastAPI application entry point
│   └── tests/           # Backend tests
│
├── docs/                # Documentation
└── scripts/             # Utility scripts
```

---

## Development Workflow

### 1. Feature Development

When developing a new feature, follow this workflow:

```
1. Create feature branch: git checkout -b feature/feature-name
2. Implement frontend UI (if needed)
3. Implement backend API (if needed)
4. Write tests
5. Test locally
6. Create pull request
```

### 2. Code Style

**Frontend (TypeScript/React):**
- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Follow ESLint rules: `npm run lint`

**Backend (Python):**
- Follow PEP 8 style guide
- Use type hints
- Format with Black: `black .`
- Check types with mypy: `mypy .`

---

## Adding New Features

### Frontend: Adding a New Page

```typescript
// 1. Create new route file
// frontend/src/app/new-page/page.tsx

export default function NewPage() {
  return (
    <div>
      <h1>New Page</h1>
    </div>
  )
}
```

### Backend: Adding a New API Endpoint

```python
# 1. Create route file
# backend/app/api/new_route.py

from fastapi import APIRouter
from app.schemas import SomeSchema

router = APIRouter()

@router.get("/")
async def get_data():
    return {"message": "Hello"}

# 2. Register in main.py
# from app.api import new_route
# app.include_router(new_route.router, prefix="/api/v1/new", tags=["New"])
```

### Adding a New Database Model

```python
# 1. Define model in backend/app/models/__init__.py

class NewModel(Base):
    __tablename__ = "new_table"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

# 2. Create migration
# cd backend
# alembic revision --autogenerate -m "Add new model"
# alembic upgrade head
```

---

## Testing

### Frontend Tests

```bash
cd frontend
npm run test
npm run test:watch  # Watch mode
```

### Backend Tests

```bash
cd backend
pytest                    # Run all tests
pytest -v                # Verbose output
pytest tests/test_api/   # Run specific test directory
pytest --cov=app         # With coverage report
```

---

## Database Management

### Create Migration

```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
```

### Apply Migration

```bash
alembic upgrade head
```

### Rollback Migration

```bash
alembic downgrade -1
```

### View Migration History

```bash
alembic history
```

---

## API Development

### API Documentation

When the backend is running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Testing API Endpoints

```bash
# Using curl
curl -X GET http://localhost:8000/health

# Using httpie (recommended)
http GET http://localhost:8000/health
```

---

## Environment Variables

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)

```bash
# Required
DATABASE_URL=postgresql://user:pass@localhost:5432/toolscout
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Optional
REDIS_URL=redis://localhost:6379/0
DEBUG=True
```

---

## Common Tasks

### Install New Package

**Frontend:**
```bash
cd frontend
npm install package-name
```

**Backend:**
```bash
cd backend
pip install package-name
echo "package-name==x.x.x" >> requirements.txt
```

### Update Dependencies

**Frontend:**
```bash
npm update
```

**Backend:**
```bash
pip install --upgrade -r requirements.txt
```

### Clear Cache

**Frontend:**
```bash
rm -rf .next node_modules
npm install
```

**Backend:**
```bash
find . -type d -name __pycache__ -exec rm -r {} +
```

---

## Git Workflow

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test updates
- `chore`: Build/config updates

**Example:**
```
feat(api): add tool search endpoint

Implement intelligent search with AI ranking
- Add Google CSE integration
- Add AI-powered result ranking
- Add caching for search results

Closes #123
```

---

## Troubleshooting

### Frontend Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Backend Import Errors

```bash
# Make sure you're in the virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall packages
pip install -r requirements.txt
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Check connection string
echo $DATABASE_URL
```

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Need help? Check the [Quick Start Guide](./QUICK_START.md) or open an issue!**
