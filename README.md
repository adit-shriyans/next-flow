# NextFlow — Visual LLM Workflow Builder

A pixel-perfect, dark-themed visual workflow builder for orchestrating LLM pipelines. Inspired by [Krea.ai](https://www.krea.ai/), NextFlow lets you visually compose multi-step AI workflows by connecting modular nodes on a drag-and-drop canvas, then execute them end-to-end with a single click.

## Demo

https://github.com/user-attachments/assets/demo.mp4

> Replace the link above with your uploaded video URL after pushing to GitHub.  
> The raw recording is available locally at [`assets/demo.mp4`](assets/demo.mp4).

## Screenshot

![NextFlow Workflow Canvas](assets/workflow-canvas.png)

*Sample "Product Marketing Kit Generator" workflow — two parallel branches converging into a final LLM summary node.*

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router, TypeScript) |
| Styling | **Tailwind CSS v4** with custom dark theme tokens |
| Visual Canvas | **React Flow** (`@xyflow/react`) — dot grid, panning, zooming, MiniMap |
| Authentication | **Clerk** (`@clerk/nextjs`) — sign-in, sign-up, route protection |
| Database | **Prisma v7** + **Neon PostgreSQL** (serverless, connection pooling) |
| State Management | **Zustand** — nodes, edges, undo/redo history, execution state |
| LLM Provider | **Google Gemini API** (`gemini-3-flash-preview`) with vision support |
| Background Jobs | **Trigger.dev v3** — offloaded image/video processing tasks |
| File Uploads | **Transloadit** (via Uppy) |
| Validation | **Zod** — API route request schemas |
| Icons | **Lucide React** |

## Features

### Visual Canvas
- Infinite pannable canvas with dot-grid background
- Drag-and-drop node placement from the left sidebar
- Animated purple edges with dashed-line flow animation
- MiniMap and zoom controls
- Multi-select, delete, and keyboard shortcuts

### Node Types (6)
| Node | Purpose | Handles |
|---|---|---|
| **Text** | Static text input | `output` (text) |
| **Upload Image** | Image file upload with preview | `output` (image) |
| **Upload Video** | Video file upload with preview | `output` (video) |
| **LLM** | Google Gemini inference (text + vision) | `system_prompt`, `user_message`, `images` → `output` |
| **Crop Image** | Percentage-based image cropping | `image_url` → `output` |
| **Extract Frame** | Video frame extraction at timestamp | `video_url`, `timestamp` → `output` |

### Execution Engine
- **DAG validation** — prevents cycles in the workflow graph
- **Topological sort** — determines correct execution order
- **Level-based parallel execution** — nodes at the same dependency level run concurrently
- **Three execution modes**: Run All, Run Selected (partial), Run Single Node (with upstream)
- **Live status feedback** — purple glow (running), green glow (success), red glow (error) on nodes
- **Inline result display** — LLM outputs render directly inside the node

### Persistence & History
- Full workflow CRUD (create, rename, save, delete)
- Workflow list dashboard with metadata
- Execution history panel (right sidebar) with run-level and node-level drill-down
- Export / Import workflows as JSON

### Auth & Security
- Clerk-powered sign-in / sign-up pages
- Protected `/workflow/*` routes via Next.js proxy middleware
- Per-user workflow isolation

### UX Polish
- Undo / Redo (Ctrl+Z / Ctrl+Shift+Z)
- Pre-built sample workflow ("Product Marketing Kit Generator")
- Connected inputs auto-disable (data flows from upstream node)
- Collapsible left and right sidebars
- Custom scrollbars, smooth transitions, dark theme throughout

---

## Project Structure

```
fe/
├── app/
│   ├── api/
│   │   ├── workflows/              # CRUD + execution routes
│   │   │   ├── route.ts            # GET (list) / POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts        # GET / PUT / DELETE single workflow
│   │   │       └── execute/
│   │   │           └── route.ts    # POST (start run), PUT (exec node), PATCH (finalize)
│   │   └── history/
│   │       └── [workflowId]/
│   │           └── route.ts        # GET execution history
│   ├── sign-in/                    # Clerk sign-in page
│   ├── sign-up/                    # Clerk sign-up page
│   ├── workflow/
│   │   ├── page.tsx                # Workflow list dashboard
│   │   ├── layout.tsx              # Shared header layout
│   │   └── [id]/page.tsx           # Workflow editor page
│   ├── layout.tsx                  # Root layout (ClerkProvider)
│   ├── page.tsx                    # Redirects → /workflow
│   └── globals.css                 # Dark theme + glow animations
├── components/
│   ├── ui/Header.tsx               # Top nav bar with Clerk UserButton
│   └── workflow/
│       ├── Canvas.tsx              # React Flow canvas wrapper
│       ├── LeftSidebar.tsx         # Draggable node palette
│       ├── RightSidebar.tsx        # Execution history panel
│       ├── Toolbar.tsx             # Save, Run, Undo/Redo, Export/Import
│       ├── WorkflowEditor.tsx      # Main orchestrator component
│       └── nodes/
│           ├── BaseNode.tsx        # Shared node shell (title, handles, status)
│           ├── TextNode.tsx
│           ├── UploadImageNode.tsx
│           ├── UploadVideoNode.tsx
│           ├── LLMNode.tsx
│           ├── CropImageNode.tsx
│           └── ExtractFrameNode.tsx
├── lib/
│   ├── dag.ts                      # Topological sort, cycle detection, upstream traversal
│   ├── db.ts                       # Prisma client singleton (PrismaPg adapter)
│   ├── execution.ts                # Client-side execution orchestrator
│   ├── sample-workflow.ts          # Pre-built demo workflow
│   ├── schemas.ts                  # Zod validation schemas
│   ├── store.ts                    # Zustand global state
│   ├── transloadit.ts              # Transloadit upload config
│   ├── types.ts                    # TypeScript interfaces
│   └── utils.ts                    # cn() class merge utility
├── trigger/
│   ├── llm-task.ts                 # Trigger.dev task: Gemini API call
│   ├── crop-image-task.ts          # Trigger.dev task: image cropping
│   └── extract-frame-task.ts       # Trigger.dev task: video frame extraction
├── prisma/
│   └── schema.prisma               # Workflow, WorkflowRun, NodeRun models
├── prisma.config.ts                # Prisma v7 config (loads .env.local)
├── proxy.ts                        # Clerk auth middleware (Next.js 16)
└── .env.local                      # Environment variables (not committed)
```

## Database Schema

```
Workflow ──< WorkflowRun ──< NodeRun
```

- **Workflow** — stores the React Flow graph (nodes + edges) as JSON, scoped to a userId
- **WorkflowRun** — a single execution attempt with status, scope, and duration
- **NodeRun** — per-node execution record with inputs, output, error, and timing

---

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **npm** >= 10
- Accounts on: [Clerk](https://clerk.com), [Neon](https://neon.tech), [Google AI Studio](https://aistudio.google.com)

### 1. Clone & Install

```bash
git clone <repo-url>
cd fe
npm install
```

### 2. Configure Environment

Create `.env.local` in the `fe/` directory:

```env
# Clerk Authentication
# https://dashboard.clerk.com → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Neon PostgreSQL
# https://neon.tech → Connection Details → Connection String
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require

# Google Gemini API
# https://aistudio.google.com/apikey
GOOGLE_GENERATIVE_AI_API_KEY=AIza...

# Trigger.dev (optional — for background task execution)
TRIGGER_SECRET_KEY=tr_dev_...

# Transloadit (optional — for cloud file uploads)
NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY=...
TRANSLOADIT_AUTH_SECRET=...
```

### 3. Push Database Schema

```bash
npx prisma db push
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to sign in via Clerk, then land on the workflow dashboard.

### 6. Try the Sample Workflow

From the dashboard, click **Load Sample Workflow** to get a pre-built "Product Marketing Kit Generator" with 9 connected nodes across two parallel branches.

---

## How It Works

```
┌─────────────┐     drag & drop     ┌───────────────┐
│ Left Sidebar │ ──────────────────► │  React Flow   │
│  (6 nodes)   │                     │    Canvas      │
└─────────────┘                     └───────┬───────┘
                                            │ connect edges
                                            ▼
                                    ┌───────────────┐
                                    │  Zustand Store │ ◄── undo/redo
                                    │ (nodes, edges) │
                                    └───────┬───────┘
                                            │ "Run All"
                                            ▼
                                    ┌───────────────┐
                                    │   DAG Engine   │
                                    │ (topo sort →   │
                                    │  exec levels)  │
                                    └───────┬───────┘
                                            │ level-by-level
                                            ▼
                                    ┌───────────────┐      ┌──────────┐
                                    │  API Routes    │ ───► │  Gemini  │
                                    │ /execute (PUT) │      │   API    │
                                    └───────┬───────┘      └──────────┘
                                            │
                                            ▼
                                    ┌───────────────┐
                                    │   Prisma +     │
                                    │  Neon Postgres │
                                    │ (persist runs) │
                                    └───────────────┘
```

1. **Build** — Drag nodes from the sidebar, connect them with typed edges
2. **Validate** — The engine checks for cycles and type compatibility
3. **Execute** — Nodes run level-by-level; outputs flow downstream as inputs
4. **Persist** — Workflow structure and execution history are saved to Neon

---

## License

MIT
