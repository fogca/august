<!-- Contact — Figma node 3:671 layout (see PageSection.svelte). -->
<script lang="ts">
	import PageSection from '$lib/components/PageSection.svelte';
</script>

<svelte:head>
	<title>Contact — Ōgast</title>
	<meta
		name="description"
		content="Contact Ōgast — licensing questions, enterprise scale, custom typefaces, and general enquiries."
	/>
</svelte:head>

<main class="Contact">
	<PageSection title="Contact" as="h1" subtitle="Licensing, custom type, general enquiries">
		<p>
			For license questions, enterprise requirements (1,000+ users / 100M+ PV), bespoke typefaces,
			or anything else — please get in touch. We will respond within two business days.
		</p>
		<p class="Contact__mail"><a href="mailto:hi@august.tf">hi@august.tf</a></p>
	</PageSection>
</main>

<style>
	.Contact {
		background: #f1f0ef;
	}

	.Contact__mail {
		margin-top: 2em;
		font-size: clamp(20px, 2.2vw, 32px);
	}
</style>
