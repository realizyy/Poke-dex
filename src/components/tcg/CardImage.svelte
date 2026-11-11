<script lang="ts">
	import { Layers } from '#lib/icons';
	import { TcgService } from '#lib/services/tcg-service';

	let {
		image,
		alt,
		quality = 'low',
		eager = false,
		width = 200,
		height = 280,
		iconSize = 32,
		class: className = ''
	}: {
		image?: string;
		alt: string;
		quality?: 'high' | 'low';
		eager?: boolean;
		width?: number;
		height?: number;
		iconSize?: number;
		class?: string;
	} = $props();

	let failedImage = $state<string | undefined>();
	const failed = $derived(failedImage !== undefined && failedImage === image);
</script>

{#if image && !failed}
	<img
		src={TcgService.cardImageUrl(image, quality)}
		{alt}
		class={className}
		loading={eager ? 'eager' : 'lazy'}
		{width}
		{height}
		onerror={() => (failedImage = image)}
	/>
{:else}
	<div
		class="flex aspect-[5/7] w-full flex-col items-center justify-center gap-1 rounded-lg p-2 text-center {className}"
		style="background: var(--bg-main); border: 1px dashed var(--border-color); color: var(--text-muted);"
		role="img"
		aria-label="{alt}, no image available"
	>
		<Layers size={iconSize} class="opacity-40" />
		<span class="text-[10px] font-semibold">No image</span>
	</div>
{/if}
