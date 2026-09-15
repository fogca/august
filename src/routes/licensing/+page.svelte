<!-- Licensing — plain-language guide to what an Ōgast licence covers,
     meant to sit ahead of the binding EULA (/legal/eula). Prices are
     deliberately left off — they live on /buy, and pulling only the scope
     data (TIER_DEFS names/labels, PROJECT_LICENSE_*) from pricing.ts keeps
     this page unable to drift out of sync with it. Route is /licensing, not
     /license — that shorter URL is a redirect to /legal/eula baked into the
     shipped fonts' own OpenType nameID 13/14 metadata.
     Layout: Figma node 3:671 (see PageSection.svelte) — the frame's own
     bottom-left line literally reads "License". -->
<script lang="ts">
	import PageSection from '$lib/components/PageSection.svelte';
	import { TIER_DEFS, PROJECT_LICENSE_LABEL, PROJECT_LICENSE_BLURB } from '$lib/data/pricing.js';

	// Team through Global — Individual (index 1) is covered on its own below,
	// it isn't part of the company-size ladder.
	const organisationTierLine = TIER_DEFS.filter((t) => t.index > 1)
		.map((t) => `${t.name} (${t.label})`)
		.join(' · ');
</script>

<svelte:head>
	<title>Licensing — Ōgast</title>
	<meta
		name="description"
		content="What an Ōgast licence covers — Desktop, Web, and App use, bundled into one licence from the Team tier upward."
	/>
</svelte:head>

<main class="Licensing">
	<PageSection title="Licensing" as="h1" subtitle="Per company size, not per platform">
		<p>
			Ōgast licences are sold per company size, not per platform. From the Team tier upward, one
			licence already includes Desktop, Web, and App use — there is no separate Desktop, Web, App,
			or Books licence to buy. The Individual tier is the one exception — it's scoped to desktop use
			alone. This page is a plain-language guide to that scope; the binding terms are in the <a
				href="/legal/eula">End User Licence Agreement</a
			>.
		</p>
	</PageSection>

	<PageSection title="Scope" subtitle="What Desktop, Web, and App means">
		<p>
			<strong>Desktop</strong> — installing the fonts on the computers you use, to design and produce
			static work — branding, print, packaging, PDFs, presentations, and exported images.
		</p>
		<p>
			<strong>Web</strong> — self-hosting the webfont files on your own server or a CDN you control, and
			loading them with @font-face on a website or web app.
		</p>
		<p>
			<strong>App</strong> — embedding the fonts in a mobile or desktop application, or a game, that you
			develop and ship.
		</p>
		<p>
			<strong>Broadcast &amp; streaming</strong> — using the fonts in video, motion graphics, and other
			audiovisual content you produce.
		</p>
		<p>
			<strong>Books &amp; publishing</strong> — embedding the fonts in an ebook, EPUB, or other digital
			publication you produce.
		</p>
		<p>
			Every tier from Team upward covers all five together, under one licence, across as many of
			your own projects as you like.
		</p>
	</PageSection>

	<PageSection title="Tiers" subtitle="Individual, Organisation, Project">
		<h3>Individual</h3>
		<p>
			For one person, scoped to desktop use only — print, PDF, and locally installed applications.
			It covers static output — branding, packaging, presentations, exported images — but not
			self-hosting a webfont, embedding in an app, or broadcast, streaming, or ebook use. If you
			need any of those, or you're producing work for an employer or a client rather than yourself,
			see Organisation or Project below.
		</p>
		<h3>Organisation — Team through Firm</h3>
		<p>
			One licence, full commercial use — Desktop, Web, App, broadcast/streaming, and
			ebook/publishing together — across as many of your own projects as you like. Priced by company
			size, in six tiers — {organisationTierLine}.
		</p>
		<p>
			Global (500+ people) is quoted individually rather than sold self-serve — get in touch at
			<a href="mailto:hi@august.tf">hi@august.tf</a>.
		</p>
		<h3>{PROJECT_LICENSE_LABEL}</h3>
		<p>{PROJECT_LICENSE_BLURB}</p>
		<p>
			It carries the same Desktop + Web + App + broadcast/streaming scope as an Organisation
			licence, but only for the one brand named on the Sales Receipt — not for the buying studio or
			agency's other clients or projects.
		</p>
	</PageSection>

	<PageSection title="Full Terms" subtitle="License">
		<p>
			This page is a summary, not the contract. Read the section that matches your licence —
			Individual, Organisation, or Project — in the
			<a href="/legal/eula">End User Licence Agreement</a> for the binding terms, or see current
			pricing on <a href="/buy">Buy</a>.
		</p>
	</PageSection>
</main>

<style>
	.Licensing {
		background: #f1f0ef;
	}

	.Licensing :global(strong) {
		font-weight: 500;
		font-variation-settings: 'wght' 500;
	}
</style>
