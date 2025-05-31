<script lang="ts">
	import { enhance } from '$app/forms';
	import { categorizeTechnology } from '$lib/utils/techCategories';
	import NavBar from '$lib/NavBar.svelte';
	import Tech from '$lib/Tech.svelte';

	let { data } = $props();

	let technology = $state('');
	let error = $state('');
	let success = $state(false);
	let loadingJourney = $state(false);
	let journeyResults = $state<JourneyResults | null>(null);
	let showJourneyResults = $state(false);

	// Show predicted category as user types
	let predictedCategory = $derived(technology.trim() ? categorizeTechnology(technology) : '');

	let groupedTechnologies = $derived(
		data.technologies?.reduce(
			(acc, tech) => {
				const techType = tech.type || 'Other';
				if (!acc[techType]) {
					acc[techType] = [];
				}
				acc[techType].push(tech);
				return acc;
			},
			{} as Record<string, Technology[]>
		) || {}
	);

	// Define the type for a technology
	type Technology = {
		id: string;
		name: string;
		type: string;
		createdAt: Date;
		updatedAt: Date;
		userId: string;
	};

	// Define the type for journey analysis results
	type JourneyResults = {
		currentStrengths?: string;
		knowledgeGaps?: string;
		learningPath?: Array<{
			title: string;
			description: string;
			resources?: string[];
		}>;
		timeEstimate?: string;
	};

	function handleSubmit() {
		return async ({
			result,
			update
		}: {
			result: { type: string; data?: { error: string } };
			update: () => Promise<void>;
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

	async function startJourney() {
		if (!data.user || data.cvCount === 0 || !data.technologies || data.technologies.length === 0) {
			return;
		}

		loadingJourney = true;
		journeyResults = null;
		
		try {
			const response = await fetch('/api/learning-path', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					learningTechnologies: data.technologies.map(t => t.name)
				})
			});

			const result = await response.json();
			
			if (!response.ok) {
				throw new Error(result.message || 'Failed to analyze learning path');
			}

			journeyResults = result.analysis;
			showJourneyResults = true;
		} catch (e) {
			console.error('Journey analysis error:', e);
			error = e instanceof Error ? e.message : 'Failed to analyze learning path';
		} finally {
			loadingJourney = false;
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
		Consulant<span class="text-primary-400">Pro</span>
	</h1>
	<p class="text-xl md:text-2xl font-light mb-12 max-w-3xl mx-auto">
		{#if data?.user}
			Welcome back! Ready to boost your productivity?
		{/if}
	</p>

	{#if data?.user}
		<div class="w-full max-w-4xl space-y-8 px-4">
			<form
				method="POST"
				action="?/addTechnology"
				use:enhance={handleSubmit}
				class="max-w-md mx-auto space-y-4"
			>
				<div class="flex flex-col space-y-2">
					<label for="technology" class="text-left text-lg font-medium"
						>Add a technology to learn</label
					>
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
							Will be categorized as:
							<span class="font-medium text-primary-300">{predictedCategory}</span>
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

			<!-- CV Upload Prompt when user has no CVs -->
			{#if data.cvCount === 0}
				<div class="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl p-6 border border-white/20 backdrop-blur-sm max-w-md mx-auto">
					<div class="text-center space-y-4">
						<div class="text-4xl mb-2">📄</div>
						<h3 class="text-xl font-semibold text-white">Supercharge Your Tech Stack!</h3>
						<p class="text-white/80 text-sm leading-relaxed">
							Upload your CV and let Grok AI automatically extract all your technologies and skills. 
							No more manual entry - just smart automation!
						</p>
						<div class="flex flex-col gap-2 text-xs text-white/60">
							<div class="flex items-center gap-2">
								<span class="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
								<span>Auto-translate from any language to English</span>
							</div>
							<div class="flex items-center gap-2">
								<span class="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
								<span>Extract 100+ technologies automatically</span>
							</div>
							<div class="flex items-center gap-2">
								<span class="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
								<span>Structured parsing of experience & education</span>
							</div>
						</div>
						<a 
							href="/cv/upload" 
							class="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
						>
							<span>🚀</span>
							Upload Your CV
						</a>
					</div>
				</div>
			{/if}

			<!-- Start Journey Button when user has both CV and learning technologies -->
			{#if data.cvCount > 0 && data.technologies && data.technologies.length > 0}
				<div class="text-center">
					<button 
						onclick={startJourney}
						disabled={loadingJourney}
						class="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg disabled:transform-none disabled:opacity-70"
					>
						{#if loadingJourney}
							<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							<span>Analyzing your journey...</span>
						{:else}
							<span class="text-2xl">🚀</span>
							<span>Start Your Journey</span>
						{/if}
					</button>
					<p class="text-white/70 text-sm mt-3 max-w-md mx-auto">
						Get AI-powered learning recommendations based on your CV and desired technologies
					</p>
				</div>
			{/if}

			<!-- Journey Results Modal/Section -->
			{#if showJourneyResults && journeyResults}
				<div class="bg-white/10 rounded-xl p-6 border border-white/20 backdrop-blur-sm">
					<div class="flex justify-between items-center mb-6">
						<h3 class="text-2xl font-bold text-white flex items-center gap-2">
							<span>🎯</span>
							Your Learning Journey
						</h3>
						<button 
							onclick={() => showJourneyResults = false}
							class="text-white/60 hover:text-white transition-colors text-xl"
						>
							✕
						</button>
					</div>
					
					<div class="space-y-6 text-white">
						{#if journeyResults.currentStrengths}
							<div class="bg-green-500/20 rounded-lg p-4 border border-green-400/30">
								<h4 class="font-semibold text-green-300 mb-2 flex items-center gap-2">
									<span>💪</span>
									Your Current Strengths
								</h4>
								<p class="text-green-100 text-sm leading-relaxed">{journeyResults.currentStrengths}</p>
							</div>
						{/if}

						{#if journeyResults.knowledgeGaps}
							<div class="bg-orange-500/20 rounded-lg p-4 border border-orange-400/30">
								<h4 class="font-semibold text-orange-300 mb-2 flex items-center gap-2">
									<span>📚</span>
									Knowledge Gaps to Address
								</h4>
								<p class="text-orange-100 text-sm leading-relaxed">{journeyResults.knowledgeGaps}</p>
							</div>
						{/if}

						{#if journeyResults.learningPath && journeyResults.learningPath.length > 0}
							<div class="bg-blue-500/20 rounded-lg p-4 border border-blue-400/30">
								<h4 class="font-semibold text-blue-300 mb-3 flex items-center gap-2">
									<span>🛤️</span>
									Recommended Learning Path
								</h4>
								<div class="space-y-3">
									{#each journeyResults.learningPath as step, index}
										<div class="flex items-start gap-3 p-3 bg-blue-600/20 rounded-lg">
											<span class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
												{index + 1}
											</span>
											<div>
												<h5 class="font-medium text-blue-200 mb-1">{step.title}</h5>
												<p class="text-blue-100 text-sm leading-relaxed">{step.description}</p>
												{#if step.resources && step.resources.length > 0}
													<div class="mt-2 flex flex-wrap gap-2">
														{#each step.resources as resource}
															<span class="bg-blue-700/30 text-blue-200 px-2 py-1 rounded text-xs">
																{resource}
															</span>
														{/each}
													</div>
												{/if}
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						{#if journeyResults.timeEstimate}
							<div class="bg-purple-500/20 rounded-lg p-4 border border-purple-400/30">
								<h4 class="font-semibold text-purple-300 mb-2 flex items-center gap-2">
									<span>⏱️</span>
									Estimated Timeline
								</h4>
								<p class="text-purple-100 text-sm leading-relaxed">{journeyResults.timeEstimate}</p>
							</div>
						{/if}
					</div>
				</div>
			{/if}

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
										<Tech {tech} />
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
