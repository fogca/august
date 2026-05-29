<svelte:head>
	<title>Contact — August Type Foundry</title>
</svelte:head>

<main class="Contact">
	<div class="Contact__inner">
		<h1 class="Contact__heading">Contact</h1>
		<p class="Contact__sub">Enterprise licensing / 1,000+ users / 100M+ PV</p>
		<p class="Contact__body">
			For large-scale or custom license requirements, please get in touch. We will respond within 2
			business days.
		</p>
		<a href="mailto:hi@august.tf" class="Contact__link">hi@august.tf</a>
	</div>
</main>

<style>
	.Contact {
		min-height: 100vh;
		display: flex;
		align-items: center;
		padding-top: 80px;
		padding-inline: 24px;
	}

	@media (min-width: 768px) {
		.Contact {
			padding-inline: 48px;
		}
	}

	.Contact__inner {
		max-width: 480px;
	}

	.Contact__heading {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(28px, 5vw, 48px);
		font-variation-settings: 'wght' 400;
		letter-spacing: 0;
		line-height: 1.1;
		margin-bottom: 8px;
	}

	.Contact__sub {
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		font-variation-settings: 'wght' 300;
		color: var(--color-text-mute);
		margin-bottom: 24px;
	}

	.Contact__body {
		font-family: 'Steiner', sans-serif;
		font-size: 14px;
		font-variation-settings: 'wght' 350;
		line-height: 1.65;
		margin-bottom: 28px;
	}

	.Contact__link {
		font-family: 'Steiner', sans-serif;
		font-size: 16px;
		font-variation-settings: 'wght' 450;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
