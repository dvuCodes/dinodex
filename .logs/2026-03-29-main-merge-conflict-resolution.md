# 2026-03-29 Main Merge Conflict Resolution

## Scope
- Resolved `origin/main` merge conflicts on `codex/tamagotchi-ideas`
- Kept canonical `/dex` redirect behavior from `main`
- Kept the tamagotchi overhaul and latest simulation fixes from this branch

## Resolution Decisions
- `e2e/route-integrity.spec.ts`: took `main` version to preserve query-string redirect coverage
- `src/app/dex/page.tsx`: took `main` version using `buildCanonicalDexHref`
- `src/components/SearchBar.tsx`: kept branch version; conflict was placeholder punctuation only
- `src/components/tamagotchi/*`: kept branch overhaul implementation
- `src/lib/tamagotchi.ts`: kept branch version and restored `syncStateRef` plus `getActionFeedbackKey` for compatibility with `main` tests

## Verification
- `git diff --name-only --diff-filter=U`
- `bun test ./src/lib`
- `bunx playwright test e2e/route-integrity.spec.ts` started but did not produce a result in this environment during this pass
