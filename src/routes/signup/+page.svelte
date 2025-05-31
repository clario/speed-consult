<script lang="ts">
	import { goto } from '$app/navigation';
	
	let email = '';
	let password = '';
	let name = '';
	let error = '';
	let loading = false;

	// Password validation state
	let passwordTouched = false;
	let passwordErrors: string[] = [];

	// Regex patterns for validation
	const hasUppercase = /[A-Z]/;
	const hasLowercase = /[a-z]/;
	const hasNumber = /[0-9]/;
	const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

	// Real-time password validation
	$: {
		passwordErrors = [];
		if (passwordTouched && password) {
			if (password.length < 8) {
				passwordErrors.push('Password must be at least 8 characters');
			}
			if (password.length > 32) {
				passwordErrors.push('Password must be less than 32 characters');
			}
			if (!hasUppercase.test(password)) {
				passwordErrors.push('Password must contain at least one uppercase letter');
			}
			if (!hasLowercase.test(password)) {
				passwordErrors.push('Password must contain at least one lowercase letter');
			}
			if (!hasNumber.test(password)) {
				passwordErrors.push('Password must contain at least one number');
			}
			if (!hasSpecialChar.test(password)) {
				passwordErrors.push('Password must contain at least one special character');
			}
		}
	}

	// Check if password is valid
	$: passwordValid = passwordTouched && password.length >= 8 && password.length <= 32 && passwordErrors.length === 0;

	function handlePasswordBlur() {
		passwordTouched = true;
	}

	function handlePasswordInput() {
		if (!passwordTouched) {
			passwordTouched = true;
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		loading = true;
		
		// Ensure password validation is triggered
		passwordTouched = true;
		
		// Check if there are validation errors
		if (passwordErrors.length > 0) {
			error = 'Please fix the password requirements below';
			loading = false;
			return;
		}
		
		try {
			const response = await fetch('/api/auth/signup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password, name })
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Signup failed');
			}

			// Redirect immediately to signin page with success message
			goto('/signin?message=signup_success');
			
		} catch (e: unknown) {
			if (e instanceof Error) {
				error = e.message;
			} else {
				error = 'An unexpected error occurred';
			}
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign Up - KonsulentPro</title>
</svelte:head>

<div class="signup-container">
	<div class="signup-card">
		<div class="brand">
			<h1>KonsulentPro</h1>
			<p>Create your account</p>
		</div>

		{#if error}
			<div class="error-message" role="alert">
				{error}
			</div>
		{/if}

		<form onsubmit={handleSubmit} autocomplete="on" novalidate>
			<div class="form-group">
				<label for="name">Name</label>
				<input
					type="text"
					id="name"
					name="name"
					bind:value={name}
					autocomplete="name"
					spellcheck="false"
					required
					placeholder="Enter your name"
					disabled={loading}
				/>
			</div>

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
					onblur={handlePasswordBlur}
					oninput={handlePasswordInput}
					autocomplete="new-password"
					required
					placeholder="Enter your password"
					class:valid={passwordValid}
					class:invalid={passwordTouched && passwordErrors.length > 0}
					disabled={loading}
				/>
				
				<!-- Password validation messages -->
				{#if passwordTouched}
					<div class="password-validation">
						{#if passwordErrors.length > 0}
							<div class="validation-errors">
								{#each passwordErrors as error}
									<div class="validation-error">
										<span class="error-icon">✗</span>
										{error}
									</div>
								{/each}
							</div>
						{:else if password.length > 0}
							<div class="validation-success">
								<span class="success-icon">✓</span>
								Password meets all requirements
							</div>
						{/if}
						
						<!-- Password requirements checklist -->
						<div class="requirements-list">
							<div class="requirement" class:met={password.length >= 8}>
								<span class="req-icon">{password.length >= 8 ? '✓' : '○'}</span>
								At least 8 characters
							</div>
							<div class="requirement" class:met={password.length <= 32}>
								<span class="req-icon">{password.length <= 32 ? '✓' : '○'}</span>
								No more than 32 characters
							</div>
							<div class="requirement" class:met={hasUppercase.test(password)}>
								<span class="req-icon">{hasUppercase.test(password) ? '✓' : '○'}</span>
								One uppercase letter
							</div>
							<div class="requirement" class:met={hasLowercase.test(password)}>
								<span class="req-icon">{hasLowercase.test(password) ? '✓' : '○'}</span>
								One lowercase letter
							</div>
							<div class="requirement" class:met={hasNumber.test(password)}>
								<span class="req-icon">{hasNumber.test(password) ? '✓' : '○'}</span>
								One number
							</div>
							<div class="requirement" class:met={hasSpecialChar.test(password)}>
								<span class="req-icon">{hasSpecialChar.test(password) ? '✓' : '○'}</span>
								One special character
							</div>
						</div>
					</div>
				{/if}
			</div>

			<button 
				type="submit" 
				class="signup-btn"
				disabled={loading || !name || !email || (passwordTouched && passwordErrors.length > 0)}
			>
				{#if loading}
					<span class="spinner"></span>
					Creating account...
				{:else}
					Sign Up
				{/if}
			</button>
		</form>

		<div class="signin-link">
			<p>Already have an account? <a href="/signin">Sign in</a></p>
		</div>
	</div>
</div>

<style>
	.signup-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(to bottom right, #3b82f6, #6366f1, #8b5cf6);
		padding: 1rem;
	}

	.signup-card {
		background: white;
		border-radius: 1rem;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
		padding: 2rem;
		width: 100%;
		max-width: 480px;
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

	input.valid {
		border-color: #10b981;
		box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
	}

	input.invalid {
		border-color: #ef4444;
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
	}

	input:disabled {
		background-color: #f9fafb;
		cursor: not-allowed;
		opacity: 0.6;
	}

	input::placeholder {
		color: #9ca3af;
	}

	.signup-btn {
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

	.signup-btn:hover:not(:disabled) {
		background: linear-gradient(to right, #5b21b6, #7c3aed);
		transform: translateY(-1px);
		box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
	}

	.signup-btn:disabled {
		background: #9ca3af;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	.signup-btn:active:not(:disabled) {
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

	/* Password validation styles */
	.password-validation {
		margin-top: 0.75rem;
		font-size: 0.875rem;
	}

	.validation-errors {
		margin-bottom: 0.75rem;
	}

	.validation-error {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #dc2626;
		margin-bottom: 0.25rem;
		font-size: 0.8rem;
	}

	.error-icon {
		color: #dc2626;
		font-weight: bold;
		width: 12px;
		text-align: center;
	}

	.validation-success {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #10b981;
		margin-bottom: 0.75rem;
		font-weight: 500;
		font-size: 0.8rem;
	}

	.success-icon {
		color: #10b981;
		font-weight: bold;
		width: 12px;
		text-align: center;
	}

	.requirements-list {
		background-color: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		padding: 0.75rem;
		margin-top: 0.5rem;
	}

	.requirement {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.375rem;
		color: #64748b;
		transition: color 0.2s;
		font-size: 0.8rem;
	}

	.requirement:last-child {
		margin-bottom: 0;
	}

	.requirement.met {
		color: #10b981;
	}

	.req-icon {
		width: 12px;
		text-align: center;
		font-weight: bold;
		font-size: 0.75rem;
	}

	.requirement.met .req-icon {
		color: #10b981;
	}

	.signin-link {
		text-align: center;
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid #e5e7eb;
	}

	.signin-link p {
		color: #6b7280;
		margin: 0;
		font-size: 0.875rem;
	}

	.signin-link a {
		color: #6366f1;
		text-decoration: none;
		font-weight: 600;
		transition: color 0.2s ease;
	}

	.signin-link a:hover {
		color: #4f46e5;
		text-decoration: underline;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.signup-container {
			padding: 0.5rem;
		}
		
		.signup-card {
			padding: 1.5rem;
		}
		
		.brand h1 {
			font-size: 1.75rem;
		}

		.requirement {
			font-size: 0.75rem;
		}

		.validation-error,
		.validation-success {
			font-size: 0.75rem;
		}
	}
</style>
