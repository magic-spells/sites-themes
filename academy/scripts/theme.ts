// Academy's browser JavaScript: the vendored components (vendor/VERSIONS.md) and what they leave out, with state on data- and aria- attributes.

import './vendor/collapsible-content.js';
import './vendor/dropdown-panel.js';
import './vendor/lightbox.min.js';
import './vendor/progress-bar.esm.js';
import './vendor/scrolling-content.js';
import './vendor/select-dropdown.js';
import './vendor/sheet.min.js';
import './vendor/split-text.esm.js';
import './vendor/sticky-header.js';
import './vendor/tab-group.js';
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

// A button or link names the panel it opens: the menu drawer, or the ask
// sheet behind every ask button. A link keeps its href (the ask page) for a
// page without JavaScript. A panel opened from inside another closes that one
// first and hands focus back to the menu button when it closes.
function openPanel(opener: HTMLElement, event: Event): void {
	const panel = document.getElementById(opener.getAttribute('data-panel-open') ?? '') as Panel | null;
	if (!panel) return;
	event.preventDefault();
	const outer = opener.closest('dialog-panel') as Panel | null;
	outer?.hide();
	panel.show(outer ? (document.querySelector('[data-panel-open="mobile-menu"]') ?? opener) : opener);
}

// The timetable's subject chips toggle: while any is pressed, every session
// of an unpressed subject dims, in the week table and the day tabs alike.
function filterSubject(chip: HTMLElement): void {
	const table = chip.closest('[data-timetable]');
	if (!table) return;
	chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'));
	const wanted = [...table.querySelectorAll('[data-subject-filter][aria-pressed="true"]')].map((c) => c.getAttribute('data-subject-filter'));
	for (const session of table.querySelectorAll('[data-session]')) {
		session.toggleAttribute('data-dim', wanted.length > 0 && !wanted.includes(session.getAttribute('data-subject')));
	}
}

// One listener for both: a panel opener and a subject chip.
document.addEventListener('click', (event) => {
	const el = (event.target as Element | null)?.closest?.<HTMLElement>('[data-panel-open], [data-subject-filter]');
	if (el?.hasAttribute('data-panel-open')) openPanel(el, event);
	else if (el) filterSubject(el);
});

// A request comes back to the page it was sent from (?form=…&sent=1 or
// &error=1). When that form lives only in the sheet, the sheet opens to show
// the result.
const returned = new URLSearchParams(location.search).get('form');
const sentFrom = returned ? [...document.forms].filter((f) => f.getAttribute('action')?.endsWith('/' + returned)) : [];
if (sentFrom.length && sentFrom.every((form) => form.closest('dialog-panel'))) {
	(sentFrom[0].closest('dialog-panel')?.querySelector('sheet-panel') as Panel | null)?.show();
}

// The cookie notice and the announcement bar: any button in one hides it, and
// with a key it stays hidden for that visitor.
for (const el of document.querySelectorAll<HTMLElement>('[data-dismiss-key]')) {
	const key = el.getAttribute('data-dismiss-key');
	el.hidden = !!key && dismissed(key);
	for (const button of el.querySelectorAll('button')) {
		button.addEventListener('click', () => {
			el.hidden = true;
			if (key) remember(key);
		});
	}
}

// Scroll reveals on cards only. They write `reveal reveal-fade-up` only
// while the Brand setting is on.
if (document.querySelector('.reveal')) Reveal.init({ offset: 0, duration: 400, once: true });
