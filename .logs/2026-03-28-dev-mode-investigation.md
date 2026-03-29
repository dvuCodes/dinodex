# Dev Mode Investigation

- [x] Reproduced the reported failure with `bunx run dev`
- [x] Reproduced the expected success path with `bun run dev`
- [x] Compared the repo script definition and existing docs
- [x] Recorded the workflow correction in `AGENTS.md`

## Evidence

- `package.json` defines `"dev": "node scripts/dev-server.mjs"`.
- `bun run dev` starts that script and prints `> Dev server listening at http://localhost:3000`.
- A later `bun run dev` attempt failed only because the first successful dev server was still running and holding `.next/dev/lock`; port `3000` was owned by `node.exe` running `scripts/dev-server.mjs` from this worktree.
- `bunx run dev` does not execute the package script. It launches Bun's `bunx` package-exec flow, resolves the external `run` CLI, and that CLI attempts to execute a local module named `dev`, which fails with `Cannot find module 'C:\\Users\\datvu\\projects\\dinodex\\dev'`.
- Existing repo references already use `bun run dev`:
  - `CLAUDE.md`
  - `docs/TODO.md`
  - `playwright.config.ts`

## Conclusion

The app's dev mode is not broken. The failure is caused by invoking the wrong Bun command:

- Correct: `bun run dev`
- Incorrect: `bunx run dev`
