// Lets a page section tell the fixed Header that it is currently over
// something dark, so the Header switches to its light colour for as long as
// that is true.
//
// The Header is a transparent overlay on the home page (2026-10: no fill of
// its own), and its brand blue disappears against the dark full-bleed
// sections there — the typeface heroes (#3e3e3e) and Contact (#333).
//
// Header and the page are siblings under +layout.svelte with no parent-child
// relationship, so this is the channel between them — the same pattern as
// homeIntro.svelte.ts and lang.svelte.ts.
class HeaderToneState {
	/** True while a dark section sits under the Header's row. */
	onDark = $state(false);
}

export const headerTone = new HeaderToneState();
