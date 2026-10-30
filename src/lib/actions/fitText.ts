// Sizes a one-line text so that its ink spans its parent's width exactly — the
// typeface page's big name (2026-10-30, after Kontrapunkt Type's, whose name
// runs the full width of the page, the first letter flush with the margin).
//
// The text is measured on a canvas at a probe size, in the element's own face
// and weight, and scaled by the ratio — by its ink (what is actually drawn),
// not its advance box, so the side bearings of the first and last letters do
// not leave the word short of the margins: the first letter's is pulled out
// with a negative margin. It works for any face, weight and word; letter-
// spacing is not touched. If the canvas has nothing to say (a face not loaded
// yet) the advance box, read from the DOM, stands in.
//
// The element is an inline-block with `white-space: nowrap`; CSS should give it
// a fallback font-size, which is what shows until the fonts are in (and with
// no JS). Pass anything that changes the text or its face (the slug) as the
// parameter: Svelte rewrites the element's style attribute when that happens,
// which drops the size set here, so the action fits again from `update`.

/** Size the text is measured at before it is scaled. */
const PROBE_PX = 100;

let canvasContext: CanvasRenderingContext2D | null | undefined;

function measureInk(text: string, font: string) {
	canvasContext ??= document.createElement('canvas').getContext('2d');
	if (!canvasContext) return null;
	canvasContext.font = font;
	const m = canvasContext.measureText(text);
	const width = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
	if (!Number.isFinite(width) || width <= 0) return null;
	// actualBoundingBoxLeft is how far the ink reaches left of the origin:
	// negative when it starts to the right of it (a side bearing).
	return { left: -m.actualBoundingBoxLeft, width };
}

export function fitText(node: HTMLElement, _key?: unknown) {
	const parent = node.parentElement;

	function fit() {
		if (!parent) return;
		const cs = getComputedStyle(parent);
		const avail =
			parent.clientWidth - parseFloat(cs.paddingLeft || '0') - parseFloat(cs.paddingRight || '0');
		if (avail <= 0) return;

		const own = getComputedStyle(node);
		const ink = measureInk(
			(node.textContent ?? '').trim(),
			`${own.fontWeight} ${PROBE_PX}px ${own.fontFamily}`
		);

		if (ink) {
			const size = (PROBE_PX * avail) / ink.width;
			node.style.fontSize = `${size}px`;
			node.style.marginLeft = `${(-ink.left * size) / PROBE_PX}px`;
			return;
		}

		node.style.marginLeft = '';
		node.style.fontSize = `${PROBE_PX}px`;
		const measured = node.getBoundingClientRect().width;
		if (measured) node.style.fontSize = `${(PROBE_PX * avail) / measured}px`;
	}

	// Only a change of width matters: setting the size changes the parent's
	// height, which would otherwise fire this again for nothing.
	let lastWidth = parent?.clientWidth ?? 0;
	const observer = parent
		? new ResizeObserver(() => {
				if (parent.clientWidth === lastWidth) return;
				lastWidth = parent.clientWidth;
				fit();
			})
		: undefined;

	fit();
	if (parent) observer?.observe(parent);
	// The measure is only right once the faces have loaded (and again if one
	// arrives late, e.g. a variable font's second request).
	document.fonts?.ready.then(fit);
	document.fonts?.addEventListener('loadingdone', fit);

	return {
		update() {
			fit();
		},
		destroy() {
			observer?.disconnect();
			document.fonts?.removeEventListener('loadingdone', fit);
		}
	};
}
