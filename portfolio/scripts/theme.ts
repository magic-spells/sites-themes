// The whole of Portfolio's browser JavaScript. The carousels, the lightbox, the
// drawer, the collapsible rows, the sticky header, the ticker, the select and
// the reveals are Magic Spells web components, vendored under ./vendor (see
// vendor/VERSIONS.md); importing them registers the elements. split-text
// blooms the name and the statements on its own once registered. This file
// adds the small behaviours they do not cover.
//
// State lives on data- and aria- attributes, never on classes: Tailwind
// generates only what it reads in .pzl and styles/ files.

import './vendor/dialog-panel.js';
import './vendor/collapsible-content.js';
import './vendor/lightbox.min.js';
import './vendor/progress-bar.esm.js';
import './vendor/scrolling-content.js';
import './vendor/select-dropdown.js';
import './vendor/sticky-header.js';
import './vendor/tarot.esm.js';
import Reveal from './vendor/reveal.js';
import './vendor/split-text.esm.js';

const DISMISSED_PREFIX = 'sites:dismissed:';

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

document.addEventListener('click', (event) => {
	// The hamburger opens the mobile menu; focus goes back to it on close.
	const opener = closest(event, '[data-panel-open]');
	const panel = opener && (document.getElementById(opener.getAttribute('data-panel-open') ?? '') as (HTMLElement & { show(trigger: Element): void }) | null);
	if (opener && panel?.show) panel.show(opener);

	// A marquee's pause button (WCAG 2.2.2) sets its own paused attribute.
	const toggle = closest(event, '[data-ticker-toggle]');
	if (!toggle) return;
	const paused = toggle.getAttribute('aria-pressed') !== 'true';
	toggle.setAttribute('aria-pressed', String(paused));
	toggle.closest('[data-ticker]')?.querySelector('scrolling-content')?.toggleAttribute('paused', paused);
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

// Scroll reveals on tiles, cards and CV rows only. Sections write
// `reveal reveal-fade-up` only while the Brand setting is on.
if (document.querySelector('.reveal')) Reveal.init({ offset: 0, duration: 400, once: true });
