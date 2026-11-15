# Vendored builds

Copied in, by Cory's rule for every Magic Spells component a theme uses: "we copy in the esm file". None of
them is an npm dependency of the theme; the build resolves only these relative imports.

| File | Package | Version | Source |
|---|---|---|---|
| dialog-panel.js, ../styles/vendor/dialog-panel.css | @magic-spells/dialog-panel | 2.0.3 | npm (the menu drawer) |
| sticky-header.js, ../styles/vendor/sticky-header.css | @magic-spells/sticky-header | 0.2.0 | npm |
| scrolling-content.js, ../styles/vendor/scrolling-content.css | @magic-spells/scrolling-content | 2.1.1 | npm (the announcement marquee) |

All copied from the Clinic theme's vendored copies, byte for byte. Each runtime build is imported by theme.ts, and
each stylesheet into the components layer. CSS lengths other than borders and shadows are rem; JavaScript builds
are unchanged.
