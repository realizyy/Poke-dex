# Frontend Architecture

## Stack

| Layer | Package | Version |
|---|---|---|
| Framework | SvelteKit | 2.55.0 |
| UI language | Svelte | 5.54.0 |
| Bundler | Vite | 6.4.1 |
| CSS | TailwindCSS | v4 (CSS-first, `@import 'tailwindcss'`) |
| Component library | DaisyUI | v5.5.19 |
| Icons | lucide-svelte | latest |
| Virtualisation | @tanstack/svelte-virtual | 3.13.23 |
| i18n | Paraglide JS | (inlang) |

---

## Theming

### Custom DaisyUI themes

Two themes are defined in `src/app.css`, both using oklch colour variables:

| Theme key | Usage |
|---|---|
| `pokedex` | Light mode — white base, red primary, yellow secondary |
| `pokedex-dark` | Dark mode — slate-900 base, same brand colours |

Theme is applied by setting **both** the `.dark` class **and** the `data-theme` attribute on `<html>`:

```ts
// src/lib/stores/theme.svelte.ts
document.documentElement.classList.toggle('dark', isDark);
document.documentElement.setAttribute('data-theme', isDark ? 'pokedex-dark' : 'pokedex');
```

This allows standard Tailwind `dark:` utilities and DaisyUI semantic tokens to both work simultaneously.

### Semantic utility classes

A set of `theme-*` helper classes is defined in `app.css` for consistent surface colours:

```
theme-bg-main         — main page background
theme-bg-secondary    — card / panel background
theme-text            — primary body text
theme-text-secondary  — muted text
theme-border          — border colour
```

Use these in preference to raw `bg-white dark:bg-gray-900` combinations.

### Pokémon type colours

Type colours are defined in two places:

1. **`tailwind.config.js` `theme.extend.colors`** — one colour per type name so you can write `bg-fire`, `text-water`, etc. in Tailwind JIT classes.
2. **`getTypeColor(type: string): string`** in `src/lib/utils/pokemon-utils.ts` — returns a hex string for use in inline `style=` attributes when a type name must be resolved at runtime.

---

## Svelte 5 conventions

### Reactivity runes

All new code uses Svelte 5 runes. The key runes used in this project:

| Rune | Purpose |
|---|---|
| `$state(val)` | Mutable reactive state |
| `$derived(expr)` | Computed value that updates when dependencies change |
| `$derived.by(() => {...})` | Derived with a block body |
| `$effect(() => {...})` | Side-effect that runs on dependency change |
| `$props()` | Destructure component props |
| `$bindable(val)` | Two-way bindable prop |

**Important:** Do not declare a derived inside a `const` without `$derived(...)`. The linter will warn `state_referenced_locally` because the value is captured once and becomes stale.

```svelte
<!-- ✅ correct -->
const cls = $derived(size === 'lg' ? 'text-xl' : 'text-sm');

<!-- ❌ incorrect — stale after first render -->
const cls = size === 'lg' ? 'text-xl' : 'text-sm';
```

### Event handlers

Use the new **lowercase callback** syntax — no `on:` directives:

```svelte
<!-- ✅ Svelte 5 -->
<button onclick={handleClick}>

<!-- ❌ Svelte 4 (removed) -->
<button on:click={handleClick}>
```

### Component props

Use `$props()` with an inline interface; mark two-way bindings with `$bindable()`:

```svelte
<script lang="ts">
  let {
    value = $bindable(''),
    onchange,
    disabled = false
  }: {
    value?: string;
    onchange?: (v: string) => void;
    disabled?: boolean;
  } = $props();
</script>
```

### Callback props (replaces `createEventDispatcher`)

Instead of dispatching custom events, accept callback props:

```svelte
<!-- Component -->
let { onsearch, onclear }: { onsearch?: (e: SearchEvent) => void; onclear?: () => void } = $props();

<!-- Parent -->
<SearchFilter onsearch={handleSearch} onclear={handleClear} />
```

---

## Store pattern

All application stores live in `src/lib/stores/` as **`.svelte.ts`** files.

### Class-based stores

Each store is a plain class whose fields are annotated with `$state` / `$derived`:

```ts
// src/lib/stores/example.svelte.ts
class ExampleStore {
  items: Item[] = $state([]);
  loading: boolean = $state(false);

  count = $derived(this.items.length);

  async loadItems() {
    this.loading = true;
    this.items = await fetchItems();
    this.loading = false;
  }
}

export const exampleStore = new ExampleStore();
```

### Consuming stores

Import the singleton directly — **no `.subscribe()`**, no `$` prefix needed in `.svelte.ts` files. In `.svelte` templates the store fields are reactive because the object itself is a Svelte 5 reactive class:

```svelte
<script lang="ts">
  import { exampleStore } from '$lib/stores/example.svelte';
</script>

{#each exampleStore.items as item}
  ...
{/each}
```

### Available stores

| Export | File | Responsibility |
|---|---|---|
| `searchStore` | `search.svelte.ts` | Pokémon search, filters, sort, pagination |
| `teamStore` | `team.svelte.ts` | Team CRUD, localStorage persistence |
| `battleStore` | `battle-store.svelte.ts` | Battle state, simulation |
| `modalStore` | `modal.svelte.ts` | Add-to-team modal visibility |
| `toastStore` | `toast-store.svelte.ts` | Toast notifications |
| `themeStore` | `theme.svelte.ts` | Light / dark mode toggle |

All are also re-exported from `src/lib/index.ts` via `$lib`.

> **Note:** Legacy `*.ts` store files (without `.svelte`) still exist for backward compatibility. Always import from the `.svelte.ts` version.

---

## Icons

All Lucide icons are centralised through a **barrel file** at `src/lib/icons/index.ts`. Import from there, not from `lucide-svelte` directly:

```ts
import { Search, Filter, ChevronDown, X } from '$lib/icons';
```

### Available icons

**Navigation:** `Home`, `Search`, `Users`, `Swords`  
**Actions:** `Plus`, `Trash2`, `Download`, `X`, `Check`, `ChevronDown`, `ChevronUp`, `ChevronLeft`, `ChevronRight`, `ArrowUp`, `ArrowDown`, `ArrowUpDown`  
**Status / Feedback:** `CheckCircle2`, `XCircle`, `AlertTriangle`, `Info`  
**Misc:** `Menu`, `Loader2`, `SearchX`, `MessageSquare`, `Star`, `Zap`, `Shield`, `Filter`, `SlidersHorizontal`

To add a new icon, add it to the barrel file first.

---

## UI atom components

### `TypeBadge`

Renders a single Pokémon type pill using the runtime `getTypeColor()` function.

```svelte
import TypeBadge from '$lib/components/ui/TypeBadge.svelte';

<TypeBadge type="fire" size="md" />
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `type` | `string` | required | Pokémon type name (lowercase) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Controls padding and font size |

### `StatBar`

Renders a labelled progress bar for a single base stat.

```svelte
import StatBar from '$lib/components/ui/StatBar.svelte';

<StatBar name="speed" value={120} />
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | `string` | required | Stat name (formatted automatically) |
| `value` | `number` | required | Base stat value |
| `max` | `number` | `255` | Full-width reference value |

Bar colour is determined by `getStatColor(value)` from `pokemon-utils.ts`:

| Range | Class |
|---|---|
| ≥ 100 | `bg-green-500` |
| ≥ 60 | `bg-yellow-500` |
| ≥ 30 | `bg-orange-500` |
| < 30 | `bg-red-500` |

---

## VirtualGrid

`src/components/ui/VirtualGrid.svelte` renders a **window-scroll virtualised grid** using `@tanstack/svelte-virtual`. Use it wherever a large, uniform card list needs to be displayed.

```svelte
import VirtualGrid from '$lib/components/ui/VirtualGrid.svelte';

<VirtualGrid items={searchStore.sortedPokemons} gap={24}>
  {#snippet item(pokemon)}
    <PokemonCard {pokemon} />
  {/snippet}
</VirtualGrid>
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `T[]` | required | Flat item array |
| `itemHeight` | `number` | `360` | Estimated card height in px (used for row height estimate) |
| `gap` | `number` | `24` | Vertical gap between rows in px |
| `item` | `Snippet<[T, number]>` | required | Snippet receiving `(item, globalIndex)` |

**Column count** is computed via `ResizeObserver` on the container:

| Container width | Columns |
|---|---|
| ≥ 1280 px | 4 |
| ≥ 1024 px | 3 |
| ≥ 640 px | 2 |
| < 640 px | 1 |

The virtualizer uses window-level scrolling (`createWindowVirtualizer`), so the page's natural scroll drives rendering. No wrapper overflow is needed.

---

## Image optimisation

Follow these conventions for every `<img>` tag:

| Image type | `loading` | `fetchpriority` | `width` / `height` |
|---|---|---|---|
| Above-the-fold hero | `eager` | `high` | exact dimensions |
| Navigation logo | `eager` | `high` | exact dimensions |
| Card sprite | `lazy` | *(omit)* | exact dimensions |
| Modal sprite | `lazy` | *(omit)* | exact dimensions |
| Evolution chain sprite | `lazy` | *(omit)* | exact dimensions |

Always provide explicit `width` and `height` to prevent layout shift (CLS).

---

## Route structure

```
src/routes/
  +layout.svelte          — App shell: header, theme, toasts
  +page.svelte            — Home / landing page
  +page.server.ts         — Home SSR data
  search/                 — Pokémon search with VirtualGrid
  pokemon/[name]/         — Pokémon detail page
  teams/                  — Team builder
  battle/                 — Battle simulator
```

---

## Internationalisation

UI strings use **Paraglide JS** (inlang). Message files live in `messages/en.json`. Import message functions from `$lib/i18n` or via the generated `$lib/paraglide/messages.js` barrel.
