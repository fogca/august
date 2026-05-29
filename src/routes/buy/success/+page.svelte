<svelte:head>
	<title>Order Received — August Type Foundry</title>
</svelte:head>

<main class="Success">
	<div class="Success__inner">
		<h1 class="Success__heading">Order Received</h1>
		<p class="Success__body">
			Thank you for purchasing Steiner. A license email with download link, EULA, and license
			certificate will arrive shortly.
		</p>
		<a href="/" class="Success__home">← Back to Type Tester</a>
	</div>
</main>

<style>
	.Success {
		min-height: 100vh;
		display: flex;
		align-items: center;
		padding-top: 80px;
		padding-inline: 24px;
	}

	.Success__inner {
		max-width: 480px;
	}

	.Success__heading {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(28px, 5vw, 48px);
		font-variation-settings: 'wght' 400;
		letter-spacing: 0;
		line-height: 1.1;
		margin-bottom: 20px;
	}

	.Success__body {
		font-family: 'Steiner', sans-serif;
		font-size: 14px;
		font-variation-settings: 'wght' 350;
		line-height: 1.65;
		color: var(--color-text-mute);
		margin-bottom: 32px;
	}

	.Success__home {
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		font-variation-settings: 'wght' 450;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
