// The whole of Firm's browser JavaScript. The menu drawer, the sticky header
// and the marquee are Magic Spells web components, vendored under ./vendor
// (see vendor/VERSIONS.md); importing them registers the elements. This file
// adds the few behaviours they leave to the theme.

import './vendor/dialog-panel.js';
import './vendor/scrolling-content.js';
import './vendor/sticky-header.js';

interface Panel extends HTMLElement {
	show(trigger?: Element): unknown;
}

const DISMISSED = 'sites:dismissed:';

/** localStorage is unavailable in some privacy modes, so both sides of the
 * remembering are guarded. */
function dismissed(key: string): boolean {
	try {
		return localStorage.getItem(DISMISSED + key) === '1';
	} catch {
		return false;
	}
}

function remember(key: string): void {
	try {
		localStorage.setItem(DISMISSED + key, '1');
	} catch {
		/* it simply returns next visit */
	}
}

document.addEventListener('click', (event) => {
	const target = event.target as Element;

	// The menu icon names the panel it opens; the panel hands focus back to it.
	const opener = target.closest('[data-panel-open]');
	if (opener) {
		(document.getElementById(opener.getAttribute('data-panel-open') ?? '') as Panel | null)?.show(opener);
		return;
	}

	// The marquee's pause button (WCAG 2.2.2) sets the marquee's own paused attribute.
	const toggle = target.closest('[data-ticker-toggle]');
	if (toggle) {
		const paused = toggle.getAttribute('aria-pressed') !== 'true';
		toggle.setAttribute('aria-pressed', String(paused));
		toggle.parentElement?.querySelector('scrolling-content')?.toggleAttribute('paused', paused);
	}
});

// A notice (the announcement, the cookie notice) is keyed by its text. Once one
// of its dismiss buttons is pressed it stays hidden for that visitor until the
// text changes. The announcement is served showing, the cookie notice hidden.
for (const notice of document.querySelectorAll<HTMLElement>('[data-notice]')) {
	const key = notice.dataset.notice ?? '';
	notice.hidden = dismissed(key);
	notice.addEventListener('click', (event) => {
		if (!(event.target as Element).closest('button[data-dismiss], [data-dismiss] button')) return;
		remember(key);
		notice.hidden = true;
	});
}

// A form comes back to the page it was sent from (?form=…&sent=1 or &error=1),
// at the top; the answer is shown where the form was.
const returned = new URLSearchParams(location.search).get('form');
if (returned) document.querySelector(`form[action$="/${returned}"]`)?.scrollIntoView({ block: 'center' });
