// Drag-to-scroll for a sideways scroller, with the mouse (2026-10-11, at the
// user's request — "ドラッグでもスクロールできるように").
//
// Touch needs nothing: a finger already scrolls the element natively, and so
// does a trackpad. The mouse has no sideways wheel, so this lets it grab the
// strip and pull. Mouse only, on purpose — taking over touch or pen would
// replace the browser's own, better, momentum scrolling.
//
// A press is not a drag until the pointer has moved a few px: until then the
// element is left alone, so a plain click still goes to whatever was clicked.
// Only once the drag begins is the pointer captured (capturing on the press
// itself retargets the click to the scroller, which breaks links inside it)
// and the click that ends the drag swallowed. The scroller should not use
// scroll-snap: it would pull the drag to the nearest snap point on release.
//
// Sets `data-scrollable` while there is something to scroll (for the grab
// cursor) and `is-dragging` during a drag — style them in the component.

/** How far (px) the pointer must move before a press becomes a drag. */
const DRAG_THRESHOLD = 4;

export function dragScroll(node: HTMLElement) {
	let pressed = false;
	let dragging = false;
	let pointerId = -1;
	let startX = 0;
	let startScroll = 0;

	function syncScrollable() {
		if (node.scrollWidth > node.clientWidth + 1) node.dataset.scrollable = '';
		else delete node.dataset.scrollable;
	}

	function onPointerDown(e: PointerEvent) {
		if (e.pointerType !== 'mouse' || e.button !== 0) return;
		if (!('scrollable' in node.dataset)) return;
		pressed = true;
		dragging = false;
		pointerId = e.pointerId;
		startX = e.clientX;
		startScroll = node.scrollLeft;
	}

	function onPointerMove(e: PointerEvent) {
		if (!pressed || e.pointerId !== pointerId) return;
		const dx = e.clientX - startX;
		if (!dragging) {
			if (Math.abs(dx) < DRAG_THRESHOLD) return;
			dragging = true;
			node.setPointerCapture(pointerId);
			node.classList.add('is-dragging');
		}
		node.scrollLeft = startScroll - dx;
	}

	function swallowClick(e: Event) {
		e.stopPropagation();
		e.preventDefault();
	}

	function onPointerEnd(e: PointerEvent) {
		if (!pressed || e.pointerId !== pointerId) return;
		pressed = false;
		if (!dragging) return;
		dragging = false;
		if (node.hasPointerCapture(pointerId)) node.releasePointerCapture(pointerId);
		node.classList.remove('is-dragging');
		// The click that ends a drag lands on the strip, not on an item.
		node.addEventListener('click', swallowClick, { capture: true, once: true });
		setTimeout(() => node.removeEventListener('click', swallowClick, { capture: true }), 0);
	}

	// A picture dragged natively would pull a ghost image out of the strip.
	const onDragStart = (e: Event) => e.preventDefault();

	const resizeObserver = new ResizeObserver(syncScrollable);
	resizeObserver.observe(node);
	for (const child of node.children) resizeObserver.observe(child);
	syncScrollable();

	node.addEventListener('pointerdown', onPointerDown);
	node.addEventListener('pointermove', onPointerMove);
	node.addEventListener('pointerup', onPointerEnd);
	node.addEventListener('pointercancel', onPointerEnd);
	node.addEventListener('dragstart', onDragStart);

	return {
		destroy() {
			resizeObserver.disconnect();
			node.removeEventListener('pointerdown', onPointerDown);
			node.removeEventListener('pointermove', onPointerMove);
			node.removeEventListener('pointerup', onPointerEnd);
			node.removeEventListener('pointercancel', onPointerEnd);
			node.removeEventListener('dragstart', onDragStart);
		}
	};
}
