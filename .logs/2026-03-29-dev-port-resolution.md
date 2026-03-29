## 2026-03-29 Dev Port Resolution

- Goal: make `bun run dev` resilient when port `3000` is already occupied by another local dev instance.
- Root cause: `scripts/dev-server.mjs` hardcoded `3000` unless `PORT` was set, and a separate `scripts/dev-server.mjs` listener was already bound to `0.0.0.0:3000` (`pid 61264`).
- Change: added a preflight port probe in `scripts/dev-server.mjs` that auto-selects the next free port within a small range when `PORT` is unset. Explicit `PORT` values remain strict for tooling and tests.
- Verification:
  - `bun run dev` with `3000` already occupied now reports `Port 3000 is busy, using 3001 instead.`
  - The fallback instance served `http://127.0.0.1:3001` with HTTP `200`.
  - The temporary verification instance was stopped afterward so only the original `3000` listener remained active.
