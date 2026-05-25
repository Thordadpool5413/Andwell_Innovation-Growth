@AGENTS.md

# Andwell Innovation & Growth — Intelligence Platform

## What This App Is
A competitive intelligence and growth planning SaaS for Andwell Health Partners (Maine home health agency). It crawls competitor websites, runs AI extraction, and generates expert briefs, battlecards, growth plans, and board reports for leadership and sales teams.

## Tech Stack
- **Next.js 15.5** App Router — breaking changes from older versions. Read `node_modules/next/dist/docs/` before writing Next.js code.
- **TypeScript** — strict mode. Run `npm run typecheck` to verify.
- **Tailwind** — utility classes only, not layout. All layout and design via custom CSS.
- **CSS** — all custom variables and design tokens in `app/globals.css`. Dark-mode-first always.
- **OpenAI** — AI extraction engine for competitor analysis.
- **SSE (Server-Sent Events)** — used for streaming analysis progress via `/api/analyze-stream`.
- **Supabase + MongoDB** — data persistence (`lib/supabase.ts`, `lib/mongodb.ts`).

## Architecture — Single Shell Pattern
**`app/page.tsx` is the entire app.** One React component (`PageContent`) holds all state and renders views conditionally via a `view` state string. Never create new pages or routes for UI features.

```
view state (string) → conditional render → view component
```

All shared state lives in `page.tsx` and is passed as props:
- `currentReport: IntelligenceReport | null` — the active intelligence report
- `growthScenario: GrowthScenario` — the active growth planning scenario
- `competitors: CompetitorInput[]` — tracked competitor URLs
- `reports: ReportSummary[]` — list of saved reports
- `busy: boolean`, `phase: string` — global loading state

## File Structure
```
app/
  page.tsx              ← entire app shell, all state, all view routing
  layout.tsx
  globals.css           ← ALL CSS variables and design tokens
  api/                  ← API routes (see below)

components/
  command-center/
    Shared.tsx          ← Panel, Badge, Stat, StatMini, TagList, ExpandableSection
    views/              ← one file per view component
  AppHeader.tsx
  ErrorBoundary.tsx
  Toast.tsx

lib/
  command-center/
    types.ts            ← View, RoleView, MatrixFilter, ReportSummary, AskResponse
    data.ts             ← nav array, roleGuidance
    utils.ts            ← api(), parseCompetitorEntries()
  types.ts              ← IntelligenceReport, CompetitorInput, all core types
  growth-plan.ts        ← buildGrowthRows, buildStaffingPlan, growthDefaultScenario
  andwell.ts            ← andwellCatalog (service line baseline truth)
  andwell-expert.ts     ← generateAndwellExpertBrief()
  store.ts              ← shared state helpers
  supabase.ts           ← Supabase client
  mongodb.ts            ← MongoDB client
```

## All Views (39 total)
Defined in `lib/command-center/types.ts` as the `View` union type.

### Sidebar Nav (3 groups)
**Home:** `home`, `dashboard`
**Workspaces:** `heatmap`, `growth`, `battlecards`, `board-packet`
**Operations:** `intake`, `reports`

### Workspace Sub-tools (toolbar strip, not full nav)
- **Intelligence workspace** (`heatmap`): `heatmap`, `expert`, `matrix`, `governance`, `brief`
- **Growth workspace** (`growth`): `growth`, `scenarios`, `financial-model`, `staffing-model`, `launch-checklist`
- **Field workspace** (`battlecards`): `battlecards`, `builder`, `referrals`, `coaching`
- **Board workspace** (`board-packet`): `board-packet`, `board`, `narrative`, `board-report`, `decisions`
- **Operations workspace** (`reports`): `reports`, `ask`, `diagnostics`

### Hidden/deep views (accessible, not in sidebar)
`launch`, `executive-view`, `county-plan`, `referral-plan`, `competitive-view`, `service-lines`, `cms-data`, `sensitivity`, `opportunity-score`, `launch-timeline`, `ai`, `prompt`, `catalog`, `ask`, `decisions`, `scenarios`, `governance`, `builder`, `referrals`, `coaching`

## API Routes
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/analyze-stream` | POST | SSE stream — crawl + AI extract competitors |
| `/api/analyze` | POST | Non-streaming analysis |
| `/api/competitors` | GET/POST | Load/save competitor library |
| `/api/reports` | GET | List or load a specific report by `?id=` |
| `/api/ask` | POST | AI Q&A against loaded report + growth context |
| `/api/expert` | POST | Generate expert brief |
| `/api/growth-narrative` | POST | Generate growth narrative |
| `/api/insights` | POST | Generate insights |
| `/api/catalog` | GET | Andwell service catalog |
| `/api/reviews` | GET | Review items |
| `/api/validate-urls` | POST | Pre-scan URL reachability check |
| `/api/diagnostics` | GET | System health check |
| `/api/health` | GET | Simple health ping |
| `/api/version` | GET | Build version |

## Shared Components (always use these, never reinvent)
From `components/command-center/Shared.tsx`:
- `<Panel title="..." action={...}>` — standard card container
- `<Badge tone="green|amber|red|blue|neutral">` — status chip
- `<Stat label="..." value={...} hint={...}>` — animated metric card
- `<StatMini label="..." value={...} tone="...">` — compact metric
- `<TagList items={[...]} />` — tag cloud
- `<ExpandableSection title="..." defaultOpen={false}>` — collapsible section

## Critical Conventions

### Empty States (non-negotiable)
Every view that requires a loaded report must show an empty state when `currentReport` is null:
```tsx
if (!currentReport) return (
  <div className="empty-state">
    <p>No report loaded.</p>
    <button className="btn btn-primary" onClick={onRunScan}>Run Competitive Scan →</button>
  </div>
);
```
Views receive `onRunScan={() => setView('intake')}` as a prop from `page.tsx`.

### Styling Rules
- **Never use hardcoded colors.** Always use CSS variables: `var(--color-bg-primary)`, `var(--color-accent)`, `var(--color-border)`, etc.
- **Dark-mode-first.** Banners and alerts use `rgba()` backgrounds, never light hex colors.
- **Section headers** use `fontSize: '28px'`, not 36px.
- **WorkspaceTools** (sub-nav toolbar) is a slim horizontal tab strip, not a card or section.
- **Inline styles** are the norm here — not Tailwind layout classes.

### State & Props Pattern
- All state lives in `page.tsx`. Views are stateless receivers.
- To add state to a view: add it to `PageContent` in `page.tsx`, pass as prop.
- Never use `useRouter` for view navigation — call `setView('view-name')`.
- Views receive `setView` as a prop when they need to navigate elsewhere.

### TypeScript
- Core types: `lib/types.ts` (IntelligenceReport, CompetitorInput, etc.)
- View/nav types: `lib/command-center/types.ts`
- Growth types: `lib/growth-plan.ts` (GrowthScenario, GrowthRow)
- Always run `npm run typecheck` after changes.

## Business Context
**Andwell Health Partners** is a Maine-based home health agency competing against other home health, hospice, and behavioral health providers across Maine counties.

The app's core workflow:
1. User adds competitor URLs in **Intake** view
2. App crawls each site (up to 8 pages) and runs OpenAI extraction
3. Results are stored as an `IntelligenceReport` with structured findings
4. All downstream views (battlecards, expert brief, board packet, etc.) derive from the loaded report
5. Growth planning is independent — uses `GrowthScenario` with Maine county/service data

**Key business rules:**
- Max 25 competitor URLs per scan
- AI extraction governed by claim safety rules (see `lib/claim-governance.ts`)
- Expert brief uses `lib/andwell-expert.ts` — do not alter its scoring logic without explicit instruction
- Andwell catalog (`lib/andwell.ts`) is the baseline truth for service line matching

## What NOT to Do
- Do not create new pages (`app/[slug]/page.tsx`) — everything is a view in the single shell
- Do not use `useRouter` for navigation between views
- Do not add new global state outside `PageContent` in `page.tsx`
- Do not use light-mode colors for alerts/banners
- Do not change `lib/andwell-expert.ts` scoring logic without being asked
- Do not add Tailwind layout classes — use inline styles or CSS
- Do not mock API calls in components — they call real routes

## Keyboard Shortcuts (built into app)
`g` growth, `d` decisions, `b` battlecards, `h` heatmap, `a` ask, `r` reports, `e` expert, `Ctrl+K` command search, `?` shortcuts overlay
