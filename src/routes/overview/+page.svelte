<script lang="ts">
	import NavBar from '$lib/NavBar.svelte';

	let { data } = $props();
	console.log(data);
</script>

<!-- Animated gradient background -------------------------------------------------- -->
<div
	class="bg-animate bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 fixed inset-0 -z-10"
	aria-hidden="true"
></div>

<!-- Navigation ------------------------------------------------------------------- -->
<NavBar {data} />
