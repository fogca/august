<!-- Licensing — plain-language guide to what an August licence covers,
     meant to sit ahead of the binding EULA (/legal/eula): explains scope
     (Desktop / Web / App / broadcast / ebook publishing) and how the three
     licence families (Individual, Organisation, Project) differ. Prices are
     deliberately left off this page — they live on /buy, and pulling only
     the scope data (TIER_DEFS names/labels, PROJECT_LICENSE_*) from
     pricing.ts keeps this page unable to drift out of sync with it. Same
     shell as the other Legal pages (Privacy, EULA, Legal Notice) — see
     .Legal / .Legal__inner below, English-only for now like those three.
     Route is /licensing, not /license — that shorter URL is already a
     redirect to /legal/eula baked into the shipped fonts' own OpenType
     nameID 13/14 metadata, so it wasn't available for this page. -->
<script lang="ts">
	import { TIER_DEFS, PROJECT_LICENSE_LABEL, PROJECT_LICENSE_BLURB } from '$lib/data/pricing.js';

	// Team through Global — Individual (index 1) is covered on its own below,
	// it isn't part of the company-size ladder.
	const organisationTierLine = TIER_DEFS.filter((t) => t.index > 1)
		.map((t) => `${t.name} (${t.label})`)
		.join(' · ');
</script>

<svelte:head>
	<title>Licensing — August Type Foundry</title>
	<meta
		name="description"
		content="What an August Type Foundry licence covers — Desktop, Web, and App use, bundled into one licence from the Team tier upward."
	/>
</svelte:head>

<main class="Legal">
	<div class="Legal__inner">
		<h1>Licensing</h1>
		<p class="Legal__lead">
			August licences are sold per company size, not per platform. From the Team tier upward,
			one licence already includes Desktop, Web, and App use — there is no separate Desktop,
			Web, App, or Books licence to buy. The Individual tier is the one exception — it's scoped
			to desktop use alone. This page is a plain-language guide to that scope; the binding terms
			are in the <a href="/legal/eula">End User Licence Agreement</a>.
		</p>

		<section class="Legal__block">
			<h2>What "Desktop, Web, and App" Means</h2>
			<p>
				<strong>Desktop</strong> — installing the fonts on the computers you use, to design and
				produce static work — branding, print, packaging, PDFs, presentations, and exported images.
			</p>
			<p>
				<strong>Web</strong> — self-hosting the webfont files on your own server or a CDN you
				control, and loading them with @font-face on a website or web app.
			</p>
			<p>
				<strong>App</strong> — embedding the fonts in a mobile or desktop application, or a game,
				that you develop and ship.
			</p>
			<p>
				<strong>Broadcast &amp; streaming</strong> — using the fonts in video, motion graphics,
				and other audiovisual content you produce.
			</p>
			<p>
				<strong>Books &amp; publishing</strong> — embedding the fonts in an ebook, EPUB, or other
				digital publication you produce.
			</p>
			<p>Every tier from Team upward covers all five together, under one licence, across as many of your own projects as you like.</p>
		</section>

		<section class="Legal__block">
			<h2>Individual</h2>
			<p>
				For one person, scoped to desktop use only — print, PDF, and locally installed
				applications. It covers static output — branding, packaging, presentations, exported
				images — but not self-hosting a webfont, embedding in an app, or broadcast, streaming,
				or ebook use. If you need any of those, or you're producing work for an employer or a
				client rather than yourself, see Organisation or Project below.
			</p>
		</section>

		<section class="Legal__block">
			<h2>Organisation — Team through Firm</h2>
			<p>
				One licence, full commercial use — Desktop, Web, App, broadcast/streaming, and
				ebook/publishing together — across as many of your own projects as you like. Priced by
				company size, in six tiers — {organisationTierLine}.
			</p>
			<p>
				Global (500+ people) is quoted individually rather than sold self-serve — get in touch
				at <a href="mailto:hi@august.tf">hi@august.tf</a>.
			</p>
		</section>

		<section class="Legal__block">
			<h2>{PROJECT_LICENSE_LABEL}</h2>
			<p>{PROJECT_LICENSE_BLURB}</p>
			<p>
				It carries the same Desktop + Web + App + broadcast/streaming scope as an Organisation
				licence, but only for the one brand named on the Sales Receipt — not for the buying
				studio or agency's other clients or projects.
			</p>
		</section>

		<section class="Legal__block">
			<h2>Full Terms</h2>
			<p>
				This page is a summary, not the contract. Read the section that matches your licence —
				Individual, Organisation, or Project — in the
				<a href="/legal/eula">End User Licence Agreement</a> for the binding terms, or see
				current pricing on <a href="/buy">Buy</a>.
			</p>
		</section>
	</div>
</main>

<style>
	.Legal {
		min-height: 100vh;
		min-height: 100dvh;
		padding-block: 96px;
	}

	@media (min-width: 768px) {
		.Legal {
			padding-top: 120px;
		}
	}

	.Legal__inner {
		padding-inline: var(--padding);
	}

	/* Same offset mechanism as the other Legal-template pages — a
	   viewport-relative left inset rather than a percentage margin, and no
	   width cap. */
	@media (min-width: 768px) {
		.Legal__inner {
			padding-left: 37.5vw;
		}
	}

	.Legal h1 {
		margin: 0 0 24px;
	}

	.Legal__lead {
		margin-bottom: 36px;
		max-width: 100%;
	}

	.Legal__block {
		/* Neutralise base.css's global `section { padding-inline }` — this
		   wrapper already gets its horizontal inset from .Legal__inner. */
		padding-inline: 0;
		margin-bottom: 28px;
		max-width: 100%;
	}

	.Legal__block h2 {
		font-size: 20px;
		margin: 0 0 8px;
	}

	.Legal__block p {
		margin: 0 0 10px;
	}

	.Legal__block p:last-child {
		margin-bottom: 0;
	}

	.Legal a {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	/* Font size per the shared Legal template: 14px mobile (base), 16px desktop. */
	.Legal p {
		font-size: 14px;
		font-weight: var(--fw-light);
	}

	@media (min-width: 768px) {
		.Legal p {
			font-size: 16px;
		}
	}
</style>
