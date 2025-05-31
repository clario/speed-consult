<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

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

			uploadProgress = 30;

			const response = await fetch('/api/cv/upload', {
				method: 'POST',
				body: formData
			});

			uploadProgress = 70;

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Upload failed');
			}

			uploadProgress = 100;
			success = data.message;
			
			// Redirect to CV list after a short delay
			setTimeout(() => {
				goto('/cv');
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

<div class="upload-container">
	<div class="upload-card">
		<div class="header">
			<h1>Upload Your CV</h1>
			<p>Upload your CV in DOCX format and let Grok AI parse it into structured data</p>
		</div>

		{#if error}
			<div class="error-message" role="alert">
				{error}
			</div>
		{/if}

		{#if success}
			<div class="success-message" role="alert">
				{success}
			</div>
		{/if}

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
				<h3>Drag and drop your CV here</h3>
				<p>or click to browse files</p>
				<div class="file-requirements">
					<span>DOCX files only • Max 10MB</span>
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
						<h4>{selectedFile.name}</h4>
						<p>{formatFileSize(selectedFile.size)}</p>
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
						<p>Processing your CV with Grok AI... {uploadProgress}%</p>
					</div>
				{/if}

				{#if !uploading}
					<div class="upload-actions">
						<button class="upload-btn" onclick={uploadCV}>
							<span class="btn-icon">🚀</span>
							Upload & Process CV
						</button>
						<button class="cancel-btn" onclick={removeFile}>
							Choose Different File
						</button>
					</div>
				{/if}
			</div>
		{/if}

		<div class="features">
			<h3>What happens next?</h3>
			<div class="feature-list">
				<div class="feature">
					<span class="feature-icon">🔍</span>
					<div>
						<strong>Text Extraction</strong>
						<p>We extract all text content from your DOCX file</p>
					</div>
				</div>
				<div class="feature">
					<span class="feature-icon">🤖</span>
					<div>
						<strong>Grok AI Parsing</strong>
						<p>Advanced Grok AI identifies and structures your experience, skills, and education</p>
					</div>
				</div>
				<div class="feature">
					<span class="feature-icon">💾</span>
					<div>
						<strong>Secure Storage</strong>
						<p>Your structured CV data is securely stored and ready for analysis</p>
					</div>
				</div>
			</div>
		</div>

		<div class="back-link">
			<a href="/cv">← Back to CV Management</a>
		</div>
	</div>
</div>

<style>
	.upload-container {
		min-height: 100vh;
		background: linear-gradient(to bottom right, #3b82f6, #6366f1, #8b5cf6);
		padding: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.upload-card {
		background: white;
		border-radius: 1rem;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
		padding: 2rem;
		width: 100%;
		max-width: 600px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.header h1 {
		font-size: 2rem;
		font-weight: 800;
		color: #1f2937;
		margin: 0 0 0.5rem 0;
	}

	.header p {
		color: #6b7280;
		margin: 0;
	}

	.upload-area {
		border: 2px dashed #d1d5db;
		border-radius: 1rem;
		padding: 3rem 2rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s ease;
		background: #f9fafb;
	}

	.upload-area:hover,
	.upload-area.drag-over {
		border-color: #6366f1;
		background: #f0f0ff;
		transform: translateY(-2px);
	}

	.upload-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.upload-area h3 {
		color: #374151;
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
	}

	.upload-area p {
		color: #6b7280;
		margin: 0 0 1rem 0;
	}

	.file-requirements {
		color: #9ca3af;
		font-size: 0.875rem;
	}

	.file-preview {
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1.5rem;
		background: #f9fafb;
	}

	.file-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.file-icon {
		font-size: 2rem;
	}

	.file-details {
		flex: 1;
	}

	.file-details h4 {
		margin: 0 0 0.25rem 0;
		color: #1f2937;
		font-size: 1rem;
	}

	.file-details p {
		margin: 0;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.remove-btn {
		background: #ef4444;
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
		transition: background 0.2s ease;
	}

	.remove-btn:hover:not(:disabled) {
		background: #dc2626;
	}

	.remove-btn:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	.upload-progress {
		margin-bottom: 1.5rem;
	}

	.progress-bar {
		background: #e5e7eb;
		border-radius: 0.5rem;
		height: 0.5rem;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}

	.progress-fill {
		background: linear-gradient(to right, #6366f1, #8b5cf6);
		height: 100%;
		transition: width 0.3s ease;
	}

	.upload-progress p {
		color: #6366f1;
		font-weight: 500;
		text-align: center;
		margin: 0;
	}

	.upload-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.upload-btn {
		background: linear-gradient(to right, #6366f1, #8b5cf6);
		color: white;
		border: none;
		border-radius: 0.5rem;
		padding: 0.75rem 1.5rem;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.2s ease;
	}

	.upload-btn:hover {
		background: linear-gradient(to right, #5b21b6, #7c3aed);
		transform: translateY(-1px);
	}

	.cancel-btn {
		background: transparent;
		color: #6b7280;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		padding: 0.75rem 1.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.cancel-btn:hover {
		background: #f3f4f6;
		border-color: #9ca3af;
	}

	.features {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid #e5e7eb;
	}

	.features h3 {
		text-align: center;
		color: #1f2937;
		margin: 0 0 1.5rem 0;
	}

	.feature-list {
		display: grid;
		gap: 1rem;
	}

	.feature {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1rem;
		background: #f8fafc;
		border-radius: 0.5rem;
	}

	.feature-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.feature strong {
		color: #1f2937;
		display: block;
		margin-bottom: 0.25rem;
	}

	.feature p {
		color: #6b7280;
		margin: 0;
		font-size: 0.875rem;
	}

	.back-link {
		text-align: center;
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid #e5e7eb;
	}

	.back-link a {
		color: #6366f1;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s ease;
	}

	.back-link a:hover {
		color: #4f46e5;
		text-decoration: underline;
	}

	.error-message {
		background-color: #fef2f2;
		border: 1px solid #fca5a5;
		color: #dc2626;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1.5rem;
		font-size: 0.875rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.error-message::before {
		content: "⚠️";
		flex-shrink: 0;
	}

	.success-message {
		background-color: #f0fdf4;
		border: 1px solid #86efac;
		color: #16a34a;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1.5rem;
		font-size: 0.875rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 500;
	}

	.success-message::before {
		content: "✅";
		flex-shrink: 0;
	}

	/* Responsive design */
	@media (max-width: 640px) {
		.upload-container {
			padding: 1rem;
		}
		
		.upload-card {
			padding: 1.5rem;
		}
		
		.upload-area {
			padding: 2rem 1rem;
		}
		
		.upload-actions {
			flex-direction: column;
		}
		
		.feature-list {
			gap: 0.75rem;
		}
	}
</style> 