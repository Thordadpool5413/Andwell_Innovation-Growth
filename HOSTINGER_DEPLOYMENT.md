Hostinger deployment configuration for Andwell Innovation Command Center

Recommended dashboard settings:

Framework preset: Node.js / Next.js
Repository: Thordadpool5413/Andwell_Innovation-Growth
Branch: main
Node version: 20.x
Root directory: ./
Package manager: npm
Build command: npm run build
Start command: npm start

Do not use app.js or index.js startup aliases.
Do not set HOST to the public domain.
Let Hostinger manage PORT.

Current package scripts:

build: next build
build:strict: cross-env CIH_STRICT_BUILD=1 next build
start: node server.js

Runtime checks after deployment:

/api/health
/api/version
/api/diagnostics
/api/runtime
/api/audit-events

The runtime endpoint reports persistence confidence. Supabase is the production target, MongoDB is accepted server persistence, and JSON is only a local/dev fallback.
