<script lang="ts">
	import { theme, toggleTheme } from '$lib/stores/theme';
	import { browser } from '$app/environment';
	
	// Reactive statement untuk menentukan apakah dalam dark mode
	$: isDark = $theme === 'dark' || ($theme === 'system' && browser && window?.matchMedia?.('(prefers-color-scheme: dark)').matches);
	
	function handleToggle() {
		toggleTheme();
	}
</script>

<div class="theme-switcher-container">
	<input 
		type="checkbox" 
		id="switcher-input" 
		class="switcher-input" 
		checked={isDark}
		on:change={handleToggle}
	/>
	<label for="switcher-input" class="switcher-label">
		<div class="icon-container">
			<svg class="moon-icon" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
				<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/>
			</svg>
			<svg class="sun-icon" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
				<circle cx="12" cy="12" r="4"/>
				<g stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
					<line x1="12" y1="1" x2="12" y2="3"/>
					<line x1="12" y1="21" x2="12" y2="23"/>
					<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
					<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
					<line x1="1" y1="12" x2="3" y2="12"/>
					<line x1="21" y1="12" x2="23" y2="12"/>
					<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
					<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
				</g>
			</svg>
		</div>
		<span class="switcher-toggler"></span>
	</label>
</div>

<style>
	.theme-switcher-container {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.switcher-input {
		height: 0;
		width: 0;
		visibility: hidden;
	}

	.switcher-label {
		cursor: pointer;
		width: 44px;
		height: 24px;
		background: var(--bg-secondary);
		display: block;
		border-radius: 100px;
		position: relative;
		border: 1px solid var(--border-color);
		transition: all 0.3s ease;
		overflow: hidden;
	}

	.switcher-label:hover {
		background: var(--bg-tertiary);
	}

	.switcher-label:after {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: 16px;
		height: 16px;
		background: var(--text-main);
		border-radius: 90px;
		transition: 0.3s ease;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		z-index: 2;
	}

	.switcher-input:checked + .switcher-label {
		background: var(--bg-secondary);
		border-color: var(--border-color);
	}

	.switcher-input:checked + .switcher-label:after {
		left: calc(100% - 2px);
		transform: translateX(-100%);
	}

	.switcher-label:active:after {
		width: 20px;
	}

	/* Icons container */
	.icon-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 3px;
		z-index: 1;
	}

	/* Icons styling */
	.switcher-label svg {
		color: var(--text-secondary);
		transition: color 0.3s ease;
		opacity: 0.7;
	}

	.switcher-label .moon-icon {
		transform: translateX(1px);
	}

	.switcher-label .sun-icon {
		transform: translateX(-1px);
	}

	/* Dark mode adjustments */
	:global(.dark) .switcher-label {
		background: var(--bg-secondary);
		border-color: var(--border-color);
	}

	:global(.dark) .switcher-label:after {
		background: var(--text-main);
	}

	:global(.dark) .switcher-label svg {
		color: var(--text-secondary);
	}

	/* Focus styles for accessibility */
	.switcher-input:focus + .switcher-label {
		outline: 2px solid rgb(59 130 246);
		outline-offset: 2px;
	}

	/* Animation for smooth transitions */
	.switcher-label,
	.switcher-label:after,
	.switcher-label svg {
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Hover effects */
	.switcher-label:hover svg {
		opacity: 1;
	}
</style>
