// The whole of Ritual's browser JavaScript. The carousels, the lightbox, the
// sheets, the Services dropdown, the select lists, the faq rows and menu
// groups, the sticky header, the ticker and the scroll reveals are Magic
// Spells web components, vendored under ./vendor (see vendor/VERSIONS.md);
// importing them registers the elements. This file adds the small behaviours
// they do not cover.
//
// State lives on data- and aria- attributes, never on classes: Tailwind
// generates only what it reads in .pzl and styles/ files.

import './vendor/dialog-panel.js';
import './vendor/bottom-sheet.js';
import './vendor/collapsible-content.js';
import './vendor/dropdown-panel.js';
import './vendor/lightbox.min.js';
import './vendor/progress-bar.esm.js';
import './vendor/scrolling-content.js';
import './vendor/select-dropdown.js';
import './vendor/sticky-header.js';
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

// A button or link names the panel it opens: the mobile menu, or the booking
// panel behind every primary action. A link keeps its href (the booking page)
// for a page without JavaScript. A panel opened from inside another closes
// that one first. Focus goes back to the trigger when the panel would
// otherwise drop it on <body>.
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

// A request comes back to the page it was sent from (?form=…&sent=1 or
// &error=1). When that form lives only in a panel, the panel opens to show
// the result.
const returned = new URLSearchParams(location.search).get('form');
const sentFrom = returned ? [...document.querySelectorAll(`form[action$="/${returned}"]`)] : [];
if (sentFrom.length && sentFrom.every((form) => form.closest('dialog-panel'))) {
	const sheet = sentFrom[0].closest('dialog-panel')?.querySelector('bottom-sheet') as Panel | null;
	customElements.whenDefined('bottom-sheet').then(() => sheet?.show());
}

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

// One dim lies over the page under the header while the Services panel is
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

// The service menu's groups fold below 48rem, the first one open; from
// 48rem every group stays open and its heading is only a heading.
const wide = matchMedia('(min-width: 48rem)');
const unfold = () => {
	if (!wide.matches) return;
	for (const group of document.querySelectorAll('[data-service-menu] collapsible-content')) group.setAttribute('open', '');
};
unfold();
wide.addEventListener('change', unfold);

// The journal's view switch: the list shows the view its data-view names.
// Without JavaScript the editor's choice shows and the switch stays hidden.
for (const group of document.querySelectorAll<HTMLElement>('[data-view-switch]')) group.hidden = false;
document.addEventListener('click', (event) => {
	const button = closest(event, '[data-view-set]');
	const list = button?.closest<HTMLElement>('[data-view]');
	if (!button || !list) return;
	list.setAttribute('data-view', button.getAttribute('data-view-set') ?? 'grid');
	for (const other of list.querySelectorAll('[data-view-set]')) other.setAttribute('aria-pressed', String(other === button));
});

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

// The cover slideshow's pause button (WCAG 2.2.2). Tarot has no play or
// pause call, so the button sets the autoplay interval: zero stops it.
document.addEventListener('click', (event) => {
	const button = closest(event, '[data-autoplay-toggle]');
	const carousel = button ? (document.getElementById(button.getAttribute('data-autoplay-toggle') ?? '') as Carousel | null) : null;
	if (!button || !carousel) return;
	const paused = button.getAttribute('aria-pressed') !== 'true';
	button.setAttribute('aria-pressed', String(paused));
	customElements.whenDefined('tarot-carousel').then(() => carousel.whenReady().then(() => {
		carousel.updateOptions({ autoplay: { interval: paused ? 0 : Number(button.getAttribute('data-interval')) } });
	}));
});

// The ticker's pause button (WCAG 2.2.2) sets the marquee's own paused
// attribute.
document.addEventListener('click', (event) => {
	const button = closest(event, '[data-ticker-toggle]');
	if (!button) return;
	const paused = button.getAttribute('aria-pressed') !== 'true';
	button.setAttribute('aria-pressed', String(paused));
	button.closest('[data-ticker]')?.querySelector('scrolling-content')?.toggleAttribute('paused', paused);
});

// Scroll reveals on cards and tiles only. They write `reveal reveal-fade-up`
// only while the Brand setting is on.
if (document.querySelector('.reveal')) Reveal.init({ offset: 0, duration: 400, once: true });
