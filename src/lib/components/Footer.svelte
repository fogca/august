<script lang="ts">
	// Ōgast site footer.
	// Holds site nav and legal links.
	import { lang, LANG_OPTIONS } from '$lib/state/lang.svelte';
	import { SITE_NAV } from '$lib/data/nav';

	type LinkItem = { label: string; href: string };

	// Desktop shows a shorter, horizontal cut of the same nav — Fonts / Custom
	// / Contact only (2026-09, at the user's request). License and About stay
	// reachable from the Header's own nav, and from the mobile list below,
	// which still shows all five.
	const FOOTER_NAV_DESKTOP = SITE_NAV.filter((item) =>
		['/fonts', '/custom', '/contact'].includes(item.href)
	);

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

	<!-- Site nav — shared verbatim with the Header's own desktop nav (see
	     $lib/data/nav.ts) so the two can't drift out of sync. Rendered twice
	     (full five-item column on mobile, Fonts/Custom/Contact-only row on
	     desktop) and toggled by breakpoint in CSS — see FOOTER_NAV_DESKTOP's
	     own comment above for why desktop drops License/About. -->
	<nav class="Footer__nav" aria-label="Footer navigation">
		<ul class="Footer__list Footer__list--mobile">
			{#each SITE_NAV as item (item.href)}
				<li><a href={item.href}>{item.label}</a></li>
			{/each}
		</ul>
		<ul class="Footer__list Footer__list--desktop">
			{#each FOOTER_NAV_DESKTOP as item (item.href)}
				<li><a href={item.href}>{item.label}</a></li>
			{/each}
		</ul>
	</nav>

	<div class="Footer__bottom">
		<!-- Legal links sit on their own row, above the language switch
		     (2026-09, at the user's revised request — "言語の上＝左端の上に
		     LicenseやEULAなどを配置して"). -->
		<ul class="Footer__legal">
			{#each LEGAL as item (item.href)}
				<li><a href={item.href}>{item.label}</a></li>
			{/each}
		</ul>
		<!-- Language (left) + copyright (right) on the same row — the user's
		     own spec: "一番下の左が言語、その同じ高さの右端にコピーライト". -->
		<div class="Footer__row">
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
	</div>
</footer>

<style>
	.Footer {
		font-family: var(--font-en), sans-serif;
		font-weight: var(--fw-ui);
		/* No background (was the same red as the Buy/licence section) and
		   black text, per the user's request. */
		color: #000;
		padding: 64px 0 24px;
		margin-top: 0;
		/* sit above the cover-reveal sections (z-index:1) above it */
		position: relative;
		z-index: 2;
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

	.Footer__nav {
		padding-inline: 16px;
	}

	@media (min-width: 768px) {
		.Footer__nav {
			padding-inline: var(--padding);
		}
	}

	.Footer__list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	/* Mobile shows the full five-item nav as a column; desktop swaps it for
	   a shorter horizontal row (FOOTER_NAV_DESKTOP — see the script block). */
	.Footer__list--desktop {
		display: none;
	}

	@media (min-width: 768px) {
		.Footer__list--mobile {
			display: none;
		}

		.Footer__list--desktop {
			display: flex;
			flex-direction: row;
			gap: 24px;
		}
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

	/* Revised layout (2026-09, at the user's own follow-up spec — the earlier
	   "everything wraps together" version wasn't what was asked for):
	   legal links get their own row, ABOVE the language switch; the language
	   switch (left) and copyright (right) share the row below it, at the
	   same height. Column on mobile so those are genuinely two separate
	   rows; row on desktop, where .Footer__row (langs + copy) grows to fill
	   the space after the legal links so the three still read as one line —
	   see .Footer__row's own comment below. Mobile's own margin-top is
	   tighter than desktop's — the gap to the nav links above read as too
	   large at the smaller size. */
	.Footer__bottom {
		margin-top: 28px;
		padding: 24px 16px 0;
		border-top: 1px solid rgba(255, 255, 255, 0.15);
		display: flex;
		flex-direction: column;
		gap: 14px;
		font-size: 12px;
		opacity: 0.6;
	}

	@media (min-width: 768px) {
		.Footer__bottom {
			margin-top: 56px;
			flex-direction: row;
			align-items: center;
			gap: 20px;
			padding-inline: var(--padding);
		}
	}

	/* Language switch (left) + copyright (right), same row/height — the
	   user's own spec: "一番下の左が言語、その同じ高さの右端にコピーライト".
	   On desktop this grows to fill whatever width the legal links (its
	   sibling) don't use, so langs sits right after them and copy still
	   lands at the row's own right edge. */
	.Footer__row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
	}

	@media (min-width: 768px) {
		.Footer__row {
			flex: 1;
		}
	}

	.Footer__legal {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
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

	/* Sits at the right end of .Footer__row via that row's own
	   justify-content:space-between (see above), at the user's request
	   ("© 2026 Ōgastが一番下で、右端に"). */
	.Footer__copy {
		margin: 0;
		font-size: 12px;
	}
</style>
