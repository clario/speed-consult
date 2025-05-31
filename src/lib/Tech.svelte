<script lang="ts">
	let {tech} = $props();
</script>

<div
	class="bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between hover:bg-white/10 transition-colors"
>
	<span class="text-sm font-medium">{tech.name}</span>
	<span class="text-xs text-white/40">
		{new Date(tech.createdAt).toLocaleDateString()}
	</span>
</div>
