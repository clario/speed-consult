<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

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

	let cvs: CV[] = [];
	let loading = true;
	let error = '';
	let deletingId = '';

	onMount(async () => {
		await loadCVs();
	});

	async function loadCVs() {
		try {
			loading = true;
			const response = await fetch('/api/cv/list');
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to load CVs');
			}

			cvs = data.cvs;
		} catch (e) {
			console.error('Load CVs error:', e);
			error = e instanceof Error ? e.message : 'Failed to load CVs';
		} finally {
			loading = false;
		}
	}

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
				const data = await response.json();
				throw new Error(data.message || 'Failed to delete CV');
			}

			// Remove from local state
			cvs = cvs.filter(cv => cv.id !== id);
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

<div class="cv-container">
	<div class="header">
		<h1>CV Management</h1>
		<p>Manage your uploaded CVs and view parsed data</p>
		
		<div class="header-actions">
			<a href="/cv/upload" class="upload-btn">
				<span class="btn-icon">📤</span>
				Upload New CV
			</a>
			<button 
				class="signout-btn" 
				onclick={() => fetch('/auth/signout', { method: 'POST' }).then(() => window.location.href = '/signin')}
			>
				Sign Out (Debug)
			</button>
		</div>
	</div>

	{#if error}
		<div class="error-message" role="alert">
			{error}
			<button 
				class="retry-btn" 
				onclick={() => { error = ''; loadCVs(); }}
			>
				Retry
			</button>
		</div>
	{/if}

	{#if loading}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Loading your CVs...</p>
		</div>
	{:else if cvs.length === 0}
		<div class="empty-state">
			<div class="empty-icon">📄</div>
			<h2>No CVs uploaded yet</h2>
			<p>Upload your first CV to get started with Grok AI-powered parsing and analysis</p>
			<a href="/cv/upload" class="empty-upload-btn">
				<span class="btn-icon">📤</span>
				Upload Your First CV
			</a>
		</div>
	{:else}
		<div class="cv-grid">
			{#each cvs as cv (cv.id)}
				<div class="cv-card">
					<div class="cv-header">
						<div class="cv-icon">📄</div>
						<div class="cv-info">
							<h3>{cv.originalName}</h3>
							<p class="cv-meta">
								{formatFileSize(cv.size)} • Uploaded {formatDate(cv.createdAt)}
							</p>
						</div>
					</div>

					<div class="cv-content">
						{#if cv.personalInfo.fullName}
							<div class="personal-info">
								<strong>{cv.personalInfo.fullName}</strong>
								{#if cv.personalInfo.email}
									<span>• {cv.personalInfo.email}</span>
								{/if}
							</div>
						{/if}

						<div class="cv-summary">
							<p>{cv.summary}</p>
						</div>

						<div class="cv-stats">
							<div class="stat">
								<span class="stat-number">{cv.experienceCount}</span>
								<span class="stat-label">Experience</span>
							</div>
							<div class="stat">
								<span class="stat-number">{cv.educationCount}</span>
								<span class="stat-label">Education</span>
							</div>
							<div class="stat">
								<span class="stat-number">{cv.skillsCount}</span>
								<span class="stat-label">Skills</span>
							</div>
						</div>

						{#if cv.keywords.length > 0}
							<div class="keywords">
								{#each cv.keywords as keyword}
									<span class="keyword">{keyword}</span>
								{/each}
							</div>
						{/if}
					</div>

					<div class="cv-actions">
						<button 
							class="view-btn" 
							onclick={() => viewCV(cv.id)}
						>
							<span class="btn-icon">👁️</span>
							View Details
						</button>
						<button 
							class="delete-btn" 
							onclick={() => deleteCV(cv.id)}
							disabled={deletingId === cv.id}
						>
							{#if deletingId === cv.id}
								<span class="spinner-small"></span>
								Deleting...
							{:else}
								<span class="btn-icon">🗑️</span>
								Delete
							{/if}
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<div class="back-link">
		<a href="/technology">← Back to Dashboard</a>
	</div>
</div>

<style>
	.cv-container {
		min-height: 100vh;
		background: linear-gradient(to bottom right, #f8fafc, #e2e8f0);
		padding: 2rem;
	}

	.header {
		text-align: center;
		margin-bottom: 3rem;
		position: relative;
	}

	.header h1 {
		font-size: 2.5rem;
		font-weight: 800;
		color: #1f2937;
		margin: 0 0 0.5rem 0;
	}

	.header p {
		color: #6b7280;
		font-size: 1.1rem;
		margin: 0 0 2rem 0;
	}

	.header-actions {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}

	.upload-btn {
		background: linear-gradient(to right, #6366f1, #8b5cf6);
		color: white;
		text-decoration: none;
		border-radius: 0.5rem;
		padding: 0.875rem 1.5rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.2s ease;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.upload-btn:hover {
		background: linear-gradient(to right, #5b21b6, #7c3aed);
		transform: translateY(-1px);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
	}

	.signout-btn {
		background: #ef4444;
		color: white;
		border: none;
		border-radius: 0.5rem;
		padding: 0.875rem 1.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.signout-btn:hover {
		background: #dc2626;
		transform: translateY(-1px);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		color: #6b7280;
	}

	.spinner {
		width: 3rem;
		height: 3rem;
		border: 4px solid #e5e7eb;
		border-top: 4px solid #6366f1;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	.spinner-small {
		width: 1rem;
		height: 1rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top: 2px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		max-width: 500px;
		margin: 0 auto;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1.5rem;
		opacity: 0.6;
	}

	.empty-state h2 {
		color: #374151;
		margin: 0 0 1rem 0;
		font-size: 1.5rem;
	}

	.empty-state p {
		color: #6b7280;
		margin: 0 0 2rem 0;
		line-height: 1.6;
	}

	.empty-upload-btn {
		background: linear-gradient(to right, #6366f1, #8b5cf6);
		color: white;
		text-decoration: none;
		border-radius: 0.5rem;
		padding: 1rem 2rem;
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.2s ease;
	}

	.empty-upload-btn:hover {
		background: linear-gradient(to right, #5b21b6, #7c3aed);
		transform: translateY(-1px);
	}

	.cv-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
		gap: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.cv-card {
		background: white;
		border-radius: 1rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		border: 1px solid #e5e7eb;
		overflow: hidden;
		transition: all 0.2s ease;
	}

	.cv-card:hover {
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}

	.cv-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem 1.5rem 1rem 1.5rem;
		border-bottom: 1px solid #f3f4f6;
	}

	.cv-icon {
		font-size: 2rem;
		flex-shrink: 0;
	}

	.cv-info {
		flex: 1;
		min-width: 0;
	}

	.cv-info h3 {
		margin: 0 0 0.25rem 0;
		color: #1f2937;
		font-size: 1.1rem;
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cv-meta {
		margin: 0;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.cv-content {
		padding: 1rem 1.5rem 1.5rem 1.5rem;
	}

	.personal-info {
		margin-bottom: 1rem;
		color: #374151;
		font-size: 0.9rem;
	}

	.personal-info strong {
		color: #1f2937;
	}

	.cv-summary {
		margin-bottom: 1.5rem;
	}

	.cv-summary p {
		color: #6b7280;
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.cv-stats {
		display: flex;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.stat {
		text-align: center;
	}

	.stat-number {
		display: block;
		font-size: 1.5rem;
		font-weight: 700;
		color: #6366f1;
	}

	.stat-label {
		display: block;
		font-size: 0.75rem;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.keywords {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.keyword {
		background: #f3f4f6;
		color: #374151;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.cv-actions {
		display: flex;
		gap: 0.75rem;
		padding: 0 1.5rem 1.5rem 1.5rem;
	}

	.view-btn {
		flex: 1;
		background: #6366f1;
		color: white;
		border: none;
		border-radius: 0.5rem;
		padding: 0.625rem 1rem;
		font-weight: 500;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: background 0.2s ease;
		font-size: 0.875rem;
	}

	.view-btn:hover {
		background: #5b21b6;
	}

	.delete-btn {
		background: #ef4444;
		color: white;
		border: none;
		border-radius: 0.5rem;
		padding: 0.625rem 1rem;
		font-weight: 500;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: background 0.2s ease;
		font-size: 0.875rem;
		min-width: 100px;
	}

	.delete-btn:hover:not(:disabled) {
		background: #dc2626;
	}

	.delete-btn:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	.error-message {
		background-color: #fef2f2;
		border: 1px solid #fca5a5;
		color: #dc2626;
		padding: 1rem;
		border-radius: 0.5rem;
		margin-bottom: 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: 1200px;
		margin-left: auto;
		margin-right: auto;
	}

	.retry-btn {
		background: #dc2626;
		color: white;
		border: none;
		border-radius: 0.25rem;
		padding: 0.5rem 1rem;
		cursor: pointer;
		font-size: 0.875rem;
		transition: background 0.2s ease;
	}

	.retry-btn:hover {
		background: #b91c1c;
	}

	.back-link {
		text-align: center;
		margin-top: 3rem;
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

	.btn-icon {
		font-size: 1rem;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.cv-container {
			padding: 1rem;
		}
		
		.header h1 {
			font-size: 2rem;
		}
		
		.cv-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
		
		.cv-actions {
			flex-direction: column;
		}
		
		.cv-stats {
			gap: 1rem;
		}
	}
</style> 