// The whole of Darkroom's browser JavaScript. The carousels, the lightbox,
// the mobile menu's sheet, the Work dropdown, the contact Subject list and the
// faq rows are Magic Spells web components, vendored under ./vendor (see
// vendor/VERSIONS.md); importing them registers the elements. This file adds
// the small behaviours they do not cover.
//
// State lives on data- attributes, never on classes: Tailwind generates only
// what it reads in .pzl and styles/ files, so the stylesheet reacts to
// attributes the script sets.

import './vendor/dialog-panel.js';
import './vendor/bottom-sheet.js';
import './vendor/collapsible-content.js';
import './vendor/dropdown-panel.js';
import './vendor/lazy-load.esm.js';
import './vendor/lightbox.min.js';
import './vendor/scrollbar.esm.js';
import './vendor/select-dropdown.js';
import './vendor/tarot.esm.js';

const DISMISSED_PREFIX = 'sites:dismissed:';
const VIEW_KEY = 'sites:series-view';

interface Panel extends HTMLElement {
	show(trigger?: Element): unknown;
}

interface Carousel extends HTMLElement {
	whenReady(): Promise<void>;
	on(event: string, listener: () => void): void;
	index: number;
}

/** localStorage is unavailable in some privacy modes; nothing here is worth
 * an exception, so both sides of the remembering are guarded. */
function dismissed(key: string): boolean {
	try {
		return localStorage.getItem(DISMISSED_PREFIX + key) === '1';
	} catch {
		return false;
	}
}

function remember(key: string, value = '1', prefix = DISMISSED_PREFIX): void {
	try {
		localStorage.setItem(prefix + key, value);
	} catch {
		/* nothing to do: it simply returns next visit */
	}
}

// A button names the panel it opens: the mobile menu's <bottom-sheet>. The
// sheet hands focus back to it on Escape and on its close button; a tap on
// the backdrop closes it without a trigger, so focus is put back here when it
// would otherwise fall to <body>.
document.addEventListener('click', (event) => {
	const opener = (event.target as Element | null)?.closest?.('[data-panel-open]') as HTMLElement | null;
	if (!opener) return;
	const panel = document.getElementById(opener.getAttribute('data-panel-open') ?? '') as Panel | null;
	if (!panel || typeof panel.show !== 'function') return;
	event.preventDefault();
	panel.show(opener);
	(panel.closest('dialog-panel') ?? panel).addEventListener(
		'hidden',
		() => {
			if (document.activeElement === document.body || !document.activeElement) opener.focus();
		},
		{ once: true },
	);
});

// The notice is a plain region that renders hidden. It shows once per
// visitor and key, without taking focus or scroll from the page; both of its
// buttons hide it, and either choice is remembered.
for (const notice of document.querySelectorAll<HTMLElement>('[data-notice]')) {
	const key = notice.getAttribute('data-notice') || notice.id;
	if (dismissed(key)) continue;
	notice.hidden = false;
	for (const button of notice.querySelectorAll('[data-notice-close]')) {
		button.addEventListener('click', () => {
			remember(key);
			notice.hidden = true;
		});
	}
}

// A series index with the switch renders both views and shows the one its
// data-view names. The reader's last choice is remembered for every index
// that offers the switch: the layout's pre-paint script copies it onto <html>
// as data-series-view before the body paints, and the view variants in
// theme.css key off that. Without JavaScript the editor's layout shows and
// the switch stays hidden.
function showView(view: string): void {
	document.documentElement.setAttribute('data-series-view', view);
	for (const index of document.querySelectorAll('[data-view]')) {
		if (!index.querySelector('[data-view-set]')) continue;
		index.setAttribute('data-view', view);
		for (const button of index.querySelectorAll('[data-view-set]')) {
			button.setAttribute('aria-pressed', String(button.getAttribute('data-view-set') === view));
		}
	}
}

const savedView = document.documentElement.getAttribute('data-series-view');
if (savedView === 'list' || savedView === 'grid') showView(savedView);
for (const group of document.querySelectorAll<HTMLElement>('[data-view-switch]')) group.hidden = false;

document.addEventListener('click', (event) => {
	const button = (event.target as Element | null)?.closest?.('[data-view-set]');
	const view = button?.getAttribute('data-view-set');
	if (!button?.closest('[data-view]') || (view !== 'list' && view !== 'grid')) return;
	showView(view);
	remember(VIEW_KEY, view, '');
});

// A counter beside a carousel, "04 / 18", follows the slide the carousel
// shows. The carousel names its counters by id.
customElements.whenDefined('tarot-carousel').then(() => {
	for (const counter of document.querySelectorAll<HTMLElement>('[data-counter-for]')) {
		const carousel = document.getElementById(counter.getAttribute('data-counter-for') ?? '') as Carousel | null;
		const current = counter.querySelector('[data-counter-index]');
		if (!carousel || !current) continue;
		const total = carousel.querySelectorAll('tarot-slide').length || 1;
		carousel.whenReady().then(() => {
			carousel.on('render-index:changed', () => {
				current.textContent = String((((carousel.index % total) + total) % total) + 1).padStart(2, '0');
			});
		});
	}
});

// Grid and masonry tiles open the lightbox of a visually hidden companion
// carousel holding the same photographs. The plugin opens from a slide click
// and has no public open(index) yet, so the tile clicks the companion's slide;
// the hidden slide gives the plugin nothing to fly from, so it fades in.
document.addEventListener('click', (event) => {
	const tile = (event.target as Element | null)?.closest?.('[data-lightbox-open]');
	if (!tile) return;
	const carousel = document.getElementById(tile.getAttribute('data-lightbox-open') ?? '');
	const index = tile.getAttribute('data-index');
	const slide = carousel?.querySelector<HTMLElement>(`tarot-slide[index="${index}"]`);
	(slide?.querySelector('img') ?? slide)?.click();
});

// Arrows that live inside a slide (the testimonials' controls, which fade
// with their slide) step the carousel around them.
document.addEventListener('click', (event) => {
	const button = (event.target as Element | null)?.closest?.('[data-carousel-step]');
	const carousel = button?.closest('tarot-carousel') as (HTMLElement & { next(): void; previous(): void }) | null;
	if (!button || !carousel) return;
	if (button.getAttribute('data-carousel-step') === 'next') carousel.next();
	else carousel.previous();
});
