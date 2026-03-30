# 2026-03-30 Browser Use CLI evaluation

## Scope

- Evaluate whether `browser-use` is useful for the Dinodex workflow and for broader team workflows.
- Compare it against the current baseline here: Bun for repo tasks and Playwright MCP / browser automation for UI verification.

## Local Workflow Context

- This repo explicitly standardizes on Bun for project scripts and Playwright for frontend verification in `AGENTS.md`.
- Current package tooling already includes `@playwright/test`.
- Local environment readiness is good for a trial:
  - `Python 3.13.7`
  - `git 2.51.1.windows.1`
  - `uv 0.9.5`
- `browser-use` is not currently installed on this machine.

## Upstream Product Notes

- The CLI is positioned as a persistent browser automation shell with a background daemon and low-latency follow-up commands.
- It supports three modes:
  - managed Chromium
  - real Chrome profiles / existing logins
  - Browser Use cloud browsers
- It can also run as an MCP server over stdin/stdout.
- Windows install requires Git for Windows and Python 3.11+.
- The docs currently mark `extract "query"` as "not yet implemented".
- Cloud-oriented features include API passthrough, Cloudflare tunnel integration, and syncing local browser profiles to Browser Use cloud through an auxiliary binary.

## Assessment

### Good fit

- Fast ad hoc browser control from a shell when the work is simple and stateful.
- Reusing an already logged-in local Chrome profile without writing custom Playwright bootstrap code.
- Remote/manual debugging where a cloud browser or temporary tunnel is valuable.
- Agent workflows that specifically want a CLI-first browser primitive or an MCP wrapper around that CLI.

### Weak fit

- Deterministic product verification. Our current Playwright MCP flow is better for route checks, console inspection, screenshots, and explicit assertions.
- Repo-first development ergonomics. `browser-use` is Python-first and adds a second automation stack beside Bun + Playwright.
- Stable scripted testing. The core interaction model depends on numbered elements returned by `state`, which is convenient interactively but weaker than selector-based authored tests.
- Security/compliance-sensitive usage. Profile sync and cloud-browser features increase review surface because cookies and session handling can leave the local machine boundary.

## Recommendation

- Do not make `browser-use` the default browser automation tool for this repo or for general engineering verification work.
- Keep Playwright MCP as the primary workflow for UI testing and regression checks.
- Adopt `browser-use` only as a secondary tool for:
  - logged-in real-browser debugging
  - quick shell-driven exploratory browser tasks
  - cloud-browser/tunnel scenarios where Playwright MCP is awkward
- If we trial it, the right scope is a small pilot rather than repo-wide standardization.

## Sources

- Browser Use CLI docs: https://docs.browser-use.com/open-source/browser-use-cli
- Browser Use GitHub repo: https://github.com/browser-use/browser-use
