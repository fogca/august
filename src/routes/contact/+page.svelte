<!-- Contact — Figma node 3:671 layout (see PageSection.svelte). Turned from
     a bare mailto link into a real enquiry form (2026-09, at the user's
     request, "Contactは問い合わせフォームにして") — see +page.server.ts for
     where a submission actually goes. The mailto link stays too, as a
     plain fallback for anyone who'd rather just email directly. -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import PageSection from '$lib/components/PageSection.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let submitting = $state(false);

	const REASONS = ['License question', 'Custom typeface', 'Enterprise / volume licensing'];
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
		{#if form?.success}
			<p class="Contact__success">
				Thanks — your message is on its way. We'll respond within two business days.
			</p>
		{:else}
			<p>
				For license questions, enterprise requirements (1,000+ users / 100M+ PV), bespoke typefaces,
				or anything else — please get in touch. We will respond within two business days.
			</p>

			<form
				class="Contact__form"
				method="POST"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						await update();
						submitting = false;
					};
				}}
			>
				<div class="Contact__row">
					<label class="Contact__field">
						<span>Name *</span>
						<input type="text" name="name" autocomplete="name" required value={form?.name ?? ''} />
					</label>
					<label class="Contact__field">
						<span>Email *</span>
						<input
							type="email"
							name="email"
							autocomplete="email"
							required
							value={form?.email ?? ''}
						/>
					</label>
				</div>

				<label class="Contact__field">
					<span>Reason</span>
					<select name="reason" value={form?.reason ?? ''}>
						<option value="">General enquiry</option>
						{#each REASONS as r (r)}
							<option value={r}>{r}</option>
						{/each}
					</select>
				</label>

				<label class="Contact__field">
					<span>Message *</span>
					<textarea name="message" rows="6" required>{form?.message ?? ''}</textarea>
				</label>

				{#if form?.error === 'missing'}
					<p class="Contact__error">Please fill in your name, email, and a message.</p>
				{:else if form?.error === 'invalid_email'}
					<p class="Contact__error">That email address doesn't look right — please check it.</p>
				{:else if form?.error === 'not_configured' || form?.error === 'send_failed'}
					<p class="Contact__error">
						Something went wrong sending this — please write to
						<a href="mailto:hi@august.tf">hi@august.tf</a> directly instead, sorry about that.
					</p>
				{/if}

				<button class="Contact__submit" type="submit" disabled={submitting}>
					{submitting ? 'Sending…' : 'Send message'}
				</button>
			</form>

			<p class="Contact__mail">Prefer email? <a href="mailto:hi@august.tf">hi@august.tf</a></p>
		{/if}
	</PageSection>
</main>

<style>
	.Contact {
		background: #ffffff;
	}

	.Contact__form {
		margin-top: 2em;
		display: flex;
		flex-direction: column;
		gap: 24px;
		max-width: 46em;
	}

	.Contact__row {
		display: grid;
		grid-template-columns: 1fr;
		gap: 24px;
	}

	@media (min-width: 560px) {
		.Contact__row {
			grid-template-columns: 1fr 1fr;
		}
	}

	.Contact__field {
		display: flex;
		flex-direction: column;
		gap: 8px;
		font-size: 12px;
		opacity: 0.6;
	}

	/* Hairline-underline inputs rather than boxed fields — matches the
	   site's own minimal line language elsewhere (thin rules, no heavy
	   borders or fills). */
	.Contact__field input,
	.Contact__field select,
	.Contact__field textarea {
		font: inherit;
		font-size: 16px;
		color: var(--color-text);
		background: transparent;
		border: 0;
		border-bottom: 1px solid var(--color-line);
		border-radius: 0;
		padding: 8px 0;
		opacity: 1;
		transition: border-color 0.15s ease;
	}

	.Contact__field select {
		appearance: none;
		-webkit-appearance: none;
		cursor: pointer;
	}

	.Contact__field textarea {
		resize: vertical;
		min-height: 8em;
		line-height: 1.5;
	}

	.Contact__field input:focus,
	.Contact__field select:focus,
	.Contact__field textarea:focus {
		outline: none;
		border-bottom-color: var(--color-text);
	}

	.Contact__submit {
		align-self: flex-start;
		font: inherit;
		font-size: 14px;
		font-weight: 500;
		font-variation-settings: 'wght' 500;
		/* !important: PageSection's own `.PageSection :global(*) { color:
		   var(--color-text) }` (this form's ancestor) lands at the SAME
		   specificity as this rule once Svelte's scoping hash is counted on
		   both, so it was winning on source order alone and silently
		   painting this button's text black-on-black (confirmed live via
		   computed style). */
		color: #ffffff !important;
		background: var(--color-text);
		border: 0;
		border-radius: 999px;
		padding: 12px 28px;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}

	.Contact__submit:hover {
		opacity: 0.8;
	}

	.Contact__submit:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.Contact__error {
		font-size: 13px;
		/* !important — see .Contact__submit's own comment on why. */
		color: var(--color-signal) !important;
		margin: -8px 0 0;
	}

	.Contact__success {
		margin-top: 2em;
		font-size: clamp(18px, 1.8vw, 24px);
	}

	.Contact__mail {
		margin-top: 2em;
		font-size: 14px;
		opacity: 0.6;
	}
</style>
