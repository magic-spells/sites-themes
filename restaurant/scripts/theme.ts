// The whole of Restaurant's browser JavaScript. The carousels, the lightbox,
// the sheets, the Menu dropdown, the select lists, the faq rows, the sticky
// header and the scroll reveals are Magic Spells web components, vendored
// under ./vendor (see vendor/VERSIONS.md); importing them registers the
// elements. This file adds the small behaviours they do not cover.
//
// State lives on data- and aria- attributes, never on classes: Tailwind
// generates only what it reads in .pzl and styles/ files, so the stylesheet
// reacts to attributes the script sets.

import './vendor/dialog-panel.js';
import './vendor/bottom-sheet.js';
import './vendor/collapsible-content.js';
import './vendor/dropdown-panel.js';
import './vendor/lazy-load.esm.js';
import './vendor/lightbox.min.js';
import './vendor/scrollbar.esm.js';
import './vendor/select-dropdown.js';
import './vendor/sticky-header.js';
import './vendor/tab-group.js';
import './vendor/tarot.esm.js';
import Reveal from './vendor/reveal.js';

const DISMISSED_PREFIX = 'sites:dismissed:';

interface Panel extends HTMLElement {
	show(trigger?: Element): unknown;
	hide(): unknown;
}

interface Carousel extends HTMLElement {
	whenReady(): Promise<void>;
	on(event: string, listener: () => void): void;
	updateOptions(options: object): void;
	goToSlide(index: number): void;
	index: number;
}

interface Dropdown extends HTMLElement {
	hide(): void;
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

function remember(key: string): void {
	try {
		localStorage.setItem(DISMISSED_PREFIX + key, '1');
	} catch {
		/* nothing to do: it simply returns next visit */
	}
}

function closest(event: Event, selector: string): HTMLElement | null {
	return ((event.target as Element | null)?.closest?.(selector) as HTMLElement | null) ?? null;
}

/** Runs once the carousel with this id has upgraded and laid out. */
function withCarousel(id: string | null, run: (carousel: Carousel) => void): void {
	const carousel = id ? (document.getElementById(id) as Carousel | null) : null;
	if (!carousel) return;
	customElements.whenDefined('tarot-carousel').then(() => carousel.whenReady().then(() => run(carousel)));
}

// A button or link names the sheet it opens: the mobile menu, or the booking
// form behind every Book a table. A link keeps its href for a page without
// JavaScript. A sheet opened from inside another closes that one first and
// returns focus to the header's menu button. The sheet hands focus back on
// Escape and on its close button; a tap on the backdrop closes it without a
// trigger, so focus is put back here when it would otherwise fall to <body>.
document.addEventListener('click', (event) => {
	const opener = closest(event, '[data-panel-open]');
	if (!opener) return;
	const panel = document.getElementById(opener.getAttribute('data-panel-open') ?? '') as Panel | null;
	if (!panel || typeof panel.show !== 'function') return;
	event.preventDefault();
	const outer = opener.closest('dialog-panel') as Panel | null;
	const trigger = outer ? (document.querySelector<HTMLElement>('[data-panel-open="mobile-menu"]') ?? opener) : opener;
	outer?.hide();
	panel.show(trigger);
	(panel.closest('dialog-panel') ?? panel).addEventListener(
		'hidden',
		() => {
			if (document.activeElement === document.body || !document.activeElement) trigger.focus();
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

// An announcement with a key hides for good once its × is pressed. Changing
// the key in the editor brings it back.
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

// One dim lies over the page under the header while any dropdown is open.
// It keys off "any panel open", so a hand-over from one trigger to the next
// keeps it up. A click on the dim closes whatever is open.
const dim = document.querySelector<HTMLElement>('[data-page-dim]');
if (dim) {
	const sync = () => dim.toggleAttribute('data-open', !!document.querySelector('dropdown-component[visible]'));
	document.addEventListener('dropdown-panel:show', sync);
	document.addEventListener('dropdown-panel:hide', () => queueMicrotask(sync));
	dim.addEventListener('click', () => {
		for (const open of document.querySelectorAll<Dropdown>('dropdown-component[visible]')) open.hide();
	});
}

// A counter, "02 / 04", follows the slide its carousel shows (tarot's
// render index: the selected index does not move on navigation).
for (const counter of document.querySelectorAll<HTMLElement>('[data-counter-for]')) {
	withCarousel(counter.getAttribute('data-counter-for'), (carousel) => {
		const current = counter.querySelector('[data-counter-index]');
		const total = carousel.querySelectorAll('tarot-slide').length || 1;
		carousel.on('render-index:changed', () => {
			if (current) current.textContent = String((((carousel.index % total) + total) % total) + 1).padStart(2, '0');
		});
	});
}

// The specials docket: each row shows its dish's photograph, and the row of
// the photograph on show is aria-current, whichever way the slide changed.
for (const list of document.querySelectorAll<HTMLElement>('[data-slides-for]')) {
	withCarousel(list.getAttribute('data-slides-for'), (carousel) => {
		const rows = [...list.querySelectorAll<HTMLElement>('[data-slide-to]')];
		const mark = () => {
			for (const [i, row] of rows.entries()) row.setAttribute('aria-current', String(i === carousel.index));
		};
		carousel.on('render-index:changed', mark);
		mark();
		for (const [i, row] of rows.entries()) row.addEventListener('click', () => carousel.goToSlide(i));
	});
}

// Dish tabs: one carousel, a chip per category. A chip shows only that
// category's slides (tarot's filterClass) and snaps back to the first; All
// shows them all again. The pressed chip carries aria-pressed.
document.addEventListener('click', (event) => {
	const chip = closest(event, '[data-filter]');
	const group = chip?.closest<HTMLElement>('[data-filter-for]');
	if (!chip || !group) return;
	for (const other of group.querySelectorAll('[data-filter]')) other.setAttribute('aria-pressed', String(other === chip));
	withCarousel(group.getAttribute('data-filter-for'), (carousel) => {
		carousel.updateOptions({ filterClass: chip.getAttribute('data-filter') ?? '' });
		carousel.goToSlide(0);
	});
});

// Grid tiles open the lightbox of a visually hidden companion carousel
// holding the same photographs: the plugin opens from a slide click and has
// no public open(index), so the tile clicks the companion's slide. When the
// lightbox closes, focus goes back to the tile it was opened from.
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

// The hero slideshow's pause button. Tarot has no play or pause call, so the
// button sets the autoplay interval: zero stops it, the section's interval
// starts it again.
document.addEventListener('click', (event) => {
	const button = closest(event, '[data-autoplay-toggle]');
	if (!button) return;
	const paused = button.getAttribute('aria-pressed') !== 'true';
	button.setAttribute('aria-pressed', String(paused));
	withCarousel(button.getAttribute('data-autoplay-toggle'), (carousel) => {
		carousel.updateOptions({ autoplay: { interval: paused ? 0 : Number(button.getAttribute('data-interval')) } });
	});
});

// The menu's category rail marks the category being read: the group that
// crosses the middle of the screen.
for (const rail of document.querySelectorAll<HTMLElement>('[data-rail]')) {
	const links = [...rail.querySelectorAll<HTMLAnchorElement>('a[href*="#"]')];
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				for (const link of links) link.setAttribute('aria-current', String(link.hash === '#' + entry.target.id));
			}
		},
		{ rootMargin: '-50% 0px -50% 0px' },
	);
	for (const link of links) {
		const group = document.getElementById(decodeURIComponent(link.hash.slice(1)));
		if (group) observer.observe(group);
	}
}

// Scroll reveals on dish and event cards. The cards write `reveal
// reveal-fade-up` only while the Brand setting is on, so with it off there is
// nothing to arm. Reduced motion is handled by the library; the layout's
// reveal-off class and load watchdog cover a script that never runs.
if (document.querySelector('.reveal')) Reveal.init({ offset: 0, duration: 400, once: true });
