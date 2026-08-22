<svelte:head>
	<title>Contact — Andersen</title>
	<meta
		name="description"
		content="Contact Andersen — licensing questions, enterprise scale, custom typefaces, and general enquiries."
	/>
</svelte:head>

<main class="Contact">
	<div class="Contact__inner">
		<h1 class="Contact__heading">Contact</h1>
		<p class="Contact__sub">Licensing · Enterprise scale · Custom type · General enquiries</p>
		<p class="Contact__body">
			For license questions, enterprise requirements (1,000+ users / 100M+ PV), bespoke typefaces,
			or anything else — please get in touch. We will respond within 2 business days.
		</p>
		<a href="mailto:hi@august.tf" class="Contact__link">hi@august.tf</a>
	</div>
</main>

<style>
	.Contact {
		min-height: 100vh;
		min-height: 100dvh;
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
		letter-spacing: 0;
		line-height: 1.1;
		margin-bottom: 8px;
	}

	.Contact__sub {
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
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
		font-weight: var(--fw-ui);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
