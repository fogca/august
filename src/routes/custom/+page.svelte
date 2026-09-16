<!-- Custom type — bespoke commissions. PageStack layout (2026-09: "左側の
     セクションは全て位置固定で本文がスクロールされていくイメージで",
     replacing the earlier design where each topic was its own 100vh
     PageSection). "Custom" stays pinned on the left the whole time; the
     subtitle beneath it shuffles through each topic's own line as the
     reader scrolls past it. Same EN/FR/DA copy as before this layout
     change; the placeholder hero band is still gone — a real commission
     image can become its own section when there is one. -->
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
			{ subtitle: 'hi@august.tf', body: enquireBody }
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
	<p class="da" lang="da">
		Ud over vores retail-bibliotek tegner Ōgast skrifter på bestilling til brands og institutioner —
		en egen stemme, fra den første skitse til en færdig familie. En skrift lavet til én identitet er
		det mest holdbare aktiv, et brand kan eje: den følger med over hver skærm, hver flade og hvert
		sprog og bliver ved med at være genkendelig — og den udløber ikke, når en licens gør.
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
	<p class="da" lang="da">
		Hver opgave begynder med at læse: brandet, dets sprog, de størrelser det faktisk sættes i, og de
		steder hvor det svigter i dag.
	</p>
	<p class="en" lang="en">
		From there we draw a small proof — a handful of characters that settle the argument — before a
		full character set is ever begun.
	</p>
	<p class="fr" lang="fr">
		À partir de là, nous dessinons une petite épreuve — une poignée de caractères qui tranche le
		débat — avant même de commencer un jeu de caractères complet.
	</p>
	<p class="da" lang="da">
		Derfra tegner vi et lille bevis — en håndfuld tegn, der afgør sagen — før et fuldt tegnsæt
		overhovedet påbegyndes.
	</p>
	<p class="en" lang="en">
		Weights, widths and a variable axis follow only when the skeleton is right.
	</p>
	<p class="fr" lang="fr">
		Les graisses, les chasses et un axe variable ne viennent qu'une fois le squelette juste.
	</p>
	<p class="da" lang="da">Vægte, bredder og en variabel akse følger først, når skelettet sidder.</p>
{/snippet}

{#snippet whatBody()}
	<h2>What You Get</h2>
	<p class="en" lang="en">
		A typeface owned outright by your organisation, with no per-seat or per-view fees.
	</p>
	<p class="fr" lang="fr">
		Un caractère détenu en pleine propriété par votre organisation, sans frais par poste ni par vue.
	</p>
	<p class="da" lang="da">
		En skrift, jeres organisation ejer fuldt ud, uden betaling per bruger eller per visning.
	</p>
	<p class="en" lang="en">
		Desktop, web and app formats, drawn as a variable font and delivered with statics.
	</p>
	<p class="fr" lang="fr">
		Formats bureautique, web et application, dessiné comme police variable et livré avec des
		instances statiques.
	</p>
	<p class="da" lang="da">
		Formater til desktop, web og app, tegnet som variabel skrift og leveret med statiske snit.
	</p>
	<p class="en" lang="en">Latin as standard; extended language coverage on request.</p>
	<p class="fr" lang="fr">
		Le latin en standard ; une couverture linguistique étendue sur demande.
	</p>
	<p class="da" lang="da">Latinsk som standard; udvidet sprogdækning efter aftale.</p>
	<p class="en" lang="en">
		Documentation — metrics, OpenType features, and a specimen your team can work from.
	</p>
	<p class="fr" lang="fr">
		Documentation — métriques, fonctionnalités OpenType, et une planche de caractères sur laquelle
		votre équipe peut s'appuyer.
	</p>
	<p class="da" lang="da">
		Dokumentation — metrik, OpenType-funktioner og et prøvetryk, jeres team kan arbejde ud fra.
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
	<p class="da" lang="da">
		Ikke enhver identitet har brug for en skrift tegnet fra bunden. En retail-familie kan ændres —
		et omtegnet bogstav, en særlig ligatur, et alternativt tal-sæt, en vægt der ligger mellem to af
		vores — og licenseres eksklusivt til jer.
	</p>
	<p class="en" lang="en">
		It costs a fraction of a bespoke family and reaches most of the distance.
	</p>
	<p class="fr" lang="fr">
		Cela coûte une fraction d'une famille sur mesure tout en parcourant l'essentiel du chemin.
	</p>
	<p class="da" lang="da">
		Det koster en brøkdel af en skræddersyet familie og når det meste af vejen.
	</p>
{/snippet}

{#snippet enquireBody()}
	<h2>Enquire</h2>
	<p class="en" lang="en">
		Tell us what the type has to do, and where it has to do it. Write to
		<a href="mailto:hi@august.tf?subject=Custom%20typeface%20enquiry">hi@august.tf</a>.
	</p>
	<p class="fr" lang="fr">
		Dites-nous ce que le caractère doit accomplir, et où il doit l'accomplir. Écrivez-nous à
		<a href="mailto:hi@august.tf?subject=Custom%20typeface%20enquiry">hi@august.tf</a>.
	</p>
	<p class="da" lang="da">
		Fortæl os, hvad skriften skal kunne, og hvor den skal kunne det. Skriv til
		<a href="mailto:hi@august.tf?subject=Custom%20typeface%20enquiry">hi@august.tf</a>.
	</p>
{/snippet}

<style>
	.Custom {
		background: #ffffff;
	}

	/* One language at a time — see About's own note on the selector shape. */
	:global([data-lang='fr']) .Custom .en,
	:global([data-lang='da']) .Custom .en {
		display: none;
	}

	.Custom .fr,
	.Custom .da {
		display: none;
	}

	:global([data-lang='fr']) .Custom .fr,
	:global([data-lang='da']) .Custom .da {
		display: block;
	}
</style>
