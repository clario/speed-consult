<script lang="ts">
	let { title } = $props();

	let test = $state(1);

	let test2 = 1;

	test2 = 3;
	test = 2;

	$effect(() => {
		console.log('test', test);
		console.log('test2', test2);
		console.log('');
	});

	let fullTitle = $derived(title + '  ' + new Date().toLocaleDateString());
</script>

<h1 class="title">{fullTitle}</h1>
<button
	onclick={() => {
		test++;
	}}>Knapp</button
>
<button
	onclick={() => {
		test2++;
	}}>Knapp</button
>
{test}
{test2}

<style>
	.title {
		color: red;
	}
</style>
