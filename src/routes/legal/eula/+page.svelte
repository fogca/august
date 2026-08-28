<!--
  End User Licence Agreement — matches the scope sold at /buy (Desktop = users,
  Web = monthly pageviews, App = downloads, Books = copies).
  Keep the licence URL in the font name table (nameID 13/14) pointed here.
-->
<svelte:head>
	<title>Licence (EULA) — August Type Foundry</title>
	<meta
		name="description"
		content="End User Licence Agreement for August Type Foundry fonts — Desktop, Web, App, and Books."
	/>
</svelte:head>

<main class="Legal">
	<div class="Legal__inner">
		<h1>End User Licence Agreement</h1>
		<p class="Legal__lead">
			These terms govern your use of fonts purchased from August Type Foundry (a brand of Mirai
			Service Co., Ltd.). By downloading or using the Fonts you agree to them. The Sales Receipt
			and licence document delivered with the Fonts record exactly what you are licensed for.
		</p>

		<section class="Legal__block">
			<h2>1. Definitions</h2>
			<p>
				<strong>Fonts</strong> — the font software you purchased. <strong>Licensee</strong> — the
				person or company named on the Sales Receipt. <strong>User</strong> — a person who installs
				or uses the Fonts. <strong>Sales Receipt</strong> — the order confirmation and licence
				document, which is the authoritative record of your licence scope.
			</p>
		</section>

		<section class="Legal__block">
			<h2>2. Licence grant</h2>
			<p>
				We grant the Licensee a perpetual, worldwide, non-exclusive licence to use the Fonts within
				the scope on the Sales Receipt. The Fonts remain the property of August Type Foundry; this
				is a licence, not a sale of the software. Pay once — there is no subscription.
			</p>
		</section>

		<section class="Legal__block">
			<h2>3. Desktop licence</h2>
			<p>
				Covers installation and use of the Fonts to create artwork, documents, and images. Scope is
				measured by the number of Users in your organisation (per the tier on your Sales Receipt);
				each User may install the Fonts on the devices they personally use. Desktop licences do not
				cover live website embedding (Web), application embedding (App), or commercial ebook
				embedding (Books) — those are separate licences.
			</p>
		</section>

		<section class="Legal__block">
			<h2>4. Web licence</h2>
			<p>
				Covers self-hosting the supplied WOFF2 webfonts via <code>@font-face</code> on the website(s)
				identified with your order, up to the monthly pageview volume on your Sales Receipt. Only the
				WOFF2 files we supply may be used on the web; the desktop OTF/TTF must not be used in
				<code>@font-face</code>. Additional sites or higher traffic require an upgraded or additional
				licence.
			</p>
		</section>

		<section class="Legal__block">
			<h2>5. App licence</h2>
			<p>
				Covers embedding the Fonts in a single mobile or desktop application, up to the number of
				downloads on your Sales Receipt. Each additional application requires its own licence.
			</p>
		</section>

		<section class="Legal__block">
			<h2>6. Books licence</h2>
			<p>
				Covers embedding the Fonts in a single ebook / digital publication title, up to the number of
				copies on your Sales Receipt. Each additional title requires its own licence.
			</p>
		</section>

		<section class="Legal__block">
			<h2>7. Embedding, modification &amp; transfer</h2>
			<p>
				You may embed the Fonts in PDFs and documents in a manner consistent with your licence. You
				may not rename, reverse-engineer, decompile, or redistribute the Fonts, or create derivative
				font software from them, without our written permission. The licence may not be transferred,
				sub-licensed, or shared with a third party without our prior written consent.
			</p>
		</section>

		<section class="Legal__block">
			<h2>8. Compliance &amp; upgrades</h2>
			<p>
				You agree to take reasonable measures to keep the Fonts from being used outside your licensed
				scope. If your usage grows beyond the tier on your Sales Receipt, you agree to upgrade the
				licence. At our request, you agree to confirm that your usage matches your Sales Receipt.
			</p>
		</section>

		<section class="Legal__block">
			<h2>9. Termination</h2>
			<p>
				This licence terminates automatically if you breach it. On termination you must stop using
				and delete all copies of the Fonts. Sections that by their nature should survive (ownership,
				liability) continue after termination.
			</p>
		</section>

		<section class="Legal__block">
			<h2>10. Warranty &amp; liability</h2>
			<p>
				The Fonts are provided “as is.” To the extent permitted by law, August Type Foundry is not
				liable for indirect or consequential losses, and our total liability is limited to the
				amount you paid for the licence. Nothing here excludes liability that cannot be excluded by
				law.
			</p>
		</section>

		<section class="Legal__block">
			<h2>11. Governing law</h2>
			<p>
				This agreement is governed by the laws of Japan, and disputes are subject to the
				jurisdiction of the courts of Japan. For licence questions, contact
				<a href="mailto:hi@august.tf">hi@august.tf</a>.
			</p>
		</section>

		<p class="Legal__note">Version 1.0 — July 2026.</p>
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
		max-width: 680px;
		padding-inline: var(--padding);
	}

	/* PC: the block sits inside the right 75% of the viewport — the title
	   (and everything else, left-aligned by default) starts flush at that
	   25% seam rather than being centered on the page. */
	@media (min-width: 768px) {
		.Legal__inner {
			margin-left: 25%;
			margin-right: 0;
		}
	}

	.Legal h1 {
		margin: 0 0 24px;
	}

	.Legal__lead {
		margin-bottom: 36px;
		max-width: 64ch;
	}

	.Legal__block {
		margin-bottom: 26px;
		max-width: 66ch;
	}

	.Legal__block h2 {
		margin: 0 0 8px;
	}

	.Legal__block code {
		font-family: var(--font-system, monospace);
		font-size: 0.92em;
		opacity: 0.85;
	}

	.Legal__note {
		margin-top: 40px;
		font-size: 11px;
		opacity: 0.5;
	}

	.Legal a {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
