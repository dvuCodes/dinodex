# Repository Guidelines
## Baseline Workflow

- Start every task by determining:
  1. goal + acceptance criteria,
  2. constraints (time, safety, scope),
  3. what must be inspected (files, commands, tests).
- If requirements are ambiguous, ask targeted clarifying questions before making irreversible changes.
- When changes are required:
  - propose a short plan (2-6 bullets), then execute.
- Always check for relevant skills before building.
- Always mark tasks off when complete.
- After every correction to assumptions/process, update this `AGENTS.md`.
- When making file edits, use the Codex `apply_patch` tool (do not embed `apply_patch` inside shell commands).
- Do not propose follow-up tasks or enhancements at the end of your final answer.
- When working on frontend design, use playwright to test and confirm desired feature implemention.
- When validating a dev server, confirm the listening port belongs to the current worktree before debugging UI behavior.
- Generated raster art under `public/dinos` can fail direct dev serving in this environment; use the custom dev server to intercept `/dinos/...` raster requests when validating rendered art.
- WebP conversion alone does not create transparency; for the current dinosaur art set, exact-preservation transparency should default to deterministic edge-connected background removal, `scripts/process-images.ts` should prefer `scripts/transparent-output` over `scripts/raw-output`, and generative image editing should be opt-in only when a real redraw is acceptable.
- Dinosaur art served from `/dinos/...` must bypass `next/image` optimization when validating or shipping transparency-sensitive renders, because the optimized path can flatten alpha in this environment.
- When the main dex is species-first, card numbering and watermarks must use the species ID (`#001`, `#002`, ...) rather than stage-specific dex IDs.

## Context7 MCP (library docs)

Use Context7 to fetch accurate, version-matched documentation during coding tasks.

- Add `use context7` when you need library/API docs.
- If known, pin the library with slash syntax (e.g., `use library /supabase/supabase`).
- Mention the target version.
- Fetch minimal targeted docs; summarize (no large dumps).

## Editing files

- Make the smallest safe change that solves the issue.
- Preserve existing style and conventions.
- Prefer patch-style edits (small, reviewable diffs) over full-file rewrites.
- After making changes, run the project's standard checks when feasible (format/lint, unit tests, build/typecheck).
- For frontend/UI changes, when possible, do a quick smoke test using Playwright MCP (navigate key routes, click primary flows, check console errors, and capture a screenshot if helpful).
