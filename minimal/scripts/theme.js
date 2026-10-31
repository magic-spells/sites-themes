// The theme's browser script. Vite compiles this and the stylesheet beside it
// into one theme.js and one theme.css; the renderer links both from <head>.
//
// Rename this to theme.ts to write TypeScript — sites check type-checks it when
// the theme carries a tsconfig.json — and `import` anything installed in the
// theme's package.json, web components included.
//
// Keep it small. Interactivity in a Sites theme belongs in web components; this
// file is where they are registered and where the few page-level behaviors
// live.

// The dialog group is mounted once by the layout and opened from anywhere.
document.addEventListener('click', (event) => {
	const trigger = event.target instanceof Element ? event.target.closest('[data-sites-dialog]') : null;
	if (!trigger) return;
	const dialog = document.getElementById(trigger.getAttribute('data-sites-dialog'));
	if (dialog instanceof HTMLDialogElement) {
		event.preventDefault();
		dialog.showModal();
	}
});
