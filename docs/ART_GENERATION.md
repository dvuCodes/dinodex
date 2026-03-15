# DINODEX — Art Generation Guide (Gemini / Nano Banana 🍌)

> Strategy for generating consistent anime-styled dinosaur art across 3 evolution stages.
> Total: 30 dinos × 3 stages = 90 images.

---

## 1. Art Requirements

### Per Dinosaur (3 images)
| Stage | Style | Dimensions | File |
|-------|-------|-----------|------|
| Hatchling | Chibi/kawaii anime | 1024×1024 | `hatchling.webp` |
| Juvenile | Shonen manga, dynamic | 1024×1024 | `juvenile.webp` |
| Adult | Epic detailed anime | 1024×1024 | `adult.webp` |

### Consistency Rules
- All 3 stages of the same dino must be recognizably the same species
- Color palette should be consistent across stages (same base body color)
- White/clean background for all (allows UI to add colored backgrounds)
- Full body visible, no cropping
- No text, no watermarks, no logos in the image
- Character design sheet quality — clean, professional

---

## 2. Prompt Templates

### 2.1 Hatchling (Stage 1)

**Base template:**
```
Cute chibi anime baby {name} dinosaur, just hatched from egg shell fragments,
very small and adorable, {specific_baby_features},
large round expressive eyes, soft rounded body proportions,
kawaii Japanese illustration style, pastel soft colors,
clean linework, white background, full body visible,
professional character design, digital illustration
```

**Per-dino feature injection `{specific_baby_features}`:**
- T-Rex: "tiny stubby arms, oversized head, fluffy downy feathers"
- Triceratops: "small soft bumps where horns will grow, tiny frill"
- Stegosaurus: "soft flexible baby plates along back, stubby tail"
- Velociraptor: "fuzzy feathered body, large curious eyes, small toe claws"

### 2.2 Juvenile (Stage 2)

**Base template:**
```
Young {name} dinosaur in dynamic action pose, anime shonen manga style,
half-grown with developing features, {specific_juvenile_features},
energetic and adventurous expression, vibrant saturated colors,
motion lines suggesting movement, slight dramatic lighting,
Japanese anime illustration style, clean detailed linework,
white background, full body visible, professional character design
```

**Per-dino feature injection `{specific_juvenile_features}`:**
- T-Rex: "lanky build, long legs for speed, growing jaw muscles, scattered feathers"
- Triceratops: "short but visible horns, expanding frill, sturdy build forming"
- Stegosaurus: "back plates growing taller, tail spikes hardening, stocky legs"
- Velociraptor: "sleek feathered body, developing sickle claws, intelligent alert eyes"

### 2.3 Adult (Stage 3)

**Base template:**
```
Majestic powerful adult {name} dinosaur, epic anime illustration,
full-grown with complete mature features, {specific_adult_features},
dramatic powerful stance, intense determined expression,
rich detailed colors with dramatic lighting, subtle aura energy effect,
highly detailed scales and textures, professional anime art style,
white background, full body visible, character design,
masterpiece quality digital illustration
```

**Per-dino feature injection `{specific_adult_features}`:**
- T-Rex: "massive skull, powerful jaw, tiny arms, muscular legs, scarred veteran look"
- Triceratops: "three large sharp horns, wide bony frill, armored rhino-like body"
- Stegosaurus: "17 tall bony plates along back, 4 deadly tail spikes, massive body"
- Velociraptor: "full feathered plumage, large sickle claw raised, predatory intensity"

---

## 3. Species-Specific Feature Guide

Use these features in the prompt injections for each dinosaur:

| # | Name | Key Visual Features |
|---|------|-------------------|
| 001 | Eoraptor | Small, slender, dog-sized, simple theropod shape |
| 002 | Coelophysis | Long neck, slender, hollow bones, pack hunter |
| 003 | Plateosaurus | Long neck, bipedal/quadruped, bulky herbivore |
| 004 | Herrerasaurus | Powerful jaws, primitive theropod, muscular |
| 005 | Postosuchus | Crocodile-like head, upright stance, armored |
| 006 | Allosaurus | Large head, horn crests above eyes, powerful arms |
| 007 | Stegosaurus | Back plates, tail spikes (thagomizer), tiny head |
| 008 | Brachiosaurus | Extremely long neck, tall front legs, tiny head |
| 009 | Diplodocus | Very long whip-like tail, longest body, slender neck |
| 010 | Archaeopteryx | Feathered wings, toothed beak, transitional bird-dino |
| 011 | Compsognathus | Tiny, chicken-sized, fast, simple design |
| 012 | Dilophosaurus | Twin crests on head, slender, medium-sized |
| 013 | Ceratosaurus | Nose horn, brow horns, row of osteoderms |
| 014 | Kentrosaurus | Shoulder spikes, back plates transitioning to spikes |
| 015 | Megalosaurus | Classic large theropod, robust, powerful jaws |
| 016 | Apatosaurus | Massive sauropod, long neck, whip tail, elephant legs |
| 017 | Yangchuanosaurus | Large theropod, bony ridges on skull, powerful |
| 018 | Tyrannosaurus Rex | Massive skull, tiny arms, muscular legs, bone-crushing jaw |
| 019 | Triceratops | Three horns, large bony frill, rhino-like body |
| 020 | Velociraptor | Feathered, sickle claw, intelligent predator |
| 021 | Spinosaurus | Huge sail on back, crocodile snout, semi-aquatic |
| 022 | Ankylosaurus | Full body armor, club tail, tank-like |
| 023 | Parasaurolophus | Long curved head crest (trumpet), duck bill |
| 024 | Pachycephalosaurus | Thick dome skull for headbutting, bipedal |
| 025 | Carnotaurus | Bull-like horns, tiny arms (even smaller than T-Rex), fast |
| 026 | Therizinosaurus | Enormous 1-meter claws, pot-bellied, feathered |
| 027 | Giganotosaurus | Slightly larger than T-Rex, shark-like teeth, narrow skull |
| 028 | Deinonychus | The "real" raptor, sickle claw, pack hunter, feathered |
| 029 | Protoceratops | Small ceratopsian, beak face, early frill, sheep-sized |
| 030 | Quetzalcoatlus | Giant pterosaur, enormous wingspan, giraffe-sized on ground |

---

## 4. Generation Pipeline Script

```bash
# Step 1: Generate all 90 images (run from project root)
# Requires GEMINI_API_KEY environment variable

# Generate one dino at a time, all 3 stages
python scripts/generate-art.py --dino 1 --stage hatchling
python scripts/generate-art.py --dino 1 --stage juvenile  
python scripts/generate-art.py --dino 1 --stage adult

# Or batch all:
python scripts/generate-art.py --all

# Step 2: Review outputs in /public/dinos/
# Step 3: Re-generate any that missed the mark
# Step 4: Optimize with WebP conversion if not already
```

### Script Architecture (scripts/generate-art.py)

```python
"""
Batch art generator for Dinodex.
Uses Gemini API to generate anime dinosaur art.

Usage:
  python generate-art.py --dino 18 --stage adult
  python generate-art.py --all
  python generate-art.py --dino 18  # all 3 stages
"""

# 1. Load dinos.json for species names + features
# 2. Build prompt from templates + species features
# 3. Call Gemini API (gemini-2.5-flash-image)
# 4. Save to /public/dinos/{id}/{stage}.webp
# 5. Log results and any failures for re-run
```

---

## 5. Quality Checklist Per Image

Before accepting a generated image:

- [ ] Species is recognizable (correct features visible)
- [ ] Stage is appropriate (hatchling looks baby, adult looks powerful)
- [ ] Style is consistent anime (not photorealistic, not 3D render)
- [ ] Full body is visible (no cropping of limbs/tail)
- [ ] Background is white/clean (no busy backgrounds)
- [ ] No text or watermarks in the image
- [ ] Colors are vibrant and appealing
- [ ] Consistent with other stages of the same species

---

## 6. Placeholder Strategy

During development before art is generated:
- Use colored placeholder divs with the dino name
- Or use simple SVG silhouettes
- The app should work fully with placeholder art
- Art generation is a parallel workstream, not a blocker

```typescript
// Fallback in DinoArt component
const artSrc = imageExists(getArtPath(id, stage)) 
  ? getArtPath(id, stage) 
  : `/dinos/placeholder-${stage}.svg`;
```
