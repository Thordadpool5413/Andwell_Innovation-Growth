Hostinger deployment configuration for Andwell Innovation Command Center

Recommended dashboard settings:

Framework preset: Node.js / Next.js
Repository: Thordadpool5413/Andwell_Innovation
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
postbuild: node scripts/patch-standalone-server.js
start: node .next/standalone/server.js

The postbuild step patches the generated .next/standalone/server.js file and copies .next/static plus public assets into the standalone bundle. That keeps GitHub pulls from creating a 503 loop or a page with missing JavaScript and CSS assets while Hostinger restarts the Node app.

If emergency diagnostics are needed, the custom bootstrap remains available with:

npm run start:custom
