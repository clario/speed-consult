<script lang="ts">
	import { onMount } from 'svelte';

	let result: Promise<any>;

	onMount(() => {
		result = (async () => {
			const res = await fetch('/api/ai2');
			return await res.json();
		})();
	});
</script>

{#await result}
	<!-- promise is pending -->
	<p>waiting for the promise to resolve...</p>
{:then value}
	<!-- promise was fulfilled -->
	<p>The value is {JSON.stringify(value)}</p>
{/await}
