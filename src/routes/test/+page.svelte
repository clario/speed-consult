<script lang="ts">
	import { onMount } from 'svelte';

	let result: Promise<any>;

	async function loadData() {
		const res = await fetch('/api/ai2');
		return await res.json();
	}

	onMount(() => {
		result = loadData();
	});
</script>

{#await result}
	<!-- promise is pending -->
	<p>waiting for the promise to resolve...</p>
{:then value}
	<!-- promise was fulfilled -->
	<p>The value is {JSON.stringify(value)}</p>
{/await}
