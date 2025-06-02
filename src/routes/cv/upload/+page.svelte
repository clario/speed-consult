<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import NavBar from '$lib/NavBar.svelte';

	// Get data from server-side load function
	let { data } = $props();

	let fileInput: HTMLInputElement;
	let selectedFile: File | null = null;
	let uploading = false;
	let dragOver = false;
	let error = '';
	let success = '';
	let uploadProgress = 0;

	// Handle file selection
	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			validateAndSetFile(file);
		}
	}

	// Handle drag and drop
	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;
		
		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			validateAndSetFile(files[0]);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dragOver = true;
	}

	function handleDragLeave() {
		dragOver = false;
	}

	// Validate file
	function validateAndSetFile(file: File) {
		error = '';
		
		// Check file type
		if (!file.name.toLowerCase().endsWith('.docx')) {
			error = 'Please select a DOCX file';
			return;
		}
		
		// Check file size (10MB limit)
		const maxSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxSize) {
			error = 'File size must be less than 10MB';
			return;
		}
		
		selectedFile = file;
	}

	// Upload and process CV
	async function uploadCV() {
		if (!selectedFile) return;

		uploading = true;
		error = '';
		success = '';
		uploadProgress = 10;

		try {
			const formData = new FormData();
			formData.append('cv', selectedFile);
			if (data?.existingCV) {
				formData.append('replaceExisting', 'true');
			}

			uploadProgress = 30;

			const response = await fetch('/api/cv/upload', {
				method: 'POST',
				body: formData
			});

			uploadProgress = 70;

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || 'Upload failed');
			}

			uploadProgress = 100;
			success = data?.existingCV 
				? 'CV successfully updated! Redirecting...' 
				: 'CV successfully uploaded! Redirecting...';
			
			// Redirect to technology page after a short delay
			setTimeout(() => {
				goto('/technology');
			}, 2000);

		} catch (e) {
			console.error('Upload error:', e);
			error = e instanceof Error ? e.message : 'Upload failed. Please try again.';
			uploadProgress = 0;
		} finally {
			uploading = false;
		}
	}

	// Remove selected file
	function removeFile() {
		selectedFile = null;
		error = '';
		if (fileInput) {
			fileInput.value = '';
		}
	}

	// Format file size
	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
</script>

<svelte:head>
	<title>Upload CV - KonsulentPro</title>
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
		{data?.existingCV ? 'Replace Your' : 'Upload Your'} <span class="text-primary-400">CV</span>
	</h1>
	<p class="text-xl md:text-2xl font-light mb-12 max-w-3xl mx-auto">
		{#if data?.existingCV}
			Update your CV and let Grok AI extract your latest technologies and experience
		{:else}
			Let Grok AI parse your CV and extract all your technologies automatically
		{/if}
	</p>

	{#if data?.user}
		<div class="w-full max-w-4xl space-y-8 px-4">
			<!-- Error/Success Messages -->
			{#if error}
				<div class="text-red-300 text-sm max-w-md mx-auto">{error}</div>
			{/if}

			{#if success}
				<div class="text-green-300 text-sm max-w-md mx-auto">{success}</div>
			{/if}

			<!-- Existing CV Info -->
			{#if data?.existingCV}
				<div class="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-xl p-6 border border-white/20 backdrop-blur-sm max-w-md mx-auto">
					<div class="text-center space-y-4">
						<div class="text-3xl mb-2">📄</div>
						<h3 class="text-lg font-semibold text-white">Current CV</h3>
						<p class="text-white/80 text-sm">
							{data.existingCV.originalName}
						</p>
						<p class="text-white/60 text-xs">
							Uploaded {new Date(data.existingCV.createdAt).toLocaleDateString()}
						</p>
					</div>
				</div>
			{/if}

			<!-- Upload Area -->
			<div class="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl p-6 border border-white/20 backdrop-blur-sm max-w-md mx-auto">
				{#if !selectedFile}
					<!-- File upload area -->
					<div 
						class="upload-area"
						class:drag-over={dragOver}
						ondrop={handleDrop}
						ondragover={handleDragOver}
						ondragleave={handleDragLeave}
						role="button"
						tabindex="0"
						onclick={() => fileInput?.click()}
					>
						<div class="upload-icon">📄</div>
						<h3 class="text-xl font-semibold mb-2 text-white">Drag and drop your CV here</h3>
						<p class="text-white/70 mb-4">or click to browse files</p>
						<div class="bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
							<span class="text-white/80 text-sm">DOCX files only • Max 10MB</span>
						</div>
					</div>

					<input
						bind:this={fileInput}
						type="file"
						accept=".docx"
						onchange={handleFileSelect}
						style="display: none;"
					/>
				{:else}
					<!-- Selected file preview -->
					<div class="file-preview">
						<div class="file-info">
							<div class="file-icon">📄</div>
							<div class="file-details">
								<h4 class="text-white font-semibold">{selectedFile.name}</h4>
								<p class="text-white/70">{formatFileSize(selectedFile.size)}</p>
							</div>
							<button 
								class="remove-btn" 
								onclick={removeFile}
								disabled={uploading}
								title="Remove file"
							>
								✕
							</button>
						</div>

						{#if uploading}
							<div class="upload-progress">
								<div class="progress-bar">
									<div class="progress-fill" style="width: {uploadProgress}%"></div>
								</div>
								<p class="text-white/90 font-medium">Processing your CV with Grok AI... {uploadProgress}%</p>
							</div>
						{:else}
							<button class="upload-btn w-full" onclick={uploadCV}>
								<span class="btn-icon">🚀</span>
								{data?.existingCV ? 'Replace CV' : 'Upload & Process CV'}
							</button>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Features Section -->
			<div class="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm max-w-2xl mx-auto">
				<h3 class="text-xl font-semibold text-white mb-6 text-center">What happens next?</h3>
				<div class="feature-list">
					<div class="feature">
						<span class="feature-icon">🔍</span>
						<div>
							<strong class="text-white">Text Extraction</strong>
							<p class="text-white/70">We extract all text content from your DOCX file</p>
						</div>
					</div>
					<div class="feature">
						<span class="feature-icon">🌐</span>
						<div>
							<strong class="text-white">Auto-Translation</strong>
							<p class="text-white/70">Automatically translate from any language to English</p>
						</div>
					</div>
					<div class="feature">
						<span class="feature-icon">🤖</span>
						<div>
							<strong class="text-white">Grok AI Parsing</strong>
							<p class="text-white/70">Advanced AI identifies experience, skills, and technology usage years</p>
						</div>
					</div>
					<div class="feature">
						<span class="feature-icon">💾</span>
						<div>
							<strong class="text-white">Secure Storage</strong>
							<p class="text-white/70">Your structured CV data is securely stored and ready for analysis</p>
						</div>
					</div>
				</div>
			</div>

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
			<p class="text-white/70 mb-8">Please sign in to upload your CV</p>
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

	.upload-area {
		border: 2px dashed rgba(255, 255, 255, 0.3);
		border-radius: 1rem;
		padding: 3rem 2rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.3s ease;
		background: rgba(255, 255, 255, 0.05);
	}

	.upload-area:hover,
	.upload-area.drag-over {
		border-color: rgba(255, 255, 255, 0.6);
		background: rgba(255, 255, 255, 0.1);
		transform: translateY(-2px);
	}

	.upload-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
	}

	.file-preview {
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 1rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
	}

	.file-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.file-icon {
		font-size: 2rem;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	.file-details {
		flex: 1;
	}

	.remove-btn {
		background: rgba(239, 68, 68, 0.8);
		color: white;
		border: none;
		border-radius: 50%;
		width: 2rem;
		height: 2rem;
		cursor: pointer;
		font-size: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		backdrop-filter: blur(10px);
	}

	.remove-btn:hover:not(:disabled) {
		background: rgba(220, 38, 38, 0.9);
		transform: scale(1.1);
	}

	.remove-btn:disabled {
		background: rgba(156, 163, 175, 0.5);
		cursor: not-allowed;
	}

	.upload-progress {
		margin-bottom: 1.5rem;
	}

	.progress-bar {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 1rem;
		height: 0.75rem;
		overflow: hidden;
		margin-bottom: 1rem;
		backdrop-filter: blur(10px);
	}

	.progress-fill {
		background: linear-gradient(to right, #6366f1, #8b5cf6);
		height: 100%;
		transition: width 0.3s ease;
		border-radius: 1rem;
	}

	.upload-btn {
		background: linear-gradient(to right, #6366f1, #8b5cf6);
		color: white;
		border: none;
		border-radius: 0.75rem;
		padding: 0.875rem 2rem;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.upload-btn:hover {
		background: linear-gradient(to right, #5b21b6, #7c3aed);
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(99, 102, 241, 0.4);
	}

	.feature-list {
		display: grid;
		gap: 1rem;
	}

	.feature {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		transition: all 0.3s ease;
	}

	.feature:hover {
		background: rgba(255, 255, 255, 0.1);
		transform: translateY(-2px);
	}

	.feature-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	.feature strong {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 1.1rem;
	}

	.feature p {
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.5;
	}

	/* Responsive design */
	@media (max-width: 640px) {
		.upload-area {
			padding: 2rem 1rem;
		}
		
		.feature-list {
			gap: 0.75rem;
		}

		.feature {
			padding: 1rem;
		}
	}
</style> 