// The whole of Nonprofit's browser JavaScript. The carousels and their
// progress bar, the menu drawer, the select lists, the rows that open and
// close, the sticky header, the marquees, the rising headings and the scroll
// reveals are Magic Spells web components, vendored under ./vendor (see
// vendor/VERSIONS.md); importing them registers the elements. This file adds
// the small behaviours they do not cover.
//
// State lives on data- and aria- attributes, never on classes: Tailwind
// generates only what it reads in .pzl and styles/ files.

import './vendor/collapsible-content.js';
import './vendor/dialog-panel.js';
import './vendor/progress-bar.esm.js';
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

// A button names the panel it opens (the menu drawer). Focus goes back to it
// when the panel would otherwise drop it on <body>.
document.addEventListener('click', (event) => {
	const opener = closest(event, '[data-panel-open]');
	const panel = document.getElementById(opener?.getAttribute('data-panel-open') ?? '') as Panel | null;
	if (!opener || typeof panel?.show !== 'function') return;
	event.preventDefault();
	panel.show(opener);
	panel.addEventListener(
		'hidden',
		() => {
			if (document.activeElement === document.body || !document.activeElement) opener.focus();
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
	for (const button of notice.querySelectorAll('button')) {
		button.addEventListener('click', () => {
			remember(key);
			notice.hidden = true;
		});
	}
}

// An announcement bar that visitors may close hides for good once its × is
// pressed, until its notices change (they are its key). The bar reads that
// memory itself, inline, before it paints.
for (const bar of document.querySelectorAll<HTMLElement>('[data-dismiss-key]')) {
	bar.querySelector('[data-dismiss]')?.addEventListener('click', () => {
		bar.hidden = true;
		remember(bar.dataset.dismissKey ?? '');
	});
}

// The announcement bar's pause button (WCAG 2.2.2) sets the marquee's own
// paused attribute.
document.addEventListener('click', (event) => {
	const button = closest(event, '[data-ticker-toggle]');
	if (!button) return;
	const paused = button.getAttribute('aria-pressed') !== 'true';
	button.setAttribute('aria-pressed', String(paused));
	button.closest('[data-ticker]')?.querySelector('scrolling-content')?.toggleAttribute('paused', paused);
});

// A marquee holds still while focus is inside it, as it does under the
// pointer (scrolling-content pauses on hover itself).
for (const type of ['focusin', 'focusout']) {
	document.addEventListener(type, (event) => {
		closest(event, 'scrolling-content')?.toggleAttribute('paused', type === 'focusin');
	});
}

// Scroll reveals on cards and figures only. They write `reveal
// reveal-fade-up` only while Brand motion is on.
if (document.querySelector('.reveal')) Reveal.init({ offset: 0, duration: 400, once: true });

// A link to a row's anchor (/donate#food) opens the row it lands on.
document.getElementById(location.hash.slice(1))?.querySelector('collapsible-content')?.setAttribute('open', '');
