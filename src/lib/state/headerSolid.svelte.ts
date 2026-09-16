// Lets a page section ask the fixed Header to drop its mix-blend-mode:difference
// for as long as that section is on screen.
//
// The header normally inverts against whatever scrolls under it, which is the
// right behaviour over flat colour fields. It is the wrong behaviour over the
// home page's raining-glyph canvas, where the backdrop changes per pixel and
// the wordmark ends up half black, half white, several times a second.
//
// Header and the page are siblings under +layout.svelte with no parent-child
// relationship, so this is the channel between them — the same pattern as
// homeIntro.svelte.ts and lang.svelte.ts. The visual opt-out itself follows
// Header's own existing `.Header.is-open` precedent (blend normal + an
// explicit colour).
class HeaderSolidState {
	/** True while a section that can't be blended against is in view. */
	active = $state(false);
}

export const headerSolid = new HeaderSolidState();
