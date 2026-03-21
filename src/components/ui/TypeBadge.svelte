<script lang="ts">
	import { getTypeColor } from '$lib/utils/pokemon-utils';

	interface Props {
		type: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let { type, size = 'md' }: Props = $props();

	const cls = $derived(size === 'sm'
		? 'px-1.5 py-0.5 text-xs'
		: size === 'lg'
		? 'px-4 py-2 text-sm'
		: 'px-2 py-0.5 text-xs');
</script>

<span
	class="rounded-full font-semibold text-white capitalize {cls}"
	style="background-color: {getTypeColor(type)};"
>
	{type}
</span>
