# Pokédex — Feature Map (PokeAPI)

## ✅ Already Implemented

| Module | PokeAPI Endpoint | Features |
|---|---|---|
| **Search** | `/pokemon`, `/type/{name}` | Filter by type, generation, stats; infinite scroll; URL persistence |
| **Pokémon Detail** | `/pokemon/{id}`, `/pokemon-species/{id}` | Stats, abilities, moves, evolution chain, type weaknesses |
| **Team Builder** | — | CRUD teams, add Pokémon, localStorage persistence |
| **Battle Simulator** | — | Turn-based simulation, battle log, type effectiveness |

---

## 🔴 High Value

### 1. ✅ Item Encyclopedia — `/items`
**Endpoint:** `GET /item/{id}`, `GET /item-category/{id}`, `GET /item-pocket`
- Browse all items grouped by pocket (medicine, hold-items, key-items, poké-balls, machines)
- Sprite per item, category badge, cost (₽), short effect text
- Category sidebar filter + name search

### 2. ✅ Berry Mechanics — `/items/berries`
**Endpoint:** `GET /berry/{id}`
- All 64 berries with flavor profile chart (Spicy / Dry / Sweet / Bitter / Sour)
- Natural Gift type + power, growth time, max harvest
- Filter by dominant flavor

### 3. ✅ Move Detail Page — `/moves/[name]`
**Endpoint:** `GET /move/{id}`
- Power, accuracy, PP, priority, damage class (physical/special/status)
- Type badge, contest type, effect & ailment (burn, paralyze...)
- All Pokémon that learn this move

### 4. ✅ Ability Detail Page — `/abilities/[name]`
**Endpoint:** `GET /ability/{id}`
- In-battle & overworld effect description
- Flavor text per game
- All Pokémon with this ability

### 5. ✅ Nature Chart — `/natures`
**Endpoint:** `GET /nature/{id}` (25 natures)
- Stat boosted / reduced (+10%/−10%)
- Berry flavor preference
- Nature selector per TeamPokémon in Team Builder

---

## 🟡 Medium Value

### 6. Pokémon Comparison Tool — `/compare`
- Side-by-side stat bars, higher value highlighted
- URL param: `/compare?a=pikachu&b=raichu`
- Uses existing cache (no new API calls)

### 7. Type Coverage Calculator
- Input: select 1–2 attack types
- Output: super-effective / immune / neutral breakdown
- Uses `TYPE_EFFECTIVENESS` already in `pokemon-utils.ts`

### 8. Learnset by Game — Moves Tab Enhancement
**Endpoint:** `/pokemon/{id}` field `moves[].version_group_details`
- Level-up / TM / HM / Egg Move / Tutor + at level
- Currently shows only move names; API already returns full learnset data

### 9. Regional Pokédex Filter
**Endpoint:** `GET /pokedex/{id}` (Kanto, Johto, Hoenn...)
- Filter Pokémon by regional dex instead of just generation number

### 10. Pokémon Forms & Regional Variants
**Endpoint:** `GET /pokemon-form/{id}`
- Alolan / Galarian / Hisuian / Paldean forms
- Mega Evolution & Gigantamax sprites

---

## ✅ Lower Priority (Completed)

### 11. Encounter Locations ✅
**Endpoint:** `GET /pokemon/{id}/encounters`
- Locations per game version, encounter method (surfing, fishing, walking...)

### 12. Egg Group / Breeding Info ✅
**Endpoint:** `GET /egg-group/{id}` + species data
- Egg groups, gender rate, hatch counter, baby trigger item

### 13. Sprites Gallery — Detail Page Tab ✅
- Front/back, normal/shiny, dream world, home sprites
- API already returns all sprite variants

### 14. Machine (TM/HM/TR) Browser ✅
**Endpoint:** `GET /machine/{id}`
- TM number → item + move + version group

### 15. Berry Flavor → Contest Connection ✅
- Pokémon Contest appeal stats from species data
- Smoothness ↔ poffin flavor connection

---

## Implementation Priority

```
Sprint 1: Item Encyclopedia + Berry Mechanics    ✅ done
Sprint 2: Move Detail + Ability Detail           ✅ done
Sprint 3: Nature Chart                           ✅ done
Sprint 4-next: Nature selector in Team Builder
Sprint 4: Pokémon Comparison Tool
Sprint 5: Learnset by Game (Moves tab upgrade)
Sprint 6: Encounter Locations + Breeding Info
```
