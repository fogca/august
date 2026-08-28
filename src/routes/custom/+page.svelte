<svelte:head>
	<title>Custom type — August Type Foundry</title>
	<meta
		name="description"
		content="August Type Foundry draws bespoke typefaces for brands and institutions — a proprietary voice, from first sketch to a fully realised family."
	/>
</svelte:head>

<main class="Custom">
	<div class="Custom__inner">
		<header class="Custom__head">
			<p class="Custom__eyebrow">Bespoke</p>
			<h1 class="Custom__title">Custom type for corporate identity</h1>
		</header>

		<!-- 1 — What it is -->
		<section class="block">
			<h2>A voice, not a licence</h2>
			<p class="en" lang="en">
				Beyond our retail library, August draws bespoke typefaces for brands and institutions — a
				proprietary voice, from the first sketch to a fully realised family. A custom typeface is
				the most enduring asset a brand can own: it travels across every screen, surface and
				language while remaining unmistakably yours, and it does not expire when a licence does.
			</p>
			<p class="da" lang="da">
				Ud over vores retail-bibliotek tegner August skrifter på bestilling til brands og
				institutioner — en egen stemme, fra den første skitse til en færdig familie. En skrift lavet
				til én identitet er det mest holdbare aktiv, et brand kan eje: den følger med over hver
				skærm, hver flade og hvert sprog og bliver ved med at være genkendelig — og den udløber
				ikke, når en licens gør.
			</p>
		</section>

		<!-- 2 — How we work -->
		<section class="block">
			<h2>How we work</h2>
			<p class="en" lang="en">
				Every commission starts with reading: the brand, its languages, the sizes it is actually
				set at, the places it fails today. From there we draw a small proof — a handful of
				characters that settle the argument — before a full character set is ever begun. Weights,
				widths and a variable axis follow only when the skeleton is right.
			</p>
			<p class="da" lang="da">
				Hver opgave begynder med at læse: brandet, dets sprog, de størrelser det faktisk sættes i,
				og de steder hvor det svigter i dag. Derfra tegner vi et lille bevis — en håndfuld tegn,
				der afgør sagen — før et fuldt tegnsæt overhovedet påbegyndes. Vægte, bredder og en
				variabel akse følger først, når skelettet sidder.
			</p>
		</section>

		<!-- 3 — What you get -->
		<section class="block">
			<h2>What you get</h2>
			<ul class="Custom__list">
				<li>A typeface owned outright by your organisation, with no per-seat or per-view fees.</li>
				<li>Desktop, web and app formats, drawn as a variable font and delivered with statics.</li>
				<li>Latin as standard; extended language coverage on request.</li>
				<li>Documentation: metrics, OpenType features, and a specimen your team can work from.</li>
			</ul>
		</section>

		<!-- 4 — Also available -->
		<section class="block">
			<h2>Short of a full commission</h2>
			<p class="en" lang="en">
				Not every identity needs a typeface drawn from nothing. A retail family can be modified —
				a redrawn letter, a custom ligature, an alternate figure set, a weight that sits between
				two of ours — and licensed exclusively to you. It is a fraction of the cost of a bespoke
				family and reaches most of the distance.
			</p>
			<p class="da" lang="da">
				Ikke enhver identitet har brug for en skrift tegnet fra bunden. En retail-familie kan
				ændres — et omtegnet bogstav, en særlig ligatur, et alternativt tal-sæt, en vægt der ligger
				mellem to af vores — og licenseres eksklusivt til jer. Det koster en brøkdel af en
				skræddersyet familie og når det meste af vejen.
			</p>
		</section>

		<!-- 5 — Contact -->
		<section class="block">
			<h2>Enquire</h2>
			<p class="en" lang="en">
				Tell us what the type has to do, and where it has to do it. Write to
				<a href="mailto:hi@august.tf?subject=Custom%20typeface%20enquiry">hi@august.tf</a>.
			</p>
			<p class="da" lang="da">
				Fortæl os, hvad skriften skal kunne, og hvor den skal kunne det. Skriv til
				<a href="mailto:hi@august.tf?subject=Custom%20typeface%20enquiry">hi@august.tf</a>.
			</p>
			<a class="Custom__cta" href="mailto:hi@august.tf?subject=Custom%20typeface%20enquiry">
				Start an enquiry
			</a>
		</section>
	</div>
</main>

<style>
	/* Same dark treatment as /about: base.css colours div / p / a / h1-h6
	   directly, so the parent colour loses the cascade — every descendant has
	   to be overridden with :global(*). */
	.Custom {
		min-height: 100vh;
		min-height: 100dvh;
		padding-block: 96px;
		background: var(--color-bg-dark);
		color: var(--white);
	}

	.Custom :global(*) {
		color: var(--white);
	}

	@media (min-width: 768px) {
		.Custom {
			padding-top: 120px;
		}
	}

	.Custom__inner {
		max-width: 760px;
		margin: 0 auto;
		padding-inline: var(--padding);
	}

	.Custom__head {
		margin-bottom: 80px;
	}

	.Custom__eyebrow {
		font-size: 11px;
		font-weight: var(--fw-ui);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.6;
		margin: 0 0 16px;
	}

	.Custom__title {
		font-size: clamp(36px, 6vw, 64px);
		line-height: 1.05;
		margin: 0;
	}

	.block {
		margin-bottom: 80px;
	}

	.block:last-child {
		margin-bottom: 0;
	}

	.Custom h2 {
		font-size: clamp(24px, 3.2vw, 32px);
		line-height: 1.15;
		margin: 0 0 20px;
	}

	.Custom .en {
		font-size: 13px;
		line-height: 1.75;
		margin: 0 0 8px;
	}

	/* One language at a time — [data-lang] lives on <html>, set by the header
	   switch (see lib/state/lang.svelte.ts). */
	:global([data-lang='da']) .Custom .en {
		display: none;
	}

	:global([data-lang='en']) .Custom .da {
		display: none;
	}

	.Custom .da {
		font-weight: 300;
		font-size: 12px;
		line-height: 1.75;
		opacity: 0.75;
		margin: 0 0 8px;
	}

	.Custom__list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.Custom__list li {
		font-size: 13px;
		line-height: 1.75;
		padding-left: 18px;
		position: relative;
	}

	.Custom__list li::before {
		content: '—';
		position: absolute;
		left: 0;
		opacity: 0.5;
	}

	.Custom__cta {
		display: inline-block;
		margin-top: 28px;
		font-size: 16px;
		font-weight: var(--fw-ui);
		text-decoration: none;
		border-bottom: 1px solid currentColor;
		padding-bottom: 3px;
		transition: opacity 0.15s ease;
	}

	.Custom__cta:hover {
		opacity: 0.7;
	}
</style>
