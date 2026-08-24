<script lang="ts">
	// August Type Foundry site footer.
	// Holds contact info, site nav and legal links.
	import Logo from './Logo.svelte';

	type LinkItem = { label: string; href: string };

	const SITE_NAV: LinkItem[] = [
		{ label: 'Fonts', href: '/fonts' },
		{ label: 'About', href: '/about' },
		{ label: 'Buy', href: '/buy' },
		{ label: 'Contact', href: '/contact' }
	];

	// Social accounts are not live yet — placeholder links must not ship.
	// Re-add entries here once the foundry accounts exist.
	const SOCIAL: LinkItem[] = [];

	const LEGAL: LinkItem[] = [
		{ label: 'EULA', href: '/legal/eula' },
		{ label: 'Privacy', href: '/legal/privacy' },
		// The page itself stays Japanese (it's Japan's mandatory commercial-
		// transactions disclosure — the content has to be, this label doesn't).
		{ label: 'Legal Notice', href: '/legal/tokusho' },
		{ label: 'Company', href: '/legal/company' }
	];

	const YEAR = new Date().getFullYear();
</script>

<footer class="Footer" aria-labelledby="footer-heading">
	<h2 id="footer-heading" class="Footer__sr">August Type Foundry</h2>

	<div class="Footer__grid">
		<!-- Column 1: brand + ethos -->
		<section class="Footer__col Footer__col--brand">
			<a href="/" class="Footer__logo" aria-label="August Type Foundry — home">
				<Logo height={27} />
			</a>
			<p class="Footer__tagline">
				A type foundry.<br />
				Asger — released 2026.
			</p>
		</section>

		<!-- Column 2: site nav (no heading, direct links — its first item,
		     Fonts, is what lines up with "Email" opposite it on mobile). -->
		<nav class="Footer__col Footer__col--nav" aria-label="Footer navigation">
			<ul class="Footer__list">
				{#each SITE_NAV as item (item.href)}
					<li><a href={item.href}>{item.label}</a></li>
				{/each}
			</ul>
		</nav>

		<!-- Column 3: social / contact -->
		<section class="Footer__col Footer__col--email">
			<h3 class="Footer__heading">Email</h3>
			<ul class="Footer__list">
				{#each SOCIAL as item (item.href)}
					<li>
						<a href={item.href} target="_blank" rel="noopener noreferrer">
							{item.label} ↗
						</a>
					</li>
				{/each}
				<li>
					<a href="mailto:hi@august.tf">hi@august.tf</a>
				</li>
			</ul>
		</section>

		<!-- Column 4: contact -->
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
		<p class="Footer__copy">© {YEAR} August Type Foundry</p>
	</div>
</footer>

<style>
	.Footer {
		font-family: 'Steiner', sans-serif;
		font-weight: var(--fw-ui);
		/* Same red as the Buy/licence section (base.css :root token) */
		background: var(--color-signal);
		color: #fff;
		padding: 64px 0 24px;
		margin-top: 0;
		/* sit above the cover-reveal sections (z-index:1) above it */
		position: relative;
		z-index: 2;
		border-top: 1px solid #fff;
	}

	/* Force all child elements to inherit white text color, overriding base.css tokens */
	.Footer :global(*) {
		color: #fff;
	}

	.Footer :global(a) {
		color: #fff;
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

	/* Mobile: brand spans full width; nav ("Links") and Email+Contact
	   ("Contact") sit side by side below it as two columns — nav's first
	   item (Fonts) lines up with the Email heading opposite it since neither
	   column carries its own extra heading above that row. */
	.Footer__grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-areas:
			'brand  brand'
			'nav    email'
			'nav    contact';
		column-gap: 16px;
		row-gap: 32px;
		padding-inline: 16px;
	}

	.Footer__col--brand {
		grid-area: brand;
	}

	.Footer__col--nav {
		grid-area: nav;
	}

	.Footer__col--email {
		grid-area: email;
	}

	.Footer__col--contact {
		grid-area: contact;
	}

	@media (min-width: 768px) {
		.Footer__grid {
			grid-template-columns: 2fr 1fr 1fr 2fr;
			grid-template-areas: 'brand nav email contact';
			gap: 32px;
			padding-inline: 32px;
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
		font-size: 32px;
		font-weight: var(--fw-ui);
		letter-spacing: 0;
		text-decoration: none;
		color: inherit;
		line-height: 1;
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
			padding-inline: 32px;
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

	.Footer__copy {
		margin: 0;
		font-size: 12px;
	}
</style>
