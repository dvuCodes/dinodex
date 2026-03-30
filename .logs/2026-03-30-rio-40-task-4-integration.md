## RIO-40 Task 4: Approve and integrate animated species 003-005

### Summary

- Approved the generated animated sprite sets for `#003`, `#004`, and `#005` by flipping their prototype metadata to `animationApproved: true`.
- Backfilled the explicit approval field for legacy animated species `#001` and `#002` so the stricter manifest contract would not regress already-shipped animated playback.
- Rebuilt `public/tamagotchi/manifest.json`, which restored manifest-backed `animation` entries for `#001-#005`.

### Files updated

- `public/tamagotchi/001/prototype/metadata.json`
- `public/tamagotchi/002/prototype/metadata.json`
- `.artifacts/tamagotchi/003/prototype/metadata.json`
- `.artifacts/tamagotchi/004/prototype/metadata.json`
- `.artifacts/tamagotchi/005/prototype/metadata.json`
- `public/tamagotchi/manifest.json`

### Verification

- Rebuilt manifest:
  - `bun -e "import { writeTamagotchiManifest } from './scripts/tamagotchi-manifest'; console.log(writeTamagotchiManifest(process.cwd()));"`
- Focused tests:
  - `bun test src/lib/tamagotchi-sprites.test.ts scripts/tamagotchi-style-lock.test.ts scripts/tamagotchi-animated-rollout.test.ts`
- Live browser validation against the local repo dev server on `http://127.0.0.1:3000/tamagotchi`:
  - confirmed port `3000` belonged to `scripts/dev-server.mjs`
  - seeded local storage with adult happy states for species `003`, `004`, and `005`
  - confirmed the Tamagotchi renderer used:
    - `/tamagotchi/003/adult-happy.png`
    - `/tamagotchi/004/adult-happy.png`
    - `/tamagotchi/005/adult-happy.png`
  - confirmed frame transforms advanced between samples, indicating active strip playback

