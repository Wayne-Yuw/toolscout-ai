# ToolScout AI

> AI-powered tool analysis assistant for content creators

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📖 Project Overview

ToolScout AI is an intelligent assistant designed for tool review content creators. It analyzes tool websites, generates multi-angle audience insights, and produces ready-to-use short video scripts.

**Core Value:**
> Input tool URL or name → Get audience analysis in 10 seconds → Select angle → Generate video script in one click

## 🏗️ Project Structure

```
toolscout-ai/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js 15 App Router
│   │   │   └── [locale]/    # Locale-based routing
│   │   │       ├── layout.tsx
│   │   │       └── page.tsx
│   │   ├── components/      # Reusable components
│   │   │   └── LanguageSwitcher.tsx
│   │   ├── i18n/            # Internationalization
│   │   │   ├── config.ts    # i18n configuration
│   │   │   ├── request.ts   # Server-side i18n setup
│   │   │   └── messages/    # Translation files
│   │   │       ├── en.json  # English translations
│   │   │       └── zh.json  # Chinese translations
│   │   ├── lib/             # Utility functions
│   │   ├── types/           # TypeScript types
│   │   ├── middleware.ts    # Next.js middleware for i18n
│   │   └── globals.css      # Global styles
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core configuration
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── main.py         # FastAPI entry point
│   ├── tests/              # Backend tests
│   └── requirements.txt
│
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
├── .gitignore
├── README.md
└── docker-compose.yml       # Docker configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **Python** >= 3.10
- **PostgreSQL** >= 14.x (or use Docker)

### 1. Clone Repository

```bash
git clone <repository-url>
cd toolscout-ai
```

### 2. Frontend Setup (Vercel-ready)

```bash
cd toolscout-ai
npm install
npm run dev
```

Frontend will be available at: http://localhost:3000. The app includes built-in Serverless API routes under `/api/*` and can be deployed to Vercel without a separate backend. See [Vercel Deploy](./docs/VERCEL_DEPLOY.md).

### 3. Optional: Legacy Python Backend

The repository still contains a FastAPI backend for reference. It's optional and not required for Vercel deployment, since analysis now runs in Next.js API routes.

### 4. Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

**Frontend (.env.local):**
```
# If you want to proxy API to an external backend, set NEXT_PUBLIC_API_URL to that base URL.
# Otherwise, leave it unset to use Next.js Serverless API routes.

# LLM keys (optional, either one enables real analysis)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=...
```

**Backend (.env):**
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/toolscout

# API Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_CSE_API_KEY=your_google_cse_key
GOOGLE_CSE_ENGINE_ID=your_engine_id

# Redis
REDIS_URL=redis://localhost:6379
```

## 🌍 Internationalization (i18n)

ToolScout AI supports multiple languages out of the box:

**Supported Languages:**
- 🇨🇳 Chinese (中文) - Default
- 🇺🇸 English

**Features:**
- Language switcher in the top-right corner
- Automatic locale detection
- URL-based locale routing (`/zh/*`, `/en/*`)
- Complete translation coverage for UI and content

**Adding a New Language:**

1. Add locale to configuration in `frontend/src/i18n/config.ts`:
```typescript
export const locales = ['en', 'zh', 'fr'] as const; // Add 'fr' for French
```

2. Create translation file: `frontend/src/i18n/messages/fr.json`

3. Update locale names and flags in config

## 📦 Tech Stack

### Frontend
- **Framework:** Next.js 15 (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand
- **HTTP Client:** Axios
- **i18n:** next-intl

### Backend
- **Framework:** FastAPI
- **Language:** Python 3.10+
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Cache:** Redis
- **Task Queue:** Celery (optional)

### External Services
- **Search:** Google Custom Search API / Brave Search API
- **Web Scraping:** Jina AI Reader / Firecrawl
- **LLM:** OpenAI GPT-4o / Anthropic Claude 3.5 Sonnet

## 🔧 Development

### Frontend Development

```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

### Backend Development

```bash
cd backend
uvicorn app.main:app --reload    # Start with hot reload
pytest                            # Run tests
black .                           # Format code
mypy .                            # Type checking
```

### Database Migrations

```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## 🐳 Docker Deployment

```bash
docker-compose up -d
```

This will start:
- Frontend (port 3000)
- Backend (port 8000)
- PostgreSQL (port 5432)
- Redis (port 6379)

## 📚 Documentation

- [Product Design Document](./docs/product-design.md)
- [API Documentation](http://localhost:8000/docs) (when backend is running)
- [Frontend Components](./docs/components.md)
- [Development Guide](./docs/development.md)

## 🗺️ Roadmap

### Phase 1: MVP (Weeks 1-3)
- [ ] URL input and analysis
- [ ] Audience segmentation
- [ ] Script generation (basic style)
- [ ] History tracking

### Phase 2: Enhanced Experience (Weeks 4-7)
- [ ] Intelligent search
- [ ] Multiple script styles
- [ ] Platform adaptation (TikTok, XiaoHongShu, Bilibili, etc.)
- [ ] Export functionality (Markdown, JSON)

### Phase 3: Advanced Features (Weeks 8+)
- [ ] Page preview with screenshots
- [ ] Custom style training
- [ ] Tool recommendations
- [ ] Batch analysis
- [ ] Chrome extension

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) first.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 📧 Contact

- **Author:** ToolScout Team
- **Email:** hello@toolscout.ai
- **Website:** https://toolscout.ai

---

**Built with ❤️ for content creators**
