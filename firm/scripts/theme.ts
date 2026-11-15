// The whole of Firm's browser JavaScript. The two sheets (the menu and the
// ask), the sticky header, the marquee, the select lists, the collapsible rows,
// the carousels with their progress bar and the gallery's lightbox are Magic
// Spells web components, vendored under ./vendor (see vendor/VERSIONS.md);
// importing them registers the elements. This file adds the few behaviours
// they leave to the theme.

import './vendor/collapsible-content.js';
import './vendor/lightbox.min.js';
import './vendor/progress-bar.esm.js';
import './vendor/scrolling-content.js';
import './vendor/select-dropdown.js';
import './vendor/sheet.min.js';
import './vendor/sticky-header.js';
import './vendor/tarot.esm.js';

interface Panel extends HTMLElement {
	show(trigger?: Element): unknown;
}

interface Carousel extends HTMLElement {
	on(event: string, listener: () => void): void;
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

const lightboxOpener = new Map<Element, HTMLElement>();
document.addEventListener('click', (event) => {
	const target = event.target as Element;
	// The menu button and every ask button name the sheet they open (its
	// sheet-panel's id); the sheet hands focus back to the opener.
	const opener = target.closest('[data-panel-open]');
	if (opener) (document.getElementById(opener.getAttribute('data-panel-open') ?? '') as Panel | null)?.show(opener);
	// A gallery photo opens the lightbox of its section's hidden carousel at
	// its own slide (the plugin opens from a slide and has no open(index));
	// focus goes back to the photo when the lightbox closes.
	const tile = target.closest<HTMLElement>('[data-lightbox-open]');
	const carousel = tile && (document.getElementById(tile.dataset.lightboxOpen ?? '') as Carousel | null);
	const slide = carousel?.querySelectorAll<HTMLElement>('tarot-slide')[Number(tile?.dataset.index)];
	if (!tile || !carousel || !slide) return;
	event.preventDefault();
	if (!lightboxOpener.has(carousel)) carousel.on('lightbox:closed', () => lightboxOpener.get(carousel)?.focus());
	lightboxOpener.set(carousel, tile);
	(slide.querySelector('img') ?? slide).click();
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
// at the top. The answer is shown where the form was: the ask sheet opens on
// its own when the form lives there, the page scrolls to it otherwise.
const returned = new URLSearchParams(location.search).get('form');
const sent = returned ? document.querySelector(`form[action$="/${returned}"]`) : null;
const sheet = sent?.closest('sheet-panel') as Panel | null | undefined;
if (sheet) sheet.show();
else sent?.scrollIntoView({ block: 'center' });
