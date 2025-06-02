<script lang="ts">
	import { goto } from '$app/navigation';
	import NavBar from '$lib/NavBar.svelte';

	// Get data from server-side load function
	let { data } = $props();

	interface CV {
		id: string;
		originalName: string;
		size: number;
		createdAt: string;
		updatedAt: string;
		summary: string;
		personalInfo: {
			fullName?: string;
			email?: string;
			phone?: string;
		};
		keywords: string[];
		experienceCount: number;
		educationCount: number;
		skillsCount: number;
	}

	let cvs: CV[] = $state(data.cvs || []);
	let loading = $state(false);
	let error = $state('');
	let deletingId = $state('');

	async function deleteCV(id: string) {
		if (!confirm('Are you sure you want to delete this CV? This action cannot be undone.')) {
			return;
		}

		try {
			deletingId = id;
			const response = await fetch(`/api/cv/${id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const result = await response.json();
				throw new Error(result.message || 'Failed to delete CV');
			}

			// Remove from local state
			cvs = cvs.filter(cv => cv.id !== id);
			// Update data.cvCount for NavBar
			data.cvCount = Math.max(0, data.cvCount - 1);
		} catch (e) {
			console.error('Delete CV error:', e);
			error = e instanceof Error ? e.message : 'Failed to delete CV';
		} finally {
			deletingId = '';
		}
	}

	function viewCV(id: string) {
		goto(`/cv/${id}`);
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>CV Management - KonsulentPro</title>
</svelte:head>

<!-- Animated gradient background -->
<div
	class="bg-animate bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 fixed inset-0 -z-10"
	aria-hidden="true"
></div>

<!-- Navigation -->
<NavBar {data} />

<!-- Main content -->
<main class="min-h-screen flex flex-col items-center justify-center text-center text-white px-4">
	<h1 class="text-5xl md:text-7xl font-extrabold text-shadow-lg mb-5 tracking-tight leading-tight mt-20">
		CV <span class="text-primary-400">Management</span>
	</h1>
	<p class="text-xl md:text-2xl font-light mb-12 max-w-3xl mx-auto">
		Manage your uploaded CVs and view parsed data
	</p>

	{#if data?.user}
		<div class="w-full max-w-6xl space-y-8 px-4">
			{#if error}
				<div class="text-red-300 text-sm max-w-md mx-auto mb-8">
					{error}
					<button 
						class="ml-2 underline hover:no-underline" 
						onclick={() => { error = ''; loadCVs(); }}
					>
						Retry
					</button>
				</div>
			{/if}

			{#if loading}
				<div class="flex flex-col items-center gap-4">
					<div class="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
					<p class="text-white/80">Loading your CVs...</p>
				</div>
			{:else if cvs.length === 0}
				<div class="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl p-8 border border-white/20 backdrop-blur-sm max-w-md mx-auto">
					<div class="text-center space-y-6">
						<div class="text-6xl mb-4">📄</div>
						<h2 class="text-2xl font-semibold text-white">No CVs uploaded yet</h2>
						<p class="text-white/80 leading-relaxed">
							Upload your first CV to get started with Grok AI-powered parsing and analysis
						</p>
						<a 
							href="/cv/upload" 
							class="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
						>
							<span>📤</span>
							Upload Your First CV
						</a>
					</div>
				</div>
			{:else}
				<!-- CV Grid -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each cvs as cv (cv.id)}
						<div class="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20 backdrop-blur-sm transition-all hover:bg-white/15 hover:transform hover:scale-105">
							<div class="flex items-start gap-3 mb-4">
								<div class="text-3xl">📄</div>
								<div class="flex-1 min-w-0">
									<h3 class="text-white font-semibold truncate">{cv.originalName}</h3>
									<p class="text-white/60 text-sm">
										{formatFileSize(cv.size)} • {formatDate(cv.createdAt)}
									</p>
								</div>
							</div>

							{#if cv.personalInfo.fullName}
								<div class="mb-4">
									<p class="text-white font-medium">{cv.personalInfo.fullName}</p>
									{#if cv.personalInfo.email}
										<p class="text-white/70 text-sm">{cv.personalInfo.email}</p>
									{/if}
								</div>
							{/if}

							<div class="mb-4">
								<p class="text-white/80 text-sm line-clamp-3">{cv.summary}</p>
							</div>

							<div class="flex justify-between mb-4 text-center">
								<div>
									<div class="text-white font-bold text-lg">{cv.experienceCount}</div>
									<div class="text-white/60 text-xs">Experience</div>
								</div>
								<div>
									<div class="text-white font-bold text-lg">{cv.educationCount}</div>
									<div class="text-white/60 text-xs">Education</div>
								</div>
								<div>
									<div class="text-white font-bold text-lg">{cv.skillsCount}</div>
									<div class="text-white/60 text-xs">Skills</div>
								</div>
							</div>

							{#if cv.keywords.length > 0}
								<div class="mb-4">
									<div class="flex flex-wrap gap-1">
										{#each cv.keywords.slice(0, 3) as keyword}
											<span class="bg-white/20 text-white text-xs px-2 py-1 rounded-full">{keyword}</span>
										{/each}
										{#if cv.keywords.length > 3}
											<span class="text-white/60 text-xs px-2 py-1">+{cv.keywords.length - 3} more</span>
										{/if}
									</div>
								</div>
							{/if}

							<div class="flex gap-2">
								<button 
									class="flex-1 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
									onclick={() => viewCV(cv.id)}
								>
									👁️ View Details
								</button>
								<button 
									class="bg-red-500/80 hover:bg-red-600/90 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm disabled:opacity-50"
									onclick={() => deleteCV(cv.id)}
									disabled={deletingId === cv.id}
								>
									{#if deletingId === cv.id}
										<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
									{:else}
										🗑️
									{/if}
								</button>
							</div>
						</div>
					{/each}
				</div>

				<!-- Upload replacement button for existing users -->
				<div class="text-center">
					<a 
						href="/cv/upload" 
						class="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
					>
						<span>🔄</span>
						Replace CV
					</a>
				</div>
			{/if}

			<!-- Back Link -->
			<div class="text-center">
				<a 
					href="/technology" 
					class="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium"
				>
					← Back to Technology Management
				</a>
			</div>
		</div>
	{:else}
		<div class="text-center">
			<p class="text-white/70 mb-8">Please sign in to manage your CVs</p>
			<a
				href="/signup"
				class="bg-primary-400 hover:bg-primary-500 text-white px-10 py-4 text-lg rounded-lg shadow-lg transition"
			>
				Sign Up
			</a>
		</div>
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

	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Text shadow for better readability */
	.text-shadow-lg {
		text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
	}
</style> 