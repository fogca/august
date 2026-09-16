<!-- Contact — Figma node 3:671 layout (see PageSection.svelte). Turned from
     a bare mailto link into a real enquiry form (2026-09, at the user's
     request, "Contactは問い合わせフォームにして") — see +page.server.ts for
     where a submission actually goes. No mailto fallback: every address on
     the site is private now (2026-09, at the user's request, "メールアドレス
     は全て非公開"), this form is the only way in.

     The form itself now lives in $lib/components/ContactForm.svelte, shared
     verbatim with the home page's own Contact section so the two can't drift.
     It holds its own submit/result state, so this route no longer reads the
     `form` prop at all. -->
<script lang="ts">
	import PageSection from '$lib/components/PageSection.svelte';
	import ContactForm from '$lib/components/ContactForm.svelte';
	import { summerColor, summerColorHex } from '$lib/state/summerColor.svelte';
	import type { ActionData } from './$types';

	// Only used for the no-JS path: with JS on, ContactForm owns its own state
	// and never reads this again (its enhance callback doesn't call update()).
	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Contact — Ōgast</title>
	<meta
		name="description"
		content="Contact Ōgast — licensing questions, enterprise scale, custom typefaces, and general enquiries."
	/>
</svelte:head>

<main class="Contact" style="--summer-color: {summerColorHex(summerColor.current)};">
	<!-- No subtitle (2026-09, at the user's request, "Licensing, custom type,
	     general enquiriesがあるけどこれ不要") — the paragraph just below
	     already says the same thing in full sentences. -->
	<PageSection title="Contact" as="h1">
		<p>
			For license questions, enterprise requirements (1,000+ users / 100M+ PV), bespoke typefaces,
			or anything else — please get in touch. We will respond within five business days.
		</p>

		<ContactForm result={form} />
	</PageSection>
</main>

<style>
	/* Same debug-switchable summer colour as About (2026-09, at the user's
	   request) — was plain white. Text stays black, PageSection's own
	   default. */
	.Contact {
		background: var(--summer-color, var(--color-amber, #ffbb32));
	}
</style>
