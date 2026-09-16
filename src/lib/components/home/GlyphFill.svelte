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
	}
	let {
		characters = ['O', 'G', 'A', 'S', 'T'],
		color = '#0d0d0d',
		fontFamily = 'Norma',
		fontWeight = 850,
		fontSize = 190,
		fillDensity = 3.2
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
		let radii = new Map<string, number>();
		let cssW = 0;
		let cssH = 0;
		let dpr = 1;
		let glyphPx = fontSize;

		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		function measureGlyphs() {
			if (!ctx) return;
			// Phones get a smaller pour — the body count scales as area/r², so a
			// fixed 190px glyph on a 375pt screen would be a handful of boulders.
			glyphPx = cssW < 768 ? Math.max(90, Math.round(fontSize * 0.58)) : fontSize;
			ctx.font = `${fontWeight} ${glyphPx}px "${fontFamily}", sans-serif`;
			radii.clear();
			sprites.clear();
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
			Composite.add(world, boundaries);
		}

		function setupColumns() {
			const maxR = Math.max(...characters.map((c) => radii.get(c) ?? glyphPx / 2));
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
				characters.reduce((sum, c) => sum + (radii.get(c) ?? glyphPx / 2), 0) / characters.length;
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
			const char = characters[Math.floor(Math.random() * characters.length)];
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

		function paint() {
			if (!ctx) return;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			// clearRect, never an opaque repaint — the section paints its own
			// background and the canvas sits on top of it.
			ctx.clearRect(0, 0, cssW, cssH);
			for (const { body, char } of bodies) {
				const sprite = sprites.get(char);
				if (!sprite) continue;
				const { x, y } = body.position;
				if (y < -sprite.h || y > cssH + sprite.h) continue; // off-screen overflow
				ctx.save();
				ctx.translate(x, y);
				ctx.rotate(body.angle);
				ctx.drawImage(sprite.bmp, -sprite.w / 2, -sprite.h / 2, sprite.w, sprite.h);
				ctx.restore();
			}
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
			if (disposed || settled || frame) return;
			frame = requestAnimationFrame(loop);
		}

		function resize() {
			const rect = section.getBoundingClientRect();
			const nextW = Math.round(rect.width);
			const nextH = Math.round(rect.height);
			if (nextW === cssW && nextH === cssH) return;
			const hadPile = bodies.length > 0;
			cssW = nextW;
			cssH = nextH;
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = Math.round(cssW * dpr);
			canvas.height = Math.round(cssH * dpr);
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
			if (frame) cancelAnimationFrame(frame);
			io?.disconnect();
			document.removeEventListener('visibilitychange', onVisibility);
			window.removeEventListener('resize', onResize);
			if (Matter && engine) {
				Matter.World.clear(engine.world, false);
				Matter.Engine.clear(engine);
			}
			bodies = [];
			sprites.clear();
		};
	});
</script>

<div class="GlyphFill" bind:this={sectionEl} aria-hidden="true">
	<canvas class="GlyphFill__canvas" bind:this={canvasEl}></canvas>
</div>

<style>
	/* --glyph-top lets the host section hold the pile clear of the fixed
	   Header's own band. The header is transparent by design and paints itself
	   solid over this section (see headerSolid.svelte.ts), so without the inset
	   a black glyph can sit directly under black header text and swallow it. */
	.GlyphFill {
		position: absolute;
		inset: var(--glyph-top, 0px) 0 0 0;
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
