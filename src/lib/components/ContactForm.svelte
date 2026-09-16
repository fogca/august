<!-- The enquiry form, shared by /contact and the home page's Contact section.
     Route-agnostic: the caller passes `action` ('' = this route's default
     action, '?/contact' = the home page's named one).

     It holds its OWN result state rather than reading the page's `form` prop,
     because the two routes generate different ActionData types and the home
     route's would not type-check against /contact's. It also means a failed
     submit leaves everything the visitor typed exactly where it was, with no
     value={form?.x} round-trip.

     Every control is rebuilt from zero on purpose: base.css strips background,
     border and outline off button/input/textarea/select, paints the
     placeholder black at 25% opacity (invisible on a dark ground) and draws a
     BLACK :focus-visible ring. `select` is also absent from base.css §7's
     colour list while `input` and `button` are present, so the three do not
     behave alike and each needs its colour stated. -->
<script lang="ts">
	import { enhance } from '$app/forms';

	interface Props {
		/** '' targets this route's default action; '?/contact' the home page's. */
		action?: string;
		/** Light ground (white section) or dark (black section). */
		tone?: 'light' | 'dark';
		/** The route's own action result. Structurally typed rather than taking
		 *  each route's generated ActionData, which are nominally different types.
		 *  WITHOUT it, a no-JS submit re-renders the page with the result on the
		 *  server and this component — which normally holds its own state — would
		 *  show a blank form and no feedback at all. */
		result?: {
			success?: boolean;
			error?: string;
			name?: string;
			email?: string;
			company?: string;
			companyUrl?: string;
			reason?: string;
			message?: string;
		} | null;
	}
	let { action = '', tone = 'light', result = null }: Props = $props();

	const REASONS = ['License question', 'Custom typeface', 'Enterprise / volume licensing'];

	const ERROR_CODES = ['missing', 'invalid_email', 'not_configured', 'send_failed'] as const;
	type ErrorCode = (typeof ERROR_CODES)[number];
	const asErrorCode = (v: unknown): ErrorCode | null =>
		ERROR_CODES.includes(v as ErrorCode) ? (v as ErrorCode) : null;

	let submitting = $state(false);
	// Seeded from the server result so the no-JS path shows the outcome, then
	// owned locally. Not re-read afterwards: use:enhance below never calls
	// update(), so `result` cannot come back and clobber what is being typed.
	// svelte-ignore state_referenced_locally
	let sent = $state(!!result?.success);
	// svelte-ignore state_referenced_locally
	let errorCode = $state<ErrorCode | null>(asErrorCode(result?.error));
	let successEl: HTMLElement | undefined = $state();

	// Move focus to the confirmation once a submit succeeds — otherwise focus is
	// left on a button that no longer exists and falls back to <body>.
	$effect(() => {
		if (sent) successEl?.focus();
	});
</script>

<!-- Wrapper + compound selectors below are load-bearing: PageSection paints
     `.PageSection__body:not(.is-native) :global(*) { color: var(--color-text) }`,
     which ties on specificity with a plain single-class rule in a child
     component and then wins on source order — that is what once painted this
     submit button black-on-black. `.ContactForm .x` outranks it outright. -->
<div class="ContactForm" class:is-dark={tone === 'dark'}>
	{#if sent}
		<div class="ContactForm__done">
			<p class="ContactForm__success" role="status" tabindex="-1" bind:this={successEl}>
				Thanks — your message is on its way. We'll respond within five business days.
			</p>
			<button
				class="ContactForm__again"
				type="button"
				onclick={() => {
					sent = false;
					errorCode = null;
				}}
			>
				Send another enquiry
			</button>
		</div>
	{:else}
		<form
			class="ContactForm__form"
			method="POST"
			{action}
			use:enhance={() => {
				submitting = true;
				errorCode = null;
				return async ({ result }) => {
					submitting = false;
					if (result.type === 'success') {
						sent = true;
						return;
					}
					if (result.type === 'failure') {
						const code = (result.data as { error?: string } | undefined)?.error;
						errorCode =
							code === 'missing' ||
							code === 'invalid_email' ||
							code === 'not_configured' ||
							code === 'send_failed'
								? code
								: 'send_failed';
						return;
					}
					if (result.type === 'error') errorCode = 'send_failed';
				};
			}}
		>
			<div class="ContactForm__row">
				<label class="ContactForm__field">
					<span>Name *</span>
					<input
						type="text"
						name="name"
						autocomplete="name"
						required
						value={result?.name ?? ''}
						oninput={() => (errorCode = null)}
					/>
				</label>
				<label class="ContactForm__field">
					<span>Email *</span>
					<input
						type="email"
						name="email"
						autocomplete="email"
						required
						value={result?.email ?? ''}
						oninput={() => (errorCode = null)}
					/>
				</label>
			</div>

			<div class="ContactForm__row">
				<label class="ContactForm__field">
					<span>Company / Studio</span>
					<input
						type="text"
						name="company"
						autocomplete="organization"
						placeholder="Optional"
						value={result?.company ?? ''}
					/>
				</label>
				<label class="ContactForm__field">
					<span>Website</span>
					<input
						type="url"
						name="companyUrl"
						autocomplete="url"
						placeholder="Optional"
						value={result?.companyUrl ?? ''}
					/>
				</label>
			</div>

			<label class="ContactForm__field">
				<span>Reason</span>
				<select name="reason" value={result?.reason ?? ''}>
					<option value="">General enquiry</option>
					{#each REASONS as r (r)}
						<option value={r}>{r}</option>
					{/each}
				</select>
			</label>

			<label class="ContactForm__field">
				<span>Message *</span>
				<textarea name="message" rows="6" required oninput={() => (errorCode = null)}
					>{result?.message ?? ''}</textarea
				>
			</label>

			{#if errorCode === 'missing'}
				<p class="ContactForm__error" role="alert">
					Please fill in your name, email, and a message.
				</p>
			{:else if errorCode === 'invalid_email'}
				<p class="ContactForm__error" role="alert">
					That email address doesn't look right — please check it.
				</p>
			{:else if errorCode === 'not_configured' || errorCode === 'send_failed'}
				<p class="ContactForm__error" role="alert">
					Something went wrong sending this — please try again in a moment.
				</p>
			{/if}

			<button class="ContactForm__submit" type="submit" disabled={submitting}>
				{submitting ? 'Sending…' : 'Send message'}
			</button>
		</form>
	{/if}
</div>

<style>
	.ContactForm {
		--field-line: rgba(0, 0, 0, 0.35);
		--field-fg: #000000;
		--submit-bg: #000000;
		--submit-fg: #ffffff;
		--error-fg: var(--color-signal);
	}

	.ContactForm.is-dark {
		--field-line: rgba(255, 255, 255, 0.35);
		--field-fg: #ffffff;
		--submit-bg: #ffffff;
		--submit-fg: #000000;
		/* The signal red measures 3.2:1 on black — under AA at this size. A
		   slightly lifted red clears it while still reading as the same red. */
		--error-fg: #ff6b63;
	}

	.ContactForm .ContactForm__form {
		margin-top: 2em;
		display: flex;
		flex-direction: column;
		gap: 24px;
		max-width: 46em;
	}

	.ContactForm__row {
		display: grid;
		grid-template-columns: 1fr;
		gap: 24px;
	}

	@media (min-width: 560px) {
		.ContactForm__row {
			grid-template-columns: 1fr 1fr;
		}
	}

	.ContactForm__field {
		display: flex;
		flex-direction: column;
		gap: 8px;
		font-size: 12px;
	}

	/* The label text. base.css re-asserts colour on span individually, so this
	   has to be stated here rather than inherited from the form. */
	.ContactForm .ContactForm__field span {
		color: var(--field-fg);
		opacity: 0.6;
	}

	/* Hairline-underline controls rather than boxed fields — matches the site's
	   own minimal line language. Everything here is re-added from zero; see the
	   file header on what base.css strips. */
	.ContactForm .ContactForm__field input,
	.ContactForm .ContactForm__field select,
	.ContactForm .ContactForm__field textarea {
		font: inherit;
		font-size: 16px;
		color: var(--field-fg);
		background: transparent;
		border: 0;
		border-bottom: 1px solid var(--field-line);
		border-radius: 0;
		padding: 8px 0;
		opacity: 1;
		transition: border-color 0.15s ease;
	}

	.ContactForm__field select {
		appearance: none;
		-webkit-appearance: none;
		cursor: pointer;
	}

	/* A dark <option> list inherits the page's colours in some browsers and not
	   others — state both so the menu is never white-on-white. */
	.ContactForm.is-dark .ContactForm__field select option {
		color: #000000;
		background: #ffffff;
	}

	.ContactForm__field textarea {
		resize: vertical;
		min-height: 8em;
		line-height: 1.5;
	}

	.ContactForm__field input:focus,
	.ContactForm__field select:focus,
	.ContactForm__field textarea:focus {
		outline: none;
		border-bottom-color: var(--field-fg);
	}

	/* base.css's own :focus-visible ring is a BLACK 2px outline — invisible on
	   a dark section. Restate it in the field colour. */
	.ContactForm__field input:focus-visible,
	.ContactForm__field select:focus-visible,
	.ContactForm__field textarea:focus-visible {
		outline: 2px solid var(--field-fg);
		outline-offset: 2px;
	}

	/* Square corners (2026-09, at the user's request — "送信ボタンは角丸なし
	   で") — was a pill, like .ContactForm__again below still is; that one
	   wasn't part of the request, left as-is. */
	.ContactForm .ContactForm__submit {
		align-self: flex-start;
		font: inherit;
		font-size: 14px;
		font-weight: 500;
		font-variation-settings: 'wght' 500;
		color: var(--submit-fg);
		background: var(--submit-bg);
		border: 0;
		border-radius: 0;
		padding: 12px 28px;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}

	.ContactForm .ContactForm__submit:hover {
		opacity: 0.8;
	}

	.ContactForm .ContactForm__submit:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.ContactForm .ContactForm__error {
		font-size: 13px;
		color: var(--error-fg);
		margin: -8px 0 0;
	}

	.ContactForm .ContactForm__done {
		margin-top: 2em;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 20px;
	}

	.ContactForm .ContactForm__success {
		font-size: clamp(18px, 1.8vw, 24px);
		color: #000000;
		margin: 0;
		outline: none;
	}

	.ContactForm .ContactForm__again {
		font: inherit;
		font-size: 14px;
		color: var(--field-fg);
		background: transparent;
		border: 1px solid var(--field-line);
		border-radius: 999px;
		padding: 10px 22px;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}

	.ContactForm .ContactForm__again:hover {
		opacity: 0.7;
	}

	.ContactForm.is-dark .ContactForm__success {
		color: #ffffff;
	}
</style>
