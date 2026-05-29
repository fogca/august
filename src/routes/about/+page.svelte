<svelte:head>
	<title>About — August Type Foundry</title>
	<meta
		name="description"
		content="August Type Foundry — an independent type foundry from Tokyo. Studio statement and philosophy."
	/>
</svelte:head>

<main class="About">
	<div class="About__inner">
		<h2 class="gq">August Type Foundry</h2>
		<p>
			An independent type foundry from Tokyo, established in 2026. We design retail families and
			bespoke type for people who treat letterforms as infrastructure — the quiet medium that
			carries everything else.
		</p>

		<h2>A communal foundry</h2>
		<p>
			We work by mingling — histories, cultures, and eras that were never meant to meet. We take
			forms from different times and disciplines, weigh their context and intent, and reshape them
			through a contemporary eye. For us, type design is continuity rather than rupture: every
			typeface we draw is in conversation with the ones that came before it, and we credit those
			debts openly in the fonts we ship.
		</p>

		<h2>Steiner — the medium meaning passes through</h2>
		<p>
			Our first release, Steiner, is a twelve-weight humanist sans-serif drawn in Tokyo. Its name
			reaches back to the classical word for the upper air — the breath of the cosmos, the medium
			through which light and form were once thought to travel. Rudolf Steiner used the same idea
			to describe the formative force that gives shape before shape is seen.
		</p>
		<p>
			That felt like the right name for a typeface, because a typeface is never the meaning
			itself. It is the medium meaning passes through — the thing you are not supposed to notice,
			doing the quiet work of carrying a thought from one mind to another.
		</p>

		<h2>Lineage</h2>
		<p>
			Steiner stands beside Apercu, but its roots run deeper. They reach through Edward Johnston's
			1916 alphabet for the London Underground, through Gill Sans and Neuzeit, and through Otl
			Aicher's Rotis, drawn at the Ulm School of Design in 1988. Where Apercu draws on Franklin
			Gothic, Steiner draws on Rotis — seventy years of humanist sans-serif tradition folded into
			a single, contemporary voice. Geometric in skeleton, modulated in breath, humanist in
			spirit.
		</p>

		<h2>gQ</h2>
		<p>
			Alongside Steiner we are developing gQ, the latest cut of Mokuseki Sans — a neo-humanist
			sans of our own, with a distinct set of signature letterforms. It debuts in 2026 and will
			grow into a full variable family in step with the foundry.
		</p>

		<h2>How we draw</h2>
		<p>
			We ship spacing tight by default. A face set loose can never be tightened back, but a face
			set tight leaves the operator room to breathe. Constraint, we believe, is what generates the
			freedom of use. We keep the same discipline in the catalogue itself — a small, considered
			library rather than a sprawling one — so that every release stays measured and intentional.
		</p>

		<h2>How we release</h2>
		<p>
			Variable font first, sold as a family. Licences are perpetual: pay once, use forever, with
			no subscription. Desktop, Web, App and Books licences are available, and bespoke
			commissions — a proprietary typeface tuned to a single identity — sit alongside the retail
			library.
		</p>

		<h2>Contact</h2>
		<p>
			For licensing, custom commissions, or anything else, write to
			<a href="mailto:hi@august.tf">hi@august.tf</a>. We are based in Tokyo, Japan.
		</p>
	</div>
</main>

<style>
	/* Text appearance comes from base.css (h2 / p). Only layout spacing here. */
	.About {
		min-height: 100vh;
		padding-block: 96px;
		padding-inline: 0;
	}

	@media (min-width: 768px) {
		.About {
			padding-top: 120px;
		}
	}

	.About__inner {
		max-width: 640px;
		margin: 0 auto;
		padding-inline: var(--padding);
	}

	.About h2 {
		margin: 40px 0 8px;
	}

	.About h2:first-child {
		margin-top: 0;
	}

	.About p {
		margin-bottom: 16px;
	}

	/* Foundry wordmark in gQ (Mokuseki Sans) */
	.About .gq {
		font-family: 'Mokuseki Sans', 'Steiner', sans-serif;
	}

	.About a {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
