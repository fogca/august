<!-- Privacy Policy — expanded 2026-08, structure/depth referenced from
     increments.cc/privacy (paraphrased, not copied). Processors in use:
     Stripe (payments), a transactional email provider, Cloudflare (hosting).
     Layout: Figma node 3:671 long-form (see PageSection.svelte `flow`) —
     title stays put on the left, the policy runs on down the right. Text
     unchanged from the 2026-08 version except the brand's macron. -->
<script lang="ts">
	import PageSection from '$lib/components/PageSection.svelte';
</script>

<svelte:head>
	<title>Privacy Policy — Ōgast</title>
	<meta name="description" content="How Ōgast collects and uses personal data." />
</svelte:head>

<main class="Legal">
	<PageSection title="Privacy" as="h1" subtitle="Privacy Policy — last updated August 2026" flow>
		<p>
			This Privacy Policy describes how Mirai Service Co., Ltd., trading as Ōgast ("Ōgast," "we,"
			"us," or "our"), handles personal information collected through august.tf and through the
			purchase, delivery, and support of our font licences — currently Norma, in 20 weights, and any
			other typefaces we release under the Ōgast name. It applies whenever you browse the site, buy
			a Desktop, Web, App, or Books licence, or write to us about an existing licence. It does not
			apply to the websites, apps, or publications you build using our fonts — those are covered by
			your own privacy practices, not ours.
		</p>

		<h3>Information We Collect</h3>
		<p>When you buy a licence or get in touch, we collect:</p>
		<p>
			Contact and billing details you give us at checkout — your name, email address, and billing
			address.
		</p>
		<p>
			Payment details, entered directly into Stripe's checkout rather than our own systems. We never
			see or store your full card number.
		</p>
		<p>
			Order details — the licence tier and scope (User count, pageview band, download count, or copy
			count) you purchased, which becomes your Sales Receipt.
		</p>
		<p>
			Correspondence — anything you send us through our <a href="/contact">contact form</a>,
			including support requests, licensing questions, and upgrade requests.
		</p>
		<p>
			Basic server logs — standard technical data (IP address, browser type, request timestamps)
			that our hosting provider collects automatically to keep the site running and secure.
		</p>

		<h3>How We Use Your Information</h3>
		<p>To process your order, take payment, and issue your Sales Receipt.</p>
		<p>To deliver the correct font files for the licence you bought.</p>
		<p>To answer support questions, handle licence upgrades, and reissue files if you lose them.</p>
		<p>To keep the records Japanese tax and accounting law requires us to keep.</p>
		<p>To confirm the scope of a licence if a compliance question ever comes up.</p>
		<p>
			We don't sell your information, run ad-retargeting on it, or track visitors of the sites and
			apps you license our fonts into. Our fonts don't phone home.
		</p>

		<h3>Payment Processing &amp; Other Service Providers</h3>
		<p>
			We rely on a small number of outside providers to run the store and the site, and each only
			sees what it needs to do its job:
		</p>
		<p>
			Stripe processes payment. Your card details go straight to Stripe and are covered by Stripe's
			own privacy policy, not ours.
		</p>
		<p>
			Our transactional email provider sends order confirmations and delivers your licensed font
			files.
		</p>
		<p>
			Cloudflare hosts august.tf and keeps basic security and traffic logs to protect the site from
			abuse.
		</p>
		<p>
			We don't share your contact or billing details with anyone beyond these providers, and never
			for their own marketing purposes.
		</p>

		<h3>Cookies &amp; Tracking</h3>
		<p>
			august.tf does not use advertising or analytics cookies, and we don't run first-party visitor
			tracking. The only cookie you're likely to encounter is a short-lived session cookie set by
			Stripe's own checkout page while you complete a purchase — that one belongs to Stripe, is
			governed by Stripe's privacy policy, and expires once checkout is done.
		</p>

		<h3>Data Retention</h3>
		<p>
			We keep order and billing records for as long as Japanese tax and accounting law requires, and
			no longer than that. Support correspondence is kept for as long as it's useful for resolving a
			licensing question, then deleted. If you ask us to delete something sooner, see "Your Rights
			&amp; Choices" below — we'll do it unless we're legally required to keep the record.
		</p>

		<h3>Your Rights &amp; Choices</h3>
		<p>
			You can ask us at any time to see what personal information we hold about you, correct
			anything that's wrong, or delete it — reach us through our <a href="/contact">contact form</a>
			and we'll handle it directly; there's no account or portal to log into. If the law where you live
			gives you additional rights — for example the EU/UK GDPR, or Japan's Act on the Protection of Personal
			Information — we'll honour those too on request. The one limit: if a request would mean losing a
			record we're legally required to keep, such as a Sales Receipt tied to an active licence, we'll
			tell you rather than deleting it outright.
		</p>

		<h3>Data Security</h3>
		<p>
			We keep the footprint small on purpose. Payment details never touch our own servers — they go
			directly to Stripe. The site is served over HTTPS, and access to order and billing records is
			limited to the people who need it to run Ōgast. No system is unbreakable, but we take
			reasonable technical and organisational precautions to protect what we hold.
		</p>

		<h3>International Data Transfers</h3>
		<p>
			Mirai Service Co., Ltd. is based in Nagoya, Japan, but the providers we rely on — Stripe and
			Cloudflare — operate globally, which means your information may be processed on servers
			outside Japan, including in the United States. Both maintain their own safeguards for handling
			data across borders; we choose providers with established security and privacy practices
			rather than running our own international infrastructure.
		</p>

		<h3>Children's Privacy</h3>
		<p>
			Ōgast isn't directed at children, and we don't knowingly collect personal information from
			anyone under 16. If you believe a minor has given us personal information, contact us through
			our <a href="/contact">contact form</a> and we'll delete it.
		</p>

		<h3>Changes to This Policy</h3>
		<p>
			We may update this policy as the business or the law changes. When we do, we'll post the
			revised version here with a new "last updated" date. For any change that meaningfully affects
			how we handle your information, we'll also try to let existing customers know by email.
		</p>

		<h3>Contact Us</h3>
		<p>
			Questions about this policy, or about your own information, go to our
			<a href="/contact">contact form</a>. You can also write to us at Mirai Service Co., Ltd.
			(trading as Ōgast), 1-16 Hinokuchi-cho, Nishi-ku, Nagoya, Aichi 451-0034, Japan. This policy
			is governed by the laws of Japan.
		</p>
	</PageSection>
</main>

<style>
	.Legal {
		background: #f1f0ef;
	}
</style>
