// Global display language for trilingual content. A [data-lang] attribute on
// <html> (set in +layout.svelte, and pre-set by an inline script in app.html to
// avoid a flash) drives the show/hide CSS on pages that carry EN/FR/DA copy.
// An explicit choice is persisted per browsing session (sessionStorage) — it
// carries across navigation and resets when the tab is closed. Absent that,
// restore() falls back to the browser's own language, the same detection
// app.html's pre-paint script uses, so the two agree and hydration doesn't flip
// it back.
//
// Ported from the OTIF site's lang store; extended from an EN/DA pair to
// EN/FR/DA 2026-09 (Header now shows all three as separate buttons rather
// than one cycling toggle, so `set()` is the only mutator now — the old
// binary toggle() doesn't generalise to three options and has been removed).
//
// Extended again 2026-09 to DE/ES/CH (buttons only, at the user's explicit
// choice — no site copy has been translated into these yet). Selecting one
// just falls through to the English default everywhere, since every FR/DA
// show/hide rule sitewide (`:global([data-lang='fr']) ...`) only matches
// those two codes specifically — nothing else needed to add an inert code
// here. "CH" is Switzerland per the user (not a language on its own); kept
// as its own code rather than folded into "de" since it's a distinct button.
export type Lang = 'en' | 'fr' | 'da' | 'de' | 'es' | 'ch';
export type LangOption = { code: Lang; label: string; name: string };

// Full set (Footer shows all six); Header shows only HEADER_LANG_CODES — a
// smaller, explicit subset (EN/FR/ES), at the user's own choice, in its own
// order rather than "however many of the full list fit". "CH" is
// Switzerland, not a language — name is left in English rather than in a
// language it doesn't have (unlike the others, whose name is in themselves).
export const LANG_OPTIONS: LangOption[] = [
	{ code: 'en', label: 'EN', name: 'English' },
	{ code: 'fr', label: 'FR', name: 'Français' },
	{ code: 'de', label: 'DE', name: 'Deutsch' },
	{ code: 'es', label: 'ES', name: 'Español' },
	{ code: 'ch', label: 'CH', name: 'Switzerland' },
	{ code: 'da', label: 'DA', name: 'Dansk' }
];
export const HEADER_LANG_CODES: readonly Lang[] = ['en', 'fr', 'es'];

const ALL_LANGS: readonly Lang[] = LANG_OPTIONS.map((l) => l.code);
const STORAGE_KEY = 'august-lang';

class LangState {
	current = $state<Lang>('en');

	/** Read the session's saved language, falling back to the browser's own
	 *  language when there's no explicit choice yet this session. Call once,
	 *  client-only. */
	restore() {
		if (typeof sessionStorage === 'undefined') return;
		const saved = sessionStorage.getItem(STORAGE_KEY);
		if ((ALL_LANGS as string[]).includes(saved ?? '')) {
			this.current = saved as Lang;
			return;
		}
		// Passive detection, not a user choice — deliberately not written to
		// sessionStorage, so a later change in the browser's own language still
		// takes effect. Only for codes with a real translation behind them —
		// "ch" isn't a navigator.language value and has no content of its own
		// to detect into.
		const browserLang = typeof navigator !== 'undefined' ? navigator.language?.toLowerCase() : '';
		if (browserLang?.startsWith('da')) {
			this.current = 'da';
		} else if (browserLang?.startsWith('fr')) {
			this.current = 'fr';
		} else if (browserLang?.startsWith('de')) {
			this.current = 'de';
		} else if (browserLang?.startsWith('es')) {
			this.current = 'es';
		}
	}

	set(next: Lang) {
		if (next === this.current) return;
		this.current = next;
		if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(STORAGE_KEY, next);
	}
}

export const lang = new LangState();
