// The whole of Sojourn's browser JavaScript. The carousels, the lightbox, the
// drawer, the collapsible rows, the sticky header, the ticker and the scroll
// reveals are Magic Spells web components, vendored under ./vendor (see
// vendor/VERSIONS.md); importing them registers the elements. This file adds
// the small behaviours they do not cover.
//
// State lives on data- and aria- attributes, never on classes: Tailwind
// generates only what it reads in .pzl and styles/ files.

import './vendor/dialog-panel.js';
import './vendor/collapsible-content.js';
import './vendor/lightbox.min.js';
import './vendor/progress-bar.esm.js';
import './vendor/scrolling-content.js';
import './vendor/sticky-header.js';
import './vendor/tarot.esm.js';
import Reveal from './vendor/reveal.js';
import './vendor/split-text.esm.js';

const DISMISSED_PREFIX = 'sites:dismissed:';

interface Carousel extends HTMLElement {
	on(event: string, listener: () => void): void;
}

/** localStorage is unavailable in some privacy modes; both sides of the
 * remembering are guarded. */
function dismissed(key: string): boolean {
	try {
		return localStorage.getItem(DISMISSED_PREFIX + key) === '1';
	} catch {
		return false;
	}
}

function remember(key: string): void {
	try {
		localStorage.setItem(DISMISSED_PREFIX + key, '1');
	} catch {
		/* it simply returns next visit */
	}
}

function closest(event: Event, selector: string): HTMLElement | null {
	return ((event.target as Element | null)?.closest?.(selector) as HTMLElement | null) ?? null;
}

// The hamburger opens the mobile menu; focus goes back to it on close.
document.addEventListener('click', (event) => {
	const opener = closest(event, '[data-panel-open]');
	const panel = opener && (document.getElementById(opener.getAttribute('data-panel-open') ?? '') as (HTMLElement & { show(trigger: Element): void }) | null);
	if (!opener || !panel?.show) return;
	panel.show(opener);
});

// The cookie notice shows once per visitor and key; either button hides it
// for good.
for (const notice of document.querySelectorAll<HTMLElement>('[data-notice]')) {
	const key = notice.getAttribute('data-notice') || notice.id;
	if (dismissed(key)) continue;
	notice.hidden = false;
	for (const button of notice.querySelectorAll('button')) {
		button.addEventListener('click', () => {
			remember(key);
			notice.hidden = true;
		});
	}
}

// An announcement with a key hides for good once its × is pressed.
for (const bar of document.querySelectorAll<HTMLElement>('[data-dismiss-key]')) {
	const key = bar.getAttribute('data-dismiss-key') ?? '';
	if (key && dismissed(key)) {
		bar.setAttribute('data-dismissed', '');
		continue;
	}
	bar.querySelector('[data-dismiss]')?.addEventListener('click', () => {
		bar.setAttribute('data-dismissed', '');
		if (key) remember(key);
	});
}

// The ticker's pause button (WCAG 2.2.2) sets the marquee's own paused
// attribute.
document.addEventListener('click', (event) => {
	const button = closest(event, '[data-ticker-toggle]');
	if (!button) return;
	const paused = button.getAttribute('aria-pressed') !== 'true';
	button.setAttribute('aria-pressed', String(paused));
	button.closest('[data-ticker]')?.querySelector('scrolling-content')?.toggleAttribute('paused', paused);
});

// Grid tiles open the lightbox of a hidden companion carousel
// holding the same photographs (the plugin opens from a slide and has no
// public open(index)). Focus goes back to the tile when it closes.
const tileFor = new Map<Element, HTMLElement>();
document.addEventListener('click', (event) => {
	const tile = closest(event, '[data-lightbox-open]');
	if (!tile) return;
	const carousel = document.getElementById(tile.getAttribute('data-lightbox-open') ?? '') as Carousel | null;
	const slide = carousel?.querySelectorAll<HTMLElement>('tarot-slide')[Number(tile.getAttribute('data-index'))];
	if (!carousel || !slide) return;
	if (!tileFor.has(carousel)) carousel.on('lightbox:closed', () => tileFor.get(carousel)?.focus());
	tileFor.set(carousel, tile);
	(slide.querySelector('img') ?? slide).click();
});

// Parallax: a [data-parallax] layer drifts against its frame by its depth
// (a share of the frame's distance from the middle of the viewport), only
// while the frame is on screen and never under reduced motion. The frame is
// measured, not the layer, so the drift never feeds back into itself.
const layers = document.querySelectorAll<HTMLElement>('[data-parallax]');
if (layers.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
	const live = new Set<HTMLElement>();
	let frame = 0;
	const move = () => {
		frame = 0;
		for (const layer of live) {
			const box = layer.parentElement!.getBoundingClientRect();
			const drift = (innerHeight / 2 - box.top - box.height / 2) * Number(layer.dataset.parallax || 0.1);
			layer.style.translate = `0 ${drift.toFixed(1)}px`;
		}
	};
	const watch = new IntersectionObserver((entries) => {
		for (const entry of entries) live[entry.isIntersecting ? 'add' : 'delete'](entry.target as HTMLElement);
		move();
	});
	for (const layer of layers) watch.observe(layer);
	addEventListener('scroll', () => (frame ||= requestAnimationFrame(move)), { passive: true });
}

// Scroll reveals on cards and photos only. They write `reveal reveal-fade-up`
// only while the Brand setting is on.
if (document.querySelector('.reveal')) Reveal.init({ offset: 0, duration: 400, once: true });
