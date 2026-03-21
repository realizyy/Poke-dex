import type { Toast, ToastOptions, ToastType } from '$lib/types';

const DEFAULT_DURATION = 5000;
const MAX_TOASTS = 5;

class ToastStore {
	toasts: Toast[] = $state([]);

	private generateId(): string {
		return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	private getConfig(type: ToastType) {
		const configs = {
			success: { duration: DEFAULT_DURATION, persistent: false },
			error: { duration: 8000, persistent: false },
			warning: { duration: 6000, persistent: false },
			info: { duration: DEFAULT_DURATION, persistent: false }
		};
		return configs[type];
	}

	add(options: ToastOptions): string {
		const id = this.generateId();
		const config = this.getConfig(options.type || 'info');

		const toast: Toast = {
			id,
			type: options.type || 'info',
			title: options.title,
			message: options.message,
			duration: options.duration ?? config.duration,
			persistent: options.persistent ?? config.persistent,
			createdAt: new Date()
		};

		this.toasts = [toast, ...this.toasts].slice(0, MAX_TOASTS);

		if (!toast.persistent && toast.duration && toast.duration > 0) {
			setTimeout(() => this.remove(id), toast.duration);
		}

		return id;
	}

	remove(id: string) {
		this.toasts = this.toasts.filter((t) => t.id !== id);
	}

	clear() {
		this.toasts = [];
	}

	success(title: string, message?: string, options?: Partial<ToastOptions>): string {
		return this.add({ type: 'success', title, message, ...options });
	}

	error(title: string, message?: string, options?: Partial<ToastOptions>): string {
		return this.add({ type: 'error', title, message, ...options });
	}

	warning(title: string, message?: string, options?: Partial<ToastOptions>): string {
		return this.add({ type: 'warning', title, message, ...options });
	}

	info(title: string, message?: string, options?: Partial<ToastOptions>): string {
		return this.add({ type: 'info', title, message, ...options });
	}

	get count(): number {
		return this.toasts.length;
	}
}

export const toastStore = new ToastStore();
