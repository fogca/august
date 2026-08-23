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
			<h2 class="gq">August Type Foundry</h2>
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

		<!-- 3 — How we draw -->
		<section class="block">
			<h2>How we draw</h2>
			<p class="en" lang="en">
				We ship spacing tight by default. A face set loose can never be tightened back, but a face
				set tight leaves the operator room to breathe. Constraint, we believe, is what generates the
				freedom of use. We keep the same discipline in the catalogue itself — a small, considered
				library rather than a sprawling one — so every release stays measured and intentional.
			</p>
			<p class="da" lang="da">
				Vi udsender skriften med stram udslutning. En skrift sat løst kan aldrig strammes igen, men
				en skrift sat stramt giver brugeren plads til at trække vejret. Begrænsning er efter vores
				overbevisning det, der skaber friheden i brugen. Vi holder den samme disciplin i selve
				kataloget — et lille, gennemtænkt bibliotek frem for et vidtløftigt — så hver udgivelse
				forbliver afmålt og bevidst.
			</p>
		</section>

		<!-- 4 — How we release -->
		<section class="block">
			<h2>How we release</h2>
			<p class="en" lang="en">
				Variable font first, sold as a family. Licences are perpetual — pay once, use forever, with
				no subscription. Desktop, Web, App and Books licences are available, and bespoke commissions
				— a proprietary typeface tuned to a single identity — sit alongside the retail library.
			</p>
			<p class="da" lang="da">
				Variabel skrift først, solgt som familie. Licenser er evigtgyldige — betal én gang, brug for
				altid, uden abonnement. Der findes licenser til Desktop, Web, App og Bøger, og
				bespoke-opgaver — en egen skrift stemt til én identitet — står side om side med
				retail-biblioteket.
			</p>
		</section>

		<!-- 5 — Contact -->
		<section class="block">
			<h2>Contact</h2>
			<p class="en" lang="en">
				For licensing, custom commissions, or anything else, write to
				<a href="mailto:hi@august.tf">hi@august.tf</a>. We are based in Tokyo, Japan.
			</p>
			<p class="da" lang="da">
				Skriv til <a href="mailto:hi@august.tf">hi@august.tf</a> om licenser, særopgaver eller hvad
				som helst andet. Vi holder til i Tokyo, Japan.
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

	.About__inner {
		max-width: 640px;
		margin: 0 auto;
		padding-inline: var(--padding);
	}

	.block {
		margin-bottom: 48px;
	}

	.block:last-child {
		margin-bottom: 0;
	}

	.About h2 {
		margin: 0 0 12px;
	}

	/* English (Latin) — base p size (Steiner). */
	.About .en {
		margin: 0 0 6px;
	}

	/* Danish — the second language runs in Steiner like the English, one step
	   lighter and a touch smaller so the pair reads as primary + secondary
	   rather than as two competing texts. (The Japanese it replaced needed a
	   CJK stack; Danish does not.) */
	.About .da {
		font-weight: 300;
		font-size: calc(var(--fs-p) - 1px);
		line-height: 1.7;
		opacity: 0.75;
		margin: 0 0 28px;
	}

	/* Last secondary paragraph in a section shouldn't add trailing space */
	.About .da:last-child {
		margin-bottom: 0;
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
