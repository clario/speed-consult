<script>
	import Title from '$lib/Title.svelte';
	import { signIn } from '../auth';
	import { page } from '$app/stores';

	let { data } = $props();

	let email = '';
	let password = '';
</script>

<h1>Speed consulting</h1>

<Title title="Hei hei" />
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<h2>{JSON.stringify(data)}</h2>
<div>
	<form>
		<label>
			Email
			<input name="email" type="email" bind:value={email} />
		</label>
		<label>
			Password
			<input name="password" type="password" bind:value={password} />
		</label>
		<button on:click={() => signIn('credentials', { email, password })}> Log in </button>
	</form>
</div>
