// The whole of Folio's browser JavaScript. The mobile menu is a
// <dialog-panel> and the header a <sticky-header>, both Magic Spells web
// components; this file registers them and adds the three small behaviours
// they do not cover: opening a panel from a button elsewhere on the page, the
// once-per-visitor notice, and the dismissible announcement bar.
//
// State lives on data- attributes, never on classes: Tailwind generates only
// what it reads in .pzl and styles/ files, so the stylesheet reacts to
// attributes the script sets.

import './vendor/dialog-panel.js';
import './vendor/sticky-header.js';

const DISMISSED_PREFIX = 'sites:dismissed:';

interface Panel extends HTMLElement {
	show(trigger?: Element): boolean;
}

/** localStorage is unavailable in some privacy modes; a notice is not worth
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

// A button names the panel it opens. The panel hands focus back to it on
// Escape and on its own close button; a click on the scrim closes it without
// a trigger, so focus is put back here when it would otherwise fall to <body>.
document.addEventListener('click', (event) => {
	const node = event.target as Element | null;
	const opener = node?.closest?.('[data-panel-open]') as HTMLElement | null;
	if (!opener) return;
	const id = opener.getAttribute('data-panel-open') ?? '';
	const panel = document.getElementById(id) as Panel | null;
	if (!panel || typeof panel.show !== 'function') return;
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
