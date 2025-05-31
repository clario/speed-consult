<script lang="ts">
	let email = '';
	let password = '';
	let name = '';
	let error = '';

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
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

	<form onsubmit={handleSubmit}>
		<div class="form-group">
			<label for="name">Name</label>
			<input
				type="text"
				id="name"
				bind:value={name}
				required
				autocomplete="name"
				placeholder="Enter your name"
			/>
		</div>

		<div class="form-group">
			<label for="email">Email</label>
			<input
				type="email"
				id="email"
				bind:value={email}
				required
				autocomplete="email"
				placeholder="Enter your email"
			/>
		</div>

		<div class="form-group">
			<label for="password">Password</label>
			<input
				type="password"
				id="password"
				bind:value={password}
				required
				autocomplete="new-password"
				placeholder="Enter your password"
			/>
		</div>

		<button type="submit">Sign Up</button>
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

	button:hover {
		background-color: #4338ca;
	}

	.error {
		color: #dc2626;
		background-color: #fee2e2;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
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
