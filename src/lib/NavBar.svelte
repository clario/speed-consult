<script lang="ts">
	let { data } = $props();
</script>

<nav
	class="absolute top-0 left-0 w-full flex items-center justify-between px-6 py-4 text-white backdrop-blur-md"
>
	<span class="font-extrabold text-2xl tracking-tight select-none">KonsulentPro</span>
	<div class="space-x-3 flex items-center">
		{#if data?.user}
			<span class="text-base">Welcome, {data.user.name || data.user.email}</span>
			<form method="POST" action="/auth/signout" style="display: inline;">
				<button type="submit" class="text-base px-4 py-2 rounded-md hover:bg-white/10 transition">
					Log&nbsp;out
				</button>
			</form>
		{:else}
			<a href="/login" class="text-base px-4 py-2 rounded-md hover:bg-white/10 transition"
				>Log&nbsp;in</a
			>
			<a
				href="/signup"
				class="hidden md:inline-flex bg-white text-slate-900 rounded-md px-5 py-2 font-medium shadow hover:shadow-lg transition"
			>
				Get&nbsp;started
			</a>
		{/if}
	</div>
</nav>
