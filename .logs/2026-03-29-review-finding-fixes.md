## 2026-03-29 Review Finding Fixes

- Switched tamagotchi runtime sprite descriptors to distinguish shipped single-frame PNGs from animated SVG fallbacks, instead of treating every source as a 4-frame sheet.
- Routed egg art to the generated species-specific `/tamagotchi/<id>/egg.png` assets.
- Added an explicit `didActionApply` check so collapsed runs do not show misleading success feedback, and disabled care buttons once a run is terminal.
- Made `discipline` a real simulation attention reason when the discipline stat drops too low.
