<script lang="ts">
	import { onDestroy } from 'svelte';
	import NavBar from '$lib/NavBar.svelte';
	import { goto } from '$app/navigation';

	// Rotating inspirational quotes for the hero section.
	const quotes: string[] = [
		'Empowering consultants to do their best work',
		'Automate the busy-work. Focus on insight.',
		'Deliver value faster than ever',
		'Built by consultants, for consultants'
	];

	let idx = $state(0);
	const timer = setInterval(() => (idx = (idx + 1) % quotes.length), 3000);
	onDestroy(() => clearInterval(timer));

	let { data } = $props();

	function handle() {
		if (data.user) {
			console.log('test');
			goto('/technology');
		} else {
			goto('signup');
		}
	}
</script>

<!-- Animated gradient background -------------------------------------------------- -->
<div
	class="bg-animate bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 fixed inset-0 -z-10"
	aria-hidden="true"
></div>

<!-- Navigation ------------------------------------------------------------------- -->
<NavBar {data} />

<!-- Hero -------------------------------------------------------------------------- -->
<main class="min-h-screen flex flex-col items-center justify-center text-center text-white px-4">
	<h1 class="text-5xl md:text-7xl font-extrabold text-shadow-lg mb-5 tracking-tight leading-tight">
		Consultant<span class="text-primary-400">Pro</span>
	</h1>
	<p class="text-xl md:text-2xl font-light mb-12 max-w-3xl mx-auto">
		Become a more effective consultant today!
	</p>
	<p>
		{quotes[idx]}
	</p>
	<a
		role="button"
		onclick={handle}
		class="bg-primary-400 hover:bg-primary-500 text-white px-10 py-4 text-lg rounded-lg shadow-lg transition"
	>
		Become 1000% more efficient today
	</a>
</main>

<!-- Styles ------------------------------------------------------------------------ -->
<style>
	/* Tailwind v4 syntax — design tokens via @theme */
	@theme {
		/* Brand colours (OKLCH is preferred in v4) */
		--color-primary-400: oklch(0.7 0.16 255);
		--color-primary-500: oklch(0.62 0.18 255);

		/* Animation timing variable */
		--animate-gradient: gradient 20s ease infinite;
		--animate-fade-in: fade-in 0.3s ease-out;

		/* Keyframes live inside @theme so they're tree-shaken when unused */
		@keyframes gradient {
			0% {
				background-position: 0% 50%;
			}
			50% {
				background-position: 100% 50%;
			}
			100% {
				background-position: 0% 50%;
			}
		}

		@keyframes fade-in {
			0% {
				opacity: 0;
				transform: translateY(-10px);
			}
			100% {
				opacity: 1;
				transform: translateY(0);
			}
		}
	}

	/* Re-use the keyframe animation variable */
	.bg-animate {
		@apply bg-gradient-to-br;
		background-size: 300% 300%;
		animation: var(--animate-gradient);
	}

	.animate-fade-in {
		animation: var(--animate-fade-in);
	}
</style>
