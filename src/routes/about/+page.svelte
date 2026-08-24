<svelte:head>
	<title>About — August Type Foundry</title>
	<meta
		name="description"
		content="August Type Foundry — an independent type foundry from Tokyo. Studio statement and philosophy."
	/>
</svelte:head>

<main class="About">
	<div class="About__inner">
		<!-- 1 — Foundry -->
		<section class="block">
			<h2>August Type Foundry</h2>
			<p class="en" lang="en">
				August Type Foundry is an independent type foundry, founded in Tokyo in 2026. We cross
				histories, cultures, and eras, reinterpret their context, and draw type through a
				contemporary eye. Anchored in retail families and bespoke commissions, we keep searching for
				forms not yet seen.
			</p>
			<p class="da" lang="da">
				August Type Foundry er et uafhængigt skriftstøberi, grundlagt i Tokyo i 2026. Vi krydser
				historier, kulturer og epoker, gentolker deres sammenhæng og tegner skrift gennem et
				nutidigt blik. Med udgangspunkt i retail-familier og bespoke-opgaver bliver vi ved med at
				lede efter former, der endnu ikke er set.
			</p>
		</section>

		<!-- 2 — Steiner (aligned with the Steiner page) -->
		<section class="block">
			<h2>Asger — the formative forces of the word, made visible</h2>
			<p class="en" lang="en">
				Our first release, Asger, is a twenty-weight neo-humanist sans-serif variable font. It
				takes its name — and its temperament — from Rudolf Steiner: a Goethean reading of nature,
				where form is never fixed but always in metamorphosis, and an anthroposophy that holds the
				human being as the measure of things. The letters are made to feel grown rather than
				constructed — organic in their curves, human in their proportion. Its humanist lineage runs
				quietly beneath — Johnston's 1916 Underground alphabet, Gill Sans, Neuzeit, Otl Aicher's
				Rotis — never the surface, only the soil.
			</p>
			<p class="da" lang="da">
				Vores første udgivelse, Asger, er en neo-humanistisk grotesk i tyve vægte, tegnet som
				variabel skrift. Den har sit navn — og sit temperament — fra Rudolf Steiner: en goethesk
				læsning af naturen, hvor formen aldrig ligger fast, men altid er under forvandling, og en
				antroposofi, der holder mennesket som målestok. Bogstaverne skal føles groede snarere end
				konstruerede — organiske i kurverne, menneskelige i proportionen. Den humanistiske slægt
				løber stille nedenunder — Johnstons Underground-alfabet fra 1916, Gill Sans, Neuzeit, Otl
				Aichers Rotis — aldrig overfladen, kun jorden.
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
	</div>
</main>

<style>
	/* Dark theme — scoped to About only. base.css applies color directly to
	   div / p / span / a / h1-h6, so the parent color loses the cascade;
	   override every descendant with :global(*). Uses base.css dark tokens. */
	.About {
		min-height: 100vh;
		min-height: 100dvh;
		padding-block: 96px;
		padding-inline: 0;
		background: var(--color-bg-dark);
		color: var(--white);
	}

	.About :global(*) {
		color: var(--white);
	}

	@media (min-width: 768px) {
		.About {
			padding-top: 120px;
		}
	}

	/* Wider column and bigger type throughout — with only the foundry and
	   Asger statements left on the page, the previous 640px/12px text setting
	   (tuned for five stacked sections) reads sparse. */
	.About__inner {
		max-width: 760px;
		margin: 0 auto;
		padding-inline: var(--padding);
	}

	.block {
		margin-bottom: 80px;
	}

	.block:last-child {
		margin-bottom: 0;
	}

	.About h2 {
		font-size: clamp(28px, 4vw, 44px);
		line-height: 1.15;
		margin: 0 0 20px;
	}

	/* English (Latin) — explicit 13px, one step up from base.css's --fs-p
	   (12px), matching the rest of the page's larger scale. */
	.About .en {
		font-size: 13px;
		line-height: 1.75;
		margin: 0 0 8px;
	}

	/* Danish — the second language runs in Steiner like the English, one step
	   lighter and a touch smaller so the pair reads as primary + secondary
	   rather than as two competing texts. (The Japanese it replaced needed a
	   CJK stack; Danish does not.) */
	.About .da {
		font-weight: 300;
		font-size: 12px;
		line-height: 1.75;
		opacity: 0.75;
		margin: 0 0 28px;
	}

	/* Last secondary paragraph in a section shouldn't add trailing space */
	.About .da:last-child {
		margin-bottom: 0;
	}
</style>
