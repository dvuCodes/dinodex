# DINODEX — Design System & Aesthetic Guide

> Anime Pokédex aesthetic: playful, colorful, collectible, Japanese-inspired.
> Think: if Game Freak designed a paleontology app.

---

## 1. Design Philosophy

**Core Feeling:** Opening Dinodex should feel like opening a real Pokédex — a mix of excitement, discovery, and "gotta see 'em all." Every interaction should reward curiosity.

**Aesthetic Direction:** Japanese anime meets natural history museum. Clean but expressive. Colorful but not chaotic. Information-dense but scannable. The UI itself is a character — it has personality.

**Key Principles:**
1. **Collectible energy** — Every card should feel like something you'd want to "collect"
2. **Stage reveals** — Switching evolution stages should feel like unwrapping a surprise
3. **Readable at a glance** — Stats, diet, era all scannable in <2 seconds
4. **Consistent but varied** — Same layout structure, but each dino's color/art makes it feel unique

---

## 2. Color Tokens

### 2.1 Era Colors (Primary Categorization)
```css
/* Triassic — warm, ancient, dawn-of-time */
--era-triassic: #B45309;
--era-triassic-light: #FEF3C7;
--era-triassic-mid: #F59E0B;
--era-triassic-dark: #78350F;

/* Jurassic — lush, verdant, peak dino era */
--era-jurassic: #047857;
--era-jurassic-light: #D1FAE5;
--era-jurassic-mid: #10B981;
--era-jurassic-dark: #064E3B;

/* Cretaceous — volcanic, dramatic, end times */
--era-cretaceous: #B91C1C;
--era-cretaceous-light: #FEE2E2;
--era-cretaceous-mid: #EF4444;
--era-cretaceous-dark: #7F1D1D;
```

### 2.2 Diet Colors
```css
--diet-carnivore: #DC2626;
--diet-carnivore-light: #FEE2E2;
--diet-herbivore: #16A34A;
--diet-herbivore-light: #DCFCE7;
--diet-omnivore: #D97706;
--diet-omnivore-light: #FEF3C7;
--diet-piscivore: #2563EB;
--diet-piscivore-light: #DBEAFE;
```

### 2.3 Evolution Stage Colors
```css
--stage-hatchling: #16A34A;
--stage-hatchling-bg: #BBF7D0;
--stage-juvenile: #D97706;
--stage-juvenile-bg: #FDE68A;
--stage-adult: #DC2626;
--stage-adult-bg: #FECACA;
```

### 2.4 Stat Bar Colors
```css
--stat-height: #EF4444;    /* Red */
--stat-length: #F97316;    /* Orange */
--stat-weight: #EAB308;    /* Yellow */
--stat-speed: #3B82F6;     /* Blue */
--stat-danger: #8B5CF6;    /* Purple */
--stat-defense: #06B6D4;   /* Cyan */
```

### 2.5 UI Base Colors
```css
--bg-primary: #FFFBF0;    /* Warm cream — parchment feel */
--bg-card: #FFFFFF;
--bg-surface: #FFF8ED;
--border-default: #E5E0D5;
--border-hover: #D4CFC4;
--text-primary: #1C1917;
--text-secondary: #78716C;
--text-muted: #A8A29E;
--accent: #E11D48;         /* Rose — primary interactive color */
--accent-hover: #BE123C;
```

---

## 3. Typography

### 3.1 Font Stack
```css
/* Display — Logo, dino names, section headings */
font-family: 'M PLUS Rounded 1c', sans-serif;
/* Weights: 400 (body), 700 (display headings), 900 (logo) */

/* Body — Descriptions, info labels, general text */
font-family: 'Noto Sans', sans-serif;
/* Weights: 400 (regular), 500 (medium), 700 (bold) */

/* Mono — Pokédex numbers, stat values */
font-family: 'JetBrains Mono', monospace;
/* Weight: 500 */
```

### 3.2 Type Scale
```
Logo:          36px / 900 weight / M PLUS Rounded 1c
Page heading:  28px / 700 weight / M PLUS Rounded 1c
Dino name:     20px / 700 weight / M PLUS Rounded 1c (card)
               28px / 700 weight / M PLUS Rounded 1c (detail)
Dex number:    14px / 500 weight / JetBrains Mono (card)
               24px / 500 weight / JetBrains Mono (detail hero)
Section head:  16px / 700 weight / Noto Sans
Body text:     14px / 400 weight / Noto Sans
Stat label:    13px / 500 weight / Noto Sans
Stat value:    13px / 500 weight / JetBrains Mono
Filter chip:   13px / 500 weight / Noto Sans
Caption:       12px / 400 weight / Noto Sans
```

---

## 4. Component Specifications

### 4.1 DinoCard (Grid Card)

```
┌─────────────────────────┐  Border: 2px solid [diet-color]
│ #001              🥩    │  Border-radius: 16px
│                         │  Background: white
│   ┌─────────────────┐   │  Shadow: 0 2px 8px rgba(0,0,0,0.06)
│   │                 │   │  Hover shadow: 0 8px 24px rgba(0,0,0,0.12)
│   │   [Dino Art]    │   │  Hover transform: translateY(-4px)
│   │   512×512       │   │  Transition: all 200ms ease
│   │                 │   │
│   └─────────────────┘   │  Art container: 
│                         │    aspect-ratio: 1/1
│   Tyrannosaurus Rex     │    border-radius: 12px
│   🥩 Carnivore          │    background: [era-color-light]
│   Cretaceous            │    overflow: hidden
└─────────────────────────┘
                              Card padding: 12px
Width: fills grid column      Art gap: 8px below art
Min-width: 150px              Name: 16px/700 M PLUS
Max-width: 280px              Diet: 12px/400 with emoji
```

### 4.2 StageSelector

```
┌──────────┐ ┌──────────┐ ┌──────────┐
│🥚Hatchling│ │⚡ Juvenile│ │ 🔥 Adult │  ← Active: filled bg, white text
└──────────┘ └──────────┘ └──────────┘    Inactive: outlined, colored text

Height: 40px
Border-radius: 20px (pill)
Gap between: 8px
Font: 14px/500 Noto Sans
Active: bg=[stage-color], text=white, shadow
Inactive: border=1px [stage-color], text=[stage-color], bg=transparent
Transition: background 200ms, color 200ms
```

### 4.3 StatBar

```
Height ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 5.6m

Label (left)  ████████████████████░░░░░░░  Value (right)
              ↑ filled portion             ↑ actual number

Bar height: 12px
Bar border-radius: 6px (pill)
Bar bg (empty): #F1F0EB
Bar fill: [stat-color]
Label: 13px/500 Noto Sans, text-secondary
Value: 13px/500 JetBrains Mono, text-primary
Animation: width from 0 to target, 500ms spring ease
Delay: stagger 50ms per bar (6 bars = 0, 50, 100, 150, 200, 250ms)
```

### 4.4 FilterChip

```
┌──────────┐
│ Jurassic │
└──────────┘

Height: 32px
Padding: 0 16px
Border-radius: 16px (pill)
Font: 13px/500 Noto Sans
Active: bg=[era-color], text=white
Inactive: bg=transparent, border=1px solid #E5E0D5, text=#78716C
Hover (inactive): bg=#F5F3EE
Transition: all 150ms ease
```

---

## 5. Layout Specifications

### 5.1 Home Page
```
┌──────────────────────────────────┐
│         🦕 DINODEX               │ ← Header: h=64px, sticky
│     Dinosaur Encyclopedia        │
├──────────────────────────────────┤
│ [🔍 Search dinosaurs...       ]  │ ← Search: mx=16px, mt=16px
│                                  │
│ [All] [Triassic] [Jurassic] ... │ ← Chips: horizontal scroll
│                                  │
│ ┌─────────┐ ┌─────────┐         │ ← Grid: gap=16px, px=16px
│ │  #001   │ │  #002   │         │
│ │ T-Rex   │ │ Tricera │         │
│ └─────────┘ └─────────┘         │
│ ┌─────────┐ ┌─────────┐         │
│ │  #003   │ │  #004   │         │
│ │ Stego   │ │ Raptor  │         │
│ └─────────┘ └─────────┘         │
│ ...                              │
└──────────────────────────────────┘

Container max-width: 1200px (centered)
Grid: auto-fill, minmax(160px, 1fr)
Gap: 16px
Padding: 16px horizontal
```

### 5.2 Detail Page
```
┌──────────────────────────────────┐
│ ← Back to Dinodex        #018   │ ← Top bar
├──────────────────────────────────┤
│                                  │
│         [Dino Art Hero]          │ ← Full-width, aspect 4:3
│         1024×1024                │    Background: era gradient
│                                  │
├──────────────────────────────────┤
│   Tyrannosaurus Rex              │ ← Name: 28px/700
│   "Tyrant Lizard King"           │ ← Meaning: 14px italic
│   tie-RAN-oh-SORE-us             │ ← Pronunciation: 13px mono
│                                  │
│  [🥚 Hatchling] [⚡ Juvenile]    │ ← Stage selector
│  [🔥 Adult]                      │
│                                  │
│  ── Stats ─────────────────────  │
│  Height  ████████████████  5.6m  │
│  Length  █████████████████ 12.3m │
│  Weight  ██████████████── 8.0T   │
│  Speed   ████████────── 32km/h   │
│  Danger  █████████████████ 9/10  │
│  Defense ████─────────── 3/10    │
│                                  │
│  ── Info ──────────────────────  │
│  Era: Late Cretaceous            │
│  Region: North America           │
│  Type: Theropod                  │
│  Discovered: Osborn, 1905        │
│                                  │
│  Fun fact text here about the    │
│  dinosaur at this stage...       │
│                                  │
│  ── Related ───────────────────  │
│  [Giga] [Allo] [Carno] [Spino]  │ ← Horizontal scroll
└──────────────────────────────────┘
```

---

## 6. Animation Specifications

### 6.1 Page Load — Home
1. Header fades in (0ms, 300ms duration)
2. Search bar slides up (100ms delay, 300ms)
3. Filter chips slide in from left (200ms delay, 300ms)
4. Cards stagger in from bottom (300ms base, +30ms per card, 400ms each)
   - Use Framer Motion `staggerChildren: 0.03`

### 6.2 Card Hover
- Transform: translateY(-4px)
- Shadow: grows from default to elevated
- Border: brightens slightly
- Duration: 200ms ease

### 6.3 Page Transition (Home → Detail)
- Card scales up and fades (if using shared layout animation)
- Or: simple fade transition (300ms)
- Framer Motion `AnimatePresence` + `layoutId` for shared element

### 6.4 Evolution Stage Change
1. Art: opacity 1→0 (200ms) → swap image → opacity 0→1 (300ms)
2. Sparkle: CSS keyframe burst at center of art (200ms at midpoint)
3. Stats: each bar width transitions (500ms spring, stagger 50ms)
4. Description: opacity 1→0→1 (200ms each half)
5. Stage button: scale(1.05) bounce on select (150ms)

### 6.5 Stat Bar Load
- Initial: width=0
- Animate to: width=[percentage]%
- Duration: 600ms
- Easing: spring(stiffness: 100, damping: 15)
- Stagger: 60ms between bars

---

## 7. Responsive Breakpoints

```
Mobile:   320px – 639px   → 2-col grid, stacked detail
Tablet:   640px – 1023px  → 3-col grid, stacked detail
Desktop:  1024px+         → 4-col grid, side-by-side detail option
```

### Mobile-specific:
- Filter chips: horizontal scroll, no wrap
- Detail art: full-width
- Stats: full-width
- Related: horizontal scroll

### Desktop-specific:
- Grid: 4 columns, centered container
- Detail: consider 2-column layout (art left, info right)
- Larger art display
- Hover states visible

---

## 8. Tailwind Configuration

```typescript
// tailwind.config.ts — key extensions
{
  theme: {
    extend: {
      colors: {
        cream: '#FFFBF0',
        parchment: '#FFF8ED',
        'era-triassic': '#F59E0B',
        'era-jurassic': '#10B981',
        'era-cretaceous': '#EF4444',
        'diet-carnivore': '#DC2626',
        'diet-herbivore': '#16A34A',
        'diet-omnivore': '#D97706',
        'stage-hatchling': '#16A34A',
        'stage-juvenile': '#D97706',
        'stage-adult': '#DC2626',
      },
      fontFamily: {
        display: ['"M PLUS Rounded 1c"', 'sans-serif'],
        body: ['"Noto Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'card': '16px',
        'pill': '9999px',
      },
      animation: {
        'sparkle': 'sparkle 0.6s ease-out forwards',
        'bar-fill': 'barFill 0.6s ease-out forwards',
      },
    },
  },
}
```
