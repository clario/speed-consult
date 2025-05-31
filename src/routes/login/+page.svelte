<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		// Redirect to the @auth/sveltekit signin page
		goto('/auth/signin');
	});
</script>

<div class="container">
	<div class="card">
		<p>Redirecting to login...</p>
	</div>
</div>

<style>
	.container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(to br, #3b82f6, #6366f1, #8b5cf6);
		padding: 1rem;
	}

	.card {
		background: white;
		padding: 2rem;
		border-radius: 1rem;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 400px;
		text-align: center;
	}
</style>
