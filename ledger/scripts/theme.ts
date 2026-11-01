// The whole of Ledger's browser JavaScript. The mobile menu is a
// <dialog-panel>, the masthead a <sticky-header> and the editor's picks a
// <tarot-carousel>, all Magic Spells web components; this file registers them
// and adds the small behaviours they do not cover: opening a panel from a
// button elsewhere on the page, the once-per-visitor notice, the dismissible
// announcement bar, the story grid's list/grid switch and the picks' card
// width. Scroll reveals come from @magic-spells/reveal.
//
// State lives on data- attributes, never on classes: Tailwind generates only
// what it reads in .pzl and styles/ files, so the stylesheet reacts to
// attributes the script sets.

import './vendor/dialog-panel.js';
import './vendor/sticky-header.js';
import Reveal from './vendor/reveal.js';
import './vendor/tarot.esm.js';

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

// A story grid with the switch renders both views and shows the one its
// data-view names. The reader's last choice is remembered for every list that
// offers the switch: the layout's inline pre-paint script copies it onto
// <html> as data-post-list-view before the body paints, and the view variants
// in theme.css key off that. Without JavaScript the editor's layout shows and
// the switch stays hidden.
const VIEW_KEY = 'sites:post-list-view';

function showView(view: string): void {
	document.documentElement.setAttribute('data-post-list-view', view);
	for (const list of document.querySelectorAll('[data-view]')) {
		if (!list.querySelector('[data-view-set]')) continue;
		list.setAttribute('data-view', view);
		for (const button of list.querySelectorAll('[data-view-set]')) {
			button.setAttribute('aria-pressed', String(button.getAttribute('data-view-set') === view));
		}
	}
}

const savedView = document.documentElement.getAttribute('data-post-list-view');
if (savedView === 'list' || savedView === 'grid') showView(savedView);
for (const group of document.querySelectorAll<HTMLElement>('[data-view-switch]')) group.hidden = false;

document.addEventListener('click', (event) => {
	const button = (event.target as Element | null)?.closest?.('[data-view-set]');
	const view = button?.getAttribute('data-view-set');
	if (!button?.closest('[data-view]') || (view !== 'list' && view !== 'grid')) return;
	showView(view);
	try {
		localStorage.setItem(VIEW_KEY, view);
	} catch {
		/* remembered for this page only */
	}
});

// Scroll reveals. The sections write `reveal reveal-fade-up` only while the
// Reveal cards on scroll setting is on, so with it off there is nothing to arm
// and the library never starts. Offset 0 puts the trigger line on the bottom
// edge of the viewport: whatever is on screen at load reveals at once, the
// rest as it arrives, once each. Reduced motion is handled by the library's
// own media query; the layout's <noscript> rule and load watchdog cover a
// script that never runs.
if (document.querySelector('.reveal')) Reveal.init({ offset: 0, duration: 400, once: true });

// The editor's picks. Tarot sizes its slides from slidesPerView, and the
// design's cards are a fixed 18rem with the next one peeking, so the count is
// worked out from the track's inner width (its padding and gap come from the
// section's options, which change with the gutters at 48rem and 64rem) and
// set again whenever the window changes size. The arrows in the section head
// are bound by Tarot itself through its navigation selectors.
interface Picks extends HTMLElement {
	readonly viewport: HTMLElement | null;
	readonly options: { paddingLeft?: string; paddingRight?: string; gap?: string; slidesPerView?: number };
	on(event: string, handler: () => void): void;
	updateOptions(options: { slidesPerView: number }): void;
}

const remToPx = (value = '0'): number => (parseFloat(value) || 0) * (value.endsWith('rem') ? 16 : 1);

function fitPicks(picks: Picks): void {
	const width = picks.viewport?.offsetWidth;
	if (!width) return;
	const { paddingLeft, paddingRight, gap, slidesPerView } = picks.options;
	const space = remToPx(gap);
	const inner = width - remToPx(paddingLeft) - remToPx(paddingRight);
	const perView = Math.max(1, Math.round(((inner + space) / (remToPx(picks.dataset.card) + space)) * 100) / 100);
	if (Math.abs(perView - (slidesPerView ?? 0)) > 0.01) picks.updateOptions({ slidesPerView: perView });
}

for (const picks of document.querySelectorAll<Picks>('tarot-carousel[data-card]')) {
	picks.on('carousel:ready', () => fitPicks(picks));
	let frame = 0;
	addEventListener('resize', () => {
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(() => fitPicks(picks));
	});
}
