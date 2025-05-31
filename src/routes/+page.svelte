<script lang="ts">
	import { onDestroy } from 'svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { categorizeTechnology } from '$lib/utils/techCategories';

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

	export let data;
	console.log('Page data:', data);
	console.log('User data:', data?.user);

	let technology = '';
	let error = '';
	let success = false;

	// Define the type for a technology
	type Technology = {
		id: string;
		name: string;
		type: string;
		createdAt: Date;
		updatedAt: Date;
		userId: string;
	};

	// Group technologies by type
	$: groupedTechnologies = data.technologies?.reduce((acc, tech) => {
		const techType = tech.type || 'Other';
		if (!acc[techType]) {
			acc[techType] = [];
		}
		acc[techType].push(tech);
		return acc;
	}, {} as Record<string, Technology[]>) || {};

	// Show predicted category as user types
	$: predictedCategory = technology.trim() ? categorizeTechnology(technology) : '';

	function handleSubmit() {
		return async ({ result, update }: { 
			result: { type: string; data?: { error: string } },
			update: () => Promise<void>
		}) => {
			console.log('Form submission result:', result);
			if (result.type === 'success') {
				technology = '';
				success = true;
				setTimeout(() => (success = false), 3000);
				// Update the page data immediately
				await update();
			} else if (result.type === 'failure') {
				error = result.data?.error || 'An error occurred';
			}
		};
	}
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
	<span class="font-extrabold text-2xl tracking-tight select-none">KonsulentPro</span>
	<div class="space-x-3 flex items-center">

		{#if data?.user}
			<span class="text-base">Welcome, {data.user.name || data.user.email}</span>
			<form method="POST" action="/auth/signout" style="display: inline;">
				<button type="submit" class="text-base px-4 py-2 rounded-md hover:bg-white/10 transition">
					Log&nbsp;out
				</button>
			</form>
		{:else}
			<a href="/login" class="text-base px-4 py-2 rounded-md hover:bg-white/10 transition"
				>Log&nbsp;in</a
			>
			<a
				href="/signup"
				class="hidden md:inline-flex bg-white text-slate-900 rounded-md px-5 py-2 font-medium shadow hover:shadow-lg transition"
			>
				Get&nbsp;Started
			</a>
		{/if}
	</div>
</nav>

<!-- Hero -------------------------------------------------------------------------- -->
<main class="min-h-screen flex flex-col items-center justify-center text-center text-white px-4">
	<h1 class="text-5xl md:text-7xl font-extrabold text-shadow-lg mb-5 tracking-tight leading-tight">
		Konsulent<span class="text-primary-400">Pro</span>
	</h1>
	<p class="text-xl md:text-2xl font-light mb-12 max-w-3xl mx-auto">
		{#if data?.user}
			Welcome back! Ready to boost your productivity?
		{:else}
			Bli en mer effektiv konsulent i dag du og!
		{/if}
	</p>

	{#if data?.user}
		<div class="w-full max-w-4xl space-y-8 px-4">
			<form method="POST" action="?/addTechnology" use:enhance={handleSubmit} class="max-w-md mx-auto space-y-4">
				<div class="flex flex-col space-y-2">
					<label for="technology" class="text-left text-lg font-medium">Add a technology to learn</label>
					<input
						type="text"
						id="technology"
						name="technology"
						bind:value={technology}
						placeholder="e.g., React, Python, Docker..."
						class="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none text-white placeholder-white/50 transition-all"
						required
					/>
					{#if predictedCategory && technology.trim()}
						<div class="text-sm text-white/70 flex items-center gap-2 animate-fade-in">
							<span class="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>
							Will be categorized as: <span class="font-medium text-primary-300">{predictedCategory}</span>
						</div>
					{:else if technology.trim()}
						<div class="text-sm text-white/50 flex items-center gap-2">
							<span class="w-2 h-2 rounded-full bg-white/30"></span>
							Will be categorized as: <span class="font-medium">Other</span>
						</div>
					{/if}
					
					{#if !technology.trim()}
						<div class="text-xs text-white/40 mt-1">
							💡 Just type a technology name - it will be automatically categorized!
						</div>
					{/if}
				</div>

				{#if error}
					<div class="text-red-300 text-sm">{error}</div>
				{/if}

				{#if success}
					<div class="text-green-300 text-sm">Technology added successfully!</div>
				{/if}

				<button
					type="submit"
					class="w-full bg-primary-400 hover:bg-primary-500 text-white px-6 py-3 rounded-lg shadow-lg transition"
				>
					Add Technology
				</button>
			</form>

			{#if groupedTechnologies && Object.keys(groupedTechnologies).length > 0}
				<div class="space-y-6">
					<h2 class="text-3xl font-bold text-left text-white">Your Technology Stack</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						{#each Object.entries(groupedTechnologies) as [techType, techs]}
							<div class="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
								<h3 class="text-lg font-semibold text-white/90 mb-3 flex items-center gap-2">
									<span class="w-2 h-2 rounded-full bg-primary-400"></span>
									{techType}
									<span class="text-sm font-normal text-white/50">({techs.length})</span>
								</h3>
								<div class="space-y-2">
									{#each techs as tech}
										<div class="bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between hover:bg-white/10 transition-colors">
											<span class="text-sm font-medium">{tech.name}</span>
											<span class="text-xs text-white/40">
												{new Date(tech.createdAt).toLocaleDateString()}
											</span>
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<a
			href="/signup"
			class="bg-primary-400 hover:bg-primary-500 text-white px-10 py-4 text-lg rounded-lg shadow-lg transition"
		>
			Bli 1000% mer effektiv i dag
		</a>
	{/if}
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
