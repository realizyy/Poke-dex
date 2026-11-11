<script lang="ts">
	import { getStatName, getStatColor } from '$lib/utils/pokemon-utils';

	interface Props {
		name: string;
		value: number;
		/** Max value for the bar (default 255). */
		max?: number;
	}

	let { name, value, max = 255 }: Props = $props();

	const pct = $derived(Math.min((value / max) * 100, 100));
</script>

<div>
	<div class="mb-1 flex items-center justify-between">
		<span class="theme-text-secondary text-sm font-medium">{getStatName(name)}</span>
		<span class="theme-text text-sm font-bold">{value}</span>
	</div>
	<div class="h-2 w-full rounded-full" style="background-color: var(--bg-tertiary);">
		<div
			class="h-2 rounded-full {getStatColor(value)} transition-all duration-500"
			style="width: {pct}%;"
		></div>
	</div>
</div>
