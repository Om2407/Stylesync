# StyleSync 🎨

> Transform any website into a living, interactive design system.

StyleSync scrapes any URL and extracts design tokens — colors, typography, and spacing — then generates a Figma-like dashboard where you can lock, edit, and export them.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + TailwindCSS + Framer Motion |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Scraping | Axios + Cheerio |

---

## Features

- **Intelligent Scraping** — Extracts CSS computed styles, font families, color palettes from any website. Graceful fallbacks for CORS-blocked sites.
- **Token Editor** — Interactive color picker (real-time hex/RGB), typography inspector, drag-to-adjust spacing visualizer.
- **Lock & Protect** — Lock specific tokens to prevent override on re-scraping.
- **Version History** — Full audit log with time-machine restore.
- **Component Preview** — Live playground (buttons, inputs, cards, type scale) that instantly adopts extracted tokens via CSS custom properties.
- **Export** — CSS variables, JSON design tokens, or Tailwind config.

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Clone & Setup

```bash
git clone https://github.com/Om2407/Stylesync.git
cd Stylesync
```

### 2. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE stylesync;"
```

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL
npm run dev
```

The backend will auto-create all tables on first run.

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Environment Variables

### Backend `.env`

```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/stylesync
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scrape` | Scrape a URL and extract tokens |
| GET | `/api/tokens/:id` | Get token data |
| PUT | `/api/tokens/:id` | Update tokens |
| POST | `/api/tokens/:id/lock` | Lock a token |
| DELETE | `/api/tokens/:id/lock` | Unlock a token |
| GET | `/api/tokens/:id/locked` | Get all locked tokens |
| GET | `/api/tokens/:id/history` | Get version history |
| POST | `/api/tokens/:id/restore` | Restore a version |
| GET | `/api/tokens/:id/export` | Export (css/json/tailwind) |
| GET | `/api/recent` | Recent scraped sites |

---

## Database Schema

```sql
scraped_sites     -- URL, status, title, favicon
design_tokens     -- JSONB: colors, typography, spacing, shadows, border_radius
locked_tokens     -- Junction: which tokens are frozen per session
version_history   -- Audit log with before/after snapshots
```

---

## Docker (Optional)

```bash
docker-compose up
```

---

## Deployment

### Frontend → Vercel
```bash
cd frontend && npm run build
# Deploy dist/ to Vercel
```

### Backend → Railway / Render
```bash
# Set DATABASE_URL env var on platform
# Start command: node src/index.js
```

---

## Project Structure

```
stylesync/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Scraper, exporter
│   │   ├── routes/         # Express routes
│   │   └── db/             # PostgreSQL + schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/          # HomePage, DashboardPage
│   │   ├── components/
│   │   │   ├── editor/     # ColorEditor, TypographyEditor, SpacingEditor, ExportPanel, VersionHistory
│   │   │   ├── preview/    # ComponentPreview
│   │   │   └── layout/     # TopBar, Sidebar
│   │   ├── store/          # Zustand global state
│   │   └── index.css       # Global styles + CSS custom properties
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Author

**Om Gupta**
GitHub: [@Om2407](https://github.com/Om2407/Stylesync)

---

> Made with ❤️ by **Om Gupta** for **PurpleMerit Technologies**
> Full Stack Vibe Coder Intern Assessment — April 2026