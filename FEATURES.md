# Pokédex — Feature Map (PokeAPI)

> Last updated: March 2026

---

## ✅ Implemented — Core

| Route | Description |
|---|---|
| `/` | Home — editorial hero, 6-feature grid, 8-Pokémon spotlight, stats strip |
| `/search` | Filter 1,025+ Pokémon by name, type, generation; infinite scroll; sort by ID / name / stats; URL persistence |
| `/pokemon/[name]` | Detail page — base stats, abilities, moves, evolution chain (visual), sprites gallery, encounter locations, breeding info, type weaknesses |
| `/teams` | CRUD team builder — up to 6 Pokémon per team, type-coverage analysis, JSON export, localStorage persistence |
| `/battle` | Turn-based battle simulator — team selection, type-effectiveness damage calc, battle log, win/lose result |
| `/compare` | Side-by-side comparison — stat bars (winner highlighted in green), types, weaknesses, physical info; URL params `?a=&b=` |

## ✅ Implemented — Items & Moves

| Route | Endpoint | Description |
|---|---|---|
| `/items` | `GET /item/{id}`, `/item-pocket` | Browse 500+ items by pocket (Poké Balls, Medicine, Hold Items, Machines, Misc, Mail) |
| `/items/berries` | `GET /berry/{id}` | All 64 berries with flavor chart (Spicy/Dry/Sweet/Bitter/Sour), Natural Gift type, growth stats |
| `/items/machines` | `GET /machine/{id}` | TM/HM browser filtered by version group |
| `/moves/[name]` | `GET /move/{id}` | Power, accuracy, PP, priority, damage class, ailment, Pokémon that learn it |
| `/abilities/[name]` | `GET /ability/{id}` | In-battle & overworld effect, flavor text per game, Pokémon list |
| `/natures` | `GET /nature/{id}` | All 25 natures — stat modifiers (+10%/−10%), berry flavor preference |

## ✅ Implemented — Infrastructure

| Layer | What's built |
|---|---|
| **Cache** | LRU cache with 10–60 min TTL per data type; `pokemon-cache.ts` tracks hit rate & memory |
| **Stores** | Svelte 5 rune stores: team, search, battle, modal, theme (light/dark/system), toast |
| **Services** | `pokemon-service`, `search-service`, `item-service`, `move-service`, `battle-service` |
| **Utils** | `type-effectiveness`, `type-colors`, stat helpers, sort utils, URL persistence utils |
| **Notifications** | Toast system (success / error / warning / info, auto-dismiss, max 5 queued) |
| **i18n** | Paraglide i18n foundation wired in `hooks.ts` |

---

## 🔴 High Value — Next Sprints

### 1. Learnset by Game — Moves Tab Upgrade
**Endpoint:** `/pokemon/{id}` → `moves[].version_group_details`
**Why:** Data is already fetched; UI only shows move names, not method or level.
- Tabs: Level-up / TM / Egg Move / Tutor / Transfer
- Show level learned, version group badge
- Already has move link → `/moves/[name]`

### 2. Pokémon Forms & Regional Variants — `/pokemon/[name]/forms`
**Endpoint:** `GET /pokemon-form/{id}`, `/pokemon-species/{id}`
**Why:** Alolan / Galarian / Hisuian / Paldean forms are highly searched.
- Sprite switcher on detail page (base → regional → mega → gmax)
- Different stat blocks per form
- Form badge on PokémonCard where applicable

### 3. Damage Calculator — `/calc`
**Custom — no new endpoint needed**
**Why:** Most popular tool in the competitive Pokémon community.
- Input: attacker Pokémon + move type + level + nature + EVs/IVs slider
- Input: defender Pokémon + level + EVs/IVs slider
- Output: damage range (min–max), % of HP, OHKO/2HKO label
- Uses `TYPE_EFFECTIVENESS` already in codebase + base damage formula
- Presets: 252 Atk / 252 Def spreads

### 4. Pokémon Quiz — `/quiz`
**Custom — uses existing Pokémon data**
**Why:** Engagement / re-visit driver, no new API calls needed.
- "Who's that Pokémon?" silhouette reveal with countdown timer
- 4 multiple-choice answers (random + correct)
- Score streak tracker (localStorage)
- Difficulty: Gen filter (only Gen 1, only Legendary, etc.)
- Share score card as image

### 5. Pokédex Completion Tracker — `/tracker`
**Custom — localStorage**
**Why:** Core loop for Pokémon fans — "catch 'em all."
- Grid of all 1,025 Pokémon; click to toggle caught / shiny / living dex
- Per-game profiles (Scarlet, Violet, GO, HOME)
- Progress bar per generation
- Export progress as JSON or share link (base64 URL param)

---

## 🟡 Medium Value

### 6. Type Coverage Calculator — `/coverage`
**Custom — zero new API calls**
- Select up to 6 attack types (simulate a team's offensive coverage)
- Output: which of the 18 types you cover super-effectively, which you miss
- Colour-coded matrix: green = 2× / red = 0.5× / grey = 1×
- `TYPE_EFFECTIVENESS` map already exists in `pokemon-utils.ts`

### 7. Regional Pokédex Filter
**Endpoint:** `GET /pokedex/{id}` (Kanto=2 … Paldea=31)
- Dropdown in Search page to filter by regional dex (not just by generation)
- Shows regional number alongside national number

### 8. Pokémon Size Comparison — `/compare` extension
**Uses existing `height` / `weight` fields**
- Visual silhouette size chart on the Compare page (relative to a 1.8m human outline)
- Derived stat: BMI / density (fun trivia)

### 9. Pokémon of the Day widget
**Custom — deterministic hash of date → Pokémon ID**
- Added to home page spotlight section
- Rotates daily without an API call (datestring → seed → ID 1–1025)
- Shows flavor text from `/pokemon-species/{id}`

### 10. Shiny Hunting Counter — `/tracker` tab
**Custom — localStorage**
- Per-Pokémon encounter counter (manual increment)
- Odds display based on method (chain fishing, Masuda, etc.)
- Reset with confirmation

---

## 🟢 Lower Priority / Polish

| Feature | Notes |
|---|---|
| **Nature selector in Team Builder** | Apply nature to a team slot → show adjusted stat values inline |
| **Move search / `/moves`** | List page for browsing/filtering all moves by type, damage class, power |
| **Ability list / `/abilities`** | List page for browsing abilities with effect summaries |
| **Location explorer / `/locations`** | `GET /region/{id}` + `/location/{id}` — map-style region → area → encounter list |
| **Egg group browser** | `GET /egg-group/{id}` — show all Pokémon per group, compatible pairs |
| **Favourite Pokémon bookmarks** | Heart icon on PokémonCard → saved to localStorage, accessible from header |
| **Team import (Showdown format)** | Paste a Showdown export string → parse into team slots |
| **Characteristic descriptions** | `/characteristic/{id}` — "Often lost in thought" → highest IV stat flavour |
| **PWA / offline mode** | Service-worker cache of first 151 Pokémon for offline browsing |

---

## Implementation Roadmap

```
Sprint 5 (current):  Learnset by Game (Moves tab upgrade)
Sprint 6:            Damage Calculator (/calc)
Sprint 7:            Pokémon Forms & Regional Variants
Sprint 8:            Pokédex Completion Tracker (/tracker)
Sprint 9:            Pokémon Quiz (/quiz)
Sprint 10:           Type Coverage Calculator + Regional Dex Filter
Ongoing polish:      Nature in Team Builder, Move/Ability list pages, Favourites
```
