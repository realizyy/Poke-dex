<script lang="ts">
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { toastStore } from '$lib/stores/toast-store.svelte';
	import Toast from './Toast.svelte';
</script>

<!-- Toast Container — desktop (top-right) -->
<div
	class="fixed top-4 right-4 z-50 hidden flex-col gap-2 max-w-sm w-full pointer-events-none md:flex"
	aria-live="polite"
	aria-label="Notifications"
>
	{#each toastStore.toasts as toast (toast.id)}
		<div
			class="pointer-events-auto"
			animate:flip={{ duration: 300 }}
			in:fly={{ x: 400, duration: 300 }}
			out:fly={{ x: 400, duration: 200 }}
		>
			<Toast {toast} onclose={(id) => toastStore.remove(id)} />
		</div>
	{/each}
</div>

<!-- Toast Container — mobile (below header) -->
<div
	class="fixed top-16 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none md:hidden"
	aria-live="polite"
	aria-label="Mobile notifications"
>
	{#each toastStore.toasts as toast (toast.id)}
		<div
			class="pointer-events-auto"
			animate:flip={{ duration: 300 }}
			in:fly={{ y: -100, duration: 300 }}
			out:fly={{ y: -100, duration: 200 }}
		>
			<Toast {toast} onclose={(id) => toastStore.remove(id)} />
		</div>
	{/each}
</div>

<style>
	/* Hide desktop container on mobile */
	@media (max-width: 768px) {
		.fixed.top-4.right-4 {
			display: none;
		}
	}
	
	/* Hide mobile container on desktop */
	@media (min-width: 769px) {
		.fixed.top-16.left-4.right-4 {
			display: none;
		}
	}
</style>