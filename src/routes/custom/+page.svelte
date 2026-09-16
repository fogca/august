<!-- Custom type — bespoke commissions. PageStack layout (2026-09: "左側の
     セクションは全て位置固定で本文がスクロールされていくイメージで",
     replacing the earlier design where each topic was its own 100vh
     PageSection). "Custom" stays pinned on the left the whole time; the
     subtitle beneath it shuffles through each topic's own line as the
     reader scrolls past it. Same EN/FR copy as before this layout change
     (DA's own copy here was removed 2026-09 when the language itself was
     dropped site-wide); the placeholder hero band is still gone — a real
     commission image can become its own section when there is one. -->
<script lang="ts">
	import PageStack from '$lib/components/PageStack.svelte';
</script>

<svelte:head>
	<title>Custom type — Ōgast</title>
	<meta
		name="description"
		content="Ōgast draws bespoke typefaces for brands and institutions — a proprietary voice, from first sketch to a fully realised family."
	/>
</svelte:head>

<main class="Custom">
	<PageStack
		title="Custom"
		as="h1"
		items={[
			{ subtitle: 'Bespoke type for corporate identity', body: introBody },
			{ subtitle: 'Reading first, drawing second', body: howBody },
			{ subtitle: 'Owned outright, delivered complete', body: whatBody },
			{ subtitle: 'A retail family, modified for you', body: shortBody },
			{ subtitle: 'Get in touch', body: enquireBody }
		]}
	/>
</main>

{#snippet introBody()}
	<p class="en" lang="en">
		Beyond our retail library, Ōgast draws bespoke typefaces for brands and institutions — a
		proprietary voice, from the first sketch to a fully realised family. A custom typeface is the
		most enduring asset a brand can own: it travels across every screen, surface and language while
		remaining unmistakably yours, and it does not expire when a licence does.
	</p>
	<p class="fr" lang="fr">
		Au-delà de notre catalogue de caractères de vente, Ōgast dessine des caractères sur mesure pour
		des marques et des institutions — une voix qui vous est propre, du premier croquis jusqu'à une
		famille complète. Un caractère sur mesure est l'actif le plus durable qu'une marque puisse
		posséder : il traverse tous les écrans, tous les supports et toutes les langues tout en restant
		indéniablement le vôtre, et il n'expire pas quand une licence expire.
	</p>
{/snippet}

{#snippet howBody()}
	<h2>How We Work</h2>
	<p class="en" lang="en">
		Every commission starts with reading: the brand, its languages, the sizes it is actually set at,
		the places it fails today.
	</p>
	<p class="fr" lang="fr">
		Chaque commande commence par une lecture : la marque, ses langues, les corps auxquels elle est
		réellement composée, les endroits où elle échoue aujourd'hui.
	</p>
	<p class="en" lang="en">
		From there we draw a small proof — a handful of characters that settle the argument — before a
		full character set is ever begun.
	</p>
	<p class="fr" lang="fr">
		À partir de là, nous dessinons une petite épreuve — une poignée de caractères qui tranche le
		débat — avant même de commencer un jeu de caractères complet.
	</p>
	<p class="en" lang="en">
		Weights, widths and a variable axis follow only when the skeleton is right.
	</p>
	<p class="fr" lang="fr">
		Les graisses, les chasses et un axe variable ne viennent qu'une fois le squelette juste.
	</p>
{/snippet}

{#snippet whatBody()}
	<h2>What You Get</h2>
	<p class="en" lang="en">
		A typeface owned outright by your organisation, with no per-seat or per-view fees.
	</p>
	<p class="fr" lang="fr">
		Un caractère détenu en pleine propriété par votre organisation, sans frais par poste ni par vue.
	</p>
	<p class="en" lang="en">
		Desktop, web and app formats, drawn as a variable font and delivered with statics.
	</p>
	<p class="fr" lang="fr">
		Formats bureautique, web et application, dessiné comme police variable et livré avec des
		instances statiques.
	</p>
	<p class="en" lang="en">Latin as standard; extended language coverage on request.</p>
	<p class="fr" lang="fr">
		Le latin en standard ; une couverture linguistique étendue sur demande.
	</p>
	<p class="en" lang="en">
		Documentation — metrics, OpenType features, and a specimen your team can work from.
	</p>
	<p class="fr" lang="fr">
		Documentation — métriques, fonctionnalités OpenType, et une planche de caractères sur laquelle
		votre équipe peut s'appuyer.
	</p>
{/snippet}

{#snippet shortBody()}
	<h2>Short of a Full Commission</h2>
	<p class="en" lang="en">
		Not every identity needs a typeface drawn from nothing. A retail family can be modified — a
		redrawn letter, a custom ligature, an alternate figure set, a weight that sits between two of
		ours — and licensed exclusively to you.
	</p>
	<p class="fr" lang="fr">
		Toute identité n'a pas besoin d'un caractère dessiné à partir de rien. Une famille de vente peut
		être modifiée — une lettre redessinée, une ligature sur mesure, un jeu de chiffres alternatif,
		une graisse intermédiaire entre deux des nôtres — puis licenciée en exclusivité pour vous.
	</p>
	<p class="en" lang="en">
		It costs a fraction of a bespoke family and reaches most of the distance.
	</p>
	<p class="fr" lang="fr">
		Cela coûte une fraction d'une famille sur mesure tout en parcourant l'essentiel du chemin.
	</p>
{/snippet}

{#snippet enquireBody()}
	<h2>Enquire</h2>
	<p class="en" lang="en">
		Tell us what the type has to do, and where it has to do it. Write to us through our
		<a href="/contact">contact form</a>.
	</p>
	<p class="fr" lang="fr">
		Dites-nous ce que le caractère doit accomplir, et où il doit l'accomplir. Écrivez-nous via notre
		<a href="/contact">formulaire de contact</a>.
	</p>
{/snippet}

<style>
	.Custom {
		background: #ffffff;
	}

	/* One language at a time — see About's own note on the selector shape. */
	:global([data-lang='fr']) .Custom .en {
		display: none;
	}

	.Custom .fr {
		display: none;
	}

	:global([data-lang='fr']) .Custom .fr {
		display: block;
	}
</style>
