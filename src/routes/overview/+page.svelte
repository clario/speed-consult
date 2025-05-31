<script lang="ts">
	import NavBar from '$lib/NavBar.svelte';

	let { data } = $props();
	console.log(data);
</script>

<!-- Animated gradient background -------------------------------------------------- -->
<div
	class="bg-animate bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 fixed inset-0 -z-10"
	aria-hidden="true"
></div>

<!-- Navigation ------------------------------------------------------------------- -->
<NavBar {data} />

<!-- Main Content ----------------------------------------------------------------- -->
<main class="min-h-screen flex flex-col items-center justify-center text-center text-white px-4 pt-20">
	<h1 class="text-5xl md:text-7xl font-extrabold text-shadow-lg mb-5 tracking-tight leading-tight">
		Company<span class="text-primary-400">Overview</span>
	</h1>
	<p class="text-xl md:text-2xl font-light mb-12 max-w-3xl mx-auto">
		See what technologies are trending across the company
	</p>

	{#if data?.user}
		<div class="w-full max-w-6xl space-y-8 px-4">
			<!-- Top Technologies Table -->
			{#if data.technologies && data.technologies.length > 0}
				<div class="bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-2xl p-8 shadow-2xl border-4 border-white/20">
					<div class="text-center mb-6">
						<h2 class="text-4xl font-black text-white mb-2 tracking-wide drop-shadow-lg">
							🔥 HOTTEST TECHNOLOGIES 🔥
						</h2>
						<p class="text-xl text-white/90 font-bold">
							TOP 10 MOST POPULAR IN THE COMPANY
						</p>
					</div>
					
					<div class="bg-white/95 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl">
						<table class="w-full">
							<thead class="bg-gradient-to-r from-gray-900 to-gray-800">
								<tr>
									<th class="px-6 py-4 text-left text-lg font-black text-white uppercase tracking-wider">
										🏆 RANK
									</th>
									<th class="px-6 py-4 text-left text-lg font-black text-white uppercase tracking-wider">
										💻 TECHNOLOGY
									</th>
									<th class="px-6 py-4 text-center text-lg font-black text-white uppercase tracking-wider">
										👥 USERS
									</th>
									<th class="px-6 py-4 text-center text-lg font-black text-white uppercase tracking-wider">
										📊 POPULARITY
									</th>
								</tr>
							</thead>
							<tbody class="divide-y-2 divide-gray-200">
								{#each data.technologies.slice(0, 10) as tech, index}
									<tr class="hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-300 transform hover:scale-[1.02]">
										<td class="px-6 py-4 whitespace-nowrap">
											<div class="flex items-center">
												{#if index === 0}
													<span class="text-3xl font-black text-yellow-500 drop-shadow-lg">🥇 #{index + 1}</span>
												{:else if index === 1}
													<span class="text-3xl font-black text-gray-400 drop-shadow-lg">🥈 #{index + 1}</span>
												{:else if index === 2}
													<span class="text-3xl font-black text-orange-600 drop-shadow-lg">🥉 #{index + 1}</span>
												{:else}
													<span class="text-2xl font-black text-gray-600">#{index + 1}</span>
												{/if}
											</div>
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<div class="text-2xl font-black text-gray-900 uppercase tracking-wide">
												{tech.name}
											</div>
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-center">
											<span class="text-3xl font-black text-blue-600">
												{tech.count}
											</span>
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-center">
											<div class="flex justify-center">
												<div class="bg-gradient-to-r from-green-400 to-blue-500 rounded-full px-6 py-2 shadow-lg">
													<div class="flex items-center space-x-2">
														{#each Array(Math.min(5, Math.ceil((tech.count / (data.technologies[0]?.count || 1)) * 5))) as _}
															<span class="text-2xl">⭐</span>
														{/each}
													</div>
												</div>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					
					<div class="text-center mt-6">
						<p class="text-white font-bold text-lg drop-shadow-lg">
							🚀 JOIN THE TREND! ADD THESE TECHNOLOGIES TO YOUR LEARNING LIST! 🚀
						</p>
						<a 
							href="/technology" 
							class="inline-block mt-4 bg-white text-gray-900 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
						>
							Start Learning →
						</a>
					</div>
				</div>
			{:else}
				<div class="bg-white/10 rounded-xl p-8 border border-white/20">
					<h3 class="text-2xl font-bold text-white mb-4">No Technologies Yet</h3>
					<p class="text-white/80 mb-6">Be the first to add technologies and start tracking company trends!</p>
					<a 
						href="/technology" 
						class="inline-block bg-primary-400 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-500 transition-colors"
					>
						Add Technologies
					</a>
				</div>
			{/if}
		</div>
	{:else}
		<a
			href="/signup"
			class="bg-primary-400 hover:bg-primary-500 text-white px-10 py-4 text-lg rounded-lg shadow-lg transition"
		>
			Sign up to see company overview
		</a>
	{/if}
</main>

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
