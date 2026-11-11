<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { TCG_LANGUAGES, langCookie, parseTcgLang } from '#lib/utils/tcg-lang';

	let { data, children } = $props();

	const TOOLS = [
		{ href: '/tcg', label: 'Sets', exact: true },
		{ href: '/tcg/cards', label: 'Search cards' },
		{ href: '/tcg/collection', label: 'My collection' },
		{ href: '/tcg/decks', label: 'Deck builder' }
	];

	const isActive = (tool: (typeof TOOLS)[number]) =>
		tool.exact ? page.url.pathname === tool.href : page.url.pathname.startsWith(tool.href);
	const showLanguage = $derived(!page.url.pathname.startsWith('/tcg/decks'));

	async function changeLanguage(event: Event) {
		const lang = parseTcgLang((event.currentTarget as HTMLSelectElement).value);
		document.cookie = langCookie(lang);
		await invalidateAll();
	}
</script>

<div
	class="border-b"
	style="border-color: var(--border-color); background-color: var(--bg-secondary);"
>
	<div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
		<nav class="flex flex-wrap gap-2" aria-label="TCG tools">
			{#each TOOLS as tool (tool.href)}
				<a
					href={tool.href}
					aria-current={isActive(tool) ? 'page' : undefined}
					class="rounded-full px-4 py-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
					style={isActive(tool)
						? 'background: var(--brand-red); color: white;'
						: 'background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color);'}
				>
					{tool.label}
				</a>
			{/each}
		</nav>
		{#if showLanguage}
			<div class="flex items-center gap-2">
				<label for="tcg-language" class="text-xs font-bold tracking-wider uppercase">
					<span style="color: var(--text-muted);">Card language</span>
				</label>
				<select
					id="tcg-language"
					value={data.lang}
					onchange={changeLanguage}
					class="rounded-xl px-3 py-1.5 text-sm"
					style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main);"
				>
					{#each TCG_LANGUAGES as l (l.id)}
						<option value={l.id}>{l.label}</option>
					{/each}
				</select>
			</div>
		{/if}
	</div>
</div>

{@render children()}
