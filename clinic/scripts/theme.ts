// The whole of Clinic's browser JavaScript. The carousels, the appointment
// sheet, the menu drawer, the Services dropdown, the select lists, the
// collapsible rows, the sticky header, the ticker, the rising headings and
// the scroll reveals are Magic Spells web components, vendored under ./vendor
// (see vendor/VERSIONS.md); importing them registers the elements. This file
// adds the small behaviours they do not cover.
//
// State lives on data- and aria- attributes, never on classes: Tailwind
// generates only what it reads in .pzl and styles/ files.

import './vendor/dialog-panel.js';
import './vendor/bottom-sheet.js';
import './vendor/collapsible-content.js';
import './vendor/dropdown-panel.js';
import './vendor/scrolling-content.js';
import './vendor/select-dropdown.js';
import './vendor/split-text.esm.js';
import './vendor/sticky-header.js';
import './vendor/tarot.esm.js';
import Reveal from './vendor/reveal.js';

const DISMISSED_PREFIX = 'sites:dismissed:';

interface Panel extends HTMLElement {
	show(trigger?: Element): unknown;
	hide(): unknown;
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

// A button or link names the panel it opens: the menu drawer, or the
// appointment sheet behind every ask button (only while Practice booking
// link is empty; a set link is followed). A link keeps its href (the book
// page) for a page without JavaScript. A panel opened from inside another
// closes that one first. Focus goes back to the trigger when the panel would
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
// &error=1). When that form lives only in the sheet, the sheet opens to show
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
		bar.hidden = true;
		continue;
	}
	bar.querySelector('[data-dismiss]')?.addEventListener('click', () => {
		bar.hidden = true;
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

// Scroll reveals on cards, tiles and steps only. They write `reveal
// reveal-fade-up` only while the Brand setting is on.
if (document.querySelector('.reveal')) Reveal.init({ offset: 0, duration: 400, once: true });
