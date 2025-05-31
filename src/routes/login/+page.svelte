<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let email = '';
	let password = '';
	let error = '';

	function handleSubmit() {
		return async ({ result }: { result: { type: string; data?: { error: string } } }) => {
			console.log('Form submission result:', result);
			if (result.type === 'success') {
				await goto('/');
			} else if (result.type === 'failure') {
				error = result.data?.error || 'An error occurred';
			}
		};
	}
</script>

<div class="container">
	<h1>Login</h1>

	{#if error}
		<div class="error">{error}</div>
	{/if}

	<form method="POST" use:enhance={handleSubmit}>
		<div class="form-group">
			<label for="email">Email</label>
			<input
				type="email"
				id="email"
				name="email"
				bind:value={email}
				required
				autocomplete="email"
			/>
		</div>

		<div class="form-group">
			<label for="password">Password</label>
			<input
				type="password"
				id="password"
				name="password"
				bind:value={password}
				required
				autocomplete="current-password"
			/>
		</div>

		<button type="submit">Login</button>
	</form>

	<p>
		Don't have an account? <a href="/signup">Sign up</a>
	</p>
</div>

<style>
	.container {
		max-width: 400px;
		margin: 0 auto;
		padding: 2rem;
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
	}

	input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	button {
		width: 100%;
		padding: 0.75rem;
		background-color: #4caf50;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		margin-top: 1rem;
	}

	button:hover {
		background-color: #45a049;
	}

	.error {
		color: red;
		margin-bottom: 1rem;
		padding: 0.5rem;
		border: 1px solid red;
		border-radius: 4px;
		background-color: #ffebee;
	}

	p {
		text-align: center;
		margin-top: 1rem;
	}

	a {
		color: #4caf50;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
