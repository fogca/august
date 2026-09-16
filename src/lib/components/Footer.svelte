<script lang="ts">
	// Ōgast site footer.
	// Holds site nav, contact and legal links.
	import { lang, LANG_OPTIONS } from '$lib/state/lang.svelte';
	import { SITE_NAV } from '$lib/data/nav';
	import Logo from '$lib/components/Logo.svelte';

	type LinkItem = { label: string; href: string };

	const LEGAL: LinkItem[] = [
		// Plain-language "what's included" guide — sits ahead of the EULA
		// (the binding contract) rather than under /legal/, since it's a
		// summary page, not itself a legal document. Note: /license (no
		// -ing) is already taken — it's a stable redirect to /legal/eula
		// baked into the shipped fonts' own OpenType nameID 13/14 metadata,
		// so this page had to take a different URL rather than that one.
		{ label: 'Licensing', href: '/licensing' },
		{ label: 'EULA', href: '/legal/eula' },
		{ label: 'Privacy', href: '/legal/privacy' },
		// Japan's mandatory commercial-transactions disclosure (特定商取引法).
		// Presented in English for now (2026-08) — facts unchanged, language only.
		// Already covers seller name/address/contact, so the separate Company
		// page (removed 2026-08) was redundant with this one.
		{ label: 'Legal Notice', href: '/legal/tokusho' }
	];

	const YEAR = new Date().getFullYear();
</script>

<footer class="Footer" aria-labelledby="footer-heading">
	<h2 id="footer-heading" class="Footer__sr">Ōgast</h2>

	<div class="Footer__grid">
		<!-- Column 1: brand + ethos -->
		<section class="Footer__col Footer__col--brand">
			<a href="/" class="Footer__logo" aria-label="Ōgast — home">
				<Logo height={26} label="" />
			</a>
			<p class="Footer__tagline">
				A type foundry.<br />
				Norma — released 2026.
			</p>
		</section>

		<!-- Column 2: site nav (no heading, direct links) — shared verbatim
		     with the Header's own desktop nav (see $lib/data/nav.ts), at the
		     user's request, so the two lists can't drift apart. -->
		<nav class="Footer__col Footer__col--nav" aria-label="Footer navigation">
			<ul class="Footer__list">
				{#each SITE_NAV as item (item.href)}
					<li><a href={item.href}>{item.label}</a></li>
				{/each}
			</ul>
		</nav>

		<!-- Column 3: contact. The separate Email column (a bare mailto link)
		     was dropped (2026-09, at the user's request) — /contact itself is
		     now the actual place to get in touch (see that route). -->
		<section class="Footer__col Footer__col--contact">
			<h3 class="Footer__heading">Contact</h3>
			<p class="Footer__note">Licensing, custom type, and general enquiries.</p>
			<ul class="Footer__list">
				<li><a href="/contact">Contact us →</a></li>
			</ul>
		</section>
	</div>

	<div class="Footer__bottom">
		<ul class="Footer__legal">
			{#each LEGAL as item (item.href)}
				<li><a href={item.href}>{item.label}</a></li>
			{/each}
		</ul>
		<!-- Same four codes as the Header (see lang.svelte.ts's own comment) —
		     DE/ES are buttons only for now, no site copy translated into them
		     yet. -->
		<div class="Footer__langs" role="group" aria-label="Language">
			{#each LANG_OPTIONS as l (l.code)}
				<button
					type="button"
					class="Footer__lang"
					class:is-active={lang.current === l.code}
					onclick={() => lang.set(l.code)}
					aria-pressed={lang.current === l.code}
					aria-label={l.name}
				>
					{l.label}
				</button>
			{/each}
		</div>
		<p class="Footer__copy">© {YEAR} Ōgast</p>
	</div>
</footer>

<style>
	.Footer {
		font-family: var(--font-en), sans-serif;
		font-weight: var(--fw-ui);
		/* No background (was the same red as the Buy/licence section) and
		   black text, per the user's request — border-color follows (a white
		   border-top would be invisible with no background behind it). */
		color: #000;
		padding: 64px 0 24px;
		margin-top: 0;
		/* sit above the cover-reveal sections (z-index:1) above it */
		position: relative;
		z-index: 2;
		border-top: 1px solid var(--color-line);
	}

	/* Force all child elements to inherit black text color, overriding base.css tokens */
	.Footer :global(*) {
		color: #000;
	}

	.Footer :global(a) {
		color: #000;
	}

	.Footer__sr {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	/* Mobile: brand spans full width; nav and Contact sit side by side below
	   it as two columns (the separate Email column that used to pair with
	   nav here is gone — see the template comment). */
	.Footer__grid {
		display: grid;
		/* auto, not 1fr 1fr: nav's links are short and a rigid 50/50 split
		   left a wide dead gap inside that column on top of the real
		   column-gap. Hug the nav to its content instead and let the fixed
		   40px gap do the actual separating. */
		grid-template-columns: auto 1fr;
		grid-template-areas:
			'brand  brand'
			'nav    contact';
		column-gap: 40px;
		row-gap: 32px;
		padding-inline: 16px;
	}

	.Footer__col--brand {
		grid-area: brand;
	}

	.Footer__col--nav {
		grid-area: nav;
	}

	.Footer__col--contact {
		grid-area: contact;
	}

	@media (min-width: 768px) {
		.Footer__grid {
			grid-template-columns: 2fr 1fr 2fr;
			grid-template-areas: 'brand nav contact';
			gap: 32px;
			padding-inline: var(--padding);
		}
	}

	.Footer__col {
		display: flex;
		flex-direction: column;
		gap: 16px;
		/* Three of the four columns are <section>s, and base.css still carries a
		   bare `section { padding-inline: var(--padding) }`. Left alone it inset
		   those columns ~19px while the <nav> column stayed flush, so Fonts /
		   About / Buy sat out of line with the logo and Email/Contact. */
		padding-inline: 0;
	}

	.Footer__logo {
		display: block;
		width: fit-content;
		color: inherit;
	}

	.Footer__tagline {
		font-size: 13px;
		line-height: 1.5;
		opacity: 0.7;
		max-width: 28ch;
	}

	.Footer__heading {
		font-size: 12px;
		font-weight: var(--fw-strong);
		letter-spacing: 0;
		opacity: 0.6;
		/* .Footer__col's flex gap (16px) already spaces every child; pull 3px
		   off just below the heading, tightening the label-to-content gap
		   without touching the other gaps in the same column. */
		margin: 0 0 -3px;
	}

	.Footer__list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.Footer__list a,
	.Footer__legal a {
		color: inherit;
		text-decoration: none;
		font-size: 14px;
		opacity: 0.85;
		transition: opacity 0.15s ease;
	}

	.Footer__list a:hover,
	.Footer__legal a:hover {
		opacity: 1;
	}

	.Footer__note {
		font-size: 12px;
		line-height: 1.5;
		opacity: 0.7;
		margin: 0;
	}

	.Footer__bottom {
		margin-top: 56px;
		padding: 24px 16px 0;
		border-top: 1px solid rgba(255, 255, 255, 0.15);
		display: flex;
		flex-direction: column;
		gap: 16px;
		font-size: 12px;
		opacity: 0.6;
	}

	@media (min-width: 768px) {
		.Footer__bottom {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			padding-inline: var(--padding);
		}
	}

	.Footer__legal {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		gap: 16px;
	}

	.Footer__legal a {
		font-size: 12px;
	}

	.Footer__langs {
		display: flex;
		gap: 10px;
		align-items: center;
	}

	.Footer__lang {
		font-family: inherit;
		background: none;
		border: 0;
		padding: 0;
		cursor: pointer;
		font-size: 12px;
		color: inherit;
		letter-spacing: 0;
		opacity: 0.55;
		transition: opacity 0.15s ease;
	}

	.Footer__lang:hover {
		opacity: 0.85;
	}

	.Footer__lang.is-active {
		opacity: 1;
	}

	/* Mobile (see .Footer__bottom's own column layout below): last in DOM
	   order already puts this at the bottom of the stack — align-self pins
	   it to the right edge too, at the user's request ("© 2026 Ōgastが
	   一番下で、右端に"). Reset on desktop, where .Footer__bottom is a ROW
	   or align-self would instead just bottom-align it within the row's
	   own height, not reposition it horizontally — space-between there
	   already puts it at the right end of the row. */
	.Footer__copy {
		margin: 0;
		font-size: 12px;
		align-self: flex-end;
	}

	@media (min-width: 768px) {
		.Footer__copy {
			align-self: auto;
		}
	}
</style>
