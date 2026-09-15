<!-- About — Figma node 3:671 layout (see PageSection.svelte): a stack of
     full-viewport sections, each a large title on the left, copy on the
     right, and its own sub-heading pinned bottom-left. Replaces the amber
     one-view statement (2026-09) — same copy, same three languages (the
     EN/FR/DA pattern from lib/state/lang.svelte.ts / Header.svelte), only
     the layout and the ground (#F1F0EF, per the frame) changed. Copy for
     the Ōgast rename is unchanged; still no "why Ōgast" story invented
     unilaterally (see the standing note in typefaces.ts). -->
<script lang="ts">
	import PageSection from '$lib/components/PageSection.svelte';
</script>

<svelte:head>
	<title>About — Ōgast</title>
	<meta
		name="description"
		content="Ōgast — an independent type foundry from Tokyo. Studio statement and philosophy."
	/>
</svelte:head>

<main class="About">
	<PageSection title="About" as="h1" subtitle="An independent type foundry, Tokyo">
		<p class="en" lang="en">
			Ōgast is an independent type foundry, founded in Tokyo in 2026. We cross histories, cultures,
			and eras, reinterpret their context, and draw type through a contemporary eye. Anchored in
			retail families and bespoke commissions, we keep searching for forms not yet seen.
		</p>
		<p class="fr" lang="fr">
			Ōgast est une fonderie de caractères indépendante, fondée à Tokyo en 2026. Nous traversons les
			histoires, les cultures et les époques, en réinterprétons le contexte, et dessinons des
			caractères à travers un regard contemporain. Ancrés dans nos familles de vente et nos
			commandes sur mesure, nous continuons de chercher des formes encore jamais vues.
		</p>
		<p class="da" lang="da">
			Ōgast er et uafhængigt skriftstøberi, grundlagt i Tokyo i 2026. Vi krydser historier, kulturer
			og epoker, gentolker deres sammenhæng og tegner skrift gennem et nutidigt blik. Med
			udgangspunkt i retail-familier og bespoke-opgaver bliver vi ved med at lede efter former, der
			endnu ikke er set.
		</p>

		<!-- Every value here already appears elsewhere on the site (the
		     statement above states 2026/Tokyo; hi@august.tf is the address on
		     /contact and in Footer.svelte) — nothing new is asserted. -->
		<dl class="About__facts">
			<div class="About__fact">
				<dt>Founded</dt>
				<dd>2026</dd>
			</div>
			<div class="About__fact">
				<dt>Location</dt>
				<dd>Tokyo, Japan</dd>
			</div>
			<div class="About__fact">
				<dt>Focus</dt>
				<dd>Retail typefaces, custom type</dd>
			</div>
			<div class="About__fact">
				<dt>Contact</dt>
				<dd><a href="mailto:hi@august.tf">hi@august.tf</a></dd>
			</div>
		</dl>
	</PageSection>

	<!-- Norma, the foundry's first release. Same copy as before this
	     redesign; the tagline is the sub-heading. -->
	<PageSection title="Norma" subtitle="The formative forces of the word, made visible">
		<p class="en" lang="en">
			Our first release, Norma, is a twenty-weight neo-humanist sans-serif variable font. The
			letters are made to feel grown rather than constructed — organic in their curves, human in
			their proportion. Its humanist lineage runs quietly beneath — Johnston's 1916 Underground
			alphabet, Gill Sans, Neuzeit, Otl Aicher's Rotis — never the surface, only the soil.
		</p>
		<p class="fr" lang="fr">
			Notre première sortie, Norma, est une police variable sans-serif néo-humaniste en vingt
			graisses. Les lettres sont pensées pour paraître nées plutôt que construites — organiques dans
			leurs courbes, humaines dans leurs proportions. Sa filiation humaniste affleure discrètement —
			l'alphabet du métro londonien de Johnston (1916), le Gill Sans, le Neuzeit, le Rotis d'Otl
			Aicher — jamais en surface, seulement dans le terreau.
		</p>
		<p class="da" lang="da">
			Vores første udgivelse, Norma, er en neo-humanistisk grotesk i tyve vægte, tegnet som variabel
			skrift. Bogstaverne skal føles groede snarere end konstruerede — organiske i kurverne,
			menneskelige i proportionen. Den humanistiske slægt løber stille nedenunder — Johnstons
			Underground-alfabet fra 1916, Gill Sans, Neuzeit, Otl Aichers Rotis — aldrig overfladen, kun
			jorden.
		</p>
		<p class="en" lang="en">
			A typeface is never the meaning itself. It is the medium meaning passes through — doing the
			quiet work of carrying a thought from one mind to another.
		</p>
		<p class="fr" lang="fr">
			Un caractère typographique n'est jamais le sens lui-même. Il est le medium à travers lequel le
			sens circule — accomplissant le travail discret de porter une pensée d'un esprit à un autre.
		</p>
		<p class="da" lang="da">
			En skrift er aldrig betydningen selv. Den er det medium, betydningen passerer igennem — det
			stille arbejde med at bære en tanke fra ét sind til et andet.
		</p>
		<p><a href="/fonts/norma">Discover Norma →</a></p>
	</PageSection>
</main>

<style>
	.About {
		background: #f1f0ef;
	}

	/* One language at a time — [data-lang] lives on <html>, set by the header
	   switch (see lib/state/lang.svelte.ts). Positive matches ("hide .en when
	   the page is showing fr or da") rather than :not() — :not([data-lang='en'])
	   would also match <body>/<main>/etc., which never carry the attribute,
	   and so would always be true regardless of <html>'s actual value. The
	   DE/ES/CH codes have no copy of their own yet and fall through to EN. */
	:global([data-lang='fr']) .About .en,
	:global([data-lang='da']) .About .en {
		display: none;
	}

	/* Translations are hidden by default and shown only on an exact match —
	   with six language codes now, "hide when X or Y" lists don't scale, and
	   :not([data-lang='fr']) would match <body>/<main> (never carry the
	   attribute) and hide them always. */
	.About .fr,
	.About .da {
		display: none;
	}

	:global([data-lang='fr']) .About .fr,
	:global([data-lang='da']) .About .da {
		display: block;
	}

	.About__facts {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 28px 32px;
		margin: 2.5em 0 0;
	}

	.About__fact dt {
		font-size: 12px;
		line-height: 1.25;
		opacity: 0.5;
		margin: 0 0 6px;
	}

	.About__fact dd {
		font-size: 16px;
		line-height: 1.25;
		margin: 0;
	}
</style>
