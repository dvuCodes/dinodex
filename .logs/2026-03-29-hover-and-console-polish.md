## 2026-03-29 Hover And Console Polish (RIO-32)

- Goal: strengthen homepage chip hover affordance and address the actionable homepage console warnings without chasing dev-only noise.
- Root cause:
  - `FilterChips.tsx` had technically valid hover behavior, but the inactive state only shifted by 1px with a faint shadow and active pills had no hover treatment.
  - `globals.css` set `scroll-behavior: smooth` on `html`, but `layout.tsx` did not include Next's required `data-scroll-behavior="smooth"` attribute.
  - The first homepage grid image in `DinoCard.tsx` was above the fold and not marked eager, which produced the LCP warning.
- Changes:
  - Strengthened chip hover for active and inactive pills in `FilterChips.tsx` with clearer lift, border, background, and shadow changes.
  - Added `data-scroll-behavior="smooth"` to the root `<html>` in `layout.tsx`.
  - Passed an `eagerImage` flag from `DinoGrid.tsx` into the first rendered `DinoCard.tsx` image and set `loading="eager"` only for that leading card.
  - Updated `AGENTS.md` to require creating or updating the relevant Linear issue before completing non-trivial work.
- Verification:
  - `bun run lint`
  - Browser smoke on `/` to confirm stronger chip hover treatment.
  - Browser console review on `/` to confirm the actionable smooth-scroll and LCP warnings are removed while leaving dev-only noise untouched.
