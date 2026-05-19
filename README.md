# Andwell Innovation Command Center

Andwell Innovation Command Center combines two products into one Hostinger-ready Node.js app:

1. A competitive intelligence hub that crawls public competitor websites, compares evidence against the Andwell service catalog, builds battlecards, saves reports, and powers Ask the Hub.
2. A growth-planning command center that models county demand, service-line opportunity, referral conversion, staffing needs, launch sequencing, and board-ready decisions.

## What Is Included

- Command Center for executive, sales leader, sales rep, and admin lenses
- Growth Command scenario engine for Home Healthcare, Mobile Wound, and Therapy Care
- Board Room with financial upside, priority counties, and competitive risk overlay
- Launch Plan with staffing model, 90-day execution timeline, and priority account plays
- Competitor Intake for up to 25 public URLs
- Evidence Matrix, Battlecards, Reports, Ask the Hub, Andwell Catalog, and System Check
- Server-side APIs for analysis, competitors, reports, reviews, catalog, diagnostics, health, and version checks
- Supabase, MongoDB, or local JSON persistence fallback
- Patched standalone Next.js bootstrap for Hostinger Node deployments

## Local Development

```bash
npm install
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Production Build

```bash
npm install
npm run build
npm start
```

`npm run build` creates the Next.js standalone output, copies required static assets into the standalone bundle, and patches the generated server so Hostinger starts reliably instead of falling into a 503 loop while Next prepares.

## Hostinger Settings

Use Node.js 20.x.

Build command:

```bash
npm run build
```

Start command:

```bash
npm start
```

Environment variables:

```bash
NODE_ENV=production
CRAWL_MAX_PAGES_PER_SITE=24
CRAWL_TIMEOUT_MS=12000
CIH_DATA_DIR=.data
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
MONGODB_URI=
OPENAI_API_KEY=
```

Let Hostinger manage `PORT`. Do not set `HOST` to the public domain.

## GitHub To Hostinger

1. In Hostinger, connect the website to `Thordadpool5413/Andwell_Innovation`.
2. Use branch `main`.
3. Use Node.js 20.x.
4. Use `npm run build` as the build command.
5. Use `npm start` as the start command.
6. Add the environment variables above.
7. Deploy.

After deployment, check:

```bash
/api/health
/api/version
/api/diagnostics
/api/runtime
```

The API routes should return JSON. If an API route returns HTML, the site is not running as the Node.js Next server.

## Safety Rule

The competitive intelligence workflow uses public website evidence. It says "not found publicly" instead of claiming a competitor does not offer a service unless approved evidence supports that stronger statement.
