<script lang="ts">
	import { theme, toggleTheme } from '../../stores/theme';
	
	function getThemeIcon(currentTheme: string) {
		switch (currentTheme) {
			case 'light':
				return {
					icon: '☀️',
					label: 'Light Mode'
				};
			case 'dark':
				return {
					icon: '🌙',
					label: 'Dark Mode'
				};
			case 'system':
				return {
					icon: '💻',
					label: 'System'
				};
			default:
				return {
					icon: '💻',
					label: 'System'
				};
		}
	}
	
	$: themeInfo = getThemeIcon($theme);
</script>

<button
	on:click={toggleTheme}
	class="group relative flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300 shadow-lg hover:shadow-xl"
	title="Toggle theme: {themeInfo.label}"
	aria-label="Toggle theme"
>
	<div class="relative text-xl transition-transform duration-300 group-hover:scale-110">
		{themeInfo.icon}
	</div>
	
	<!-- Tooltip -->
	<div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
		{themeInfo.label}
		<div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
	</div>
</button>
