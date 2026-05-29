# Performance Optimization Verification Test Plan

## Setup
- App running on http://localhost:3001
- Test dataset: 10+ competitors
- Tools: Chrome DevTools React Profiler, Network tab

## Test Cases

### 1. InsightsBar Memoization
**Expected:** InsightsBar should NOT re-fetch when parent Dashboard re-renders with same refreshKey
- Open Dashboard view with growth data loaded
- Open Chrome DevTools → Network tab
- Watch for `/api/insights` calls
- Action: Trigger parent re-render by switching roles
- **Pass:** No new /api/insights call
- **Fail:** /api/insights fetched again (memo not working)

### 2. BattlecardCard Extraction + Memoization
**Expected:** Individual competitor cards should not re-render when sibling cards change
- Open Battlecards view with 10+ competitors
- Open React Profiler (DevTools → Profiler)
- Record interaction: Toggle "approved only" filter
- Check: Should only re-render the filtered-in cards, not all 10+
- **Pass:** Card count in profiler matches filtered count
- **Fail:** All 10+ cards re-render

### 3. generateCoachingPlan Caching
**Expected:** Coaching plans should compute once, not recalculate on re-render
- Open Battlecards, expand "Pre-call coaching plan" on one card
- Record profiler data
- Action: Scroll or toggle adjacent card's section
- Check: Plan content doesn't recalculate
- **Pass:** Plan text unchanged, no computation
- **Fail:** Plan regenerates (expensive function runs again)

### 4. ActionCard Memoization
**Expected:** Action cards in Dashboard should not re-render unnecessarily
- Open Dashboard → scroll to "Top recommended actions"
- Apply role filter (switch from Executive to Growth Leader)
- Record profiler: ActionCard components should skip render if props unchanged
- **Pass:** Filtered cards re-render, unfiltered skip
- **Fail:** All cards re-render

### 5. Overall Performance
**Expected:** Battlecards grid with 10+ competitors should render smoothly
- Open Battlecards with full dataset
- Profiler: Initial render time < 500ms per card
- Toggle filters: Re-filter should complete < 200ms
- Scroll performance: 60fps maintained
- **Pass:** Smooth interactions, no janky scrolling
- **Fail:** Lag, dropped frames, slow re-filters

## Success Criteria
✅ All 5 tests pass
✅ No TypeScript errors
✅ Visual appearance unchanged
