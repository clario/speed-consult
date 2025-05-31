<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let loading = false;
	let error = '';
	let successMessage = '';

	// Get any error from URL params (from failed signin attempts)
	$: if ($page.url.searchParams.has('error')) {
		error = 'Invalid email or password. Please try again.';
	}

	// Get success message from URL params (from successful signup)
	$: if ($page.url.searchParams.get('message') === 'signup_success') {
		successMessage = 'Account created successfully! Please sign in with your new credentials.';
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		try {
			const result = await signIn('credentials', {
				email,
				password,
				redirect: false
			});

			if (result?.error) {
				error = 'Invalid email or password. Please try again.';
			} else {
				// Redirect to home page on successful login
				goto('/');
			}
		} catch (e) {
			error = 'An error occurred. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign In - KonsulentPro</title>
</svelte:head>

<div class="signin-container">
	<div class="signin-card">
		<div class="brand">
			<h1>KonsulentPro</h1>
			<p>Sign in to your account</p>
		</div>

		{#if error}
			<div class="error-message" role="alert">
				{error}
			</div>
		{/if}

		{#if successMessage}
			<div class="success-message" role="alert">
				{successMessage}
			</div>
		{/if}

		<form on:submit={handleSubmit} autocomplete="on" novalidate>
			<div class="form-group">
				<label for="email">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					bind:value={email}
					autocomplete="email"
					spellcheck="false"
					required
					placeholder="Enter your email"
					disabled={loading}
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					bind:value={password}
					autocomplete="current-password"
					required
					placeholder="Enter your password"
					disabled={loading}
				/>
			</div>

			<button 
				type="submit" 
				class="signin-btn"
				disabled={loading || !email || !password}
			>
				{#if loading}
					<span class="spinner"></span>
					Signing in...
				{:else}
					Sign In
				{/if}
			</button>
		</form>

		<div class="signup-link">
			<p>Don't have an account? <a href="/signup">Sign up</a></p>
		</div>
	</div>
</div>

<style>
	.signin-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(to bottom right, #3b82f6, #6366f1, #8b5cf6);
		padding: 1rem;
	}

	.signin-card {
		background: white;
		border-radius: 1rem;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
		padding: 2rem;
		width: 100%;
		max-width: 400px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.brand {
		text-align: center;
		margin-bottom: 2rem;
	}

	.brand h1 {
		font-size: 2rem;
		font-weight: 800;
		color: #1f2937;
		margin: 0 0 0.5rem 0;
		letter-spacing: -0.025em;
	}

	.brand p {
		color: #6b7280;
		margin: 0;
		font-size: 1rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group:last-of-type {
		margin-bottom: 2rem;
	}

	label {
		display: block;
		font-weight: 600;
		color: #374151;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	input {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 2px solid #e5e7eb;
		border-radius: 0.5rem;
		font-size: 1rem;
		transition: all 0.2s ease;
		background: white;
		box-sizing: border-box;
	}

	input:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	input:disabled {
		background-color: #f9fafb;
		cursor: not-allowed;
		opacity: 0.6;
	}

	input::placeholder {
		color: #9ca3af;
	}

	.signin-btn {
		width: 100%;
		background: linear-gradient(to right, #6366f1, #8b5cf6);
		color: white;
		border: none;
		border-radius: 0.5rem;
		padding: 0.875rem 1rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 50px;
	}

	.signin-btn:hover:not(:disabled) {
		background: linear-gradient(to right, #5b21b6, #7c3aed);
		transform: translateY(-1px);
		box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
	}

	.signin-btn:disabled {
		background: #9ca3af;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	.signin-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top: 2px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
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

	.signup-link {
		text-align: center;
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid #e5e7eb;
	}

	.signup-link p {
		color: #6b7280;
		margin: 0;
		font-size: 0.875rem;
	}

	.signup-link a {
		color: #6366f1;
		text-decoration: none;
		font-weight: 600;
		transition: color 0.2s ease;
	}

	.signup-link a:hover {
		color: #4f46e5;
		text-decoration: underline;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.signin-container {
			padding: 0.5rem;
		}
		
		.signin-card {
			padding: 1.5rem;
		}
		
		.brand h1 {
			font-size: 1.75rem;
		}
	}
</style> 