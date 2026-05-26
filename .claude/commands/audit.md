Perform a full UI and code audit of the Andwell app.

1. **Empty states** — check every view in `components/command-center/views/` for missing empty states. Every view that depends on a loaded report must have a "Run Competitive Scan →" CTA.
2. **Broken buttons** — find any onClick handlers that are empty, console.log only, or call undefined functions
3. **Nav consistency** — verify all 11 sidebar items route to a working view
4. **TypeScript** — run `npm run typecheck` and list all errors
5. **Visual polish** — flag any section headers over 28px, light-mode banner colors, or missing dark-mode styling

Report findings grouped by: Critical (broken), Warning (missing), Info (polish). Include file path and line number for each.
