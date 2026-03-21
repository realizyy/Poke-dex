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
	<div class="flex justify-between items-center mb-1">
		<span class="text-sm font-medium theme-text-secondary">{getStatName(name)}</span>
		<span class="text-sm font-bold theme-text">{value}</span>
	</div>
	<div class="w-full rounded-full h-2" style="background-color: var(--bg-tertiary);">
		<div
			class="h-2 rounded-full {getStatColor(value)} transition-all duration-500"
			style="width: {pct}%;"
		></div>
	</div>
</div>
