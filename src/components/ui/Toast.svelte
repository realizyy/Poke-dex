<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Toast } from '$lib/types';
	
	export let toast: Toast;
	
	const dispatch = createEventDispatcher<{
		close: string;
	}>();
	
	function handleClose() {
		dispatch('close', toast.id);
	}
	
	// Get icon for toast type
	function getIcon(type: string): string {
		const icons: Record<string, string> = {
			success: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
			</svg>`,
			error: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
			</svg>`,
			warning: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
			</svg>`,
			info: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
			</svg>`
		};
		return icons[type] || icons.info;
	}
	
	// Get colors for toast type
	function getColors(type: string): { bg: string; border: string; text: string; icon: string } {
		const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
			success: {
				bg: 'bg-green-50 dark:bg-green-900/20',
				border: 'border-green-200 dark:border-green-800',
				text: 'text-green-800 dark:text-green-200',
				icon: 'text-green-600 dark:text-green-400'
			},
			error: {
				bg: 'bg-red-50 dark:bg-red-900/20',
				border: 'border-red-200 dark:border-red-800',
				text: 'text-red-800 dark:text-red-200',
				icon: 'text-red-600 dark:text-red-400'
			},
			warning: {
				bg: 'bg-yellow-50 dark:bg-yellow-900/20',
				border: 'border-yellow-200 dark:border-yellow-800',
				text: 'text-yellow-800 dark:text-yellow-200',
				icon: 'text-yellow-600 dark:text-yellow-400'
			},
			info: {
				bg: 'bg-blue-50 dark:bg-blue-900/20',
				border: 'border-blue-200 dark:border-blue-800',
				text: 'text-blue-800 dark:text-blue-200',
				icon: 'text-blue-600 dark:text-blue-400'
			}
		};
		return colors[type] || colors.info;
	}
	
	$: colors = getColors(toast.type);
</script>

<div
	class="flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out {colors.bg} {colors.border}"
	role="alert"
	aria-live="polite"
>
	<!-- Icon -->
	<div class="flex-shrink-0 {colors.icon}">
		{@html getIcon(toast.type)}
	</div>
	
	<!-- Content -->
	<div class="flex-1 min-w-0">
		<h4 class="font-semibold {colors.text}">
			{toast.title}
		</h4>
		{#if toast.message}
			<p class="mt-1 text-sm {colors.text} opacity-90">
				{toast.message}
			</p>
		{/if}
	</div>
	
	<!-- Close Button -->
	<button
		onclick={handleClose}
		class="flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-black/10 dark:hover:bg-white/10 {colors.text}"
		aria-label="Close notification"
	>
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
		</svg>
	</button>
</div>