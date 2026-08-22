<script lang="ts">
	// Site-wide error boundary — replaces SvelteKit's bare fallback page.
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} — Andersen</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="ErrorPage">
	<div class="ErrorPage__inner">
		<p class="ErrorPage__status">{page.status}</p>
		<h1 class="ErrorPage__heading">
			{page.status === 404 ? 'Page not found' : 'Something went wrong'}
		</h1>
		<p class="ErrorPage__body">
			{#if page.status === 404}
				The page you are looking for doesn't exist or has moved.
			{:else if page.url.pathname.startsWith('/buy')}
				An unexpected error occurred. Nothing was charged. Please try again in a moment, or write
				to us if it keeps happening.
			{:else}
				An unexpected error occurred. Please try again in a moment, or write to us if it keeps
				happening.
			{/if}
		</p>
		<div class="ErrorPage__links">
			<a href="/">← Andersen</a>
			<a href="mailto:hi@august.tf">hi@august.tf</a>
		</div>
	</div>
</main>

<style>
	.ErrorPage {
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		align-items: center;
		padding-top: 80px;
		padding-inline: 24px;
	}

	.ErrorPage__inner {
		max-width: 480px;
	}

	.ErrorPage__status {
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		color: var(--color-text-mute);
		margin-bottom: 12px;
	}

	.ErrorPage__heading {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(28px, 5vw, 48px);
		letter-spacing: 0;
		line-height: 1.1;
		margin-bottom: 20px;
	}

	.ErrorPage__body {
		font-family: 'Steiner', sans-serif;
		font-size: 14px;
		font-variation-settings: 'wght' 350;
		line-height: 1.65;
		margin-bottom: 32px;
	}

	.ErrorPage__links {
		display: flex;
		gap: 24px;
		flex-wrap: wrap;
	}

	.ErrorPage__links a {
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		font-weight: var(--fw-ui);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
