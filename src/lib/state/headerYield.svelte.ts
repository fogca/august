// Lets a page section ask the fixed Header to step out of the way (slide up
// out of view) for as long as that section sits under it.
//
// For the home page's full-bleed typeface heroes (2026-10 redesign): each is
// a full screen with its own tagline in the top-left corner, exactly where
// the compact header's nav would sit on top of it.
//
// Header and the page are siblings under +layout.svelte with no parent-child
// relationship, so this is the channel between them — the same pattern as
// homeIntro.svelte.ts and lang.svelte.ts.
class HeaderYieldState {
	/** True while a section that the header should clear is under it. */
	active = $state(false);
}

export const headerYield = new HeaderYieldState();
