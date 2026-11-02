// The whole of Nomad's browser JavaScript. The one-up gallery carousel, the
// lightbox, the drawers, the Places and country dropdowns, the select lists,
// the faq rows, the sticky header and the scroll reveals are Magic Spells web
// components, vendored under ./vendor (see vendor/VERSIONS.md); importing
// them registers the elements. This file adds the small behaviours they do
// not cover: the video loops, the photo strips' arrows, the country filter,
// the hover photographs, the topic filter and the list/grid switch.
//
// State lives on data- and aria- attributes, never on classes: Tailwind
// generates only what it reads in .pzl and styles/ files, so the stylesheet
// reacts to attributes the script sets.

import './vendor/dialog-panel.js';
import './vendor/collapsible-content.js';
import './vendor/dropdown-panel.js';
import './vendor/lightbox.min.js';
import './vendor/select-dropdown.js';
import './vendor/sticky-header.js';
import './vendor/tarot.esm.js';
import Reveal from './vendor/reveal.js';

const DISMISSED_PREFIX = 'sites:dismissed:';
const VIEW_KEY = 'sites:post-list-view';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

interface Panel extends HTMLElement {
	show(trigger?: Element): unknown;
	hide(): unknown;
}

interface Carousel extends HTMLElement {
	whenReady(): Promise<void>;
	on(event: string, listener: () => void): void;
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

/** The section (or other wrapper) a control belongs to. */
function scopeOf(element: Element): Element {
	return element.closest('section') ?? document.body;
}

/** Runs once the carousel with this id has upgraded and laid out. */
function withCarousel(id: string | null, run: (carousel: Carousel) => void): void {
	const carousel = id ? (document.getElementById(id) as Carousel | null) : null;
	if (!carousel) return;
	customElements.whenDefined('tarot-carousel').then(() => carousel.whenReady().then(() => run(carousel)));
}

// A button or link names the drawer it opens: the mobile menu, or a post's
// locator map. A link keeps its href for a page without JavaScript. The
// drawer hands focus back on Escape and on its close button; a tap on the
// backdrop closes it without a trigger, so focus is put back here when it
// would otherwise fall to <body>.
document.addEventListener('click', (event) => {
	const opener = closest(event, '[data-panel-open]');
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
// visitor and key, without taking focus or scroll from the page; its buttons
// hide it, and the choice is remembered.
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

// Strip and grid photographs open the lightbox of a visually hidden
// companion carousel holding the same items: the plugin opens from a slide
// click and has no public open(index), so the tile clicks the companion's
// slide. When the lightbox closes, focus goes back to the tile.
const tileFor = new Map<Element, HTMLElement>();
document.addEventListener('click', (event) => {
	const tile = closest(event, '[data-lightbox-open]');
	if (!tile) return;
	const carousel = document.getElementById(tile.getAttribute('data-lightbox-open') ?? '') as Carousel | null;
	const slide = carousel?.querySelectorAll<HTMLElement>('tarot-slide')[Number(tile.getAttribute('data-index'))];
	if (!carousel || !slide) return;
	if (!tileFor.has(carousel)) carousel.on('lightbox:closed', () => tileFor.get(carousel)?.focus());
	tileFor.set(carousel, tile);
	(slide.querySelector('img, video') ?? slide).dispatchEvent(new MouseEvent('click', { bubbles: true }));
});

// The photo strips are CSS scroll-snap rows (their slides keep each
// photograph's own width, which tarot cannot). The arrows scroll the strip
// they name by most of its visible width, and disable at either end.
for (const strip of document.querySelectorAll<HTMLElement>('[data-strip]')) {
	const prev = document.querySelector<HTMLButtonElement>(`[data-strip-prev="${strip.id}"]`);
	const next = document.querySelector<HTMLButtonElement>(`[data-strip-next="${strip.id}"]`);
	const sync = () => {
		if (prev) prev.disabled = strip.scrollLeft <= 1;
		if (next) next.disabled = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 1;
	};
	const step = (direction: number) => {
		strip.scrollBy({ left: direction * strip.clientWidth * 0.8, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
	};
	prev?.addEventListener('click', () => step(-1));
	next?.addEventListener('click', () => step(1));
	strip.addEventListener('scroll', sync, { passive: true });
	window.addEventListener('resize', sync);
	sync();
}

// Video loops: muted, started only in view and never under reduced motion,
// paused again off-screen. The markup carries a poster, so with reduced
// motion or no JavaScript the still shows. A loop the reader paused stays
// paused.
const loops = [...document.querySelectorAll<HTMLVideoElement>('video[data-loop]')];
const pausedByReader = new WeakSet<HTMLVideoElement>();
if (loops.length) {
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const video = entry.target as HTMLVideoElement;
				if (entry.isIntersecting && !reducedMotion.matches && !pausedByReader.has(video)) {
					video.play().catch(() => {});
				} else if (!entry.isIntersecting) {
					video.pause();
				}
			}
		},
		{ threshold: 0.25 },
	);
	for (const video of loops) {
		if (reducedMotion.matches) {
			video.removeAttribute('autoplay');
			for (const toggle of scopeOf(video).querySelectorAll<HTMLElement>('[data-loop-toggle]')) toggle.hidden = true;
		}
		video.preload = 'metadata';
		observer.observe(video);
	}
}

// The loop's pause control: pressed means paused. The label swaps between
// the two words the markup carries.
document.addEventListener('click', (event) => {
	const toggle = closest(event, '[data-loop-toggle]');
	if (!toggle) return;
	const video = scopeOf(toggle).querySelector<HTMLVideoElement>('video[data-loop]');
	if (!video) return;
	const label = toggle.querySelector('[data-loop-label]');
	if (label && !toggle.hasAttribute('data-pause-label')) toggle.setAttribute('data-pause-label', label.textContent ?? '');
	const pause = toggle.getAttribute('aria-pressed') !== 'true';
	toggle.setAttribute('aria-pressed', String(pause));
	if (label) label.textContent = toggle.getAttribute(pause ? 'data-play-label' : 'data-pause-label') ?? '';
	if (pause) {
		pausedByReader.add(video);
		video.pause();
	} else {
		pausedByReader.delete(video);
		video.play().catch(() => {});
	}
});

// "Watch with sound" unmutes the loop in place, from the start, with its
// controls; the pause control has nothing left to do.
document.addEventListener('click', (event) => {
	const button = closest(event, '[data-loop-sound]');
	if (!button) return;
	const video = scopeOf(button).querySelector<HTMLVideoElement>('video[data-loop]');
	if (!video) return;
	pausedByReader.delete(video);
	video.muted = false;
	video.controls = true;
	video.currentTime = 0;
	video.play().catch(() => {});
	button.parentElement?.setAttribute('hidden', '');
	video.focus();
});

// The film player: the poster's play button shows the video with its
// controls and starts it, with sound.
document.addEventListener('click', (event) => {
	const button = closest(event, '[data-player-start]');
	if (!button) return;
	const video = scopeOf(button).querySelector<HTMLVideoElement>('video[data-player]');
	if (!video) return;
	video.hidden = false;
	video.controls = true;
	button.hidden = true;
	video.play().catch(() => {});
	video.focus();
});

// The country filter: a choice in a [data-country-scope] hides that scope's
// rows, pins and country groups for every other country, names the choice on
// the trigger and marks it current. The empty choice shows them all again.
document.addEventListener('click', (event) => {
	const choice = closest(event, '[data-country-set]');
	const scope = choice?.closest<HTMLElement>('[data-country-scope]');
	if (!choice || !scope) return;
	const country = choice.getAttribute('data-country-set') ?? '';
	for (const item of scope.querySelectorAll<HTMLElement>('[data-country]')) {
		item.hidden = country !== '' && item.getAttribute('data-country') !== country;
	}
	for (const other of scope.querySelectorAll('[data-country-set]')) {
		other.setAttribute('aria-current', String(other === choice));
	}
	const label = scope.querySelector('[data-country-label]');
	if (label) label.textContent = choice.firstChild?.textContent?.trim() || choice.textContent?.trim() || '';
	(choice.closest('dropdown-component') as Dropdown | null)?.hide?.();
});

// A place row and its pin light each other while either is under the
// pointer or focused.
function markPlace(scope: Element, handle: string | null, on: boolean): void {
	if (!handle) return;
	for (const item of scope.querySelectorAll(`[data-place-row="${handle}"], [data-place-pin="${handle}"]`)) {
		item.setAttribute('aria-current', String(on));
	}
}
for (const type of ['pointerover', 'pointerout', 'focusin', 'focusout']) {
	document.addEventListener(type, (event) => {
		const item = closest(event, '[data-place-row], [data-place-pin]');
		if (!item) return;
		const handle = item.getAttribute('data-place-row') ?? item.getAttribute('data-place-pin');
		markPlace(scopeOf(item), handle, type === 'pointerover' || type === 'focusin');
	});
}

// Start here and the places index: a row under the pointer (or focused)
// shows its photograph in the section's sticky picture.
for (const type of ['pointerover', 'focusin']) {
	document.addEventListener(type, (event) => {
		const row = closest(event, '[data-photo-src]');
		const src = row?.getAttribute('data-photo-src');
		const photo = row ? scopeOf(row).querySelector<HTMLImageElement>('[data-hover-photo]') : null;
		if (src && photo && photo.getAttribute('src') !== src) photo.src = src;
	});
}

// The topic filter is a GET form with its own Show button; with JavaScript
// a change submits it, and the button hides.
for (const form of document.querySelectorAll<HTMLFormElement>('form[data-topic-filter]')) {
	for (const button of form.querySelectorAll<HTMLElement>('button[type="submit"]')) button.hidden = true;
	form.addEventListener('change', () => form.requestSubmit());
}

// A post list with the switch renders both views and shows the one its
// data-view names. The reader's last choice is remembered for every list that
// offers the switch: the layout's inline pre-paint script copies it onto
// <html> as data-post-list-view before the body paints, and the view variants
// in theme.css key off that. Without JavaScript the editor's layout shows and
// the switch stays hidden.
function showView(view: string): void {
	document.documentElement.setAttribute('data-post-list-view', view);
	for (const list of document.querySelectorAll('[data-view]')) {
		if (!list.querySelector('[data-view-set]')) continue;
		list.setAttribute('data-view', view);
		for (const button of list.querySelectorAll('[data-view-set]')) {
			button.setAttribute('aria-pressed', String(button.getAttribute('data-view-set') === view));
		}
	}
}

const savedView = document.documentElement.getAttribute('data-post-list-view');
if (savedView === 'list' || savedView === 'grid') showView(savedView);
for (const group of document.querySelectorAll<HTMLElement>('[data-view-switch]')) group.hidden = false;

document.addEventListener('click', (event) => {
	const button = closest(event, '[data-view-set]');
	const view = button?.getAttribute('data-view-set');
	if (!button?.closest('[data-view]') || (view !== 'list' && view !== 'grid')) return;
	showView(view);
	try {
		localStorage.setItem(VIEW_KEY, view);
	} catch {
		/* remembered for this page only */
	}
});

// Scroll reveals. The sections write `reveal reveal-fade-up` only while the
// Brand setting is on, so with it off there is nothing to arm. Reduced motion
// is handled by the library (which also sets reveal-armed on <html>); the
// layout's reveal-off class and load watchdog cover a script that never runs.
if (document.querySelector('.reveal')) Reveal.init({ offset: 0, duration: 400, once: true });
