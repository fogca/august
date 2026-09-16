<!-- Home page About — one full screen of running text, set well above body
     size so the statement itself is the layout (2026-09, at the user's
     request: "Aboutは...少し本文より大きめのテキストで画面全体にってデザイン",
     with a studio About page as the reference: a small dateline, then one
     large indented paragraph that fills the screen, then a short list below).

     The copy is lifted VERBATIM from /about (both languages) — nothing here is
     newly written. Same for the three facts: they are the existing About page's
     own <dl>, minus Contact, which now has its own section directly below this
     one.

     Amber ground per base.css's own note on --color-amber ("New brand color
     (2026-09) — first use: the About page background. Pairs with black text").
     Language switching uses the site-wide [data-lang] attribute on <html>, in
     the positive-match form (`[data-lang='fr'] .en { display:none }`), never
     `:not([data-lang='en'])` — that also matches every element with no
     attribute at all, which is most of the document. -->
<script lang="ts">
	import Arrow from '$lib/components/Arrow.svelte';
</script>

<section class="HomeAbout" id="about">
	<div class="HomeAbout__inner">
		<p class="HomeAbout__label">2026 — Tokyo</p>

		<div class="HomeAbout__statement">
			<p class="en" lang="en">
				Ōgast is an independent type foundry, founded in Tokyo in 2026. We cross histories,
				cultures, and eras, reinterpret their context, and draw type through a contemporary eye.
				Anchored in retail families and bespoke commissions, we keep searching for forms not yet
				seen.
			</p>
			<p class="fr" lang="fr">
				Ōgast est une fonderie de caractères indépendante, fondée à Tokyo en 2026. Nous traversons
				les histoires, les cultures et les époques, en réinterprétons le contexte, et dessinons des
				caractères à travers un regard contemporain. Ancrés dans nos familles de vente et nos
				commandes sur mesure, nous continuons de chercher des formes encore jamais vues.
			</p>
		</div>

		<div class="HomeAbout__foot">
			<dl class="HomeAbout__facts">
				<div class="HomeAbout__fact">
					<dt>Founded</dt>
					<dd>2026</dd>
				</div>
				<div class="HomeAbout__fact">
					<dt>Location</dt>
					<dd>Tokyo, Japan</dd>
				</div>
				<div class="HomeAbout__fact">
					<dt>Focus</dt>
					<dd>Retail typefaces, custom type</dd>
				</div>
			</dl>

			<a class="HomeAbout__cta" href="/about">
				<span class="CtaLabel">Read more</span>
				<Arrow size={9} />
			</a>
		</div>
	</div>
</section>

<style>
	.HomeAbout {
		min-height: 100svh;
		background: var(--color-amber, #ffbb32);
		display: flex;
		align-items: center;
		padding-block: clamp(96px, 12vh, 160px);
	}

	/* base.css §7 re-asserts `color: var(--color-text)` on div/p/a/dt/dd
	   INDIVIDUALLY, so a plain `color` on this section would never reach them.
	   Black is what the amber is documented to pair with, so this restates it
	   rather than fighting it — the rule exists so the section owns its own
	   colour instead of inheriting whatever the token happens to be. */
	.HomeAbout :global(*) {
		color: #000000;
	}

	.HomeAbout__inner {
		width: 100%;
		max-width: 1440px;
		margin-inline: auto;
		display: flex;
		flex-direction: column;
		gap: clamp(28px, 4vh, 48px);
	}

	.HomeAbout__label {
		font-family: var(--font-en), sans-serif;
		font-size: 12px;
		font-weight: var(--fw-ui);
		letter-spacing: 0.04em;
		opacity: 0.75;
		margin: 0;
	}

	/* The statement IS the layout: several steps above body copy, wrapping to
	   fill the screen. Justified inter-word with hyphenation, the same
		 magazine treatment the rest of the home page uses. */
	.HomeAbout__statement p {
		font-family: var(--font-en), sans-serif;
		/* Width AND height aware: a pure-vw clamp bottomed out at the 26px floor
		   for everything under ~765px, which left tablet widths with a statement
		   occupying barely half the screen. max() takes whichever of the two
		   axes has room, so a short-but-wide laptop stays bounded too. */
		font-size: clamp(26px, max(3.4vw, 4.6vh), 50px);
		line-height: 1.16;
		font-variation-settings: 'wght' 400;
		letter-spacing: -0.005em;
		text-align: justify;
		text-justify: inter-word;
		-webkit-hyphens: auto;
		hyphens: auto;
		/* First-line indent, as in the reference layout. */
		text-indent: 2.4em;
		margin: 0;
	}

	/* One language at a time — see the file header on why this is a positive
	   match and not :not(). */
	.HomeAbout__statement .fr {
		display: none;
	}

	:global([data-lang='fr']) .HomeAbout__statement .en {
		display: none;
	}

	:global([data-lang='fr']) .HomeAbout__statement .fr {
		display: block;
	}

	.HomeAbout__foot {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 24px 32px;
	}

	.HomeAbout__facts {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, auto));
		gap: 16px 48px;
		margin: 0;
	}

	.HomeAbout__fact dt {
		font-family: var(--font-en), sans-serif;
		font-size: 11px;
		line-height: 1.25;
		opacity: 0.6;
		margin: 0 0 6px;
	}

	.HomeAbout__fact dd {
		font-family: var(--font-en), sans-serif;
		font-size: 15px;
		line-height: 1.25;
		margin: 0;
	}

	.CtaLabel {
		display: inline-block;
		transform: translateY(1.5px);
	}

	.HomeAbout__cta {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-family: var(--font-en), sans-serif;
		font-size: 15px;
		font-weight: var(--fw-ui);
		text-decoration: none;
		transition: opacity 0.2s ease;
	}

	.HomeAbout__cta:hover {
		opacity: 0.6;
	}

	@media (max-width: 767.98px) {
		/* Tighter frame on a phone: at this size the statement itself is most of
		   the screen, and the desktop padding pushed its last line past the fold. */
		.HomeAbout {
			padding-block: clamp(56px, 8vh, 96px);
		}

		.HomeAbout__statement p {
			text-align: left;
			text-indent: 1.6em;
			-webkit-hyphens: auto;
			hyphens: auto;
		}

		.HomeAbout__facts {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 16px 24px;
		}
	}
</style>
