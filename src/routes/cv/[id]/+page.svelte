<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	interface CVData {
		personalInfo: {
			fullName: string;
			email?: string;
			phone?: string;
			location?: string;
			linkedIn?: string;
			website?: string;
			summary?: string;
		};
		experience: Array<{
			jobTitle: string;
			company: string;
			location?: string;
			startDate: string;
			endDate?: string;
			current?: boolean;
			description: string;
			achievements?: string[];
		}>;
		education: Array<{
			degree: string;
			institution: string;
			location?: string;
			startDate?: string;
			endDate?: string;
			gpa?: string;
			achievements?: string[];
		}>;
		skills: {
			technical?: string[];
			soft?: string[];
			languages?: Array<{
				language: string;
				level: string;
			}>;
		};
		certifications?: Array<{
			name: string;
			issuer: string;
			date?: string;
			expiryDate?: string;
		}>;
		projects?: Array<{
			name: string;
			description: string;
			technologies?: string[];
			url?: string;
			startDate?: string;
			endDate?: string;
		}>;
		awards?: Array<{
			name: string;
			issuer: string;
			date?: string;
			description?: string;
		}>;
	}

	interface CV {
		id: string;
		originalName: string;
		size: number;
		createdAt: string;
		updatedAt: string;
		rawText: string;
		parsedData: CVData;
	}

	let cv: CV | null = null;
	let loading = true;
	let error = '';

	$: cvId = $page.params.id;

	onMount(async () => {
		await loadCV();
	});

	async function loadCV() {
		try {
			loading = true;
			const response = await fetch(`/api/cv/${cvId}`);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to load CV');
			}

			cv = data.cv;
		} catch (e) {
			console.error('Load CV error:', e);
			error = e instanceof Error ? e.message : 'Failed to load CV';
		} finally {
			loading = false;
		}
	}

	function formatDate(dateString: string): string {
		if (!dateString) return '';
		if (dateString.toLowerCase() === 'present' || dateString.toLowerCase() === 'current') {
			return 'Present';
		}
		
		// Try to parse the date
		const date = new Date(dateString);
		if (isNaN(date.getTime())) {
			return dateString; // Return as-is if not a valid date
		}
		
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short'
		});
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	function goBack() {
		goto('/cv');
	}
</script>

<svelte:head>
	<title>{cv ? `${cv.originalName} - CV Details` : 'CV Details'} - KonsulentPro</title>
</svelte:head>

<div class="cv-detail-container">
	{#if loading}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Loading CV details...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<div class="error-message">
				<h2>Error Loading CV</h2>
				<p>{error}</p>
				<button class="retry-btn" onclick={loadCV}>Try Again</button>
				<button class="back-btn" onclick={goBack}>← Back to CV List</button>
			</div>
		</div>
	{:else if cv}
		<div class="cv-header">
			<button class="back-button" onclick={goBack}>
				← Back to CV List
			</button>
			
			<div class="cv-meta">
				<h1>{cv.originalName}</h1>
				<div class="meta-info">
					<span>{formatFileSize(cv.size)}</span>
					<span>•</span>
					<span>Uploaded {new Date(cv.createdAt).toLocaleDateString()}</span>
					<span>•</span>
					<span>Processed by Grok AI</span>
				</div>
			</div>
		</div>

		<div class="cv-content">
			<!-- Personal Information -->
			<section class="cv-section">
				<h2>👤 Personal Information</h2>
				<div class="personal-card">
					<h3>{cv.parsedData.personalInfo.fullName}</h3>
					<div class="contact-grid">
						{#if cv.parsedData.personalInfo.email}
							<div class="contact-item">
								<span class="contact-label">Email:</span>
								<a href="mailto:{cv.parsedData.personalInfo.email}">{cv.parsedData.personalInfo.email}</a>
							</div>
						{/if}
						{#if cv.parsedData.personalInfo.phone}
							<div class="contact-item">
								<span class="contact-label">Phone:</span>
								<span>{cv.parsedData.personalInfo.phone}</span>
							</div>
						{/if}
						{#if cv.parsedData.personalInfo.location}
							<div class="contact-item">
								<span class="contact-label">Location:</span>
								<span>{cv.parsedData.personalInfo.location}</span>
							</div>
						{/if}
						{#if cv.parsedData.personalInfo.linkedIn}
							<div class="contact-item">
								<span class="contact-label">LinkedIn:</span>
								<a href="{cv.parsedData.personalInfo.linkedIn}" target="_blank">{cv.parsedData.personalInfo.linkedIn}</a>
							</div>
						{/if}
						{#if cv.parsedData.personalInfo.website}
							<div class="contact-item">
								<span class="contact-label">Website:</span>
								<a href="{cv.parsedData.personalInfo.website}" target="_blank">{cv.parsedData.personalInfo.website}</a>
							</div>
						{/if}
					</div>
					{#if cv.parsedData.personalInfo.summary}
						<div class="summary">
							<h4>Summary</h4>
							<p>{cv.parsedData.personalInfo.summary}</p>
						</div>
					{/if}
				</div>
			</section>

			<!-- Experience -->
			{#if cv.parsedData.experience && cv.parsedData.experience.length > 0}
				<section class="cv-section">
					<h2>💼 Work Experience</h2>
					<div class="timeline">
						{#each cv.parsedData.experience as exp}
							<div class="timeline-item">
								<div class="timeline-dot"></div>
								<div class="timeline-content">
									<div class="job-header">
										<h3>{exp.jobTitle}</h3>
										<span class="date-range">
											{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate || '')}
										</span>
									</div>
									<div class="company-info">
										<strong>{exp.company}</strong>
										{#if exp.location}
											<span class="location">• {exp.location}</span>
										{/if}
									</div>
									{#if exp.description}
										<p class="description">{exp.description}</p>
									{/if}
									{#if exp.achievements && exp.achievements.length > 0}
										<div class="achievements">
											<h4>Key Achievements:</h4>
											<ul>
												{#each exp.achievements as achievement}
													<li>{achievement}</li>
												{/each}
											</ul>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Education -->
			{#if cv.parsedData.education && cv.parsedData.education.length > 0}
				<section class="cv-section">
					<h2>🎓 Education</h2>
					<div class="education-grid">
						{#each cv.parsedData.education as edu}
							<div class="education-card">
								<h3>{edu.degree}</h3>
								<div class="institution">
									<strong>{edu.institution}</strong>
									{#if edu.location}
										<span class="location">• {edu.location}</span>
									{/if}
								</div>
								{#if edu.startDate || edu.endDate}
									<div class="date-range">
										{formatDate(edu.startDate || '')} - {formatDate(edu.endDate || '')}
									</div>
								{/if}
								{#if edu.gpa}
									<div class="gpa">GPA: {edu.gpa}</div>
								{/if}
								{#if edu.achievements && edu.achievements.length > 0}
									<div class="achievements">
										<h4>Achievements:</h4>
										<ul>
											{#each edu.achievements as achievement}
												<li>{achievement}</li>
											{/each}
										</ul>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Skills -->
			{#if cv.parsedData.skills && (cv.parsedData.skills.technical?.length || cv.parsedData.skills.soft?.length || cv.parsedData.skills.languages?.length)}
				<section class="cv-section">
					<h2>⚡ Skills</h2>
					<div class="skills-container">
						{#if cv.parsedData.skills.technical && cv.parsedData.skills.technical.length > 0}
							<div class="skill-category">
								<h3>Technical Skills</h3>
								<div class="skill-tags">
									{#each cv.parsedData.skills.technical as skill}
										<span class="skill-tag technical">{skill}</span>
									{/each}
								</div>
							</div>
						{/if}

						{#if cv.parsedData.skills.soft && cv.parsedData.skills.soft.length > 0}
							<div class="skill-category">
								<h3>Soft Skills</h3>
								<div class="skill-tags">
									{#each cv.parsedData.skills.soft as skill}
										<span class="skill-tag soft">{skill}</span>
									{/each}
								</div>
							</div>
						{/if}

						{#if cv.parsedData.skills.languages && cv.parsedData.skills.languages.length > 0}
							<div class="skill-category">
								<h3>Languages</h3>
								<div class="language-grid">
									{#each cv.parsedData.skills.languages as lang}
										<div class="language-item">
											<span class="language">{lang.language}</span>
											<span class="level">{lang.level}</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</section>
			{/if}

			<!-- Certifications -->
			{#if cv.parsedData.certifications && cv.parsedData.certifications.length > 0}
				<section class="cv-section">
					<h2>🏆 Certifications</h2>
					<div class="cert-grid">
						{#each cv.parsedData.certifications as cert}
							<div class="cert-card">
								<h3>{cert.name}</h3>
								<div class="cert-issuer">{cert.issuer}</div>
								{#if cert.date}
									<div class="cert-date">Issued: {formatDate(cert.date)}</div>
								{/if}
								{#if cert.expiryDate}
									<div class="cert-expiry">Expires: {formatDate(cert.expiryDate)}</div>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Projects -->
			{#if cv.parsedData.projects && cv.parsedData.projects.length > 0}
				<section class="cv-section">
					<h2>🚀 Projects</h2>
					<div class="project-grid">
						{#each cv.parsedData.projects as project}
							<div class="project-card">
								<div class="project-header">
									<h3>{project.name}</h3>
									{#if project.url}
										<a href="{project.url}" target="_blank" class="project-link">🔗</a>
									{/if}
								</div>
								{#if project.startDate || project.endDate}
									<div class="project-date">
										{formatDate(project.startDate || '')} - {formatDate(project.endDate || '')}
									</div>
								{/if}
								{#if project.description}
									<p class="project-description">{project.description}</p>
								{/if}
								{#if project.technologies && project.technologies.length > 0}
									<div class="project-tech">
										<h4>Technologies:</h4>
										<div class="tech-tags">
											{#each project.technologies as tech}
												<span class="tech-tag">{tech}</span>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Awards -->
			{#if cv.parsedData.awards && cv.parsedData.awards.length > 0}
				<section class="cv-section">
					<h2>🏅 Awards & Recognition</h2>
					<div class="award-grid">
						{#each cv.parsedData.awards as award}
							<div class="award-card">
								<h3>{award.name}</h3>
								<div class="award-issuer">{award.issuer}</div>
								{#if award.date}
									<div class="award-date">{formatDate(award.date)}</div>
								{/if}
								{#if award.description}
									<p class="award-description">{award.description}</p>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</div>
	{/if}
</div>

<style>
	.cv-detail-container {
		min-height: 100vh;
		background: linear-gradient(to bottom right, #f8fafc, #e2e8f0);
		padding: 2rem;
	}

	.loading-container,
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
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

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.error-message {
		text-align: center;
		background: white;
		padding: 2rem;
		border-radius: 1rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.error-message h2 {
		color: #dc2626;
		margin: 0 0 1rem 0;
	}

	.retry-btn,
	.back-btn {
		background: #6366f1;
		color: white;
		border: none;
		border-radius: 0.5rem;
		padding: 0.75rem 1.5rem;
		margin: 0.5rem;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.retry-btn:hover,
	.back-btn:hover {
		background: #5b21b6;
	}

	.cv-header {
		max-width: 1200px;
		margin: 0 auto 2rem auto;
		display: flex;
		align-items: center;
		gap: 2rem;
	}

	.back-button {
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
		color: #6366f1;
		font-weight: 500;
	}

	.back-button:hover {
		background: #f3f4f6;
		transform: translateX(-2px);
	}

	.cv-meta h1 {
		font-size: 2rem;
		font-weight: 700;
		color: #1f2937;
		margin: 0 0 0.5rem 0;
	}

	.meta-info {
		color: #6b7280;
		font-size: 0.875rem;
	}

	.meta-info span {
		margin: 0 0.5rem;
	}

	.cv-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.cv-section {
		background: white;
		border-radius: 1rem;
		padding: 2rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		border: 1px solid #e5e7eb;
	}

	.cv-section h2 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1f2937;
		margin: 0 0 1.5rem 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* Personal Information */
	.personal-card h3 {
		font-size: 1.5rem;
		color: #1f2937;
		margin: 0 0 1rem 0;
	}

	.contact-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.contact-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.contact-label {
		font-weight: 600;
		color: #374151;
		min-width: 70px;
	}

	.contact-item a {
		color: #6366f1;
		text-decoration: none;
	}

	.contact-item a:hover {
		text-decoration: underline;
	}

	.summary {
		background: #f8fafc;
		padding: 1.5rem;
		border-radius: 0.5rem;
		border-left: 4px solid #6366f1;
	}

	.summary h4 {
		margin: 0 0 0.5rem 0;
		color: #374151;
	}

	.summary p {
		margin: 0;
		line-height: 1.6;
		color: #6b7280;
	}

	/* Timeline */
	.timeline {
		position: relative;
		padding-left: 2rem;
	}

	.timeline::before {
		content: '';
		position: absolute;
		left: 0.75rem;
		top: 0;
		bottom: 0;
		width: 2px;
		background: #e5e7eb;
	}

	.timeline-item {
		position: relative;
		margin-bottom: 2rem;
	}

	.timeline-dot {
		position: absolute;
		left: -2rem;
		top: 0.5rem;
		width: 0.75rem;
		height: 0.75rem;
		background: #6366f1;
		border-radius: 50%;
		border: 3px solid white;
		box-shadow: 0 0 0 3px #e5e7eb;
	}

	.timeline-content {
		background: #f8fafc;
		padding: 1.5rem;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
	}

	.job-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.5rem;
		gap: 1rem;
	}

	.job-header h3 {
		margin: 0;
		color: #1f2937;
		font-size: 1.25rem;
	}

	.date-range {
		color: #6366f1;
		font-weight: 500;
		font-size: 0.875rem;
		white-space: nowrap;
	}

	.company-info {
		margin-bottom: 1rem;
		color: #374151;
	}

	.location {
		color: #6b7280;
	}

	.description {
		margin: 1rem 0;
		line-height: 1.6;
		color: #6b7280;
	}

	.achievements h4 {
		margin: 0 0 0.5rem 0;
		color: #374151;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.achievements ul {
		margin: 0;
		padding-left: 1.5rem;
	}

	.achievements li {
		margin-bottom: 0.25rem;
		color: #6b7280;
	}

	/* Education Grid */
	.education-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.education-card {
		background: #f8fafc;
		padding: 1.5rem;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
	}

	.education-card h3 {
		margin: 0 0 0.5rem 0;
		color: #1f2937;
		font-size: 1.1rem;
	}

	.institution {
		margin-bottom: 0.5rem;
		color: #374151;
	}

	.gpa {
		color: #6366f1;
		font-weight: 500;
		margin: 0.5rem 0;
	}

	/* Skills */
	.skills-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.skill-category h3 {
		margin: 0 0 1rem 0;
		color: #374151;
		font-size: 1.1rem;
	}

	.skill-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.skill-tag {
		padding: 0.5rem 1rem;
		border-radius: 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		background: #f3f4f6;
		color: #374151;
	}

	.skill-tag.technical {
		background: #dbeafe;
		color: #1e40af;
	}

	.skill-tag.soft {
		background: #f0fdf4;
		color: #166534;
	}

	.language-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
	}

	.language-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #f8fafc;
		padding: 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
	}

	.language {
		font-weight: 500;
		color: #1f2937;
	}

	.level {
		color: #6366f1;
		font-size: 0.875rem;
	}

	/* Cards Grid */
	.cert-grid,
	.project-grid,
	.award-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.cert-card,
	.project-card,
	.award-card {
		background: #f8fafc;
		padding: 1.5rem;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
		transition: transform 0.2s ease;
	}

	.cert-card:hover,
	.project-card:hover,
	.award-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.cert-card h3,
	.project-card h3,
	.award-card h3 {
		margin: 0 0 0.5rem 0;
		color: #1f2937;
		font-size: 1.1rem;
	}

	.cert-issuer,
	.award-issuer {
		color: #6366f1;
		font-weight: 500;
		margin-bottom: 0.5rem;
	}

	.cert-date,
	.cert-expiry,
	.project-date,
	.award-date {
		color: #6b7280;
		font-size: 0.875rem;
		margin: 0.25rem 0;
	}

	.project-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.5rem;
	}

	.project-link {
		color: #6366f1;
		text-decoration: none;
		font-size: 1.2rem;
	}

	.project-description,
	.award-description {
		margin: 1rem 0;
		line-height: 1.6;
		color: #6b7280;
	}

	.project-tech h4 {
		margin: 1rem 0 0.5rem 0;
		color: #374151;
		font-size: 0.875rem;
	}

	.tech-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.tech-tag {
		background: #dbeafe;
		color: #1e40af;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.cv-detail-container {
			padding: 1rem;
		}

		.cv-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.cv-section {
			padding: 1.5rem;
		}

		.job-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.contact-grid {
			grid-template-columns: 1fr;
		}

		.timeline {
			padding-left: 1.5rem;
		}

		.timeline-dot {
			left: -1.5rem;
		}
	}
</style> 