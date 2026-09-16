// Global display language for trilingual content. A [data-lang] attribute on
// <html> (set in +layout.svelte, and pre-set by an inline script in app.html to
// avoid a flash) drives the show/hide CSS on pages that carry EN/FR copy.
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
// choice — no site copy had been translated into these). DA and CH were
// both dropped again shortly after (2026-09, at the user's request,
// "言語DA CHは削除で") — DA had real translated copy behind it (now removed
// from every page that carried it), CH never did (it stood for
// Switzerland, not a language, and had always just fallen through to
// English). Header and Footer show the exact same four codes now — EN, FR,
// DE, ES — rather than Header showing a smaller subset of Footer's list;
// there's a single list (LANG_OPTIONS) for both to share, not two.
export type Lang = 'en' | 'fr' | 'de' | 'es';
export type LangOption = { code: Lang; label: string; name: string };

// The full set — Header and Footer both show all four now (previously
// Header showed a smaller subset of this list; not needed once the list
// itself only has four options left in it).
export const LANG_OPTIONS: LangOption[] = [
	{ code: 'en', label: 'EN', name: 'English' },
	{ code: 'fr', label: 'FR', name: 'Français' },
	{ code: 'de', label: 'DE', name: 'Deutsch' },
	{ code: 'es', label: 'ES', name: 'Español' }
];

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
		// takes effect. Only for codes with a real translation behind them.
		const browserLang = typeof navigator !== 'undefined' ? navigator.language?.toLowerCase() : '';
		if (browserLang?.startsWith('fr')) {
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
