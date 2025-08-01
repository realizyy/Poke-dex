import { writable } from 'svelte/store';
import type { Toast, ToastOptions, ToastType } from '$lib/types';

const DEFAULT_DURATION = 5000; // 5 seconds
const MAX_TOASTS = 5; // Maximum number of toasts to show at once

function createToastStore() {
	const { subscribe, set, update } = writable<Toast[]>([]);

	// Generate unique ID for toast
	const generateId = (): string => {
		return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	};

	// Get toast configuration based on type
	const getToastConfig = (type: ToastType) => {
		const configs = {
			success: {
				duration: DEFAULT_DURATION,
				persistent: false
			},
			error: {
				duration: 8000, // Longer for errors
				persistent: false
			},
			warning: {
				duration: 6000,
				persistent: false
			},
			info: {
				duration: DEFAULT_DURATION,
				persistent: false
			}
		};
		return configs[type];
	};

	return {
		subscribe,

		// Add a new toast
		add: (options: ToastOptions): string => {
			const id = generateId();
			const config = getToastConfig(options.type || 'info');
			
			const toast: Toast = {
				id,
				type: options.type || 'info',
				title: options.title,
				message: options.message,
				duration: options.duration ?? config.duration,
				persistent: options.persistent ?? config.persistent,
				createdAt: new Date()
			};

			update(toasts => {
				const newToasts = [toast, ...toasts];
				// Limit the number of toasts
				return newToasts.slice(0, MAX_TOASTS);
			});

			// Auto remove toast after duration (if not persistent)
			if (!toast.persistent && toast.duration && toast.duration > 0) {
				setTimeout(() => {
					toastStore.remove(id);
				}, toast.duration);
			}

			return id;
		},

		// Remove a specific toast
		remove: (id: string) => {
			update(toasts => toasts.filter(toast => toast.id !== id));
		},

		// Clear all toasts
		clear: () => {
			set([]);
		},

		// Helper methods for different toast types
		success: (title: string, message?: string, options?: Partial<ToastOptions>): string => {
			return toastStore.add({
				type: 'success',
				title,
				message,
				...options
			});
		},

		error: (title: string, message?: string, options?: Partial<ToastOptions>): string => {
			return toastStore.add({
				type: 'error',
				title,
				message,
				...options
			});
		},

		warning: (title: string, message?: string, options?: Partial<ToastOptions>): string => {
			return toastStore.add({
				type: 'warning',
				title,
				message,
				...options
			});
		},

		info: (title: string, message?: string, options?: Partial<ToastOptions>): string => {
			return toastStore.add({
				type: 'info',
				title,
				message,
				...options
			});
		},

		// Utility methods
		count: (): number => {
			let count = 0;
			const unsubscribe = subscribe(toasts => {
				count = toasts.length;
			});
			unsubscribe();
			return count;
		}
	};
}

export const toastStore = createToastStore();