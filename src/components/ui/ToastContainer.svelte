<script lang="ts">
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { toastStore } from '$lib/stores/toast-store';
	import Toast from './Toast.svelte';
	import type { Toast as ToastType } from '$lib/types';
	
	let toasts: ToastType[] = [];
	
	// Subscribe to toast store
	toastStore.subscribe(value => {
		toasts = value;
	});
	
	function handleToastClose(event: CustomEvent<string>) {
		toastStore.remove(event.detail);
	}
</script>

<!-- Toast Container -->
<div
	class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
	aria-live="polite"
	aria-label="Notifications"
>
	{#each toasts as toast (toast.id)}
		<div
			class="pointer-events-auto"
			animate:flip={{ duration: 300 }}
			in:fly={{ x: 400, duration: 300, delay: 0 }}
			out:fly={{ x: 400, duration: 200 }}
		>
			<Toast {toast} on:close={handleToastClose} />
		</div>
	{/each}
</div>

<!-- Mobile Toast Container -->
<div
	class="fixed top-16 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none md:hidden"
	aria-live="polite"
	aria-label="Mobile notifications"
>
	{#each toasts as toast (toast.id)}
		<div
			class="pointer-events-auto"
			animate:flip={{ duration: 300 }}
			in:fly={{ y: -100, duration: 300, delay: 0 }}
			out:fly={{ y: -100, duration: 200 }}
		>
			<Toast {toast} on:close={handleToastClose} />
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