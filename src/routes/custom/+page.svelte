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
	<div class="Custom__inner">
		<h1>Custom type</h1>
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
</main>

<style>
	.Custom {
		min-height: 100vh;
		min-height: 100dvh;
		padding-block: 96px;
	}

	@media (min-width: 768px) {
		.Custom {
			padding-top: 120px;
		}
	}

	.Custom__inner {
		padding-inline: var(--padding);
	}

	/* PC: same offset mechanism as the Legal/EULA template — a viewport-relative
	   left inset rather than a percentage margin, and no width cap. */
	@media (min-width: 768px) {
		.Custom__inner {
			padding-left: 37.5vw;
		}
	}

	.Custom h1 {
		margin: 0 0 24px;
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
