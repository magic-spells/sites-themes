// The whole of this theme's browser JavaScript. Everything else is markup and
// CSS: the header is sticky with position, the FAQ is <details>, the menu and
// the notice are <dialog>, so the only thing left to script is opening and
// closing them and remembering that the notice was dismissed.
//
// Nothing here adds or removes a class. Tailwind generates only what it can
// read in .pzl and styles/ files, so state lives on data- attributes and the
// stylesheet reacts to those.

const DISMISSED_PREFIX = 'sites:dismissed:';

/** The dialog a trigger points at, or null when the id names nothing. */
function target(el: Element): HTMLDialogElement | null {
	const id = el.getAttribute('data-dialog-open');
	return id ? document.querySelector<HTMLDialogElement>(`#${CSS.escape(id)}`) : null;
}

/** localStorage is unavailable in some privacy modes; a notice is not worth an
 * exception, so both sides of the remembering are guarded. */
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
		/* nothing to do: the notice simply returns next visit */
	}
}

document.addEventListener('click', (event) => {
	const node = event.target as Element | null;
	if (!node || !node.closest) return;

	const opener = node.closest('[data-dialog-open]');
	if (opener) {
		const dialog = target(opener);
		if (dialog) {
			event.preventDefault();
			dialog.showModal();
		}
		return;
	}

	const closer = node.closest('[data-dialog-close]');
	if (closer) {
		const dialog = closer.closest('dialog');
		if (dialog) {
			event.preventDefault();
			dialog.close();
		}
	}
});

// A modal dialog's backdrop is the dialog element itself, so a click that lands
// on the element rather than on the panel inside it is a click outside.
document.addEventListener('click', (event) => {
	const dialog = event.target as HTMLElement | null;
	if (dialog instanceof HTMLDialogElement && dialog.open && dialog.matches('[data-dialog-light-dismiss]')) {
		dialog.close();
	}
});

// Notices show themselves, without a backdrop, once per visitor.
for (const dialog of document.querySelectorAll<HTMLDialogElement>('dialog[data-dialog-notice]')) {
	const key = dialog.getAttribute('data-dialog-key') ?? dialog.id;
	if (dismissed(key)) continue;
	dialog.show();
	dialog.addEventListener('close', () => remember(key), { once: true });
}
