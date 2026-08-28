// End User Licence Agreement content — August Type Foundry.
// Structured as one Article-numbered mini-agreement per licence sold on
// /buy: Individual, Organisation (Team through Global, bundling full
// commercial use into one tier priced by company size), and Project
// (flat-priced, single-brand scope for a studio/agency buying on behalf of
// a client) — see $lib/data/pricing.ts. Rewritten 2026-08 to match the move
// away from four independent Desktop/Web/App/Books licences toward one
// unified licence per tier; the original four-section draft is superseded.
// Layout/structure reference: a screenshot of another foundry's EULA
// (sidebar nav + numbered Articles). Prose tone reference: increments.cc
// (plain, practical, not dense boilerplate).
//
// ⚠️ This is drafted content, not reviewed by a lawyer. Several clauses
// (liability cap, warranty disclaimer, cure periods, "no derivative
// typeface" restriction, the Organisation-Size definition, the Project
// License's Purchaser/Brand mechanic) were added by standard font-industry
// convention or from the business logic discussed rather than confirmed
// against August's actual policy — flagged inline below each section as
// `flagsForReview`. Recommend a lawyer's pass before treating this as
// final, especially the liability/warranty articles and anything touching
// Japan's Consumer Contract Act / APPI.

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
		id: 'individual',
		navLabel: 'Individual',
		heading: 'End User Licence Agreement (Individual License)',
		intro:
			"This section covers the Individual License for August Type Foundry's fonts — the " +
			'smallest tier, for one person using the OpenType and TrueType files on their own ' +
			'computers to design and produce static work: posters, packaging, brand identities, ' +
			'PDFs, presentations, print, and exported images. It does not cover self-hosting ' +
			'webfonts, embedding in an app, or broadcast/streaming use — those need an ' +
			'Organisation License (see the next section). If you have bought more than one ' +
			'licence, each is governed by its own section of this EULA.',
		articles: [
			{
				number: 1,
				title: 'Definitions',
				clauses: [
					'"Licensor", "we", "us", or "August" means Mirai Service Co., Ltd., a company registered in Japan and trading as August Type Foundry.',
					'"Licensee" or "you" means the individual named on the Sales Receipt.',
					'"Fonts" means the August Type Foundry font software covered by your Sales Receipt, supplied as OpenType (.otf) or TrueType (.ttf) files for installation on desktop devices — currently Steiner (marketed as "Asger"), across its full range of weights.',
					'"Sales Receipt" means the order confirmation we issue at checkout, recording the licence tier, price paid, and date — it is the master record of what you are licensed for.'
				]
			},
			{
				number: 2,
				title: 'Formation of Agreement & Scope of Licensed Usage',
				clauses: [
					'This Agreement forms the moment your payment is processed through Stripe and we issue you a Sales Receipt.',
					'It is a one-time purchase, not a subscription: once paid, your Individual License has no expiry date or renewal fee.',
					"It is a non-exclusive, non-transferable licence granted to you alone — it doesn't carry over to anyone else, and it can't be resold or handed off without our written consent.",
					'This licence is scoped to one person and to desktop use only. It does not cover self-hosting webfonts, embedding in an app or game, or broadcast/streaming use — an Organisation License covers all of those, bundled into one tier priced by company size.'
				]
			},
			{
				number: 3,
				title: 'Permitted Use',
				clauses: [
					'You may install the Fonts on any devices you personally use — for example, a work desktop and a personal laptop — the licence follows you, not one machine.',
					'You may use the Fonts to design and produce static artwork and documents: branding and logos, print and packaging, editorial and presentation layouts, PDFs, and exported images (JPG, PNG, and similar).',
					"You may deliver finished, flattened output — a print-ready PDF, an exported image, a packaging die-line — to clients, printers, or the public; it's the output that travels, not the font software itself.",
					'You may use the Fonts across as many projects as you like, for as long as your licence lasts.'
				]
			},
			{
				number: 4,
				title: 'Restrictions & Prohibited Use',
				clauses: [
					"Don't share, distribute, sell, rent, sublicense, or otherwise make the font software files available to anyone else — including uploading them to a public repository, an open shared drive, or handing them to a freelancer, employer, or agency who hasn't bought their own licence.",
					"Don't use the Fonts to self-host webfonts on a website, embed them in an app or game, or use them in broadcast or streaming content — those uses need an Organisation License.",
					"Don't modify the font software to build and redistribute a derivative typeface, and don't claim authorship of the font design itself.",
					"Don't use the Fonts to produce a logo, wordmark, or graphic that is itself sold or licensed on as a font or lettering product.",
					'If you are producing work for an employer or a client rather than yourself, an Individual License is not the right tier — see the Organisation License or Project License sections.'
				]
			},
			{
				number: 5,
				title: 'Term & Termination',
				clauses: [
					"Your Individual License is perpetual: once your Sales Receipt is issued, your right to use the Fonts within this licence's scope doesn't expire.",
					"We may terminate this Agreement if you materially breach it — for example, sharing the font files or using them beyond desktop scope — and don't correct it within a reasonable time after we notify you.",
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
			'Article 4.4/4.5 (no derivative typeface, no logo-resale-as-font) carried over from the original Desktop-licence draft by convention — confirm they match how August wants client logo work treated.',
			"Article 6 (warranty/liability cap) and Article 5 (termination/cure) are substantive legal clauses — recommend a lawyer's review before publishing, particularly the liability cap and the undefined 'reasonable time to cure'.",
			'No specific court/venue is named for disputes (only "governed by the laws of Japan") — add one (e.g. Nagoya District Court) if a named jurisdiction is wanted.'
		]
	},
	{
		id: 'organisation',
		navLabel: 'Organisation',
		heading: 'End User Licence Agreement (Organisation License — Team through Global)',
		intro:
			'This section covers the Organisation License — every tier from Team through Firm, ' +
			'priced and scoped by company size (see your Sales Receipt for which tier you hold; ' +
			'Global is quoted individually, see Article 2.5). Unlike the Individual License, one ' +
			'Organisation License bundles full commercial use: desktop, self-hosted web, app/game ' +
			"embedding, and broadcast/streaming, all under one agreement. It covers your " +
			"organisation's own ongoing use across as many projects as you like — it does not " +
			"extend to a client's separate company (see the Project License section for that).",
		articles: [
			{
				number: 1,
				title: 'Definitions',
				clauses: [
					'"Licensor", "we", "us", or "August" means Mirai Service Co., Ltd., a company registered in Japan and trading as August Type Foundry.',
					'"Licensee" or "you" means the organisation named on the Sales Receipt.',
					'"Fonts" means the August Type Foundry font software covered by your Sales Receipt — OpenType, TrueType, and WOFF2 files as applicable to desktop, web, and app use — currently Steiner (marketed as "Asger"), across its full range of weights.',
					'"Organisation Size" means the total number of people at Licensee — full-time and part-time — authorised to use the Fonts under this licence, including staff, contractors, and freelancers working on Licensee\'s behalf.',
					'"Licensed Tier" means the tier named on your Sales Receipt (Team, Studio, Agency, Brand, or Firm) and its associated Organisation Size ceiling.',
					'"Sales Receipt" means the order confirmation we issue at checkout, recording your Licensed Tier, price paid, and date — it is the master record of what you are licensed for.'
				]
			},
			{
				number: 2,
				title: 'Formation of Agreement & Scope of Licensed Usage',
				clauses: [
					'This Agreement forms the moment your payment is processed through Stripe and we issue you a Sales Receipt.',
					'It is a one-time purchase, not a subscription: once paid, your Organisation License has no expiry date or renewal fee.',
					"It is a non-exclusive, non-transferable licence granted to Licensee only — it doesn't carry over to a different company if Licensee is sold, merged, or restructured, and it can't be resold or handed off without our written consent.",
					'Your licensed scope is full commercial use — desktop, self-hosted web, app/game embedding, and broadcast/streaming — across as many of your own projects, products, sites, and apps as you like, within your Licensed Tier.',
					"If your Organisation Size grows past your Licensed Tier's ceiling, you'll need to upgrade to a tier that covers your new headcount within 30 days.",
					'Organisations larger than the Firm tier (500 people) are not self-serve — contact us for a Global quote.'
				]
			},
			{
				number: 3,
				title: 'Permitted Use',
				clauses: [
					"Each authorised person at Licensee may install the Fonts on any devices they use for Licensee's work.",
					'You may self-host the supplied WOFF2 files on your own server or a CDN you control, and load them with @font-face on any website or web app you operate.',
					'You may embed the Fonts in any mobile or desktop application, or game, that you develop and ship.',
					'You may use the Fonts in broadcast, streaming, video, motion, and other audiovisual content you produce.',
					'You may use the Fonts to design and produce static artwork and documents — branding, print, packaging, presentations, PDFs, and exported images — the same as an Individual License.',
					'All of the above is covered under this one licence, across as many projects, products, sites, and apps as you like, for as long as your licence lasts within your Licensed Tier.',
					"You may deliver finished output — flattened files, compiled apps, rendered video, a live website — to clients, printers, app stores, CDNs, and the public; it's the output that travels, not the font software itself."
				]
			},
			{
				number: 4,
				title: 'Restrictions & Prohibited Use',
				clauses: [
					"Don't authorise more people to use the Fonts than your Licensed Tier's Organisation Size covers, without first upgrading.",
					"Don't share, distribute, sell, rent, sublicense, or otherwise make the font software files available to anyone outside Licensee — including uploading them to a public repository, an open shared drive, or handing them to a freelancer or agency who hasn't bought their own licence.",
					"Don't use this licence to cover a client's separate legal entity — a client who needs to hold their own rights to the Fonts (for example, to use them in-house after your engagement ends) needs their own Project License or Organisation License, not a sublicence of yours.",
					"Don't modify the font software to build and redistribute a derivative typeface, and don't claim authorship of the font design itself.",
					"Don't use the Fonts to produce a logo, wordmark, or graphic that is itself sold or licensed on as a font or lettering product."
				]
			},
			{
				number: 5,
				title: 'Term & Termination',
				clauses: [
					"Your Organisation License is perpetual: once your Sales Receipt is issued, your right to use the Fonts within your Licensed Tier doesn't expire.",
					"We may terminate this Agreement if you materially breach it — for example, exceeding your Organisation Size without upgrading, or distributing the font files — and don't correct it within a reasonable time after we notify you.",
					'If this Agreement is terminated for breach, you must stop using the Fonts and delete all copies from your systems and devices.',
					"Termination doesn't entitle you to a refund of fees already paid."
				]
			},
			{
				number: 6,
				title: 'Warranty & Liability',
				clauses: [
					"The Fonts are provided \"as is\" — we don't guarantee they'll be error-free or fit for every use.",
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
					'For licensing questions, including upgrades or a Global quote, contact hi@august.tf.',
					'We may update this Agreement from time to time; the version in effect on the date of your Sales Receipt governs your licence.'
				]
			}
		],
		flagsForReview: [
			"Article 2.5's 30-day upgrade grace period is a convention (matching common industry practice, including the reference EULA reviewed during pricing research), not confirmed as August's official policy — decide and state a number explicitly.",
			"Article 4.3 (can't use an Organisation License to cover a client's separate entity) is the key clause connecting this section to the Project License section below — worth double-checking the two sections don't contradict each other as both evolve.",
			'"Organisation Size" (Article 1.4) counting contractors/freelancers alongside staff is a judgment call, not a stated fact — confirm this is the intended measurement.',
			"Liability cap and termination clauses (Articles 5–6) are real legal disclaimers — recommend a lawyer's review pass, same Consumer Contract Act / APPI considerations as the other sections.",
			'No specific court/venue named for disputes beyond "governed by the laws of Japan".'
		]
	},
	{
		id: 'project',
		navLabel: 'Project License',
		heading: 'End User Licence Agreement (Project License)',
		intro:
			'This section covers the Project License — a flat-priced licence scoped to one named ' +
			'Brand, typically bought by a design studio or agency on behalf of a client. It ' +
			'carries the same full commercial use as an Organisation License — desktop, web, ' +
			'app/game, broadcast/streaming — but only for the one Brand named on the Sales ' +
			"Receipt, not for the purchasing studio or agency's other work. If you need a licence " +
			"for your own studio or agency's general use instead, see the Individual or " +
			'Organisation License sections.',
		articles: [
			{
				number: 1,
				title: 'Definitions',
				clauses: [
					'"Licensor", "we", "us", or "August" means Mirai Service Co., Ltd., a company registered in Japan and trading as August Type Foundry.',
					'"Purchaser" means the person or company named on the Sales Receipt as having bought this licence — often a design studio or agency buying on behalf of a client.',
					'"Brand" means the single named business, brand identity, or client project stated on the Sales Receipt, which this licence is scoped to.',
					'"Fonts" means the August Type Foundry font software covered by your Sales Receipt — currently Steiner (marketed as "Asger"), across its full range of weights.',
					'"Sales Receipt" means the order confirmation we issue at checkout, recording the named Brand, price paid, and date — it is the master record of what this licence covers.'
				]
			},
			{
				number: 2,
				title: 'Formation of Agreement & Scope of Licensed Usage',
				clauses: [
					'This Agreement forms the moment payment is processed through Stripe and we issue a Sales Receipt naming the Brand.',
					'It is a one-time purchase, not a subscription: once paid, this licence has no expiry date or renewal fee.',
					"It is a non-exclusive, non-transferable licence scoped to the one Brand named on the Sales Receipt — it does not extend to the Purchaser's other clients, projects, or brands, and it does not extend to the Brand's own use of any other business it separately owns or operates.",
					"The licensed scope is full commercial use — desktop, self-hosted web, app/game embedding, and broadcast/streaming — for the named Brand's own identity, materials, and channels, without a company-size ceiling.",
					"Both the Purchaser and the Brand named on the Sales Receipt may rely on this licence: the Purchaser to produce the Brand's materials, and the Brand itself to use the Fonts in its own ongoing operation of that one identity, including after the Purchaser's engagement with the Brand ends."
				]
			},
			{
				number: 3,
				title: 'Permitted Use',
				clauses: [
					"The Fonts may be used across the named Brand's own branding, marketing, website(s), app(s), and broadcast/video content — the same full range of use as an Organisation License, but limited to that one Brand.",
					'The Purchaser may install and use the Fonts to design, produce, and deliver the Brand\'s materials as part of fulfilling a design or development engagement for that Brand.',
					"The Brand itself may install and use the Fonts directly for its own materials, on its own devices, website, and channels, under this same one licence.",
					"Either party may deliver finished output — flattened files, a live website, a compiled app, rendered video — to printers, hosting providers, app stores, and the public; it's the output that travels, not the font software itself."
				]
			},
			{
				number: 4,
				title: 'Restrictions & Prohibited Use',
				clauses: [
					"Don't use the Fonts under this licence for any brand, business, or entity other than the one named on the Sales Receipt — a different client or project needs its own Project License.",
					"The Purchaser may not use this licence for its own unrelated work, other clients, or internal materials — that needs the Purchaser's own Individual or Organisation License.",
					"Don't share the font software files beyond what's needed to produce the named Brand's materials — for example, a printer or production partner may hold them temporarily for that purpose only, and must not retain or reuse them.",
					"Don't sell, sublicense, or otherwise pass this licence on to a different brand or entity, whether or not related to the original Brand.",
					"Don't modify the font software to build and redistribute a derivative typeface, and don't claim authorship of the font design itself."
				]
			},
			{
				number: 5,
				title: 'Term & Termination',
				clauses: [
					"This licence is perpetual for the named Brand: once the Sales Receipt is issued, the right to use the Fonts for that Brand doesn't expire, and continues even after the Purchaser's engagement with the Brand ends.",
					"We may terminate this Agreement if either party materially breaches it — in particular, using the Fonts for a brand other than the one named — and doesn't correct the breach within a reasonable time after we notify them.",
					"If this Agreement is terminated for breach, use of the Fonts for the named Brand must stop and all copies must be deleted from the breaching party's systems and devices.",
					"Termination doesn't entitle either party to a refund of fees already paid."
				]
			},
			{
				number: 6,
				title: 'Warranty & Liability',
				clauses: [
					"The Fonts are provided \"as is\" — we don't guarantee they'll be error-free or fit for every use.",
					'We warrant that we have the right to license the Fonts under this Agreement.',
					'To the extent permitted by law, our total liability arising from this Agreement is capped at the amount actually paid for the licence, as shown on the Sales Receipt.',
					"We aren't liable for indirect, incidental, or consequential losses, including lost profits or lost work, arising from use of the Fonts."
				]
			},
			{
				number: 7,
				title: 'Governing Law & Contact',
				clauses: [
					'This Agreement is governed by the laws of Japan.',
					'Licensor is Mirai Service Co., Ltd. (trading as August Type Foundry), 1-16 Hinokuchi-cho, Nishi-ku, Nagoya, Aichi 451-0034, Japan.',
					'For licensing questions — including extending a Project License to a company-wide Organisation License — contact hi@august.tf.',
					'We may update this Agreement from time to time; the version in effect on the date of your Sales Receipt governs your licence.'
				]
			}
		],
		flagsForReview: [
			"Article 2.5 (both Purchaser and Brand can independently rely on the licence, surviving the end of their engagement) is the core mechanic of this licence and was drafted from the business logic discussed, not from a supplied legal fact — worth a careful read to confirm it says what August intends, especially the 'survives the engagement ending' part.",
			'There is no stated mechanism for verifying who the named Brand actually is, or for resolving a dispute between Purchaser and Brand over the Fonts (e.g. if the relationship between them turns adversarial) — worth deciding whether this needs its own clause.',
			'No formal upgrade-credit path to an Organisation License is stated (Article 7.3 only offers to discuss it) — if a specific credit or discount is intended, it should be written here explicitly rather than handled ad hoc.',
			"Liability cap and termination clauses (Articles 5–6) are real legal disclaimers — recommend a lawyer's review pass, same Consumer Contract Act / APPI considerations as the other sections.",
			'No specific court/venue named for disputes beyond "governed by the laws of Japan".'
		]
	}
];
