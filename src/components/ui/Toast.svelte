<script lang="ts">
	import { CheckCircle2, XCircle, AlertTriangle, Info, X } from '$lib/icons';
	import type { Toast } from '$lib/types';

	interface Props {
		toast: Toast;
		onclose: (id: string) => void;
	}

	const { toast, onclose }: Props = $props();

	const iconMap = {
		success: CheckCircle2,
		error: XCircle,
		warning: AlertTriangle,
		info: Info
	} as const;

	// DaisyUI alert variant + high-contrast left-border treatment
	const styleMap: Record<string, { alertClass: string; borderColor: string; iconClass: string }> = {
		success: {
			alertClass: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
			borderColor: 'border-l-4 border-emerald-500',
			iconClass: 'text-emerald-600 dark:text-emerald-400'
		},
		error: {
			alertClass: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
			borderColor: 'border-l-4 border-red-500',
			iconClass: 'text-red-600 dark:text-red-400'
		},
		warning: {
			alertClass: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
			borderColor: 'border-l-4 border-amber-500',
			iconClass: 'text-amber-600 dark:text-amber-400'
		},
		info: {
			alertClass: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
			borderColor: 'border-l-4 border-blue-500',
			iconClass: 'text-blue-600 dark:text-blue-400'
		}
	};

	const styles = $derived(styleMap[toast.type] ?? styleMap.info);
	const IconComponent = $derived(iconMap[toast.type as keyof typeof iconMap] ?? Info);
</script>

<div
	class="alert flex items-start gap-3 rounded-lg shadow-lg {styles.alertClass} {styles.borderColor}"
	role="alert"
	aria-live="polite"
>
	<!-- Icon -->
	<div class="mt-0.5 flex-shrink-0 {styles.iconClass}">
		<IconComponent size={20} />
	</div>

	<!-- Content -->
	<div class="flex-1 min-w-0">
		<p class="font-semibold leading-snug">{toast.title}</p>
		{#if toast.message}
			<p class="mt-0.5 text-sm opacity-80">{toast.message}</p>
		{/if}
	</div>

	<!-- Close Button -->
	<button
		onclick={() => onclose(toast.id)}
		class="flex-shrink-0 rounded-lg p-1 opacity-60 transition-opacity hover:opacity-100"
		aria-label="Close notification"
	>
		<X size={16} />
	</button>
</div>
