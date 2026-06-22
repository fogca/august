<script lang="ts">
	// OpenType feature reference — a working cheat-sheet of the features a
	// professional Latin font is expected to ship, split into "essential" and
	// "recommended". Each row is a LIVE off → on demo via font-feature-settings
	// (or `lang` for locl). Steiner does not yet ship every feature, so demos
	// render in fonts that verifiably do — Inter (sans) and EB Garamond (serif).
	// Every sample / off-on pair was confirmed against each font's actual GSUB
	// table and rendered output, so the toggle is always visible — no empty demos.
	// NOTE: font-family is set INLINE on each sample span on purpose. base.css has
	// `…, span, … { font-family: var(--heading-font) }`, a direct rule that would
	// otherwise force Steiner onto these spans (inheritance loses to a direct rule).
	type Need = 'must' | 'nice';
	type Demo = 'feature' | 'lang' | 'static';
	type FontKey = 'inter' | 'garamond';

	interface Feature {
		tag: string;
		name: string; // English feature name
		ja: string; // one-line Japanese gloss
		need: Need;
		font: FontKey;
		sample: string;
		demo?: Demo; // default 'feature'
		lang?: string; // BCP-47 tag for demo === 'lang'
		// Full CSS declaration overrides for the OFF / ON sample. Default is
		// `font-feature-settings: '<tag>' 0|1`. Caps / numeric features need their
		// high-level font-variant-* property — font-feature-settings is ignored for
		// those in Chromium, so they carry explicit overrides below.
		off?: string;
		on?: string;
	}

	interface Group {
		title: string;
		note: string;
		items: Feature[];
	}

	const FONT_LABEL: Record<FontKey, string> = {
		inter: 'Inter',
		garamond: 'EB Garamond'
	};
	const FONT_STACK: Record<FontKey, string> = {
		inter: "'Inter', system-ui, sans-serif",
		garamond: "'EB Garamond', Georgia, serif"
	};

	const GROUPS: Group[] = [
		{
			title: 'Essential — foundation',
			note: '土台。どれも欠けると「ちゃんとした書体」に見えない。',
			items: [
				{
					tag: 'kern',
					name: 'Kerning',
					ja: '文字ペアの間隔調整。オフにすると AV・To が間延びする。',
					need: 'must',
					font: 'inter',
					sample: 'AVATAR To Wo Ya. Tr'
				},
				{
					tag: 'liga',
					name: 'Standard Ligatures',
					ja: 'fi・fl・ff・ffi の衝突を1グリフに統合。',
					need: 'must',
					font: 'garamond',
					sample: 'office final flower stiff'
				},
				{
					tag: 'calt',
					name: 'Contextual Alternates',
					ja: '前後関係を見て自動で字形を差し替える（ここでは矢印化）。',
					need: 'must',
					font: 'inter',
					sample: 'step --> next --> done'
				},
				{
					tag: 'ccmp',
					name: 'Mark Composition & Positioning',
					ja: 'アクセントの合成・配置（mark / mkmk）。常時オン＝正しく載るか壊れるかの二択。',
					need: 'must',
					font: 'inter',
					sample: 'Ǻ Ņ ờ ẫ ǚ Ḝ',
					demo: 'static'
				},
				{
					tag: 'locl',
					name: 'Localized Forms',
					ja: '言語に応じて字形を切替（ルーマニア語＝セディーユをコンマ下に）。',
					need: 'must',
					font: 'inter',
					sample: 'şcoală ţară',
					demo: 'lang',
					lang: 'ro'
				},
				{
					tag: 'case',
					name: 'Case-Sensitive Forms',
					ja: 'オールキャップス時に記号類を大文字の高さへ。',
					need: 'must',
					font: 'inter',
					sample: '(A–Z) ¡HOLA! @5·9'
				}
			]
		},
		{
			title: 'Essential — figures',
			note: '数字まわり。本文・表・価格表示の品質に直結する。',
			items: [
				{
					tag: 'onum',
					name: 'Oldstyle Figures',
					ja: '等高のライニング（左）→ 本文になじむ上下動のあるオールドスタイル。',
					need: 'must',
					font: 'garamond',
					sample: 'in 1842 — 67,309',
					// EB Garamond defaults to oldstyle, so force lining on the OFF side.
					off: "font-feature-settings: 'lnum' 1",
					on: "font-feature-settings: 'onum' 1"
				},
				{
					tag: 'tnum',
					name: 'Tabular Figures',
					ja: '全数字を等幅に。表・金額で桁が縦に揃う。',
					need: 'must',
					font: 'inter',
					sample: '1,481  2,070'
				},
				{
					tag: 'frac',
					name: 'Fractions',
					ja: 'スラッシュ分数を正式な分数字形へ。',
					need: 'must',
					font: 'inter',
					sample: '1/2 3/4 5/8'
				},
				{
					tag: 'zero',
					name: 'Slashed Zero',
					ja: '0 と O を区別するスラッシュ付きゼロ。',
					need: 'nice',
					font: 'inter',
					sample: '0 vs O · 10,204'
				}
			]
		},
		{
			title: 'Recommended — expression',
			note: 'あると表現の幅が出る。余力で。中身が無いなら入れない。',
			items: [
				{
					tag: 'smcp',
					name: 'Small Capitals',
					ja: '小文字を小型大文字へ。本文中の略語に最適。',
					need: 'nice',
					font: 'garamond',
					sample: 'small caps refinement',
					// Caps features ignore font-feature-settings in Chromium — use font-variant-caps.
					off: 'font-variant-caps: normal',
					on: 'font-variant-caps: small-caps'
				},
				{
					tag: 'c2sc',
					name: 'Caps to Small Caps',
					ja: '大文字を小型大文字へ。オールキャップスを穏やかに。',
					need: 'nice',
					font: 'garamond',
					sample: 'UNESCO · PDF',
					off: 'font-variant-caps: normal',
					on: 'font-variant-caps: all-small-caps'
				},
				{
					tag: 'cv11',
					name: 'Character Variant — single-story a',
					ja: '個別の字形バリエーション（ここでは1階建ての a）。',
					need: 'nice',
					font: 'inter',
					sample: 'a magnolia area'
				},
				{
					tag: 'ss02',
					name: 'Stylistic Set — disambiguation',
					ja: 'まとまった字形セット（識別性を上げた I）。',
					need: 'nice',
					font: 'inter',
					sample: 'Illinois · Il1'
				},
				{
					tag: 'ss01',
					name: 'Stylistic Set — alternate digits',
					ja: '別デザインの数字（3 4 6 9）。',
					need: 'nice',
					font: 'inter',
					sample: '3 4 6 9 · 2026'
				},
				{
					tag: 'hist',
					name: 'Historical Forms',
					ja: '古字形（long s など）。',
					need: 'nice',
					font: 'garamond',
					sample: 'passing roses'
				}
			]
		}
	];

	// Build the inline style for a sample span: demo font first (must beat the
	// base.css `span` rule), then the feature toggle as a full CSS declaration.
	function sampleStyle(f: Feature, state: 'off' | 'on'): string {
		const family = `font-family: ${FONT_STACK[f.font]};`;
		if (f.demo === 'lang' || f.demo === 'static') return family;
		const decl =
			state === 'off'
				? (f.off ?? `font-feature-settings: '${f.tag}' 0`)
				: (f.on ?? `font-feature-settings: '${f.tag}' 1`);
		return `${family} ${decl};`;
	}
</script>

<svelte:head>
	<!-- Demo fonts that verifiably ship the features below. Variable woff2 from
	     Google Fonts keeps the GSUB/GPOS table used here. -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..600;1,400&family=Inter:opsz,wght@14..32,400..600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<section class="OTRef" aria-label="OpenType feature reference">
	{#each GROUPS as group (group.title)}
		<div class="OTRef__group">
			<div class="OTRef__grouphead">
				<h2 class="OTRef__grouptitle">{group.title}</h2>
				<p class="OTRef__groupnote" lang="ja">{group.note}</p>
			</div>

			<ul class="OTRef__list">
				{#each group.items as f (f.tag)}
					<li class="OTRef__row">
						<div class="OTRef__meta">
							<div class="OTRef__heading">
								<span class="OTRef__name">{f.name}</span>
								<span class="OTRef__tag">{f.tag}</span>
								<span class="OTRef__chip" class:OTRef__chip--must={f.need === 'must'}>
									{f.need === 'must' ? '必須' : '推奨'}
								</span>
							</div>
							<p class="OTRef__ja" lang="ja">{f.ja}</p>
							<p class="OTRef__font">Demo · {FONT_LABEL[f.font]}</p>
						</div>

						<div class="OTRef__samples">
							{#if f.demo === 'static'}
								<!-- Structural feature: no on/off — show one correct specimen. -->
								<span class="OTRef__sample OTRef__sample--on" style={sampleStyle(f, 'on')}>
									{f.sample}
								</span>
								<span class="OTRef__always">always on</span>
							{:else if f.demo === 'lang'}
								<!-- locl fires by language, not font-feature-settings. -->
								<span class="OTRef__sample" style={sampleStyle(f, 'off')}>{f.sample}</span>
								<span class="OTRef__arrow" aria-hidden="true">→</span>
								<span class="OTRef__sample OTRef__sample--on" style={sampleStyle(f, 'on')} lang={f.lang}>
									{f.sample}
								</span>
							{:else}
								<span class="OTRef__sample" style={sampleStyle(f, 'off')}>{f.sample}</span>
								<span class="OTRef__arrow" aria-hidden="true">→</span>
								<span class="OTRef__sample OTRef__sample--on" style={sampleStyle(f, 'on')}>
									{f.sample}
								</span>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</section>

<style>
	.OTRef {
		padding: 0 var(--padding);
	}

	.OTRef__group {
		margin-bottom: 64px;
	}

	.OTRef__grouphead {
		margin-bottom: 8px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--color-text);
	}

	.OTRef__grouptitle {
		font-family: 'Steiner', sans-serif;
		font-size: var(--fs-h4);
		font-weight: var(--fw-strong);
		letter-spacing: 0;
		margin: 0;
		color: var(--color-text);
	}

	.OTRef__groupnote {
		font-family: 'Steiner', sans-serif;
		font-size: var(--fs-h6);
		line-height: 1.5;
		color: rgba(0, 0, 0, 0.45);
		margin: 4px 0 0;
		letter-spacing: 0;
	}

	.OTRef__list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.OTRef__row {
		display: grid;
		grid-template-columns: 1fr;
		gap: 14px;
		padding: 22px 0;
		border-bottom: 1px solid var(--color-line);
	}

	.OTRef__meta {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.OTRef__heading {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 10px;
	}

	.OTRef__name {
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		font-weight: var(--fw-ui);
		letter-spacing: 0;
		color: var(--color-text);
	}

	.OTRef__tag {
		font-family: ui-monospace, 'SF Mono', monospace;
		font-size: 10px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: rgba(0, 0, 0, 0.4);
	}

	.OTRef__chip {
		font-family: 'Steiner', sans-serif;
		font-size: 9px;
		line-height: 1;
		letter-spacing: 0.02em;
		padding: 3px 6px;
		border: 1px solid var(--color-line);
		color: rgba(0, 0, 0, 0.5);
		border-radius: 2px;
	}

	.OTRef__chip--must {
		background: var(--color-text);
		border-color: var(--color-text);
		color: var(--color-bg);
	}

	.OTRef__ja {
		font-family: 'Steiner', sans-serif;
		font-size: var(--fs-p);
		line-height: 1.55;
		color: rgba(0, 0, 0, 0.6);
		letter-spacing: 0;
		margin: 0;
		max-width: 44ch;
	}

	.OTRef__font {
		font-family: ui-monospace, 'SF Mono', monospace;
		font-size: 9px;
		letter-spacing: 0.04em;
		color: rgba(0, 0, 0, 0.32);
		margin: 0;
	}

	.OTRef__samples {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 16px;
		font-size: clamp(26px, 4.5vw, 40px);
		line-height: 1.25;
	}

	.OTRef__sample {
		color: rgba(0, 0, 0, 0.34);
	}

	.OTRef__sample--on {
		color: var(--color-text);
	}

	.OTRef__arrow {
		font-family: 'Steiner', sans-serif;
		font-size: 14px;
		color: rgba(0, 0, 0, 0.3);
		align-self: center;
	}

	.OTRef__always {
		font-family: ui-monospace, monospace;
		font-size: 9px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: rgba(0, 0, 0, 0.3);
		align-self: center;
	}

	@media (min-width: 768px) {
		.OTRef__row {
			grid-template-columns: 300px 1fr;
			gap: 40px;
			align-items: center;
			padding: 26px 0;
		}
	}
</style>
