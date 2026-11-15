// The whole of Community's browser JavaScript. The lightbox and the
// carousel it opens from, the menu drawer, the header dropdown, the select
// lists, the collapsible rows, the sticky header, the ticker, the rising
// headings and the scroll reveals are Magic Spells web components, vendored under
// ./vendor (see vendor/VERSIONS.md); importing them registers the elements.
// This file adds the small behaviours they do not cover.
//
// State lives on data- and aria- attributes, never on classes: Tailwind
// generates only what it reads in .pzl and styles/ files.

import './vendor/dialog-panel.js';
import './vendor/collapsible-content.js';
import './vendor/dropdown-panel.js';
import './vendor/lightbox.min.js';
import './vendor/scrolling-content.js';
import './vendor/select-dropdown.js';
import './vendor/split-text.esm.js';
import './vendor/sticky-header.js';
import './vendor/tarot.esm.js';
import Reveal from './vendor/reveal.js';

const DISMISSED_PREFIX = 'sites:dismissed:';

interface Panel extends HTMLElement {
	show(trigger?: Element): unknown;
}

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

// The menu icon opens the drawer it names; dialog-panel gives focus back to
// the icon when the drawer closes.
document.addEventListener('click', (event) => {
	const opener = closest(event, '[data-panel-open]');
	const panel = opener && (document.getElementById(opener.getAttribute('data-panel-open') ?? '') as Panel | null);
	if (!opener || !panel) return;
	panel.show(opener);
});

// The announcement and the cookie notice are keyed by their text: once
// closed, each stays closed until the text changes.
for (const box of document.querySelectorAll<HTMLElement>('[data-dismiss-key]')) {
	const key = box.dataset.dismissKey ?? '';
	box.hidden = dismissed(key);
	box.querySelector('[data-dismiss]')?.addEventListener('click', () => {
		remember(key);
		box.hidden = true;
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

// Grid photos and prints open the lightbox of a visually hidden companion
// carousel holding the same photographs (the plugin opens from a slide and
// has no public open(index)). Focus goes back to the photo when it closes.
const opened = new Map<Element, HTMLElement>();
document.addEventListener('click', (event) => {
	const tile = closest(event, '[data-lightbox-open]');
	const carousel = tile && (document.getElementById(tile.getAttribute('data-lightbox-open') ?? '') as Carousel | null);
	const slide = carousel?.querySelectorAll<HTMLElement>('tarot-slide')[Number(tile?.getAttribute('data-index'))];
	if (!tile || !carousel || !slide) return;
	event.preventDefault();
	if (!opened.has(carousel)) carousel.on('lightbox:closed', () => opened.get(carousel)?.focus());
	opened.set(carousel, tile);
	(slide.querySelector('img') ?? slide).click();
});

// A select whose options are links (the groups' kinds on phones): a choice
// goes to its page.
document.addEventListener('select-dropdown:change', (event) => {
	const href = (event as CustomEvent<{ value: string }>).detail?.value;
	if (href && (event.target as Element).hasAttribute('data-links')) location.assign(href);
});

// Rows, slips and cards fade up once as the page scrolls, while the Brand
// setting writes their reveal classes.
if (document.querySelector('.reveal')) Reveal.init({ offset: 0 });
