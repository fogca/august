// End User Licence Agreement content — August Type Foundry.
// Drafted 2026-08, structured as one Article-numbered mini-agreement per
// licence type (Desktop / Web / App / Books), matching the four licence
// tiers actually sold on /buy (see $lib/data/pricing.ts). Layout/structure
// reference: a screenshot of another foundry's EULA (sidebar nav + numbered
// Articles). Prose tone reference: increments.cc (plain, practical, not
// dense boilerplate).
//
// ⚠️ This is drafted content, not reviewed by a lawyer. Several clauses
// (liability cap, warranty disclaimer, cure periods, "no derivative
// typeface" restriction, promotional-copy counting, parent-company
// non-extension) were added by standard font-industry convention rather
// than confirmed against August's actual policy — flagged inline below
// each section as `flagsForReview`. Recommend a lawyer's pass before
// treating this as final, especially the liability/warranty articles and
// anything touching Japan's Consumer Contract Act / APPI.

export interface EulaArticle {
	number: number;
	title: string;
	clauses: string[];
}

export interface EulaSection {
	id: string;
	navLabel: string;
	heading: string;
	intro: string;
	articles: EulaArticle[];
	flagsForReview: string[];
}

export const EULA_SECTIONS: EulaSection[] = [
	{
		id: 'desktop',
		navLabel: 'Desktop',
		heading: 'End User Licence Agreement (Desktop Fonts)',
		intro:
			"This section covers the Desktop licence for August Type Foundry's fonts — the OpenType and " +
			'TrueType files you install on your own computers to design and produce static work: posters, ' +
			'packaging, brand identities, PDFs, presentations, print, and exported images. It is a separate, ' +
			'standalone agreement from our Web, App, and Books licences, which cover self-hosted webfonts, ' +
			'embedded apps, and book/publication embedding respectively. If you have bought more than one ' +
			'licence type, each is governed by its own section of this EULA.',
		articles: [
			{
				number: 1,
				title: 'Definitions',
				clauses: [
					'"Licensor", "we", "us", or "August" means Mirai Service Co., Ltd., a company registered in Japan and trading as August Type Foundry.',
					'"Licensee" or "you" means the individual or organisation named on the Sales Receipt.',
					'"Fonts" means the August Type Foundry font software covered by your Sales Receipt, supplied as OpenType (.otf) or TrueType (.ttf) files for installation on desktop devices — currently Steiner (marketed as "Asger"), across its full range of weights.',
					"\"User\" means an individual within Licensee's organisation authorised to install and use the Fonts under this licence.",
					'"Sales Receipt" means the order confirmation we issue at checkout, recording the licence tier, number of Users, price paid, and date — it is the master record of what you are licensed for.'
				]
			},
			{
				number: 2,
				title: 'Formation of Agreement & Scope of Licensed Usage',
				clauses: [
					'This Agreement forms the moment your payment is processed through Stripe and we issue you a Sales Receipt.',
					'It is a one-time purchase, not a subscription: once paid, your Desktop licence has no expiry date or renewal fee.',
					"It is a non-exclusive, non-transferable licence granted to Licensee only — it doesn't carry over to a different company if Licensee is sold, merged, or restructured, and it can't be resold or handed off without our written consent.",
					'Your licensed scope is the number of Users stated on your Sales Receipt; that number, not the number of installed devices, is what defines your tier.',
					"If your team grows past your licensed number of Users, you'll need to upgrade to a tier that covers your new headcount before those additional people start using the Fonts."
				]
			},
			{
				number: 3,
				title: 'Permitted Use',
				clauses: [
					'Each licensed User may install the Fonts on any devices they personally use — for example, a work desktop and a personal laptop — the licence follows the person, not one machine.',
					'You may use the Fonts to design and produce static artwork and documents: branding and logos, print and packaging, editorial and presentation layouts, PDFs, and exported images (JPG, PNG, and similar).',
					"You may deliver finished, flattened output — a print-ready PDF, an exported image, a packaging die-line — to clients, printers, or the public; it's the output that travels, not the font software itself.",
					'You may use the Fonts across as many projects as you like, for as long as your licence lasts, within your licensed User count.'
				]
			},
			{
				number: 4,
				title: 'Restrictions & Prohibited Use',
				clauses: [
					"Don't install or use the Fonts for more Users than your Sales Receipt covers without first upgrading your licence.",
					"Don't share, distribute, sell, rent, sublicense, or otherwise make the font software files available to anyone outside your own licensed Users — including uploading them to a public repository, an open shared drive, or handing them to a freelancer or agency who hasn't bought their own licence.",
					'Don\'t use Desktop Fonts to self-host webfonts on a website, embed them in an application, or embed them in a book or publication — those uses each need a separate Web, App, or Books licence.',
					"Don't modify the font software to build and redistribute a derivative typeface, and don't claim authorship of the font design itself.",
					'Don\'t use the Fonts to produce a logo, wordmark, or graphic that is itself sold or licensed on as a font or lettering product.'
				]
			},
			{
				number: 5,
				title: 'Term & Termination',
				clauses: [
					"Your Desktop licence is perpetual: once your Sales Receipt is issued, your right to use the Fonts within your licensed scope doesn't expire.",
					"We may terminate this Agreement if you materially breach it — for example, exceeding your licensed User count or distributing the font files — and don't correct it within a reasonable time after we notify you.",
					'If this Agreement is terminated for breach, you must stop using the Fonts and delete all copies from your devices.',
					"Termination doesn't entitle you to a refund of fees already paid."
				]
			},
			{
				number: 6,
				title: 'Warranty & Liability',
				clauses: [
					"The Fonts are provided \"as is\" — we don't guarantee they'll be error-free or suit every use beyond ordinary design and production work.",
					'We warrant that we have the right to license the Fonts to you under this Agreement.',
					'To the extent permitted by law, our total liability arising from this Agreement is capped at the amount you actually paid for the licence, as shown on your Sales Receipt.',
					"We aren't liable for indirect, incidental, or consequential losses, including lost profits or lost work, arising from your use of the Fonts."
				]
			},
			{
				number: 7,
				title: 'Governing Law & Contact',
				clauses: [
					'This Agreement is governed by the laws of Japan.',
					'Licensor is Mirai Service Co., Ltd. (trading as August Type Foundry), 1-16 Hinokuchi-cho, Nishi-ku, Nagoya, Aichi 451-0034, Japan.',
					'For licensing questions, contact hi@august.tf.',
					'We may update this Agreement from time to time; the version in effect on the date of your Sales Receipt governs your licence.'
				]
			}
		],
		flagsForReview: [
			'Article 4.4/4.5 (no derivative typeface, no logo-resale-as-font) are standard type-foundry restrictions added by convention, not from a supplied fact — confirm they match how August wants client logo work treated.',
			"Article 6 (warranty/liability cap) and Article 5 (termination/cure) are substantive legal clauses drafted from scratch — recommend a lawyer's review before publishing, particularly the liability cap and the undefined 'reasonable time to cure'.",
			'Article 7.4 (updates to the Agreement governed by purchase-date version) is a common perpetual-licence safeguard not in the original facts — confirm it matches policy.',
			'No specific court/venue is named for disputes (only "governed by the laws of Japan") — add one (e.g. Nagoya District Court) if a named jurisdiction is wanted.',
			'Article 3.1 ("devices they personally use") has no numeric device cap — confirm this open-ended reading is intentional.'
		]
	},
	{
		id: 'web',
		navLabel: 'Web Fonts',
		heading: 'End User Licence Agreement (Web Fonts)',
		intro:
			'This is the Web licence for fonts you have bought from August Type Foundry, the type foundry ' +
			'operated by Mirai Service Co., Ltd. It applies whenever your Sales Receipt lists a Web tier, and ' +
			'it covers how you can self-host and serve the supplied WOFF2 files on your website. Nothing here ' +
			'overrides the Desktop, App, or Books licences — each covers its own kind of use, and you will ' +
			'need a separate one for each.',
		articles: [
			{
				number: 1,
				title: 'Definitions',
				clauses: [
					'"Fonts" means the WOFF2 webfont files August Type Foundry supplies for web use, including every weight and any variable-font instances packaged with them.',
					'"Licensee" (called "you" in this document) means the person or company named on the Sales Receipt for this licence.',
					'"Licensed Website" means each website, subdomain, or web app named on your Sales Receipt as approved to serve the Fonts.',
					'"Monthly Pageviews" means the pageview tier shown on your Sales Receipt — the ceiling your Licensed Website(s) are licensed to serve the Fonts up to, on average, per month.',
					'"Sales Receipt" means the order confirmation August Type Foundry issues at purchase, recording your licence tier, Licensed Website(s), and pageview volume.'
				]
			},
			{
				number: 2,
				title: 'Formation of Agreement & Scope of Licensed Usage',
				clauses: [
					'This agreement takes effect once you complete payment for a Web licence; your Sales Receipt is issued at that point and forms part of this agreement.',
					'It is a one-time purchase — pay once, and the licence keeps going for as long as you stay within its scope. No subscription, no renewal.',
					"The licence is non-exclusive and non-transferable, and it's granted to you alone; it doesn't automatically extend to a parent company, subsidiary, or client.",
					'It covers only the Licensed Website(s) and Monthly Pageviews stated on your Sales Receipt — nothing wider.',
					"If you want to add a website, or you're growing past your pageview tier, get an upgraded or additional Web licence first (see Article 4.5)."
				]
			},
			{
				number: 3,
				title: 'Permitted Use',
				clauses: [
					'You can install the supplied WOFF2 files on your own server or a CDN you control, and load them with @font-face on your Licensed Website(s).',
					'You can use the Fonts for any styling on those sites — headings, body copy, logotypes rendered in the browser — as long as the files stay under your control.',
					'You can make the ordinary copies needed to run your site: backups, staging environments, CDN edge caches.',
					'You can adjust font-display, subsetting, and preload strategy however you like, as long as what is actually served is the Fonts as supplied.'
				]
			},
			{
				number: 4,
				title: 'Restrictions & Prohibited Use',
				clauses: [
					"Don't serve the Fonts from any site other than the Licensed Website(s) on your Sales Receipt.",
					"The desktop OTF/TTF files from a Desktop licence aren't a substitute for this one — only the WOFF2 files supplied for Web use may go on a website.",
					"Don't upload the Fonts to a public font host, CDN, or code repository where someone outside your project could link to or download them.",
					"Don't redistribute, resell, or share the Fonts with anyone else, including clients — a separate licence covers each project.",
					'Growing past your Monthly Pageviews is a breach of this licence. If your traffic is outgrowing your tier, contact us to upgrade rather than letting it run over.'
				]
			},
			{
				number: 5,
				title: 'Term & Termination',
				clauses: [
					'This licence is perpetual — once bought, it runs indefinitely for the Licensed Website(s) and pageview volume on your Sales Receipt.',
					"August Type Foundry can end this licence on written notice if you materially breach it, in particular Article 4, and don't fix the breach after being asked to.",
					"If your licence ends, remove the Fonts from your Licensed Website(s) and delete any copies you're holding for that purpose.",
					"Ending the licence doesn't entitle you to a refund for the period it was validly in use."
				]
			},
			{
				number: 6,
				title: 'Warranty & Liability',
				clauses: [
					'August Type Foundry warrants that it has the right to license the Fonts to you as described here.',
					"Beyond that, the Fonts are supplied \"as is\" — we don't warrant they're error-free or fit for every use you might put them to.",
					'Our liability under this licence is capped at the amount you paid for it.',
					"We're not liable for indirect losses — lost business, lost revenue, and the like — arising from your use of the Fonts."
				]
			},
			{
				number: 7,
				title: 'Governing Law & Contact',
				clauses: [
					'This agreement is governed by the laws of Japan.',
					'The licensor is Mirai Service Co., Ltd., trading as August Type Foundry, 1-16 Hinokuchi-cho, Nishi-ku, Nagoya, Aichi 451-0034, Japan.',
					'Questions about this licence — upgrades, extra Licensed Websites, anything else — go to hi@august.tf.'
				]
			}
		],
		flagsForReview: [
			'No refund policy is stated. If Web licences are final-sale/non-refundable (common for font licences), say so explicitly.',
			"Article 2.3 (doesn't extend to a parent/subsidiary/client) was added as standard practice — worth confirming, especially since August also does client web-design work and may want an explicit path for an agency-purchased licence to cover a client's site (Article 4.4 currently blocks that).",
			"Monthly Pageviews (1.4) doesn't specify a measurement method (which analytics source, peak vs. average, any grace buffer) — worth deciding and stating explicitly.",
			"Article 5.2's cure period ('after being asked to') has no specific day count — consider naming one (e.g. 14 or 30 days).",
			'No specific court/venue named for disputes beyond "governed by the laws of Japan".',
			"Liability cap and warranty disclaimer (Article 6) should get a lawyer's look — Japan's Consumer Contract Act restricts how far liability can be excluded, particularly for gross negligence, and this may differ for business vs. individual-consumer Licensees.",
			'"Licensed Website" (1.3) includes subdomains/web apps generically — confirm whether a subdomain of an already-licensed site is included automatically or needs its own Sales Receipt listing.'
		]
	},
	{
		id: 'app',
		navLabel: 'App Fonts',
		heading: 'End User Licence Agreement (App Fonts)',
		intro:
			'This section covers the App licence: embedding August Type Foundry\'s Fonts inside a single ' +
			'mobile or desktop application. Scope is measured in downloads, at the tier recorded on your ' +
			'Sales Receipt — not by seats or pageviews. If you are shipping more than one app, each one needs ' +
			'its own App licence. For anything not covered here, see the Desktop, Web, or Books sections of ' +
			'this agreement.',
		articles: [
			{
				number: 1,
				title: 'Definitions',
				clauses: [
					'"Fonts" means the font software licensed by August Type Foundry, including all weights and styles of the applicable typeface family (currently Steiner, marketed as "Asger") covered by this licence.',
					'"Licensee" means the individual or organisation named on the Sales Receipt as the purchaser of this App licence.',
					'"Sales Receipt" means the order confirmation issued at purchase; it records the App and the licensed download tier, and is the authoritative record of scope for this licence.',
					'"App" means the single named mobile or desktop application, identified by Licensee at or before purchase, in which the Fonts are embedded under this licence.',
					'"Download" means one installation of the App by an end user, as counted by the relevant app store, distribution platform, or install analytics; this licence measures scope in Downloads rather than named Users.'
				]
			},
			{
				number: 2,
				title: 'Formation of Agreement & Scope of Licensed Usage',
				clauses: [
					'This licence is formed once Licensee completes payment through Stripe and receives a Sales Receipt; no separate signature is required.',
					'This is a one-time purchase: Licensee pays once for perpetual use of the Fonts within the App, at the download tier purchased, with no subscription or renewal fee.',
					'This licence applies to exactly one App, as identified on the Sales Receipt — it does not extend to any other app, website, or document Licensee produces.',
					'The download tier on the Sales Receipt sets the maximum cumulative number of Downloads licensed for that App.',
					'Each additional application — including a spin-off, companion, or unrelated app — needs its own separate App licence, purchased independently.'
				]
			},
			{
				number: 3,
				title: 'Permitted Use',
				clauses: [
					"Licensee may embed the Fonts inside the compiled App identified on the Sales Receipt, for release on mobile and/or desktop platforms as applicable.",
					"The Fonts may be used to render any text inside the App's interface, including text that is dynamic, user-entered, or generated at runtime.",
					'Licensee may distribute the App with the Fonts embedded to end users, up to the cumulative Download count stated in the licensed tier.',
					'End users who download and use the App may use the embedded Fonts as part of using the App; they do not need a separate Fonts licence of their own.',
					'Licensee may convert, subset, hint, or compress the Fonts as reasonably necessary to embed them in the App, provided the visual design of the letterforms is not altered.'
				]
			},
			{
				number: 4,
				title: 'Restrictions & Prohibited Use',
				clauses: [
					'Licensee may not extract the Fonts from the App, or repurpose the embedded font files, for use in any other app, website, document, or product.',
					'Licensee may not use a single App licence to cover more than one application; embedding the Fonts in a second app requires a second licence.',
					'Licensee may not sublicense, resell, rent, lend, or otherwise share the Fonts or this licence with any third party, including other developers or studios.',
					'Licensee may not build or ship an App whose purpose is to let end users extract, install, or otherwise obtain the Fonts as standalone font files.',
					'If cumulative Downloads exceed the licensed tier, Licensee must upgrade to the appropriate tier promptly; continuing to distribute the App beyond the licensed tier without upgrading is a breach of this licence.'
				]
			},
			{
				number: 5,
				title: 'Term & Termination',
				clauses: [
					'This licence continues perpetually for the App and download tier stated on the Sales Receipt once payment is completed; there is no expiry date.',
					'August Type Foundry may terminate this licence if Licensee materially breaches its terms and fails to correct the breach after being notified.',
					'On termination, Licensee must stop distributing any version of the App that embeds the Fonts, and remove the Fonts from future App updates.',
					'Termination of this licence does not entitle Licensee to a refund of fees already paid.'
				]
			},
			{
				number: 6,
				title: 'Warranty & Liability',
				clauses: [
					'The Fonts are provided "as is," without warranty that they are error-free, uninterrupted, or fit for every particular purpose Licensee has in mind.',
					"August Type Foundry's total liability arising from this licence is limited to the amount Licensee actually paid for this App licence.",
					'August Type Foundry is not liable for indirect, incidental, or consequential losses arising from use of the Fonts inside the App.'
				]
			},
			{
				number: 7,
				title: 'Governing Law & Contact',
				clauses: [
					'This agreement is governed by the laws of Japan.',
					'This licence is issued by Mirai Service Co., Ltd., trading as August Type Foundry, at 1-16 Hinokuchi-cho, Nishi-ku, Nagoya, Aichi 451-0034, Japan.',
					'Questions about this licence, or requests to upgrade your download tier, can be sent to hi@august.tf.'
				]
			}
		],
		flagsForReview: [
			'"Download" is defined by app-store/platform install counts — whether reinstalls, OS-level updates, or the same end user on multiple devices count toward the tier is not settled; confirm against how the App Store / Google Play report installs.',
			"Article 4's upgrade obligation says \"promptly\" with no specific grace period — consider naming a number of days.",
			"Article 3's subsetting/hinting/compression permission was inferred as a reasonable technical necessity, not stated explicitly — confirm it matches intended permissions.",
			'No refund/returns policy beyond "no refund on termination for breach" — add an explicit all-sales-final clause if that is the intended policy.',
			'No specific court/venue named for disputes beyond "governed by the laws of Japan".',
			"Liability cap and termination clauses (Articles 5–6) are real legal disclaimers — recommend a lawyer's review pass before this goes live."
		]
	},
	{
		id: 'books',
		navLabel: 'Books',
		heading: 'End User Licence Agreement (Books)',
		intro:
			'This licence covers embedding August Type Foundry fonts inside a single book, magazine, or ' +
			'other editorial publication — the Title named on your Sales Receipt — whether it is produced ' +
			'in print, digital, or both. It is a one-time purchase, not a subscription, scoped to a maximum ' +
			'number of Copies of that Title. If you need fonts for a website, an app, or general design work ' +
			'instead, see our Web, App, or Desktop Fonts agreements — this one is for publication embedding ' +
			'only.',
		articles: [
			{
				number: 1,
				title: 'Definitions',
				clauses: [
					'"August," "we," and "us" mean Mirai Service Co., Ltd., trading as August Type Foundry, of 1-16 Hinokuchi-cho, Nishi-ku, Nagoya, Aichi 451-0034, Japan.',
					'"Fonts" means the August Type Foundry font software (currently Steiner, marketed as "Asger") supplied under a Books licence, in whichever formats we make available for embedding in publications.',
					'"Licensee" and "you" mean the person or organisation named on the Sales Receipt; "Sales Receipt" means the receipt we issue at purchase, recording your Title, your licensed Copy tier, and your purchase date.',
					'"Title" means the single book, magazine, or other editorial publication identified on the Sales Receipt, in which the Fonts are embedded — whether published in print, digital, or both.',
					'"Copy" means one instance of the Title made available to a reader — sold, given away, or otherwise distributed — in any format in which that Title is published, print or digital: a printed and bound book, a magazine issue off the press, an ePub or MOBI/AZW file, a fixed-layout PDF, or similar.'
				]
			},
			{
				number: 2,
				title: 'Formation of Agreement & Scope of Licensed Usage',
				clauses: [
					'This Agreement forms when you complete checkout for a Books licence and receive a Sales Receipt; the Sales Receipt is part of this Agreement and is the record of what you have licensed.',
					'In exchange for your one-time payment, we grant you a non-exclusive, non-transferable, perpetual licence to embed the Fonts in the one Title named on your Sales Receipt — there is no subscription and no renewal fee.',
					'Your licence is scoped to the maximum number of Copies stated on your Sales Receipt, counted across print and digital formats together; distributing more Copies than that requires upgrading to a higher tier first.',
					'The licence covers one Title only. A sequel, a separate edition treated as a new publication, or any other Title needs its own Books licence.',
					'The licence belongs to the Licensee named on the Sales Receipt and does not automatically extend to parent companies, subsidiaries, or other affiliated entities.'
				]
			},
			{
				number: 3,
				title: 'Permitted Use',
				clauses: [
					"Embed or install the Fonts in the Title's layout, pre-press, and digital production files so they display and print correctly, including subsetting the Fonts to only the characters your Title actually uses.",
					'Use the Fonts across whatever formats you publish that one Title in — a print run, ePub, Kindle/MOBI/AZW, fixed-layout PDF, and similar — as long as total Copies across all formats stay within your licensed tier.',
					'Sell or distribute Copies of the Title through any retailer, printer, distribution platform, or direct channel, up to your licensed Copy count.',
					'Send out free promotional, review, or gifted Copies of the Title; these count toward your licensed Copy total the same as sold Copies.',
					'Upgrade your Copy tier at any time by contacting us — do this before you expect to exceed your current licensed count, not after.'
				]
			},
			{
				number: 4,
				title: 'Restrictions & Prohibited Use',
				clauses: [
					'Don\'t extract the Fonts from the Title\'s files for use outside that Title — using them in another publication, on a website, or in an app each needs its own separate licence (Desktop, Web, or App).',
					"Don't share the Font files themselves with your typesetter, printer, distributor, or anyone else beyond what's needed to produce the Title — the distributed Copies are what carry the design, not the source Font files.",
					"Don't rename the Fonts, claim authorship of them, or strip copyright or embedding information from the files.",
					"Don't distribute more Copies than your Sales Receipt allows without upgrading first — exceeding your tier is a breach of this Agreement, not an automatic entitlement to the next one.",
					'Don\'t sublicense, resell, or hand this licence to another party — for example, a new publisher taking over the Title — without our written consent.'
				]
			},
			{
				number: 5,
				title: 'Term & Termination',
				clauses: [
					'This licence runs perpetually from your purchase date for the one Title — there is nothing to renew as long as you stay within its terms.',
					'We may terminate this licence if you materially breach it and do not correct the breach within 14 days of written notice from us.',
					'If this licence is terminated, you must stop embedding the Fonts in any new Copies of the Title — printed or digital — from that point forward.',
					'Termination does not reach back into Copies already distributed to readers before the termination date — those readers keep their Copies.',
					'On termination, delete the Font files from the production and master files you use to generate the Title.'
				]
			},
			{
				number: 6,
				title: 'Warranty & Liability',
				clauses: [
					'We warrant that we own or control the rights needed to license the Fonts to you; beyond that, the Fonts are provided "as is," without further warranty.',
					'We do not guarantee the Fonts will render or print identically across every device, reading app, e-reader, or print run, or that they are free of every possible bug.',
					'We may provide updates or bug fixes at our discretion; where reasonably practical, we will make these available to existing Books licensees at no extra cost.',
					'To the extent the law allows, our total liability to you under this Agreement is capped at the amount you paid for this licence.',
					"We're not liable for indirect or consequential losses — lost sales of your Title, for example — arising from an issue with the Fonts."
				]
			},
			{
				number: 7,
				title: 'Governing Law & Contact',
				clauses: [
					'This Agreement is governed by the laws of Japan.',
					'This Agreement, together with your Sales Receipt, is the entire agreement between us for this licence.',
					'We may update these terms from time to time; the version in effect on your purchase date, as referenced by your Sales Receipt, is the one that governs your licence.',
					'Questions about your licence or this Agreement: hi@august.tf — Mirai Service Co., Ltd. (trading as August Type Foundry), 1-16 Hinokuchi-cho, Nishi-ku, Nagoya, Aichi 451-0034, Japan.'
				]
			}
		],
		flagsForReview: [
			"Copy-tier numbers (e.g. up to 5,000 / 50,000 copies) aren't spelled out in this text — cross-check against the actual tier table on /buy (pricing.ts) before publishing.",
			'No specific court/venue named for disputes beyond "governed by the laws of Japan".',
			"Article 5's 14-day cure period is a general EULA convention, not confirmed as August's official policy.",
			'Article 3\'s "promotional copies count toward the tier" rule is an industry-convention assumption — confirm it matches actual policy.',
			'Article 2/3\'s "Copies across print and digital formats count together toward one tier" is an explicit policy choice made here (fixing an earlier draft that only covered digital formats, inconsistent with the Books licence blurb on /buy, which covers print books/magazines too) — confirm this aggregate-counting approach is what August actually wants, versus counting print and digital separately.',
			"Article 3's subsetting permission mirrors the other licence types — confirm it doesn't conflict with any print-production requirements (e.g. a printer needing the full, non-subsetted font).",
			"Liability cap (Article 6) should get a lawyer's review pass, as with the other three licence sections — same Consumer Contract Act / APPI considerations apply."
		]
	}
];
