<script lang="ts">
	let email = '';
	let password = '';
	let name = '';
	let error = '';

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
		
		// Ensure password validation is triggered
		passwordTouched = true;
		
		// Check if there are validation errors
		if (passwordErrors.length > 0) {
			error = 'Please fix the password requirements below';
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

			// Redirect to login page after successful signup
			window.location.href = '/login';
		} catch (e: unknown) {
			if (e instanceof Error) {
				error = e.message;
			} else {
				error = 'An unexpected error occurred';
			}
		}
	}
</script>

<div class="container">
	<h1>Sign Up</h1>

	{#if error}
		<div class="error">{error}</div>
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

		<button type="submit" disabled={passwordTouched && passwordErrors.length > 0}>
			Sign Up
		</button>
	</form>

	<p>
		Already have an account? <a href="/login">Log in</a>
	</p>
</div>

<style>
	.container {
		max-width: 400px;
		margin: 2rem auto;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	h1 {
		text-align: center;
		margin-bottom: 2rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
	}

	input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	input.valid {
		border-color: #10b981;
		box-shadow: 0 0 0 1px #10b981;
	}

	input.invalid {
		border-color: #ef4444;
		box-shadow: 0 0 0 1px #ef4444;
	}

	button {
		width: 100%;
		padding: 0.75rem;
		background-color: #4f46e5;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	button:hover:not(:disabled) {
		background-color: #4338ca;
	}

	button:disabled {
		background-color: #9ca3af;
		cursor: not-allowed;
	}

	.error {
		color: #dc2626;
		background-color: #fee2e2;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
	}

	/* Password validation styles */
	.password-validation {
		margin-top: 0.5rem;
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
	}

	.error-icon {
		color: #dc2626;
		font-weight: bold;
	}

	.validation-success {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #10b981;
		margin-bottom: 0.75rem;
		font-weight: 500;
	}

	.success-icon {
		color: #10b981;
		font-weight: bold;
	}

	.requirements-list {
		background-color: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 4px;
		padding: 0.75rem;
		margin-top: 0.5rem;
	}

	.requirement {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
		color: #6b7280;
		transition: color 0.2s;
	}

	.requirement:last-child {
		margin-bottom: 0;
	}

	.requirement.met {
		color: #10b981;
	}

	.req-icon {
		width: 16px;
		text-align: center;
		font-weight: bold;
	}

	.requirement.met .req-icon {
		color: #10b981;
	}

	p {
		text-align: center;
		margin-top: 1rem;
	}

	a {
		color: #4f46e5;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
