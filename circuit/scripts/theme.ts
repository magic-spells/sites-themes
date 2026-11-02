// The whole of Circuit's browser JavaScript. The carousels, the lightbox,
// the sheets, the Classes dropdown, the select lists, the faq rows, the day
// tabs, the sticky header and the scroll reveals are Magic Spells web
// components, vendored under ./vendor (see vendor/VERSIONS.md); importing
// them registers the elements. This file adds the small behaviours they do
// not cover.
//
// State lives on data- and aria- attributes, never on classes: Tailwind
// generates only what it reads in .pzl and styles/ files.

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
}

interface Dropdown extends HTMLElement {
	hide(): void;
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

function withCarousel(id: string | null, run: (carousel: Carousel) => void): void {
	const carousel = id ? (document.getElementById(id) as Carousel | null) : null;
	if (!carousel) return;
	customElements.whenDefined('tarot-carousel').then(() => carousel.whenReady().then(() => run(carousel)));
}

// A button or link names the sheet it opens: the mobile menu, or the trial
// form behind every primary action. A link keeps its href for a page without
// JavaScript. A sheet opened from inside another closes that one first. Focus
// goes back to the trigger when the sheet would otherwise drop it on <body>.
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

// The cookie notice shows once per visitor and key; either button hides it
// for good.
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

// One dim lies over the page under the header while the Classes panel is
// open; a click on it closes the panel.
const dim = document.querySelector<HTMLElement>('[data-page-dim]');
if (dim) {
	const sync = () => dim.toggleAttribute('data-open', !!document.querySelector('dropdown-component[visible]'));
	document.addEventListener('dropdown-panel:show', sync);
	document.addEventListener('dropdown-panel:hide', () => queueMicrotask(sync));
	dim.addEventListener('click', () => {
		for (const open of document.querySelectorAll<Dropdown>('dropdown-component[visible]')) open.hide();
	});
}

// The timetable's class filter: a chip writes its class on the timetable
// and hides every session of another class, in the week table and in the
// day tabs alike. All shows them all again.
document.addEventListener('click', (event) => {
	const chip = closest(event, '[data-class-filter]');
	const table = chip?.closest<HTMLElement>('[data-timetable]');
	if (!chip || !table) return;
	const wanted = chip.getAttribute('data-class-filter') ?? '';
	table.setAttribute('data-class', wanted);
	for (const other of table.querySelectorAll('[data-class-filter]')) other.setAttribute('aria-pressed', String(other === chip));
	for (const session of table.querySelectorAll<HTMLElement>('[data-session]')) {
		session.hidden = wanted !== '' && session.getAttribute('data-class') !== wanted;
	}
	openBusyDay(table);
});

// The day tabs open on Monday, unless Monday has nothing to show (a run
// club meets on Wednesday and Saturday): then on the first day that does.
function openBusyDay(table: HTMLElement) {
	const group = table.querySelector('tab-group');
	if (!group) return;
	const panels = [...group.querySelectorAll('tab-panel')];
	const busy = (panel: Element) => [...panel.querySelectorAll<HTMLElement>('[data-session]')].some((session) => !session.hidden);
	const current = panels.findIndex((panel) => !panel.hasAttribute('hidden'));
	if (current >= 0 && busy(panels[current])) return;
	const first = panels.findIndex(busy);
	if (first >= 0) group.setAttribute('active', String(first));
}
for (const table of document.querySelectorAll<HTMLElement>('[data-timetable]')) openBusyDay(table);

// Grid tiles open the lightbox of a visually hidden companion carousel
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

// The hero slideshow's pause button (WCAG 2.2.2). Tarot has no play or pause
// call, so the button sets the autoplay interval: zero stops it.
document.addEventListener('click', (event) => {
	const button = closest(event, '[data-autoplay-toggle]');
	if (!button) return;
	const paused = button.getAttribute('aria-pressed') !== 'true';
	button.setAttribute('aria-pressed', String(paused));
	withCarousel(button.getAttribute('data-autoplay-toggle'), (carousel) => {
		carousel.updateOptions({ autoplay: { interval: paused ? 0 : Number(button.getAttribute('data-interval')) } });
	});
});

// Scroll reveals on class, coach, event and album cards only. The cards
// write `reveal reveal-fade-up` only while the Brand setting is on.
if (document.querySelector('.reveal')) Reveal.init({ offset: 0, duration: 400, once: true });
