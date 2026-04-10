# BrainDump

An AI-powered task organizer. Paste a messy list of thoughts, todos, or ideas and the app turns them into a structured, prioritized plan with categories and action steps.

---

## How It Works

1. **Dump** — type anything into the input: todos, ideas, half-formed thoughts
2. **Organize** — AI categorizes, prioritizes, and breaks each item into steps
3. **Track** — mark tasks as in progress or done, check off individual steps

---

## Prerequisites

- Node.js 18+
- An [OpenRouter](https://openrouter.ai) API key (free)

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the database

```bash
npx drizzle-kit push
```

This creates a local `sqlite.db` file with the required tables.

### 3. Add your API key

Create a `.env.local` file in the project root:

```bash
OPENROUTER_KEY=sk-or-v1-your-key-here
```

Get a free key at https://openrouter.ai/keys — sign up, click **Create Key**, copy it.

### 4. Start the app

```bash
npm run dev
```

Open http://localhost:3000.

---

## Pages

| Page | Path | Description |
|------|------|-------------|
| Home | `/` | Enter a brain dump and get a structured plan |
| My Plans | `/plans` | Overview of all saved plans with progress stats |
| Plan Detail | `/plan/[id]` | Full plan view with interactive task and step tracking |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── dump/route.ts          # POST /api/dump — sends text to AI
│   │   └── plans/
│   │       ├── route.ts           # GET/POST /api/plans
│   │       └── [id]/route.ts      # GET/PUT/DELETE /api/plans/:id
│   ├── plan/[id]/page.tsx         # Plan detail page
│   ├── plans/page.tsx             # Plans list page
│   └── page.tsx                   # Home page
├── components/
│   ├── brain-dump-input.tsx       # Multi-line bullet input
│   ├── category-group.tsx         # Groups tasks by category
│   ├── header.tsx                 # Navigation bar
│   ├── loading-spinner.tsx        # Processing indicator
│   ├── plan-card.tsx              # Summary card for plans list
│   ├── structured-plan.tsx        # Plan display (preview + saved)
│   └── task-item.tsx              # Individual task card with steps
├── hooks/
│   └── use-dump-processor.ts      # State machine for the dump → plan flow
└── lib/
    ├── ai/
    │   ├── client.ts              # OpenRouter API call
    │   └── prompts.ts             # System prompt and message builder
    ├── db/
    │   ├── index.ts               # SQLite connection (singleton)
    │   └── schema.ts              # Drizzle ORM table definitions
    └── types.ts                   # Shared TypeScript types
```

---

## Database Schema

Three tables stored in `sqlite.db`:

**plans** — top-level plan created from a brain dump
- `id`, `raw_input`, `title`, `summary`, `created_at`, `updated_at`

**tasks** — individual tasks within a plan
- `id`, `plan_id`, `title`, `description`, `category`, `priority` (high/medium/low), `status` (todo/in_progress/done), `sort_order`, `created_at`

**steps** — action steps within a task
- `id`, `task_id`, `content`, `is_complete`, `sort_order`

Deleting a plan cascades to its tasks and steps automatically.

---

## API Reference

### `POST /api/dump`
Send raw text to the AI and get back a structured plan. Does **not** save to the database.

**Request**
```json
{ "rawInput": "your brain dump text" }
```

**Response**
```json
{
  "title": "Plan title",
  "summary": "Short summary",
  "categories": [
    {
      "name": "Category Name",
      "tasks": [
        {
          "title": "Task title",
          "description": "Optional detail",
          "priority": "high",
          "steps": ["Step 1", "Step 2"]
        }
      ]
    }
  ]
}
```

---

### `GET /api/plans`
Returns all saved plans with progress stats.

### `POST /api/plans`
Saves a plan (and all its tasks/steps) to the database.

**Request**
```json
{ "rawInput": "original text", "plan": { ...structured plan... } }
```

---

### `GET /api/plans/:id`
Returns a full plan with all tasks and steps grouped by category.

### `PUT /api/plans/:id`
Updates a task status or toggles a step's completion.

**Update task status**
```json
{ "taskId": "abc123", "status": "in_progress" }
```

**Toggle step**
```json
{ "stepId": "xyz789", "isComplete": true }
```

### `DELETE /api/plans/:id`
Deletes the plan and all associated tasks and steps.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at http://localhost:3000 |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npx drizzle-kit push` | Apply schema changes to the database |
| `npx drizzle-kit studio` | Open a visual database browser |

---

## Tech Stack

- **[Next.js 16](https://nextjs.org)** — React framework with App Router
- **[Tailwind CSS 4](https://tailwindcss.com)** — Styling
- **[Drizzle ORM](https://orm.drizzle.team)** — Type-safe SQLite queries
- **[better-sqlite3](https://github.com/WiseLibs/better-sqlite3)** — SQLite driver
- **[OpenRouter](https://openrouter.ai)** — AI API gateway (uses `openrouter/auto` to pick the best available free model)
- **[nanoid](https://github.com/ai/nanoid)** — ID generation
