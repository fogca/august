<!-- Raining-glyph fill — the background of the home page's "Custom type"
     section. The five letters of OGAST (2026-09, at the user's request —
     grown from just O/G) pour in from above and pack the whole screen,
     several layers deep.

     Ported from the standalone study at Dev/Ωstudies/glyph-stack/og-fill.html,
     with p5.js dropped on the way in: everything that study used p5 for
     (a canvas, a rAF loop, random, textWidth, rotated text) is a handful of
     Canvas2D calls, while p5 itself is ~250KB, owns its own rAF loop and
     window listeners (exactly what has to be stoppable when this section is
     off-screen), and can only synthesise bold — `ctx.font = '850 190px Norma'`
     is the only way to instance a real weight off a variable font, which on a
     foundry's own site is the whole point.

     THE TRICK (unchanged from the study): every glyph is really a CIRCLE rigid
     body whose radius is measureText(char)/2. Canvas2D paints the letterform on
     top of that circle at its position and angle each frame — so what you see is
     typography, but what is simulated is a cheap, stable pile of circles. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { loadMatter } from '$lib/physics';
	import { onScroll } from '$lib/scroll';

	interface Props {
		/** Characters poured in. */
		characters?: string[];
		/** Painted glyph colour. */
		color?: string;
		fontFamily?: string;
		/** wght instance — a real variable-font axis value, not synthetic bold. */
		fontWeight?: number;
		/** Glyph size in CSS px at desktop widths (scaled down on phones). */
		fontSize?: number;
		/** Circle-area poured in, as a multiple of the canvas area. >1 overflows
		 *  into a packed, several-layers-deep pile. */
		fillDensity?: number;
		/** Static things the pile can land ON, as boxes in CSS px relative to
		 *  THIS element's own box (it is inset:0, so the host section's box).
		 *  Called fresh every time the walls are rebuilt — a resize, and the
		 *  moment `armed` flips — so a caller measuring live DOM (the intro's
		 *  own wordmark, say) reads it at rest rather than mid-animation.
		 *  Only the top edge of each box is ever really seen: bodies land on
		 *  it and roll off, and anything falling through a gap between boxes
		 *  carries on to the floor. */
		obstacles?: () => { x: number; y: number; w: number; h: number }[];
		/** Draw THESE shapes instead of typesetting `characters` with the
		 *  webfont. For the intro, where the pile has to be the wordmark's own
		 *  drawn letterforms at the wordmark's own size — not Norma set at some
		 *  approximating weight, which reads visibly heavier beside it.
		 *  `d` is path data in viewBox units; `ox`/`oy` its bbox origin in
		 *  those same units (so the sprite can be centred on the ink rather
		 *  than on the viewBox); `scale` converts to CSS px; `w`/`h` are the
		 *  already-scaled on-screen size. Re-read whenever the walls are, so a
		 *  caller measuring live DOM gets it at rest. */
		shapes?: () => { d: string; ox: number; oy: number; w: number; h: number; scale: number }[];
		/** False holds the pour back even once the section is on screen — for
		 *  a caller that wants to start it on its own signal (scroll phase,
		 *  say) rather than on first intersection. Default true keeps the
		 *  original "pour as soon as it's visible" behaviour. */
		armed?: boolean;
	}
	let {
		characters = ['O', 'G', 'A', 'S', 'T'],
		color = '#0d0d0d',
		fontFamily = 'Norma',
		fontWeight = 850,
		fontSize = 190,
		fillDensity = 3.2,
		obstacles = undefined,
		shapes = undefined,
		armed = true
	}: Props = $props();

	// Physics feel — carried over from the study, where these were tuned by eye.
	const GRAVITY_Y = 0.9;
	const MAX_TOTAL = 420; // hard cap, keeps the sim cheap
	const SPAWN_PER_FRAME = 4;
	const SPAWN_ANGULAR_VEL = 0.25;
	const RESTITUTION = 0.3;
	const FRICTION = 0.35;
	const FRICTION_AIR = 0.015;
	const DENSITY = 0.001;
	const MAX_SPEED = 25; // per-body velocity clamp, anti-tunneling insurance
	const WALL_THICKNESS = 200;
	const SUBSTEPS = 5;
	const DESPAWN_MARGIN = 400;
	const REDUCED_MOTION_STEPS = 320; // headless settle, then paint one frame

	let sectionEl: HTMLElement | undefined = $state();
	let canvasEl: HTMLCanvasElement | undefined = $state();
	/** Set by onMount; see its own comment where it's assigned. */
	let arm: (() => void) | undefined;

	// Re-measures the obstacles and releases the pour when the caller arms it.
	// The IntersectionObserver path also calls start(), which checks `armed`
	// itself — so whichever of the two happens second is the one that runs,
	// and neither needs to know about the other.
	$effect(() => {
		if (armed) arm?.();
	});

	onMount(() => {
		if (!browser || !canvasEl || !sectionEl) return;

		const canvas = canvasEl;
		const section = sectionEl;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let disposed = false;
		let frame = 0;
		let onScreen = false;
		let settled = false;
		let offRepaintScroll: (() => void) | undefined;

		// Everything below is component-local: the study kept this state in
		// file-level globals, which would collide across mounts and HMR.
		let Matter: Awaited<ReturnType<typeof loadMatter>> | null = null;
		let engine: import('matter-js').Engine | null = null;
		let world: import('matter-js').World | null = null;
		let boundaries: import('matter-js').Body[] = [];
		let bodies: { body: import('matter-js').Body; char: string }[] = [];
		let spawnColumns: { x: number; nextY: number }[] = [];
		let nextColumn = 0;
		let queueRemaining = 0;
		let sprites = new Map<string, { bmp: HTMLCanvasElement; w: number; h: number }>();
		/** Shape mode only (see the `shapes` prop): the paths get filled straight
		 *  into the frame rather than pre-rendered to a bitmap first. The sprite
		 *  cache exists to keep 400 rotated fillText calls affordable; a handful
		 *  of big letterforms is nothing to fill directly, and going direct is
		 *  also visibly sharper — a rotated blit resamples its bitmap, which at
		 *  this size reads as soft edges. */
		let vectors = new Map<
			string,
			{ path: Path2D; ox: number; oy: number; w: number; h: number; scale: number }
		>();
		let radii = new Map<string, number>();
		let cssW = 0;
		/** Physics playfield height — shorter than the canvas itself by
		 *  `topClearance` (see below). Everything physics-related (walls,
		 *  floor, spawn columns, despawn margin) is sized against this, same
		 *  as before this was split out. */
		let cssH = 0;
		/** Header clearance (2026-09, at the user's request — "OGUSTスタック
		 *  のcanvasもしっかり100vhにして"): the <canvas> element itself is
		 *  now the section's full height (see .GlyphFill's own CSS comment),
		 *  but the pile still must not build up behind the fixed Header —
		 *  same clamp(52px, 7vh, 72px) the CSS `--glyph-top` used to encode,
		 *  now applied as a paint-time offset instead of a crop. Physics is
		 *  untouched: cssH/the wall layout are exactly what they were when
		 *  the canvas was physically shorter, so the pile still overflows
		 *  upward into open headroom rather than a hard ceiling — a real
		 *  ceiling here would recreate the exact "3x the circle area the box
		 *  can hold, nowhere to go" bug createBoundaries()'s own comment
		 *  describes, since fillDensity is 3.2. */
		let topClearance = 0;
		let dpr = 1;
		let glyphPx = fontSize;

		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		/** The keys spawnOne() draws from — the characters themselves in the
		 *  webfont case, or one key per supplied shape. Everything downstream
		 *  (radii, sprites, spawn columns, target count) is keyed off these, so
		 *  neither path has to know which one is in play. */
		let pieceKeys: string[] = [...characters];

		function measureGlyphs() {
			if (!ctx) return;
			radii.clear();
			sprites.clear();
			vectors.clear();

			const shapeList = shapes?.();
			if (shapeList?.length) {
				pieceKeys = shapeList.map((_, i) => `shape-${i}`);
				shapeList.forEach((s, i) => {
					const key = pieceKeys[i];
					// Circumscribing radius, not the webfont path's half-ADVANCE:
					// these are whole drawn letterforms rather than one size of
					// type, and at this scale a radius that fits inside the ink
					// lets neighbours visibly overlap — which reads as a bug,
					// where a little air between them does not.
					radii.set(key, Math.max(s.w, s.h) / 2);
					vectors.set(key, {
						path: new Path2D(s.d),
						ox: s.ox,
						oy: s.oy,
						w: s.w,
						h: s.h,
						scale: s.scale
					});
				});
				return;
			}

			pieceKeys = [...characters];
			// Phones get a smaller pour — the body count scales as area/r², so a
			// fixed 190px glyph on a 375pt screen would be a handful of boulders.
			glyphPx = cssW < 768 ? Math.max(90, Math.round(fontSize * 0.58)) : fontSize;
			ctx.font = `${fontWeight} ${glyphPx}px "${fontFamily}", sans-serif`;
			for (const ch of characters) {
				const w = ctx.measureText(ch).width;
				radii.set(ch, w / 2);

				// Pre-render each glyph once and blit it — 200+ rotated fillText
				// calls per frame is the one thing in this loop that actually costs.
				const box = Math.ceil(Math.max(w, glyphPx * 1.35) * 1.25);
				const bmp = document.createElement('canvas');
				bmp.width = Math.ceil(box * dpr);
				bmp.height = Math.ceil(box * dpr);
				const bctx = bmp.getContext('2d');
				if (!bctx) continue;
				bctx.scale(dpr, dpr);
				bctx.font = `${fontWeight} ${glyphPx}px "${fontFamily}", sans-serif`;
				bctx.fillStyle = color;
				bctx.textAlign = 'center';
				bctx.textBaseline = 'middle';
				bctx.fillText(ch, box / 2, box / 2);
				sprites.set(ch, { bmp, w: box, h: box });
			}
		}

		function createBoundaries() {
			if (!Matter || !world) return;
			const { Bodies, Composite } = Matter;
			if (boundaries.length) Composite.remove(world, boundaries);
			const t = WALL_THICKNESS;

			// The headroom, carried over verbatim in intent from the study: a
			// ceiling sitting right at the top edge gives a fillDensity > 1
			// nowhere to go, and the solver's attempt to crush ~3x more circle
			// area than the box can hold is what launched bodies through the
			// floor. Well above the viewport, the overflow just stacks out of
			// sight. The VISIBLE area still packs edge to edge, because gravity
			// keeps building the pile up from the floor regardless.
			const headroom = cssH * 10;
			const top = -headroom;
			const sideH = cssH + headroom;
			const sideCenterY = (top + cssH) / 2;

			boundaries = [
				Bodies.rectangle(cssW / 2, cssH + t / 2, cssW, t, { isStatic: true }),
				Bodies.rectangle(cssW / 2, top - t / 2, cssW, t, { isStatic: true }),
				Bodies.rectangle(-t / 2, sideCenterY, t, sideH, { isStatic: true }),
				Bodies.rectangle(cssW + t / 2, sideCenterY, t, sideH, { isStatic: true })
			];

			// Caller-supplied landing surfaces (see the `obstacles` prop). Their
			// boxes are element-pixel space, physics space is that minus
			// topClearance — the same offset paint() adds back on the way out.
			for (const o of obstacles?.() ?? []) {
				if (o.w <= 0 || o.h <= 0) continue;
				boundaries.push(
					Bodies.rectangle(o.x + o.w / 2, o.y + o.h / 2 - topClearance, o.w, o.h, {
						isStatic: true
					})
				);
			}

			Composite.add(world, boundaries);
		}

		function setupColumns() {
			const maxR = Math.max(...pieceKeys.map((c) => radii.get(c) ?? glyphPx / 2));
			const diameter = maxR * 2;
			const n = Math.max(3, Math.floor(cssW / (diameter * 0.9)));
			spawnColumns = Array.from({ length: n }, (_, i) => ({
				x: (i + 0.5) * (cssW / n),
				nextY: -diameter * 0.5
			}));
			nextColumn = 0;
		}

		function targetCount() {
			const avgR =
				pieceKeys.reduce((sum, c) => sum + (radii.get(c) ?? glyphPx / 2), 0) / pieceKeys.length;
			const avgArea = Math.PI * avgR * avgR;
			return Math.min(Math.ceil(((cssW * cssH) / avgArea) * fillDensity), MAX_TOTAL);
		}

		// Spawning many bodies per frame at pure-random X was the study's own
		// first bug: several landing inside one diameter-wide strip in a single
		// frame let Matter's overlap resolution shove them apart hard enough to
		// tunnel through the floor. Columns guarantee clear air around every new
		// body; each column remembers how high its own queue has grown.
		function spawnOne() {
			if (!Matter || !world) return;
			const { Bodies, Body, Composite } = Matter;
			const char = pieceKeys[Math.floor(Math.random() * pieceKeys.length)];
			const radius = radii.get(char) ?? glyphPx / 2;

			const col = spawnColumns[nextColumn % spawnColumns.length];
			nextColumn++;
			const x = col.x + (Math.random() - 0.5) * radius * 0.6;
			const y = col.nextY;
			col.nextY -= radius * 2 + 10 + Math.random() * 30;

			const body = Bodies.circle(x, y, radius, {
				restitution: RESTITUTION,
				friction: FRICTION,
				frictionAir: FRICTION_AIR,
				density: DENSITY
			});
			Body.setAngularVelocity(body, (Math.random() - 0.5) * 2 * SPAWN_ANGULAR_VEL);
			Composite.add(world, body);
			bodies.push({ body, char });
		}

		function clampVelocities() {
			if (!Matter) return;
			const { Body } = Matter;
			for (const { body } of bodies) {
				const { x, y } = body.velocity;
				const speed = Math.hypot(x, y);
				if (speed > MAX_SPEED) {
					const s = MAX_SPEED / speed;
					Body.setVelocity(body, { x: x * s, y: y * s });
				}
			}
		}

		function stepPhysics(delta: number) {
			if (!Matter || !engine || !world) return;
			const { Engine, Composite } = Matter;

			for (let i = 0; i < SPAWN_PER_FRAME && queueRemaining > 0; i++) {
				spawnOne();
				queueRemaining--;
			}

			// Substep: same simulated time, resolved in smaller increments, so a
			// compressed pile cannot build up enough single-step velocity to
			// tunnel through a wall.
			const step = delta / SUBSTEPS;
			for (let i = 0; i < SUBSTEPS; i++) Engine.update(engine, step);
			clampVelocities();

			for (let i = bodies.length - 1; i >= 0; i--) {
				if (bodies[i].body.position.y > cssH + DESPAWN_MARGIN) {
					Composite.remove(world, bodies[i].body);
					bodies.splice(i, 1);
				}
			}
		}

		/** How much of the top of the canvas to keep clear THIS frame — see
		 *  the file's own note on why this can't just be the constant
		 *  `topClearance` (2026-09, at the user's report of a white gap
		 *  between the typeface section and this one: "書体とCustomの間に
		 *  白の余白がある"). The header is fixed to the VIEWPORT's own top
		 *  ~52-72px band, not to this section's own top edge — while this
		 *  (ordinary, scrolling — not pinned) section is still entering from
		 *  below, its own y=0 sits well below the header on screen, so
		 *  nothing needs protecting there yet; reserving the full amount
		 *  regardless of scroll position is what painted a static white
		 *  strip that read as a seam between sections. Physics stays
		 *  completely untouched — only how much of the already-simulated
		 *  playfield gets clipped away changes, not the playfield itself. */
		function currentClearance() {
			const top = section.getBoundingClientRect().top;
			return Math.max(0, topClearance - Math.max(0, top));
		}

		function paint() {
			if (!ctx) return;
			const clip = currentClearance();
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			// clearRect, never an opaque repaint — the section paints its own
			// background and the canvas sits on top of it. Clears the FULL
			// canvas (cssH + topClearance), not just the physics playfield —
			// see topClearance's own comment above.
			ctx.clearRect(0, 0, cssW, cssH + topClearance);
			ctx.save();
			// A body can (and often does) sit slightly above physics-y=0 — the
			// off-screen cull below only excludes it once it clears a full
			// sprite height above that line, same margin the old code used
			// when the canvas itself physically ended there. Now that the
			// canvas extends into the header-clearance band too, that same
			// near-the-top jitter would otherwise paint directly into it —
			// clip it out so the band stays genuinely empty instead. `clip`
			// (not the constant `topClearance`) is what actually varies with
			// scroll — see currentClearance() above.
			ctx.beginPath();
			ctx.rect(0, clip, cssW, cssH + topClearance - clip);
			ctx.clip();
			ctx.fillStyle = color;
			for (const { body, char } of bodies) {
				const vec = vectors.get(char);
				const sprite = vec ? undefined : sprites.get(char);
				// How far off the playfield a piece has to be before it stops
				// being worth drawing — its own drawn extent, either way.
				const reach = vec ? Math.max(vec.w, vec.h) : sprite?.h;
				if (reach === undefined) continue;
				const { x, y } = body.position;
				if (y < -reach || y > cssH + reach) continue; // off-screen overflow
				ctx.save();
				// +topClearance shifts physics-space (0..cssH, floor at the
				// bottom) down into canvas-pixel-space (topClearance..full
				// height) — the clip above is what actually keeps the top
				// strip empty; this offset just repositions the playfield
				// within the taller canvas.
				ctx.translate(x, y + topClearance);
				ctx.rotate(body.angle);
				if (vec) {
					// Centre the INK on the body, then into the path's own
					// viewBox space: no intermediate bitmap, so this stays crisp
					// at any rotation and any devicePixelRatio.
					ctx.translate(-vec.w / 2, -vec.h / 2);
					ctx.scale(vec.scale, vec.scale);
					ctx.translate(-vec.ox, -vec.oy);
					ctx.fill(vec.path);
				} else if (sprite) {
					ctx.drawImage(sprite.bmp, -sprite.w / 2, -sprite.h / 2, sprite.w, sprite.h);
				}
				ctx.restore();
			}
			ctx.restore();
		}

		/** True once nothing is moving and nothing is left to pour. */
		function isSettled() {
			if (queueRemaining > 0) return false;
			for (const { body } of bodies) {
				if (Math.hypot(body.velocity.x, body.velocity.y) > 0.08) return false;
				if (Math.abs(body.angularVelocity) > 0.004) return false;
			}
			return bodies.length > 0;
		}

		function loop() {
			frame = 0;
			if (disposed || !onScreen || document.hidden) return;
			stepPhysics(1000 / 60);
			paint();
			// Stop once the pile has come to rest — this is decoration, and a
			// settled pile costs nothing to leave on screen.
			if (isSettled()) {
				settled = true;
				return;
			}
			frame = requestAnimationFrame(loop);
		}

		function start() {
			if (disposed || settled || frame || !armed) return;
			frame = requestAnimationFrame(loop);
		}

		// Called from the $effect below the moment `armed` flips true. Shapes
		// and walls are re-read first on purpose: a caller measuring live DOM
		// for either (the intro measures its own wordmark for both) would
		// otherwise have been read at init time, while that wordmark was still
		// mid-entrance. Nothing has spawned yet at this point — the queue is
		// still full — so re-deriving the radii and the count is free.
		arm = () => {
			if (disposed || !armed) return;
			measureGlyphs();
			createBoundaries();
			refill();
			start();
		};

		function resize() {
			// `section` (.GlyphFill) is now inset:0 — its rect IS the full
			// section height (100vh/100lvh), unlike before this was split
			// into a visual canvas and a physics playfield (see topClearance's
			// own comment above).
			const rect = section.getBoundingClientRect();
			const nextW = Math.round(rect.width);
			const nextFullH = Math.round(rect.height);
			// Same clamp(52px, 7vh, 72px) the old CSS `--glyph-top` encoded,
			// against this section's own height rather than the CSS `vh` unit
			// — equivalent since .Home__custom is exactly one viewport tall.
			const nextTopClearance = Math.round(Math.min(72, Math.max(52, nextFullH * 0.07)));
			const nextH = nextFullH - nextTopClearance;
			if (nextW === cssW && nextH === cssH && nextTopClearance === topClearance) return;
			const hadPile = bodies.length > 0;
			cssW = nextW;
			cssH = nextH;
			topClearance = nextTopClearance;
			// Capped at 2 read soft on modern phones (DPR 3 is common there) —
			// 2026-09, at the user's request ("CustomのCanvasの解像度が少し
			// SPで低く感じる"). 3 still bounds the backing-store size against
			// anything unusually high.
			dpr = Math.min(window.devicePixelRatio || 1, 3);
			canvas.width = Math.round(cssW * dpr);
			// Full section height, not just the physics playfield — this is
			// the part that makes the <canvas> element itself 100vh.
			canvas.height = Math.round(nextFullH * dpr);
			measureGlyphs();
			createBoundaries();
			// The walls move, but a pile packed for the old box does not: glyph
			// sizes, the body count and the spawn columns are all derived from the
			// canvas area, so after a real resize the only correct answer is to
			// pour again. (`settled` is cleared by refill(), which is what lets the
			// loop restart — without this the pile stays frozen at its old shape,
			// half off-screen.)
			if (hadPile) {
				refill();
				if (reduced) {
					for (let i = 0; i < REDUCED_MOTION_STEPS; i++) stepPhysics(1000 / 60);
				} else if (onScreen) {
					start();
				}
			}
			paint();
		}

		function refill() {
			if (!Matter || !world) return;
			const { Composite } = Matter;
			for (const { body } of bodies) Composite.remove(world, body);
			bodies = [];
			setupColumns();
			queueRemaining = targetCount();
			settled = false;
		}

		let io: IntersectionObserver | undefined;
		const onVisibility = () => {
			if (document.hidden) {
				if (frame) cancelAnimationFrame(frame);
				frame = 0;
			} else start();
		};
		const onResize = () => {
			resize();
		};

		(async () => {
			try {
				Matter = await loadMatter();
			} catch {
				return; // no physics: the section still reads as a plain black band
			}
			if (disposed) return;

			// Radii come from font metrics, so the real face has to be loaded
			// before anything is measured — otherwise the whole pile is sized
			// against the fallback and never re-measured.
			try {
				await document.fonts?.load(`${fontWeight} ${fontSize}px "${fontFamily}"`);
				await document.fonts?.ready;
			} catch {
				/* measuring against the fallback is survivable */
			}
			if (disposed) return;

			engine = Matter.Engine.create({ positionIterations: 10, velocityIterations: 8 });
			world = engine.world;
			world.gravity.y = GRAVITY_Y;

			resize();
			refill();

			// Registered for every path, including reduced motion — resize() is
			// what keeps the pile matching the box, and a reduced-motion reader
			// resizing their window should not be left with a stale one.
			window.addEventListener('resize', onResize, { passive: true });

			// Re-clip on every scroll tick, independent of the physics loop and
			// registered for every path (including reduced motion, which never
			// starts one) — see currentClearance()'s own comment. The loop
			// stops once the pile settles (by design, a settled pile costs
			// nothing to leave on screen), but the CLIP still needs to keep
			// tracking the section's own position on screen even after that,
			// or scrolling this section back through the header's band later
			// would show the same stale gap again. A loose proximity check
			// (not the IntersectionObserver's own onScreen, which reduced
			// motion never sets) — cheap, and skips the redraw for scrolls
			// happening nowhere near this section.
			let scrollFrame = 0;
			offRepaintScroll = onScroll(() => {
				if (scrollFrame) return;
				scrollFrame = requestAnimationFrame(() => {
					scrollFrame = 0;
					if (disposed) return;
					const rect = section.getBoundingClientRect();
					if (rect.top < window.innerHeight + 200 && rect.bottom > -200) paint();
				});
			});

			if (reduced) {
				// No animation at all: settle it headlessly, then paint the
				// result once. base.css's reduced-motion blanket only zeroes CSS
				// durations — a JS physics loop has to opt out by hand.
				for (let i = 0; i < REDUCED_MOTION_STEPS; i++) stepPhysics(1000 / 60);
				paint();
				return;
			}

			// Pour when the section actually comes into view, not on mount.
			io = new IntersectionObserver(
				([entry]) => {
					onScreen = entry.isIntersecting;
					if (onScreen) start();
					else if (frame) {
						cancelAnimationFrame(frame);
						frame = 0;
					}
				},
				{ threshold: 0 }
			);
			io.observe(section);

			document.addEventListener('visibilitychange', onVisibility);
		})();

		return () => {
			disposed = true;
			arm = undefined;
			if (frame) cancelAnimationFrame(frame);
			io?.disconnect();
			document.removeEventListener('visibilitychange', onVisibility);
			window.removeEventListener('resize', onResize);
			offRepaintScroll?.();
			if (Matter && engine) {
				Matter.World.clear(engine.world, false);
				Matter.Engine.clear(engine);
			}
			bodies = [];
			sprites.clear();
			vectors.clear();
		};
	});
</script>

<div class="GlyphFill" bind:this={sectionEl} aria-hidden="true">
	<canvas class="GlyphFill__canvas" bind:this={canvasEl}></canvas>
</div>

<style>
	/* Full section height now (2026-09, "OGUSTスタックのcanvasもしっかり
	   100vhにして") — was inset from the top by --glyph-top to hold the pile
	   clear of the fixed Header's own band (it paints itself solid black
	   over this section — see headerSolid.svelte.ts — and a black glyph
	   directly behind that would swallow it). That clearance is now kept as
	   a paint-time offset inside GlyphFill's own script (topClearance) rather
	   than a CSS crop, so the <canvas> element itself is genuinely 100vh
	   while the pile still can't reach behind the header. */
	.GlyphFill {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
	}

	/* base.css's `img, picture, svg, video` display:block reset does NOT
	   include canvas — left inline it picks up a baseline gap at the bottom of
	   a supposedly full-bleed section. */
	.GlyphFill__canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
