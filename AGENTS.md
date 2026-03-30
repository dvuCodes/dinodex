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
- Use the existing Linear team `Rio31` for non-trivial work. Start from a Linear issue whenever practical instead of treating chat as the task tracker.
- Before starting non-trivial implementation, create the Linear issue or explicitly link the existing issue in the first work update. If work begins without one, stop and create it before continuing.
- Linear is the source of truth for backlog, priority, assignment, project membership, and status. Repo files remain the source of truth for implementation detail and evidence.
- Model time-bound initiatives as Linear projects and keep implementation work as atomic Linear issues. Use parent/sub-issues only when a task is too large for one reviewable change.
- Standardize non-trivial issue descriptions around `Context`, `Acceptance Criteria`, and `Verification`.
- Post meaningful status back to Linear as work progresses: move issues to `In Progress` when starting, `In Review` when verification is ready, and `Done` only after final validation is complete.
- Reference the related Linear issue ID in repo artifacts when relevant, especially `.logs/` entries and any prompts or verification artifacts created during the task.
- Use the active `Rio31` cycle when cycles are configured. If cycles are unavailable through the current tool path, record the blocker in `.logs/` and continue tracking work by project + backlog state.
- When making file edits, use the Codex `apply_patch` tool (do not embed `apply_patch` inside shell commands).
- Do not propose follow-up tasks or enhancements at the end of your final answer.
- When working on frontend design, use playwright to test and confirm desired feature implemention.
- When validating a dev server, confirm the listening port belongs to the current worktree before debugging UI behavior.
- `bun` is the default package manager for this repo. Prefer `bun install`, `bun run`, and `bunx` for installs, scripts, tests, and Playwright unless a documented exception exists.
- Use `bun run <script>` for package scripts such as `dev`; do not use `bunx run <script>`, because `bunx` executes package CLIs and will invoke the external `run` binary instead of this repo's `package.json` scripts.
- Generated raster art under `public/dinos` can fail direct dev serving in this environment; use the custom dev server to intercept `/dinos/...` raster requests when validating rendered art.
- WebP conversion alone does not create transparency; for the current dinosaur art set, exact-preservation transparency should default to deterministic edge-connected background removal, `scripts/process-images.ts` should prefer `scripts/transparent-output` over `scripts/raw-output`, and generative image editing should be opt-in only when a real redraw is acceptable.
- Dinosaur art served from `/dinos/...` must bypass `next/image` optimization when validating or shipping transparency-sensitive renders, because the optimized path can flatten alpha in this environment.
- When the main dex is species-first, card numbering and watermarks must use the species ID (`#001`, `#002`, ...) rather than stage-specific dex IDs.
- Use the nano banana 2 skill to generate visual assets for your work, and every time you generate a collection of assets, save the prompts you used to be able to continue generating more of the same assets later (create files in .prompts)
- The local `nano-banana-2` skill now uses the Gemini API directly through `GEMINI_API_KEY`; do not route new Nano Banana 2 work through `infsh`.
- For Gemini-generated sprite assets in this repo, prefer a pure solid white background plus deterministic edge-connected near-white removal over asking the model for true transparency, because direct image generations can return baked preview backgrounds.
- Log your work under .logs (create new log files as you see fit) to record your thought process and decisions, and reference them when iterating on features
- Use playwright to test the visual output of your work, and iterate if it doesn't look right or fit the vibe

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


