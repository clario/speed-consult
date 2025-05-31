<script lang="ts">
	let { title = 'hei' } = $props();

	let fullTitle = $derived(title + '  ' + new Date().toLocaleDateString());
</script>

<h1>{fullTitle}</h1>
