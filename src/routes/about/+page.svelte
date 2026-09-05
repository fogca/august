<!-- About — redesigned 2026-09 at the user's request, referenced from two
     images: a 1619 Project magazine spread (a statement set large enough to
     fill the whole page, with small index/footnote text below it) and Paul
     Pacher's own studio site (a huge intro paragraph filling the first
     screen, with compact "Services"/"Experience" fact-lists underneath).
     Style note: "Swiss typeface... Helmut Schmid typography" is read here as
     compositional — a numbered, grid-disciplined, functional layout — not a
     literal font swap. Norma (this site's own face, via --font-en) stays;
     nothing here introduces a second typeface.

     Revision (same day): merged the former "01 Foundry" / "02 Information"
     sections into one 100vh view — statement pinned to the top, fact-sheet
     pinned to the bottom, via justify-content:space-between — and dropped
     the numbered eyebrows + border-top rules between every section on the
     page. Copy updated for the Ôgast rename: same statement, only the
     studio's own name in it changed — no new "why Ôgast" story invented
     (see the standing note in typefaces.ts on why that isn't done
     unilaterally). -->
<svelte:head>
	<title>About — Ôgast</title>
	<meta
		name="description"
		content="Ôgast — an independent type foundry from Tokyo. Studio statement and philosophy."
	/>
</svelte:head>

<main class="About">
	<!-- Statement pinned to the top, fact-sheet pinned to the bottom — both
	     inside one 100vh view. -->
	<section class="About__hero">
		<div class="About__hero-copy">
			<p class="About__hero-text en" lang="en">
				Ôgast is an independent type foundry, founded in Tokyo in 2026. We cross histories,
				cultures, and eras, reinterpret their context, and draw type through a contemporary eye.
				Anchored in retail families and bespoke commissions, we keep searching for forms not yet
				seen.
			</p>
			<p class="About__hero-text da" lang="da">
				Ôgast er et uafhængigt skriftstøberi, grundlagt i Tokyo i 2026. Vi krydser historier,
				kulturer og epoker, gentolker deres sammenhæng og tegner skrift gennem et nutidigt blik.
				Med udgangspunkt i retail-familier og bespoke-opgaver bliver vi ved med at lede efter
				former, der endnu ikke er set.
			</p>
		</div>

		<!-- Every value here already appears elsewhere on the site (the
		     statement above states 2026/Tokyo; hi@august.tf is the same
		     address used on /contact and in Footer.svelte) — nothing new is
		     asserted. -->
		<div class="About__facts">
			<p class="About__facts-eyebrow">Information</p>
			<dl class="About__facts-grid">
				<div class="About__facts-item">
					<dt>Founded</dt>
					<dd>2026</dd>
				</div>
				<div class="About__facts-item">
					<dt>Location</dt>
					<dd>Tokyo, Japan</dd>
				</div>
				<div class="About__facts-item">
					<dt>Focus</dt>
					<dd>Retail typefaces, custom type</dd>
				</div>
				<div class="About__facts-item">
					<dt>Contact</dt>
					<dd><a href="mailto:hi@august.tf">hi@august.tf</a></dd>
				</div>
			</dl>
		</div>
	</section>

	<!-- Norma, the foundry's first release. Same copy as before this
	     redesign; still no "why Norma" naming story — see the standing note
	     in typefaces.ts on why that isn't invented unilaterally. -->
	<section class="About__block">
		<p class="About__block-eyebrow">Norma</p>
		<h2 class="About__block-heading">The formative forces of the word, made visible</h2>
		<p class="en" lang="en">
			Our first release, Norma, is a twenty-weight neo-humanist sans-serif variable font. The
			letters are made to feel grown rather than constructed — organic in their curves, human in
			their proportion. Its humanist lineage runs quietly beneath — Johnston's 1916 Underground
			alphabet, Gill Sans, Neuzeit, Otl Aicher's Rotis — never the surface, only the soil.
		</p>
		<p class="da" lang="da">
			Vores første udgivelse, Norma, er en neo-humanistisk grotesk i tyve vægte, tegnet som
			variabel skrift. Bogstaverne skal føles groede snarere end konstruerede — organiske i
			kurverne, menneskelige i proportionen. Den humanistiske slægt løber stille nedenunder —
			Johnstons Underground-alfabet fra 1916, Gill Sans, Neuzeit, Otl Aichers Rotis — aldrig
			overfladen, kun jorden.
		</p>
		<p class="en" lang="en">
			A typeface is never the meaning itself. It is the medium meaning passes through — doing the
			quiet work of carrying a thought from one mind to another.
		</p>
		<p class="da" lang="da">
			En skrift er aldrig betydningen selv. Den er det medium, betydningen passerer igennem — det
			stille arbejde med at bære en tanke fra ét sind til et andet.
		</p>
	</section>
</main>

<style>
	/* Dark theme — scoped to About only. base.css applies color directly to
	   div / p / span / a / h1-h6, so the parent color loses the cascade;
	   override every descendant with :global(*). Uses base.css dark tokens. */
	.About {
		min-height: 100vh;
		min-height: 100dvh;
		background: var(--color-bg-dark);
		color: var(--white);
		font-family: var(--font-en), sans-serif;
	}

	.About :global(*) {
		color: var(--white);
	}

	/* One language at a time — [data-lang] lives on <html>, set by the header
	   switch (see lib/state/lang.svelte.ts). */
	:global([data-lang='da']) .About .en {
		display: none;
	}

	:global([data-lang='en']) .About .da {
		display: none;
	}

	/* ── Statement (top) + Information (bottom), one 100vh view ── */
	.About__hero {
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 24px;
		padding-inline: 20px;
		/* Room for the fixed global header, same convention as every other
		   page's own top padding. */
		padding-top: 96px;
	}

	@media (min-width: 768px) {
		.About__hero {
			padding-top: 0;
		}
	}

	/* Full width, justified, no eyebrow above it (the reference's own giant
	   paragraph carries no label either) — set at a fixed reading size
	   rather than the earlier display-scale clamp, now that this behaves as
	   a body paragraph rather than a headline. line-height opened up from
	   the headline's 1.15 to 1.5: justify's uneven word-spacing reads easier
	   with more room between lines at this size. */
	.About__hero-text {
		font-size: 28px;
		line-height: 1.5;
		letter-spacing: 0;
		text-align: justify;
		margin: 0;
	}

	.About__hero-text.da {
		font-weight: 300;
		opacity: 0.8;
	}

	/* ── Information: a compact fact grid ── */
	.About__facts {
		padding-bottom: 48px;
	}

	.About__facts-eyebrow {
		font-size: 12px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		opacity: 0.55;
		margin: 0 0 32px;
	}

	.About__facts-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 28px;
		margin: 0;
		max-width: 720px;
	}

	@media (min-width: 600px) {
		.About__facts-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 32px 48px;
		}
	}

	.About__facts-item dt {
		font-size: 12px;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		opacity: 0.55;
		margin: 0 0 6px;
	}

	.About__facts-item dd {
		font-size: clamp(18px, 2.4vw, 24px);
		line-height: 1.3;
		margin: 0;
	}

	.About__facts-item a {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	/* ── Norma statement ── */
	.About__block {
		padding-block: 80px;
		padding-inline: var(--padding);
	}

	.About__block-eyebrow {
		font-size: 12px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		opacity: 0.55;
		margin: 0 0 20px;
	}

	.About__block-heading {
		font-size: clamp(24px, 3.4vw, 36px);
		line-height: 1.2;
		max-width: 22ch;
		margin: 0 0 28px;
	}

	.About__block .en,
	.About__block .da {
		max-width: 62ch;
	}

	.About__block .en {
		font-size: 15px;
		line-height: 1.7;
		margin: 0 0 10px;
	}

	.About__block .da {
		font-weight: 300;
		font-size: 14px;
		line-height: 1.7;
		opacity: 0.75;
		margin: 0 0 28px;
	}

	.About__block .da:last-child {
		margin-bottom: 0;
	}
</style>
