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
type Lang = 'en' | 'fr' | 'da';

const STORAGE_KEY = 'august-lang';

class LangState {
	current = $state<Lang>('en');

	/** Read the session's saved language, falling back to the browser's own
	 *  language when there's no explicit choice yet this session. Call once,
	 *  client-only. */
	restore() {
		if (typeof sessionStorage === 'undefined') return;
		const saved = sessionStorage.getItem(STORAGE_KEY);
		if (saved === 'en' || saved === 'fr' || saved === 'da') {
			this.current = saved;
			return;
		}
		// Passive detection, not a user choice — deliberately not written to
		// sessionStorage, so a later change in the browser's own language still
		// takes effect.
		const browserLang = typeof navigator !== 'undefined' ? navigator.language?.toLowerCase() : '';
		if (browserLang?.startsWith('da')) {
			this.current = 'da';
		} else if (browserLang?.startsWith('fr')) {
			this.current = 'fr';
		}
	}

	set(next: Lang) {
		if (next === this.current) return;
		this.current = next;
		if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(STORAGE_KEY, next);
	}
}

export const lang = new LangState();
