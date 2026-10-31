<!-- A section heading in the typeface page's lower half, after Kontrapunkt
     Type's ("Glyph Overview", "Information"): a rule, the heading, a rule.
     The rules are the page's text colour, like the one under the name. -->
<script lang="ts">
	let { title }: { title: string } = $props();
</script>

<div class="SectionHeading">
	<h2 class="SectionHeading__title">{title}</h2>
</div>

<style>
	.SectionHeading {
		border-top: var(--border-line);
		border-bottom: var(--border-line);
		padding: 10px 0 12px;
	}

	.SectionHeading__title {
		margin: 0;
		font-size: 22px;
		line-height: 1.2;
		font-weight: 450;
		letter-spacing: 0;
		color: var(--color-text);
	}
</style>
