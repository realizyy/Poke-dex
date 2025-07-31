<script lang="ts">
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let text: string = 'Loading...';
	export let showText: boolean = true;

	const sizeClasses = {
		sm: 'w-8 h-8',
		md: 'w-16 h-16',
		lg: 'w-24 h-24'
	};
</script>

<div class="flex flex-col items-center justify-center gap-4 p-6">
	<!-- Pokeball Spinner -->
	<div class="pokeball-spinner {sizeClasses[size]}" role="status" aria-label="Loading">
		<span class="sr-only">Loading...</span>
	</div>

	<!-- Loading Text -->
	{#if showText}
		<p class="text-lg font-semibold tracking-wide">
			{text}
		</p>
	{/if}
</div>

<style>
	/* Component-specific pokeball spinner sizing */
	:global(.pokeball-spinner.w-8) {
		width: 32px;
		height: 32px;
	}
	:global(.pokeball-spinner.w-16) {
		width: 64px;
		height: 64px;
	}
	:global(.pokeball-spinner.w-24) {
		width: 96px;
		height: 96px;
	}

	/* Adjust center button size based on spinner size */
	:global(.pokeball-spinner.w-8::before) {
		width: 8px;
		height: 8px;
	}
	:global(.pokeball-spinner.w-8::after) {
		width: 4px;
		height: 4px;
	}

	:global(.pokeball-spinner.w-16::before) {
		width: 16px;
		height: 16px;
	}
	:global(.pokeball-spinner.w-16::after) {
		width: 8px;
		height: 8px;
	}

	:global(.pokeball-spinner.w-24::before) {
		width: 24px;
		height: 24px;
	}
	:global(.pokeball-spinner.w-24::after) {
		width: 12px;
		height: 12px;
	}
</style>
