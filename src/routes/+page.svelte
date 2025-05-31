<script lang="ts">
	import { onDestroy } from 'svelte';

	// Rotating inspirational quotes for the hero section.
	const quotes: string[] = [
		'Empowering consultants to do their best work',
		'Automate the busy-work. Focus on insight.',
		'Deliver value faster than ever',
		'Built by consultants, for consultants'
	];

	let idx = 0;
	const timer = setInterval(() => (idx = (idx + 1) % quotes.length), 6000);
	onDestroy(() => clearInterval(timer));
</script>

<!-- Animated gradient background -------------------------------------------------- -->
<div
	class="bg-animate bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 fixed inset-0 -z-10"
	aria-hidden="true"
></div>

<!-- Navigation ------------------------------------------------------------------- -->
<nav
	class="absolute top-0 left-0 w-full flex items-center justify-between px-6 py-4 text-white backdrop-blur-md"
>
	<span class="font-extrabold text-2xl tracking-tight select-none">ConsultPro</span>
	<div class="space-x-3 flex items-center">
		<a href="/login" class="text-base px-4 py-2 rounded-md hover:bg-white/10 transition"
			>Log&nbsp;in</a
		>
		<a
			href="/signup"
			class="hidden md:inline-flex bg-white text-slate-900 rounded-md px-5 py-2 font-medium shadow hover:shadow-lg transition"
		>
			Get&nbsp;Started
		</a>
	</div>
</nav>

<!-- Hero -------------------------------------------------------------------------- -->
<main class="min-h-screen flex flex-col items-center justify-center text-center text-white px-4">
	<h1 class="text-5xl md:text-7xl font-extrabold text-shadow-lg mb-5 tracking-tight leading-tight">
		Konsulent<span class="text-primary-400">Pro</span>
	</h1>
	<p class="text-xl md:text-2xl font-light mb-12 max-w-3xl mx-auto">
		Bli en mer effektiv konsulent i dag du og!
	</p>

	<a
		href="/signup"
		class="bg-primary-400 hover:bg-primary-500 text-white px-10 py-4 text-lg rounded-lg shadow-lg transition"
	>
		Bli 1000% mer effektiv i dag
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

		/* Keyframes live inside @theme so they’re tree-shaken when unused */
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
	}

	/* Re-use the keyframe animation variable */
	.bg-animate {
		@apply bg-gradient-to-br;
		background-size: 300% 300%;
		animation: var(--animate-gradient);
	}
</style>
