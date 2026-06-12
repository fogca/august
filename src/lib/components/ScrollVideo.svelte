<script lang="ts">
	// Scroll-driven, viewport-pinned video.
	//
	// The outer wrapper reserves the scroll runway (100vh + scrollDistance);
	// the stage is `position: sticky` so it holds at the viewport top while the
	// wrapper scrolls past, then releases naturally. Scroll progress 0→1 across
	// that runway is mapped to video.currentTime — scrolling up rewinds, scroll
	// speed = play speed.
	import { onMount } from 'svelte';
	import { onScroll } from '$lib/scroll';

	interface Props {
		src: string;
		scrollDistance?: number;
		poster?: string;
		label?: string;
		fit?: 'cover' | 'contain';
		background?: string;
	}

	let {
		src,
		scrollDistance = 2400,
		poster,
		label = 'Steiner scroll specimen',
		fit = 'cover',
		background = '#000'
	}: Props = $props();

	let outer: HTMLDivElement;
	let video: HTMLVideoElement;

	onMount(() => {
		// Reduced motion: skip the scrub, just play the video once.
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			video?.play().catch(() => {
				/* autoplay blocked — poster remains */
			});
			return;
		}

		let rafId = 0;

		const update = () => {
			if (!outer || !video || !video.duration) return;
			const range = outer.offsetHeight - window.innerHeight;
			if (range <= 0) return;
			const progress = Math.min(1, Math.max(0, -outer.getBoundingClientRect().top / range));
			const t = video.duration * progress;
			if (Math.abs(video.currentTime - t) > 0.01) video.currentTime = t;
		};

		const requestUpdate = () => {
			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame(update);
		};

		const onMetadata = () => update();
		if (video.readyState >= 1 && isFinite(video.duration) && video.duration > 0) {
			update();
		} else {
			video.addEventListener('loadedmetadata', onMetadata, { once: true });
		}

		const offScroll = onScroll(requestUpdate);
		window.addEventListener('resize', requestUpdate);
		requestUpdate();

		return () => {
			cancelAnimationFrame(rafId);
			offScroll();
			window.removeEventListener('resize', requestUpdate);
			video?.removeEventListener('loadedmetadata', onMetadata);
		};
	});
</script>

<div
	class="ScrollVideo"
	class:is-contain={fit === 'contain'}
	bind:this={outer}
	style="height: calc(100vh + {scrollDistance}px); --scroll-video-bg: {background};"
>
	<div class="ScrollVideo__stage">
		<video
			bind:this={video}
			{src}
			{poster}
			aria-label={label}
			muted
			playsinline
			preload="auto"
			disablepictureinpicture
		></video>
	</div>
</div>

<style>
	/* No `overflow: hidden` here — it would make this element the sticky
	   containment box and unpin the stage. */
	.ScrollVideo {
		position: relative;
		width: 100%;
		background: var(--scroll-video-bg, #000);
	}

	.ScrollVideo__stage {
		position: sticky;
		top: 0;
		width: 100%;
		height: 100vh;
		height: 100dvh;
	}

	.ScrollVideo__stage video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.ScrollVideo.is-contain .ScrollVideo__stage video {
		object-fit: contain;
	}
</style>
