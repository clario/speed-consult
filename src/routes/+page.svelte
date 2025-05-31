<script>
	import Title from '$lib/Title.svelte';
	let { data } = $props();
</script>

<h1>Speed consulting</h1>

<Title title="Hei hei" />
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<h2>{JSON.stringify(data)}</h2>
