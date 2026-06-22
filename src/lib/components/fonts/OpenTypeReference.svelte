<script lang="ts">
	import { onMount } from 'svelte';
	// OpenType feature reference — a working cheat-sheet of the features a
	// professional Latin font is expected to ship. Each row is a LIVE off → on
	// demo. Steiner does not yet ship every feature, so demos render in fonts that
	// verifiably do — Inter (sans) and EB Garamond (serif).
	//
	// CROSS-BROWSER: every toggle is applied through ALL the mechanisms that exist
	// for it at once, set to the same state, because engines disagree on which one
	// they honour (e.g. Chromium ignores `font-feature-settings: 'smcp'` but obeys
	// font-variant-caps; other engines do the opposite for oldstyle-nums / hist):
	//   1. high-level `font-variant-*` / `font-kerning` (best support),
	//   2. `font-variant-alternates` via @font-feature-values (ss## / cv## / hist),
	//   3. `font-feature-settings` (+ -webkit- prefix) as a last-resort fallback.
	// Whichever the browser supports wins; the others are harmless no-ops.
	//
	// NOTE: font-family is set INLINE on each sample span — base.css has a direct
	// `…, span, … { font-family: var(--heading-font) }` rule that otherwise forces
	// Steiner onto these spans (inheritance loses to a direct rule).
	type Need = 'must' | 'nice';
	type FontKey = 'inter' | 'garamond';

	interface Feature {
		tag: string;
		name: string;
		ja: string;
		need: Need;
		font: FontKey;
		sample: string;
		lang?: string; // locl: drives the change via the `lang` attribute
		varProp?: string; // high-level property name (font-variant-*, font-kerning)
		varOff?: string;
		varOn?: string;
		altOn?: string; // font-variant-alternates ON value (ss/cv/hist)
		altOff?: string; // default 'normal'
		ffsOff?: string; // font-feature-settings OFF value, default "'tag' 0"
		ffsOn?: string; // font-feature-settings ON value, default "'tag' 1"
		ghost?: boolean; // overlay the OFF state faintly behind ON (for subtle vertical shifts like `case`)
	}

	interface Group {
		title: string;
		note: string;
		items: Feature[];
	}

	const FONT_LABEL: Record<FontKey, string> = { inter: 'Inter', garamond: 'EB Garamond' };
	// Self-hosted, uniquely-named families. Self-hosting matters: Google Fonts
	// (fonts.gstatic.com) is routinely blocked by privacy extensions / networks,
	// and when the demo fonts fail to load every demo silently falls back and the
	// feature appears "not working". Unique names avoid any clash with a cached
	// or system Inter / EB Garamond.
	const FONT_STACK: Record<FontKey, string> = {
		inter: "'OTRef Inter', system-ui, sans-serif",
		garamond: "'OTRef Garamond', Georgia, serif"
	};

	// Raw <head> CSS: local @font-face for the demo fonts + named feature values so
	// ss##/cv## can also be driven by font-variant-alternates. Injected via {@html}
	// so Svelte leaves the @font-face / @font-feature-values at-rules untouched.
	const HEAD_CSS = `<style>
		@font-face {
			font-family: 'OTRef Inter';
			src: url('/fonts/otref-inter.woff2') format('woff2');
			font-weight: 100 900;
			font-style: normal;
			font-display: swap;
		}
		@font-face {
			font-family: 'OTRef Garamond';
			src: url('/fonts/otref-garamond.woff2') format('woff2');
			font-weight: 400 800;
			font-style: normal;
			font-display: swap;
		}
		@font-feature-values 'OTRef Inter' {
			@styleset { ot-ss01: 1; ot-ss02: 2; }
			@character-variant { ot-cv11: 11; }
		}
	</style>`;

	const GROUPS: Group[] = [
		{
			title: 'Essential — foundation',
			note: '土台。どれも欠けると「ちゃんとした書体」に見えない。',
			items: [
				{
					tag: 'kern',
					name: 'Kerning',
					ja: '文字ペアの間隔調整。オフだと AV・To が間延びする。',
					need: 'must',
					font: 'inter',
					sample: 'AV To Wa Ya',
					varProp: 'font-kerning',
					varOff: 'none',
					varOn: 'normal'
				},
				{
					tag: 'liga',
					name: 'Standard Ligatures',
					ja: 'fi・fl・ff・ffi の衝突を1グリフに統合。',
					need: 'must',
					font: 'garamond',
					sample: 'fi fl ffi ffl',
					varProp: 'font-variant-ligatures',
					varOff: 'no-common-ligatures',
					varOn: 'common-ligatures'
				},
				{
					tag: 'calt',
					name: 'Contextual Alternates',
					ja: '前後関係を見て自動で字形を差し替える（ここでは矢印化）。',
					need: 'must',
					font: 'inter',
					sample: 'a --> b',
					varProp: 'font-variant-ligatures',
					varOff: 'no-contextual',
					varOn: 'contextual'
				},
				{
					tag: 'locl',
					name: 'Localized Forms',
					ja: '言語で字形を切替（ルーマニア語＝セディーユ ş をコンマ下 ș に）。',
					need: 'must',
					font: 'inter',
					sample: 'şcoală',
					lang: 'ro'
				},
				{
					tag: 'case',
					name: 'Case-Sensitive Forms',
					ja: 'オールキャップス時、括弧・中黒・ダッシュが小文字基準の低い位置から大文字の中心へ上がる。薄い赤＝OFF（元）の位置。',
					need: 'must',
					font: 'inter',
					sample: '(A·B–C)',
					ghost: true
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
					ja: '等高のライニング → 本文になじむ上下動のあるオールドスタイル。',
					need: 'must',
					font: 'garamond',
					sample: '0123456789',
					varProp: 'font-variant-numeric',
					varOff: 'lining-nums',
					varOn: 'oldstyle-nums',
					// EB Garamond defaults to oldstyle, so the OFF side forces lining.
					ffsOff: "'lnum' 1",
					ffsOn: "'onum' 1"
				},
				{
					tag: 'tnum',
					name: 'Tabular Figures',
					ja: '全数字を等幅に。表・金額で桁が縦に揃う。',
					need: 'must',
					font: 'inter',
					sample: '1,481 · 2,070',
					varProp: 'font-variant-numeric',
					varOff: 'proportional-nums',
					varOn: 'tabular-nums'
				},
				{
					tag: 'frac',
					name: 'Fractions',
					ja: 'スラッシュ分数を正式な分数字形へ。',
					need: 'must',
					font: 'inter',
					sample: '1/2 3/4',
					varProp: 'font-variant-numeric',
					varOff: 'normal',
					varOn: 'diagonal-fractions'
				},
				{
					tag: 'zero',
					name: 'Slashed Zero',
					ja: '0 と O を区別するスラッシュ付きゼロ。',
					need: 'nice',
					font: 'inter',
					sample: '0 O 1080',
					varProp: 'font-variant-numeric',
					varOff: 'normal',
					varOn: 'slashed-zero'
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
					sample: 'small caps',
					varProp: 'font-variant-caps',
					varOff: 'normal',
					varOn: 'small-caps'
				},
				{
					tag: 'c2sc',
					name: 'Caps to Small Caps',
					ja: '大文字を小型大文字へ。オールキャップスを穏やかに。',
					need: 'nice',
					font: 'garamond',
					sample: 'UNESCO',
					varProp: 'font-variant-caps',
					varOff: 'normal',
					varOn: 'all-small-caps'
				},
				{
					tag: 'cv11',
					name: 'Character Variant — single-story a',
					ja: '個別の字形バリエーション（ここでは1階建ての a）。',
					need: 'nice',
					font: 'inter',
					sample: 'a banana',
					altOn: 'character-variant(ot-cv11)'
				},
				{
					tag: 'ss02',
					name: 'Stylistic Set — disambiguation',
					ja: 'まとまった字形セット（識別性を上げた I）。',
					need: 'nice',
					font: 'inter',
					sample: 'Illinois Il1',
					altOn: 'styleset(ot-ss02)'
				},
				{
					tag: 'ss01',
					name: 'Stylistic Set — alternate digits',
					ja: '別デザインの数字（3 4 6 9 が変わる）。',
					need: 'nice',
					font: 'inter',
					sample: '3 4 6 9',
					altOn: 'styleset(ot-ss01)'
				},
				{
					tag: 'hist',
					name: 'Historical Forms',
					ja: '古字形（s が long s ſ に）。',
					need: 'nice',
					font: 'garamond',
					sample: 'passing',
					altOn: 'historical-forms'
				}
			]
		}
	];

	// Compose every applicable toggle mechanism, all set to the same state, so the
	// demo fires regardless of which one the browser honours.
	function sampleStyle(f: Feature, state: 'off' | 'on'): string {
		const parts = [`font-family: ${FONT_STACK[f.font]}`];
		if (f.lang) return parts.join('; ') + ';'; // locl is driven by the lang attribute
		if (f.varProp) parts.push(`${f.varProp}: ${state === 'off' ? f.varOff : f.varOn}`);
		if (f.altOn) parts.push(`font-variant-alternates: ${state === 'off' ? (f.altOff ?? 'normal') : f.altOn}`);
		const ffs = state === 'off' ? (f.ffsOff ?? `'${f.tag}' 0`) : (f.ffsOn ?? `'${f.tag}' 1`);
		parts.push(`font-feature-settings: ${ffs}`);
		parts.push(`-webkit-font-feature-settings: ${ffs}`);
		return parts.join('; ') + ';';
	}

	// Confirm the demo fonts actually loaded — if they don't, every demo falls back
	// and nothing toggles, so surface it plainly instead of failing silently.
	let fontsOk = $state<boolean | null>(null);
	onMount(async () => {
		try {
			await document.fonts.ready;
		} catch {
			/* ignore */
		}
		const inter = document.fonts.check("24px 'OTRef Inter'");
		const garamond = document.fonts.check("24px 'OTRef Garamond'");
		fontsOk = inter && garamond;
	});
</script>

<svelte:head>
	<!-- Self-hosted demo fonts (no external request to block) + named feature values. -->
	{@html HEAD_CSS}
</svelte:head>

<section class="OTRef" aria-label="OpenType feature reference">
	{#if fontsOk === false}
		<p class="OTRef__fontwarn" role="status">
			⚠ デモ用フォント（Inter / EB Garamond）が読み込めていません。各機能の変化が表示されない可能性があります。
		</p>
	{/if}
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
							<span class="OTRef__cell">
								<span class="OTRef__sample" style={sampleStyle(f, 'off')}>{f.sample}</span>
								<span class="OTRef__state">off</span>
							</span>
							<span class="OTRef__arrow" aria-hidden="true">→</span>
							<span class="OTRef__cell">
								{#if f.ghost}
									<!-- Overlay the OFF state faintly behind ON so a subtle vertical
									     shift (case) reads as a clear double image. -->
									<span class="OTRef__ghostwrap">
										<span class="OTRef__sample OTRef__ghost" style={sampleStyle(f, 'off')} aria-hidden="true">
											{f.sample}
										</span>
										<span class="OTRef__sample OTRef__sample--on" style={sampleStyle(f, 'on')}>
											{f.sample}
										</span>
									</span>
								{:else}
									<span class="OTRef__sample OTRef__sample--on" style={sampleStyle(f, 'on')} lang={f.lang}>
										{f.sample}
									</span>
								{/if}
								<span class="OTRef__state OTRef__state--on">on · {f.tag}</span>
							</span>
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

	.OTRef__fontwarn {
		font-family: 'Steiner', sans-serif;
		font-size: var(--fs-h6);
		line-height: 1.5;
		color: var(--color-accent, #b33030);
		border: 1px solid var(--color-accent, #b33030);
		border-radius: 3px;
		padding: 10px 14px;
		margin: 0 0 32px;
		letter-spacing: 0;
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
		gap: 18px;
		padding: 28px 0;
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

	/* Big, glyph-focused specimens. Each cell stacks the sample over a tiny
	   off/on caption so the toggle state is unambiguous. */
	.OTRef__samples {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 12px 22px;
	}

	.OTRef__cell {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.OTRef__sample {
		font-size: clamp(34px, 6.5vw, 54px);
		font-weight: 450;
		line-height: 1.1;
		color: rgba(0, 0, 0, 0.4);
	}

	.OTRef__sample--on {
		color: var(--color-text);
	}

	/* Ghost overlay: faint OFF state pinned behind the ON sample. The caps line up
	   exactly, so only the case-shifted marks read as a double image. */
	.OTRef__ghostwrap {
		position: relative;
		display: inline-block;
	}

	.OTRef__ghost {
		position: absolute;
		inset: 0;
		z-index: 0;
		color: rgba(179, 48, 48, 0.55);
		pointer-events: none;
	}

	/* Keep the black ON sample above the red ghost, so only the shifted marks
	   show red underneath. */
	.OTRef__ghostwrap .OTRef__sample--on {
		position: relative;
		z-index: 1;
	}

	.OTRef__state {
		font-family: ui-monospace, 'SF Mono', monospace;
		font-size: 9px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: rgba(0, 0, 0, 0.32);
	}

	.OTRef__state--on {
		color: rgba(0, 0, 0, 0.55);
	}

	.OTRef__arrow {
		font-family: 'Steiner', sans-serif;
		font-size: 16px;
		color: rgba(0, 0, 0, 0.3);
		align-self: center;
		margin-bottom: 17px; /* nudge onto the glyph baseline, above the caption */
	}

	@media (min-width: 768px) {
		.OTRef__row {
			grid-template-columns: 280px 1fr;
			gap: 40px;
			align-items: center;
			padding: 30px 0;
		}
	}
</style>
