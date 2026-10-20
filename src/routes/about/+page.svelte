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
     "about" page theme's own orange on blue since 2026-10 (the home
     opening's colours, at the user's request — "Aboutページのカラーリング
     を、OPのカラーリングで青背景・オレンジテキストにして"; it was blue on
     peach, and the summer amber with black text before that), so the
     Header, painted in the page colour, sits on it seamlessly.

     No arrow-icon link here any more (2026-09, at the user's request —
     "▶︎のリンクはなるべく使わないようにして、角丸なしのボックスリンクに
     Aboutも統一して") — "Discover Norma" is a solid, square-cornered box
     link now, matching the Home page's own Contact CTA rather than the
     Arrow.svelte pattern used elsewhere.

     Copy for the Apres Guerre rename is unchanged apart from the name; still
     no naming story invented unilaterally (see the standing note in
     typefaces.ts). The statement was doubled in length (2026-10, at the user's
     request — "文章量も倍にして", draft approved in chat): the two added
     sentences are the site's own existing copy — the Norma block's "A typeface
     is never the meaning itself…" and the Custom section's bespoke line —
     nothing new is asserted. "Tokyo"
     stays out of the copy (2026-09, "Tokyo Japanという情報はなるべく
     控えて"). -->
<script lang="ts">
	import { getTypeface } from '$lib/data/typefaces';

	// The Norma block, with its link to Norma's page, only shows while Norma
	// is public (it is hidden for now, and its page 404s — 2026-10-11).
	const normaShown = !(getTypeface('norma')?.hidden ?? true);
</script>

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
					Apres Guerre is an independent type foundry, founded in 2026. We cross histories,
					cultures, and eras, reinterpret their context, and draw type through a contemporary eye.
					Anchored in retail families and bespoke commissions, we keep searching for forms not yet
					seen. A typeface is never the meaning itself. It is the medium meaning passes through,
					doing the quiet work of carrying a thought from one mind to another. For brands and
					institutions, we design bespoke typefaces: a proprietary voice, drawn from the first
					sketch to a fully realised family.
				</p>
				<p class="fr" lang="fr">
					Apres Guerre est une fonderie de caractères indépendante, fondée en 2026. Nous traversons
					les histoires, les cultures et les époques, en réinterprétons le contexte, et dessinons
					des caractères à travers un regard contemporain. Ancrés dans nos familles de vente et nos
					commandes sur mesure, nous continuons de chercher des formes encore jamais vues. Un
					caractère typographique n'est jamais le sens lui-même. Il est le medium à travers lequel
					le sens circule — accomplissant le travail discret de porter une pensée d'un esprit à un
					autre. Pour les marques et les institutions, nous dessinons des caractères sur mesure :
					une voix propre, tracée du premier croquis à une famille pleinement aboutie.
				</p>
			</div>

			<!-- The information, gathered under titles (2026-10, at the user's
			     request — a reference site's About: a large statement, then short
			     titled groups of small lines): Services, Information, Contact.
			     Every line is the site's own existing copy — the Custom page's
			     bespoke / modified-family sentences, the Licensing page's scope,
			     the Contact page and Footer — nothing new is asserted; the French
			     is the site's where it exists, otherwise translated. Location is
			     still left out (2026-09, to keep the studio's city out of the
			     copy). -->
			<div class="About__groups">
				<section class="About__group" aria-labelledby="about-services">
					<h2 class="About__groupTitle" id="about-services">Services</h2>
					<div class="About__items">
						<div class="About__item">
							<h3 class="About__itemTitle">
								<span class="en" lang="en">Custom Type</span>
								<span class="fr" lang="fr">Caractères sur mesure</span>
							</h3>
							<p class="en" lang="en">
								We draw bespoke typefaces for brands and institutions — a proprietary voice, from
								the first sketch to a fully realised family.
							</p>
							<p class="fr" lang="fr">
								Nous dessinons des caractères sur mesure pour des marques et des institutions — une
								voix qui vous est propre, du premier croquis jusqu'à une famille complète.
							</p>
						</div>
						<div class="About__item">
							<h3 class="About__itemTitle">
								<span class="en" lang="en">Modified Retail Families</span>
								<span class="fr" lang="fr">Familles de vente modifiées</span>
							</h3>
							<p class="en" lang="en">
								A retail family can be modified — a redrawn letter, a custom ligature, an alternate
								figure set, a weight that sits between two of ours — and licensed exclusively to
								you.
							</p>
							<p class="fr" lang="fr">
								Une famille de vente peut être modifiée — une lettre redessinée, une ligature sur
								mesure, un jeu de chiffres alternatif, une graisse intermédiaire entre deux des
								nôtres — puis licenciée en exclusivité pour vous.
							</p>
						</div>
						<div class="About__item">
							<h3 class="About__itemTitle">
								<span class="en" lang="en">Retail Typefaces</span>
								<span class="fr" lang="fr">Caractères de vente</span>
							</h3>
							<p class="en" lang="en">Ango, a nine-weight variable typeface, in development.</p>
							<p class="fr" lang="fr">
								Ango, une police variable en neuf graisses, en cours de développement.
							</p>
						</div>
						<div class="About__item">
							<h3 class="About__itemTitle">
								<span class="en" lang="en">Licensing</span>
								<span class="fr" lang="fr">Licences</span>
							</h3>
							<p class="en" lang="en">
								Sold per company size, not per platform: from the Team tier upward, one licence
								covers Desktop, Web, and App use.
							</p>
							<p class="fr" lang="fr">
								Vendues selon la taille de l'entreprise et non par plateforme : à partir du niveau
								Team, une seule licence couvre l'usage Desktop, Web et App.
							</p>
						</div>
					</div>
				</section>

				<section class="About__group" aria-labelledby="about-information">
					<h2 class="About__groupTitle" id="about-information">
						<span class="en" lang="en">Information</span>
						<span class="fr" lang="fr">Informations</span>
					</h2>
					<div class="About__items">
						<div class="About__item">
							<h3 class="About__itemTitle">
								<span class="en" lang="en">Founded</span>
								<span class="fr" lang="fr">Fondation</span>
							</h3>
							<p>2026</p>
						</div>
						<div class="About__item">
							<h3 class="About__itemTitle">
								<span class="en" lang="en">Focus</span>
								<span class="fr" lang="fr">Orientation</span>
							</h3>
							<p class="en" lang="en">Retail typefaces, custom type</p>
							<p class="fr" lang="fr">Caractères de vente, caractères sur mesure</p>
						</div>
						<div class="About__item">
							<h3 class="About__itemTitle">
								<span class="en" lang="en">Documents</span>
								<span class="fr" lang="fr">Documents</span>
							</h3>
							<p class="About__links">
								<a href="/licensing">Licensing</a>
								<a href="/legal/eula">EULA</a>
								<a href="/legal/privacy">Privacy</a>
								<a href="/legal/tokusho">Legal Notice</a>
							</p>
						</div>
					</div>
				</section>

				<section class="About__group" aria-labelledby="about-contact">
					<h2 class="About__groupTitle" id="about-contact">Contact</h2>
					<div class="About__items">
						<div class="About__item">
							<h3 class="About__itemTitle">
								<span class="en" lang="en">Licensing, custom type, general enquiries</span>
								<span class="fr" lang="fr">Licences, caractères sur mesure, demandes générales</span
								>
							</h3>
							<p class="en" lang="en">
								For license questions, enterprise requirements (1,000+ users / 100M+ PV), bespoke
								typefaces, or anything else — please get in touch. We will respond within five
								business days.
							</p>
							<p class="fr" lang="fr">
								Pour toute question de licence, tout besoin d'entreprise (1 000+ utilisateurs / 100
								M+ de pages vues), tout caractère sur mesure ou toute autre demande, écrivez-nous.
								Nous répondons sous cinq jours ouvrés.
							</p>
						</div>
						<div class="About__item">
							<p class="About__links">
								<a href="/contact">
									<span class="en" lang="en">Contact form</span>
									<span class="fr" lang="fr">Formulaire de contact</span>
								</a>
							</p>
						</div>
					</div>
				</section>
			</div>
		</div>
	</section>

	{#if normaShown}
		<section class="About__norma">
			<div class="About__inner">
				<h2 class="About__normaTitle">Norma</h2>
				<div class="About__body About__body--norma">
					<p class="en" lang="en">
						Our first release, Norma, is a twenty-weight neo-humanist sans-serif variable font. The
						letters are made to feel grown rather than constructed — organic in their curves, human
						in their proportion. Its humanist lineage runs quietly beneath — Johnston's 1916
						Underground alphabet, Gill Sans, Neuzeit, Otl Aicher's Rotis — never the surface, only
						the soil.
					</p>
					<p class="fr" lang="fr">
						Notre première sortie, Norma, est une police variable sans-serif néo-humaniste en vingt
						graisses. Les lettres sont pensées pour paraître nées plutôt que construites —
						organiques dans leurs courbes, humaines dans leurs proportions. Sa filiation humaniste
						affleure discrètement — l'alphabet du métro londonien de Johnston (1916), le Gill Sans,
						le Neuzeit, le Rotis d'Otl Aicher — jamais en surface, seulement dans le terreau.
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
	{/if}
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
	}

	/* One size for the large type: the statement and the group titles below it
	   (2026-10, at the user's request — the titles are "大きめの本文と同じサイズ"
	   as the statement). SP is the user's own 24.5px. */
	.About {
		--about-fs: clamp(26px, max(3.4vw, 4.6vh), 50px);
		/* The small lines under the titles. */
		--about-item-fs: 15px;
	}

	/* --- Statement block: same layout as the home page's About teaser
	   (AboutSection.svelte's .HomeAbout) — small label, oversized indented
	   statement, facts row — ported rather than just referenced. --- */
	/* The rest of the first screen below the layout's masthead spacer
	   (which already clears the Header's large wordmark). */
	.About__statement {
		min-height: calc(100svh - var(--masthead-h));
		display: flex;
		align-items: center;
		background: var(--color-bg);
		padding-inline: var(--padding);
		padding-block: 0 clamp(48px, 8vh, 96px);
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
		font-size: var(--about-fs);
		line-height: 1.16;
		/* 2026-09, at the user's request — "Aboutセクションの文章はwght250にして". */
		font-variation-settings: 'wght' 250;
		letter-spacing: -0.005em;
		text-align: left;
		text-indent: 2.4em;
		margin: 0;
	}

	/* The statement's own settings (2026-10, at the user's request — the
	   values he gave: wght 450, line-height 1.1, letter-spacing 0.01em,
	   hyphens auto, width 102%, no first-line indent). Scoped to the statement
	   so the Norma block below, which shares .About__body p, is left as it
	   was; font-size is SP only (--about-fs in the media query). */
	.About__statement .About__body p {
		font-variation-settings: 'wght' 450;
		line-height: 1.1;
		letter-spacing: 0.01em;
		hyphens: auto;
		width: 102%;
		text-indent: 0;
	}

	/* --- The groups (Services / Information / Contact): a title at the
	   statement's own size, then short lines — each a small title and its text
	   — as in the reference. Stacked on SP; on PC the title sits in a column
	   of its own with the lines beside it. --- */
	.About__groups {
		display: flex;
		flex-direction: column;
		gap: clamp(56px, 9vh, 96px);
		margin-top: clamp(24px, 6vh, 72px);
	}

	.About__group {
		display: flex;
		flex-direction: column;
		gap: 28px;
		/* base.css gives every <section> the page's side padding; these sit
		   inside the statement's own already-padded block, so none again. */
		padding-inline: 0;
	}

	.About__groupTitle {
		font-family: var(--font-en), sans-serif;
		font-size: var(--about-fs);
		font-weight: 400;
		font-variation-settings: 'wght' 450;
		line-height: 1.1;
		letter-spacing: 0.01em;
		margin: 0;
	}

	.About__items {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.About__itemTitle,
	.About__item p {
		font-family: var(--font-en), sans-serif;
		font-size: var(--about-item-fs);
		font-weight: 400;
		font-variation-settings: 'wght' 400;
		line-height: 1.35;
		letter-spacing: 0.005em;
		margin: 0;
	}

	.About__links {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 20px;
	}

	.About__links a {
		text-decoration: underline;
		text-underline-offset: 0.2em;
		text-decoration-thickness: 1px;
		transition: opacity 0.15s ease;
	}

	.About__links a:hover {
		opacity: 0.7;
	}

	@media (min-width: 768px) {
		.About {
			--about-item-fs: clamp(16px, 1.35vw, 22px);
		}

		.About__group {
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
			column-gap: 32px;
			align-items: start;
		}

		.About__items {
			max-width: 62ch;
		}
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
		font-family: var(--font-ango), sans-serif;
		font-size: clamp(28px, 3.6vw, 44px);
		font-weight: 400;
		margin: 0 0 24px;
	}

	.About__body--norma p {
		font-family: var(--font-ango), sans-serif;
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
		font-family: var(--font-ango), sans-serif;
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

	/* The box is the text colour (orange here), so its label can't be white:
	   it takes the ground's blue. */
	:global(html[data-theme='about']) .About__cta {
		color: var(--color-bg);
	}

	@media (max-width: 767.98px) {
		.About__statement {
			padding-block: clamp(72px, 10vh, 120px);
		}

		.About__body p {
			text-indent: 1.6em;
		}

		.About {
			--about-fs: 24.5px;
		}

		.About__cta {
			display: flex;
			width: 100%;
		}
	}
</style>
