<!-- Custom type — bespoke commissions. Layout matches the Legal template
     (37.5vw left offset on desktop, no width caps, 14px/16px body text,
     20px section headings) so the reading pages share one setting. -->
<svelte:head>
	<title>Custom type — August Type Foundry</title>
	<meta
		name="description"
		content="August Type Foundry draws bespoke typefaces for brands and institutions — a proprietary voice, from first sketch to a fully realised family."
	/>
</svelte:head>

<main class="Custom">
	<!-- Full-bleed hero, first thing on the page. No photo dropped in yet —
	     swap the placeholder below for a real commission image at
	     /images/custom/hero.jpg (or pass one in via a prop) when there is one. -->
	<section class="Custom__hero" aria-hidden="true">
		<div class="Custom__hero-placeholder">
			<span class="Custom__hero-placeholder-label">Custom</span>
		</div>
	</section>

	<div class="Custom__split">
		<div class="Custom__head">
			<h1>Custom Typeface for Corporate Identity</h1>
		</div>

		<div class="Custom__inner">
			<p class="Custom__lead en" lang="en">
			Beyond our retail library, August draws bespoke typefaces for brands and institutions — a
			proprietary voice, from the first sketch to a fully realised family. A custom typeface is the
			most enduring asset a brand can own: it travels across every screen, surface and language
			while remaining unmistakably yours, and it does not expire when a licence does.
		</p>
		<p class="Custom__lead da" lang="da">
			Ud over vores retail-bibliotek tegner August skrifter på bestilling til brands og
			institutioner — en egen stemme, fra den første skitse til en færdig familie. En skrift lavet
			til én identitet er det mest holdbare aktiv, et brand kan eje: den følger med over hver skærm,
			hver flade og hvert sprog og bliver ved med at være genkendelig — og den udløber ikke, når en
			licens gør.
		</p>

		<section class="Custom__block">
			<h2>How We Work</h2>
			<p class="en" lang="en">
				Every commission starts with reading: the brand, its languages, the sizes it is actually
				set at, the places it fails today.
			</p>
			<p class="en" lang="en">
				From there we draw a small proof — a handful of characters that settle the argument —
				before a full character set is ever begun.
			</p>
			<p class="en" lang="en">
				Weights, widths and a variable axis follow only when the skeleton is right.
			</p>
			<p class="da" lang="da">
				Hver opgave begynder med at læse: brandet, dets sprog, de størrelser det faktisk sættes i,
				og de steder hvor det svigter i dag.
			</p>
			<p class="da" lang="da">
				Derfra tegner vi et lille bevis — en håndfuld tegn, der afgør sagen — før et fuldt tegnsæt
				overhovedet påbegyndes.
			</p>
			<p class="da" lang="da">
				Vægte, bredder og en variabel akse følger først, når skelettet sidder.
			</p>
		</section>

		<section class="Custom__block">
			<h2>What You Get</h2>
			<p class="en" lang="en">A typeface owned outright by your organisation, with no per-seat or per-view fees.</p>
			<p class="en" lang="en">Desktop, web and app formats, drawn as a variable font and delivered with statics.</p>
			<p class="en" lang="en">Latin as standard; extended language coverage on request.</p>
			<p class="en" lang="en">Documentation — metrics, OpenType features, and a specimen your team can work from.</p>
			<p class="da" lang="da">En skrift, jeres organisation ejer fuldt ud, uden betaling per bruger eller per visning.</p>
			<p class="da" lang="da">Formater til desktop, web og app, tegnet som variabel skrift og leveret med statiske snit.</p>
			<p class="da" lang="da">Latinsk som standard; udvidet sprogdækning efter aftale.</p>
			<p class="da" lang="da">Dokumentation — metrik, OpenType-funktioner og et prøvetryk, jeres team kan arbejde ud fra.</p>
		</section>

		<section class="Custom__block">
			<h2>Short of a Full Commission</h2>
			<p class="en" lang="en">
				Not every identity needs a typeface drawn from nothing. A retail family can be modified — a
				redrawn letter, a custom ligature, an alternate figure set, a weight that sits between two
				of ours — and licensed exclusively to you.
			</p>
			<p class="en" lang="en">
				It costs a fraction of a bespoke family and reaches most of the distance.
			</p>
			<p class="da" lang="da">
				Ikke enhver identitet har brug for en skrift tegnet fra bunden. En retail-familie kan ændres
				— et omtegnet bogstav, en særlig ligatur, et alternativt tal-sæt, en vægt der ligger mellem
				to af vores — og licenseres eksklusivt til jer.
			</p>
			<p class="da" lang="da">
				Det koster en brøkdel af en skræddersyet familie og når det meste af vejen.
			</p>
		</section>

		<section class="Custom__block">
			<h2>Enquire</h2>
			<p class="en" lang="en">
				Tell us what the type has to do, and where it has to do it. Write to
				<a href="mailto:hi@august.tf?subject=Custom%20typeface%20enquiry">hi@august.tf</a>.
			</p>
			<p class="da" lang="da">
				Fortæl os, hvad skriften skal kunne, og hvor den skal kunne det. Skriv til
				<a href="mailto:hi@august.tf?subject=Custom%20typeface%20enquiry">hi@august.tf</a>.
			</p>
		</section>
		</div>
	</div>
</main>

<style>
	.Custom {
		min-height: 100vh;
		min-height: 100dvh;
		/* No padding-top: the hero is full-bleed against the very top of the
		   page, above the header's own space. */
		padding-bottom: 96px;
	}

	/* Hero — full width, first thing on the page. Mobile: square (100vw), same
	   convention as the typeface-page hero. Desktop: a flat 75vh band. */
	/* Explicit 100vw rather than width:100% — width:100% only ever matches the
	   parent's content box, so it stays correct even if .Custom ever gains
	   inline padding upstream. The negative margin cancels 100vw's own
	   scrollbar-width overshoot so it doesn't force horizontal scroll. */
	.Custom__hero {
		width: 100vw;
		margin-inline: calc(50% - 50vw);
		height: 100vw;
		overflow: hidden;
	}

	@media (min-width: 768px) {
		.Custom__hero {
			height: 75vh;
			height: 75dvh;
		}
	}

	.Custom__hero-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-dark);
	}

	.Custom__hero-placeholder-label {
		font-family: 'Atom', sans-serif;
		font-size: clamp(60px, 15vw, 220px);
		letter-spacing: 0;
		color: #fff;
		opacity: 0.15;
		user-select: none;
	}

	/* Mobile: title stacked above the body, both flush left — plain block
	   flow, no flex. Desktop: a 40/60 flex row instead, so the two columns
	   start at the same Y (align-items: flex-start) rather than the title
	   sitting above the body as a separate block. */
	.Custom__split {
		padding-top: 48px;
	}

	@media (min-width: 768px) {
		.Custom__split {
			display: flex;
			align-items: flex-start;
			padding-top: 72px;
		}
	}

	.Custom__head {
		padding-inline: var(--padding);
		margin-bottom: 40px;
	}

	@media (min-width: 768px) {
		.Custom__head {
			flex: 0 0 40%;
			max-width: 40%;
			margin-bottom: 0;
		}
	}

	.Custom h1 {
		margin: 0;
		max-width: 20ch;
	}

	.Custom__inner {
		padding-inline: var(--padding);
	}

	/* Desktop: the right-hand 60% of the flex row — replaces the old
	   viewport-relative left inset now that the split is flex-driven. */
	@media (min-width: 768px) {
		.Custom__inner {
			flex: 0 0 60%;
			max-width: 60%;
			padding-left: 0;
		}
	}

	.Custom__lead {
		margin-bottom: 36px;
		max-width: 100%;
	}

	.Custom__block {
		/* Neutralise base.css's global `section { padding-inline }` — this
		   wrapper already gets its horizontal inset from .Custom__inner. */
		padding-inline: 0;
		margin-bottom: 28px;
		max-width: 100%;
	}

	.Custom__block h2 {
		font-size: 20px;
		margin: 0 0 8px;
	}

	.Custom__block p {
		margin: 0 0 10px;
	}

	.Custom__block p:last-child {
		margin-bottom: 0;
	}

	.Custom a {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	/* Font size per the Legal template: 14px mobile (base), 16px desktop. */
	.Custom p {
		font-size: 14px;
		font-weight: var(--fw-light);
	}

	@media (min-width: 768px) {
		.Custom p {
			font-size: 16px;
		}
	}

	/* One language at a time — [data-lang] lives on <html>, set by the header
	   switch (see lib/state/lang.svelte.ts). */
	:global([data-lang='da']) .Custom .en {
		display: none;
	}

	:global([data-lang='en']) .Custom .da {
		display: none;
	}
</style>
