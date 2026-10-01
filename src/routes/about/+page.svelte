<!-- About — its own individual design (2026-09, at the user's request:
     "その他ページデザインの対象からAboutは外して個別のデザインにするべき"),
     no longer sharing PageStack with Custom/Licensing. Ported to match the
     home page's own About teaser (home/AboutSection.svelte) closely rather
     than just conceptually — same small dateline-style label, the same
     oversized indented statement paragraph, the same facts row (2026-09, at
     the user's follow-up request: "Aboutページは、TopのAboutセクションの
     ようにして") — this is the complete version of that same layout, not a
     differently-styled page that happens to share its copy.

     Both blocks share one ground (2026-09, "その下も全体的に背景色ありに
     して") so the whole page reads as one continuous coloured page — the
     page theme's own blue on peach since the 2026-10 Apres Guerre redesign
     (was the summer amber with black text), so the Header's compact bar,
     painted in the page colour, sits on it seamlessly.

     No arrow-icon link here any more (2026-09, at the user's request —
     "▶︎のリンクはなるべく使わないようにして、角丸なしのボックスリンクに
     Aboutも統一して") — "Discover Norma" is a solid, square-cornered box
     link now, matching the Home page's own Contact CTA rather than the
     Arrow.svelte pattern used elsewhere.

     Copy for the Apres Guerre rename is unchanged apart from the name; still
     no naming story invented unilaterally (see the standing note in
     typefaces.ts). "Tokyo"
     stays out of the copy (2026-09, "Tokyo Japanという情報はなるべく
     控えて"). -->
<svelte:head>
	<title>About — Apres Guerre</title>
	<meta
		name="description"
		content="Apres Guerre — an independent type foundry. Studio statement and philosophy."
	/>
</svelte:head>

<main class="About">
	<section class="About__statement">
		<div class="About__inner">
			<h1 class="About__label">About</h1>

			<div class="About__body">
				<p class="en" lang="en">
					Apres Guerre is an independent type foundry, founded in 2026. We cross histories, cultures, and
					eras, reinterpret their context, and draw type through a contemporary eye. Anchored in
					retail families and bespoke commissions, we keep searching for forms not yet seen.
				</p>
				<p class="fr" lang="fr">
					Apres Guerre est une fonderie de caractères indépendante, fondée en 2026. Nous traversons les
					histoires, les cultures et les époques, en réinterprétons le contexte, et dessinons des
					caractères à travers un regard contemporain. Ancrés dans nos familles de vente et nos
					commandes sur mesure, nous continuons de chercher des formes encore jamais vues.
				</p>
			</div>

			<!-- Every value here already appears elsewhere on the site — nothing
			     new is asserted. Location was dropped (2026-09) to keep the
			     studio's city out of the copy as far as reasonably possible. -->
			<dl class="About__facts">
				<div class="About__fact">
					<dt>Founded</dt>
					<dd>2026</dd>
				</div>
				<div class="About__fact">
					<dt>Focus</dt>
					<dd>Retail typefaces, custom type</dd>
				</div>
				<div class="About__fact">
					<dt>Contact</dt>
					<dd><a href="/contact">Contact form</a></dd>
				</div>
			</dl>
		</div>
	</section>

	<section class="About__norma">
		<div class="About__inner">
			<h2 class="About__normaTitle">Norma</h2>
			<div class="About__body About__body--norma">
				<p class="en" lang="en">
					Our first release, Norma, is a twenty-weight neo-humanist sans-serif variable font. The
					letters are made to feel grown rather than constructed — organic in their curves, human in
					their proportion. Its humanist lineage runs quietly beneath — Johnston's 1916 Underground
					alphabet, Gill Sans, Neuzeit, Otl Aicher's Rotis — never the surface, only the soil.
				</p>
				<p class="fr" lang="fr">
					Notre première sortie, Norma, est une police variable sans-serif néo-humaniste en vingt
					graisses. Les lettres sont pensées pour paraître nées plutôt que construites — organiques
					dans leurs courbes, humaines dans leurs proportions. Sa filiation humaniste affleure
					discrètement — l'alphabet du métro londonien de Johnston (1916), le Gill Sans, le Neuzeit,
					le Rotis d'Otl Aicher — jamais en surface, seulement dans le terreau.
				</p>
				<p class="en" lang="en">
					A typeface is never the meaning itself. It is the medium meaning passes through — doing
					the quiet work of carrying a thought from one mind to another.
				</p>
				<p class="fr" lang="fr">
					Un caractère typographique n'est jamais le sens lui-même. Il est le medium à travers
					lequel le sens circule — accomplissant le travail discret de porter une pensée d'un
					esprit à un autre.
				</p>
			</div>
			<a class="About__cta" href="/fonts/norma">Discover Norma</a>
		</div>
	</section>
</main>

<style>
	/* One language at a time — [data-lang] lives on <html>, set by the header
	   switch. Positive match, not :not() — see AboutSection.svelte's own note. */
	:global([data-lang='fr']) .About .en {
		display: none;
	}

	.About .fr {
		display: none;
	}

	:global([data-lang='fr']) .About .fr {
		display: block;
	}

	.About__inner {
		width: 100%;
		max-width: 1440px;
		margin-inline: auto;
	}

	/* --- Statement block: same layout as the home page's About teaser
	   (AboutSection.svelte's .HomeAbout) — small label, oversized indented
	   statement, facts row — ported rather than just referenced. --- */
	.About__statement {
		min-height: 100svh;
		display: flex;
		align-items: center;
		background: var(--color-bg);
		padding-inline: var(--padding);
		padding-block: clamp(96px, 12vh, 160px);
	}

	.About__statement .About__inner {
		display: flex;
		flex-direction: column;
		gap: clamp(28px, 4vh, 48px);
	}

	/* Small dateline-style label standing in for a display title — same
	   treatment as .HomeAbout__label, just "About" instead of "2026" (this
	   is a standalone page, not a teaser, so it still needs to say what page
	   it is). Still the real <h1>. */
	.About__label {
		font-family: var(--font-en), sans-serif;
		font-size: 12px;
		font-weight: var(--fw-ui);
		letter-spacing: 0.04em;
		opacity: 0.75;
		margin: 0;
	}

	/* The statement IS the layout — several steps above body copy, same
	   first-line indent as the teaser. Left-aligned, not justified (2026-09,
	   at the user's request — "Aboutセクションの文章justifyからleftに
	   align調整して"). */
	.About__body p {
		font-family: var(--font-en), sans-serif;
		font-size: clamp(26px, max(3.4vw, 4.6vh), 50px);
		line-height: 1.16;
		/* 2026-09, at the user's request — "Aboutセクションの文章はwght250にして". */
		font-variation-settings: 'wght' 250;
		letter-spacing: -0.005em;
		text-align: left;
		text-indent: 2.4em;
		margin: 0;
	}

	.About__facts {
		display: flex;
		flex-wrap: wrap;
		gap: 16px 48px;
		margin: 0;
	}

	.About__fact dt {
		font-family: var(--font-en), sans-serif;
		font-size: 11px;
		opacity: 0.6;
		margin: 0 0 6px;
	}

	.About__fact dd {
		font-family: var(--font-en), sans-serif;
		font-size: 15px;
		margin: 0;
	}

	/* --- Norma block: same ground as the statement above (2026-09, "その下
	   も全体的に背景色ありにして"). --- */
	.About__norma {
		background: var(--color-bg);
		padding-inline: var(--padding);
		padding-block: clamp(96px, 14vh, 160px);
	}

	.About__norma .About__inner {
		max-width: 68ch;
	}

	.About__normaTitle {
		font-family: var(--font-elio), sans-serif;
		font-size: clamp(28px, 3.6vw, 44px);
		font-weight: 400;
		margin: 0 0 24px;
	}

	.About__body--norma p {
		font-family: var(--font-elio), sans-serif;
		font-size: 15px;
		line-height: 1.55;
		font-variation-settings: 'wght' 350;
		text-align: left;
		margin: 0 0 1em;
	}

	.About__body--norma p:last-of-type {
		margin-bottom: 0;
	}

	/* Solid, square-cornered box link (2026-09, at the user's request —
	   "▶︎のリンクはなるべく使わないようにして、角丸なしのボックスリンクに
	   Aboutも統一して") — replaces the Arrow.svelte + text pattern used
	   elsewhere, matching the Home page's own Contact CTA. */
	.About__cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-top: 28px;
		padding: 16px 32px;
		font-family: var(--font-elio), sans-serif;
		font-size: 15px;
		font-weight: var(--fw-ui);
		color: #ffffff;
		background: var(--color-text);
		border: 0;
		border-radius: 0;
		text-decoration: none;
		transition: opacity 0.15s ease;
	}

	.About__cta:hover {
		opacity: 0.8;
	}

	@media (max-width: 767.98px) {
		.About__statement {
			padding-block: clamp(72px, 10vh, 120px);
		}

		.About__body p {
			text-indent: 1.6em;
		}

		.About__cta {
			display: flex;
			width: 100%;
		}
	}
</style>
